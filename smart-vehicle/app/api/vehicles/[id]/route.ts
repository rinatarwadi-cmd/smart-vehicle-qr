import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/client";

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createSupabaseServerClient();
    
    // Auth check
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: vehicleId } = await params;
    if (!vehicleId) {
      return NextResponse.json({ error: "Missing vehicle ID" }, { status: 400 });
    }

    // Verify ownership and delete
    const { error: deleteError } = await supabase
      .from("vehicles")
      .delete()
      .match({ id: vehicleId, owner_id: user.id });

    if (deleteError) {
      console.error("[DELETE /api/vehicles/:id] db error:", deleteError);
      return NextResponse.json({ error: "Failed to delete vehicle" }, { status: 500 });
    }

    // If RLS allows delete and matching happened, it's deleted.
    // Assuming RLS cascade deletes `qr_tokens` and `vehicle_events`.
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[DELETE /api/vehicles/:id] exception:", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createSupabaseServerClient();
    
    // Auth check
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: vehicleId } = await params;
    if (!vehicleId) {
      return NextResponse.json({ error: "Missing vehicle ID" }, { status: 400 });
    }

    const body = await request.json();
    const { plate_number, model, color, nickname, contact_phone } = body;

    if (contact_phone && !/^\+\d{10,15}$/.test(contact_phone)) {
      return NextResponse.json({ error: "contact_phone must be in E.164 format (e.g. +919876543210)" }, { status: 400 });
    }

    const { data: vehicle, error: updateError } = await supabase
      .from("vehicles")
      .update({
        plate: plate_number?.trim().toUpperCase(),
        model: model?.trim(),
        color: color?.trim(),
        make: nickname?.trim(),
        phone: contact_phone?.trim(),
      })
      .match({ id: vehicleId, owner_id: user.id })
      .select()
      .single();

    if (updateError) {
      console.error("[PATCH /api/vehicles/:id] db error:", updateError);
      return NextResponse.json({ error: "Failed to update vehicle" }, { status: 500 });
    }

    return NextResponse.json({ success: true, vehicle });
  } catch (err) {
    console.error("[PATCH /api/vehicles/:id] exception:", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
