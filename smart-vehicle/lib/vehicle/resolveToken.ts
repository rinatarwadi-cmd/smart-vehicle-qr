import { getSupabaseAdmin } from "@/lib/supabase/server";

/**
 * The safe, client-facing shape of vehicle data.
 *
 * CRITICAL PRIVACY RULES:
 *  - Raw phone numbers MUST NOT appear here.
 *  - Owner PII (name, email, address) MUST NOT appear here.
 *  - Only display-safe fields are included.
 */
export interface VehiclePublicData {
  plate: string;
  make: string;
  model: string;
  color: string;
  /** Opaque token — used server-side only to resolve the call bridge */
  token: string;
}

export type TokenResolveResult =
  | { status: "ok"; vehicle: VehiclePublicData }
  | { status: "not_found" }
  | { status: "expired" }
  | { status: "inactive" }
  | { status: "error"; message: string };

/**
 * Resolves a public QR token to safe vehicle display data.
 *
 * The token is matched against the `qr_tokens` table. The query
 * selects ONLY non-sensitive columns — the owner's phone number
 * and personal details never leave the database row.
 *
 * Expected schema (qr_tokens table):
 *   id          uuid primary key
 *   token       text unique not null        ← the opaque string from the URL
 *   vehicle_id  uuid references vehicles(id)
 *   is_active   boolean default true
 *   expires_at  timestamptz nullable        ← null = no expiry
 *   created_at  timestamptz
 *
 * Expected schema (vehicles table):
 *   id          uuid primary key
 *   plate       text not null
 *   make        text not null
 *   model       text not null
 *   color       text not null
 *   owner_id    uuid references auth.users(id)
 *   created_at  timestamptz
 */
export async function resolveToken(
  token: string
): Promise<TokenResolveResult> {
  try {
    // Dev mock: return demo vehicle when Supabase isn't configured
    if (
      process.env.NODE_ENV === "development" &&
      (!process.env.NEXT_PUBLIC_SUPABASE_URL ||
        !process.env.SUPABASE_SERVICE_ROLE_KEY)
    ) {
      return {
        status: "ok",
        vehicle: {
          plate: "KA-01-AB-1234",
          make: "Apex",
          model: "GT",
          color: "Stealth Black",
          token,
        },
      };
    }

    const supabaseAdmin = getSupabaseAdmin();

    const { data, error } = await supabaseAdmin
      .from("qr_tokens")
      .select(
        `
        is_active,
        expires_at,
        vehicles (
          plate,
          make,
          model,
          color
        )
      `
      )
      .eq("token", token)
      .single();

    if (error || !data) {
      return { status: "not_found" };
    }

    if (!data.is_active) {
      return { status: "inactive" };
    }

    if (data.expires_at && new Date(data.expires_at) < new Date()) {
      return { status: "expired" };
    }

    // `vehicles` comes back as an object (single FK join)
    const v = (data.vehicles as unknown) as {
      plate: string;
      make: string;
      model: string;
      color: string;
    } | null;

    if (!v) {
      return { status: "not_found" };
    }

    return {
      status: "ok",
      vehicle: {
        plate: v.plate,
        make: v.make,
        model: v.model,
        color: v.color,
        // Opaque token passed back so the call API route can look up the
        // owner's phone without ever sending it to the client.
        token,
      },
    };
  } catch (err) {
    console.error("[resolveToken] Unexpected error:", err);
    return { status: "error", message: "Token resolution failed" };
  }
}
