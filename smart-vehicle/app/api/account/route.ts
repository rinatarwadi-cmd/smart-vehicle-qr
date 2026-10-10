import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase/server";
import { createSupabaseServerClient } from "@/lib/supabase/client";

export async function DELETE() {
  try {
    const supabase = await createSupabaseServerClient();
    
    // Verify user is authenticated
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const supabaseAdmin = getSupabaseAdmin();

    // 1. Delete all user vehicles and associated tokens
    // In Supabase, if we have foreign key cascades, this happens automatically, 
    // but just to be safe, we can manually trigger the delete if needed.
    // However, the cleanest way is just to delete the Auth User via admin client, 
    // which cascades to `auth.users` references if FK is set to cascade.
    // Assuming 'vehicles.owner_id' references 'auth.users(id)' on delete cascade.
    
    const { error: deleteUserError } = await supabaseAdmin.auth.admin.deleteUser(user.id);
    
    if (deleteUserError) {
      console.error("[/api/account] Delete error:", deleteUserError);
      return NextResponse.json({ error: "Failed to delete account" }, { status: 500 });
    }

    // Sign out logic is handled on the client after successful 200 OK.
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[/api/account] Unhandled error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
