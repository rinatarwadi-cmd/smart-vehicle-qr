import { createSupabaseServerClient } from "@/lib/supabase/client";
import { getSupabaseAdmin } from "@/lib/supabase/server";

export interface VehicleWithToken {
  id: string;
  plate: string;
  make: string;
  model: string;
  color: string;
  created_at: string;
  activeToken: string | null;
  isProtected: boolean;
  phone?: string;
}

export interface VehicleEvent {
  id: string;
  vehicle_id: string;
  event_type: "call" | "parking" | "lights" | "message" | "issue";
  status: string;
  created_at: string;
  vehicle_plate: string;
}

/**
 * Fetches all vehicles for the currently authenticated user,
 * along with their active QR token status.
 * Uses the SSR client (respects RLS).
 */
export async function getOwnerVehicles(): Promise<VehicleWithToken[]> {
  const supabase = await createSupabaseServerClient();

  const { data, error } = await supabase
    .from("vehicles")
    .select(`
      id,
      plate,
      make,
      model,
      color,
      phone,
      created_at,
      qr_tokens (
        token,
        is_active
      )
    `)
    .order("created_at", { ascending: false });

  if (error || !data) return [];

  return data.map((v) => {
    const tokens = v.qr_tokens as { token: string; is_active: boolean }[] | null ?? [];
    const activeToken = tokens.find((t) => t.is_active)?.token ?? null;

    return {
      id: v.id,
      plate: v.plate,
      make: v.make,
      model: v.model,
      color: v.color,
      phone: v.phone,
      created_at: v.created_at,
      activeToken,
      isProtected: activeToken !== null,
    };
  });
}

/**
 * Fetches the 20 most recent activity events across all of the
 * authenticated owner's vehicles.
 */
export async function getOwnerActivity(vehicleIds: string[]): Promise<VehicleEvent[]> {
  if (vehicleIds.length === 0) return [];

  const supabase = await createSupabaseServerClient();

  const { data, error } = await supabase
    .from("vehicle_events")
    .select(`
      id,
      vehicle_id,
      event_type,
      status,
      created_at,
      vehicles (
        plate
      )
    `)
    .in("vehicle_id", vehicleIds)
    .order("created_at", { ascending: false })
    .limit(20);

  if (error || !data) return [];

  return data.map((e) => ({
    id: e.id,
    vehicle_id: e.vehicle_id,
    event_type: e.event_type as VehicleEvent["event_type"],
    status: e.status,
    created_at: e.created_at,
    vehicle_plate: (e.vehicles as unknown as { plate: string } | null)?.plate ?? "—",
  }));
}

/**
 * Generates a new QR token for a vehicle.
 * Uses service role to bypass RLS on insert.
 */
export async function generateQrToken(vehicleId: string): Promise<string | null> {
  const supabaseAdmin = getSupabaseAdmin();

  // Deactivate all existing tokens for this vehicle
  await supabaseAdmin
    .from("qr_tokens")
    .update({ is_active: false })
    .eq("vehicle_id", vehicleId);

  // Generate new opaque token
  const token = `sv-${vehicleId.slice(0, 8)}-${Date.now().toString(36)}`;

  const { data, error } = await supabaseAdmin
    .from("qr_tokens")
    .insert({ token, vehicle_id: vehicleId, is_active: true })
    .select("token")
    .single();

  if (error || !data) return null;
  return data.token;
}

/**
 * Pauses (deactivates) all QR tokens for a vehicle.
 */
export async function pauseQrToken(vehicleId: string): Promise<boolean> {
  const supabaseAdmin = getSupabaseAdmin();
  const { error } = await supabaseAdmin
    .from("qr_tokens")
    .update({ is_active: false })
    .eq("vehicle_id", vehicleId);

  return !error;
}
