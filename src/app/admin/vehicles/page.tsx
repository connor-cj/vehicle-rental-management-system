import Link from "next/link";
import { asc } from "drizzle-orm";
import { db } from "@/db";
import { vehicles } from "@/db/schema";
import AdminHeader from "@/components/admin/Header";
import VehiclesTable from "@/components/admin/VehiclesTable";

export const dynamic = "force-dynamic";

export default async function AdminVehiclesPage() {
  const fleet = await db.select().from(vehicles).orderBy(asc(vehicles.id));

  return (
    <>
      <AdminHeader
        title="Fleet Manager"
        sub={`${fleet.length} vehicles on record — edit specs, pricing, imagery and availability.`}
      >
        <Link
          href="/admin/vehicles/new"
          className="bg-gold px-5 py-3 font-mono text-[10px] font-bold tracking-[0.25em] text-carbon uppercase transition-colors hover:bg-gold-strong"
        >
          + Add vehicle
        </Link>
      </AdminHeader>
      <VehiclesTable vehicles={fleet} />
    </>
  );
}
