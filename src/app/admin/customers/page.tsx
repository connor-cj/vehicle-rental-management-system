import { asc } from "drizzle-orm";
import { db } from "@/db";
import { customers } from "@/db/schema";
import AdminHeader from "@/components/admin/Header";
import CustomersTable from "@/components/admin/CustomersTable";

export const dynamic = "force-dynamic";

export default async function AdminCustomersPage() {
  const list = await db.query.customers.findMany({
    with: { bookings: true },
    orderBy: [asc(customers.fullName)],
  });

  return (
    <>
      <AdminHeader
        title="Customers"
        sub={`${list.length} customers in the book — contact info, licences and rental history.`}
      />
      <CustomersTable customers={list} />
    </>
  );
}
