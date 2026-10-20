import { desc } from "drizzle-orm";
import { db } from "@/db";
import { bookings } from "@/db/schema";
import AdminHeader from "@/components/admin/Header";
import BookingsTable from "@/components/admin/BookingsTable";

export const dynamic = "force-dynamic";

interface AdminBookingsPageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export default async function AdminBookingsPage({ searchParams }: AdminBookingsPageProps) {
  const sp = await searchParams;
  const initialStatus = typeof sp.status === "string" ? sp.status : undefined;

  const list = await db.query.bookings.findMany({
    with: { vehicle: true, customer: true },
    orderBy: [desc(bookings.createdAt)],
  });

  const pending = list.filter((b) => b.status === "pending").length;

  return (
    <>
      <AdminHeader
        title="Bookings"
        sub={`${list.length} reservations on record · ${pending} awaiting confirmation.`}
      />
      <BookingsTable bookings={list} initialStatus={initialStatus} />
    </>
  );
}
