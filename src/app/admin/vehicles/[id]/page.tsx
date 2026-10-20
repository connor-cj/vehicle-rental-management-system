import { notFound } from "next/navigation";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { vehicles } from "@/db/schema";
import AdminHeader from "@/components/admin/Header";
import VehicleForm from "@/components/admin/VehicleForm";

export const dynamic = "force-dynamic";

interface EditVehiclePageProps {
  params: Promise<{ id: string }>;
}

export default async function EditVehiclePage({ params }: EditVehiclePageProps) {
  const { id } = await params;
  const [vehicle] = await db
    .select()
    .from(vehicles)
    .where(eq(vehicles.id, Number(id)))
    .limit(1);

  if (!vehicle) notFound();

  return (
    <>
      <AdminHeader
        title="Edit vehicle"
        sub={`${vehicle.name} · ${vehicle.licensePlate} · ${vehicle.location}`}
      />
      <VehicleForm mode="edit" initial={vehicle} />
    </>
  );
}
