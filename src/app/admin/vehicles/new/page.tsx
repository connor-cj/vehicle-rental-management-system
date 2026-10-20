import AdminHeader from "@/components/admin/Header";
import VehicleForm from "@/components/admin/VehicleForm";

export const dynamic = "force-dynamic";

export default function NewVehiclePage() {
  return (
    <>
      <AdminHeader
        title="Add vehicle"
        sub="Capture a new listing — it goes live on the site the moment you save."
      />
      <VehicleForm mode="create" />
    </>
  );
}
