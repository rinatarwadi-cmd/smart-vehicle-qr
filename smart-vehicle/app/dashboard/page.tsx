import { redirect } from "next/navigation";
import { getUser } from "@/lib/supabase/client";
import { getOwnerVehicles, getOwnerActivity } from "@/lib/vehicle/dashboard";
import { DashboardClient } from "@/components/dashboard/DashboardClient";

export const metadata = {
  title: "Dashboard · Smart Vehicle",
  description: "Manage your vehicles and QR tags",
};

export default async function DashboardPage() {
  const user = await getUser();

  const vehicles = await getOwnerVehicles();
  const vehicleIds = vehicles.map((v) => v.id);
  const events = await getOwnerActivity(vehicleIds);

  const ownerName =
    (user?.user_metadata?.full_name as string | undefined)?.split(" ")[0] ??
    user?.email?.split("@")[0] ??
    "Owner";

  return (
    <DashboardClient
      ownerName={ownerName}
      ownerEmail={user?.email ?? ""}
      vehicles={vehicles}
      events={events}
    />
  );
}
