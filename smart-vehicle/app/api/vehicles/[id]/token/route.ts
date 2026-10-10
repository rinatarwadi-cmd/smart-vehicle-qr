import { NextRequest, NextResponse } from "next/server";
import { getUser } from "@/lib/supabase/client";
import { generateQrToken, pauseQrToken } from "@/lib/vehicle/dashboard";
import { getSupabaseAdmin } from "@/lib/supabase/server";

/**
 * POST /api/vehicles/[id]/token
 *
 * Manages QR token state for a vehicle owned by the authenticated user.
 * Body: { action: "generate" | "pause" | "resume" }
 *
 * Ownership is verified before any mutation.
 */
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: vehicleId } = await params;
  const body = await req.json();
  const { action } = body as { action?: string };

  if (!["generate", "pause", "resume"].includes(action ?? "")) {
    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  }

  // Verify the requesting user owns this vehicle
  const user = await getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabaseAdmin = getSupabaseAdmin();
  const { data: vehicle, error } = await supabaseAdmin
    .from("vehicles")
    .select("id, owner_id")
    .eq("id", vehicleId)
    .single();

  if (error || !vehicle || vehicle.owner_id !== user.id) {
    return NextResponse.json({ error: "Vehicle not found" }, { status: 404 });
  }

  if (action === "generate" || action === "resume") {
    const token = await generateQrToken(vehicleId);
    if (!token) {
      return NextResponse.json({ error: "Failed to generate token" }, { status: 500 });
    }
    return NextResponse.json({ status: "ok", token });
  }

  if (action === "pause") {
    const ok = await pauseQrToken(vehicleId);
    if (!ok) {
      return NextResponse.json({ error: "Failed to pause token" }, { status: 500 });
    }
    return NextResponse.json({ status: "ok" });
  }
}
