import Link from "next/link";
import { desc } from "drizzle-orm";
import {
  CarFront,
  KeyRound,
  CalendarDays,
  CircleDollarSign,
  ArrowRight,
  AlertCircle,
  TrendingUp,
} from "lucide-react";
import { db } from "@/db";
import { bookings, vehicles } from "@/db/schema";
import { formatDate, formatZAR, formatZARCompact } from "@/lib/format";
import AdminHeader from "@/components/admin/Header";
import StatCard from "@/components/admin/StatCard";
import StatusPill from "@/components/admin/StatusPill";
import RevenueChart, { type RevenuePoint } from "@/components/admin/RevenueChart";
import { VEHICLE_STATUS_META, type VehicleStatus } from "@/lib/constants";

export const dynamic = "force-dynamic";

export default async function AdminDashboard() {
  const [fleet, allBookings] = await Promise.all([
    db.select().from(vehicles),
    db.query.bookings.findMany({
      with: { vehicle: true, customer: true },
      orderBy: [desc(bookings.createdAt)],
    }),
  ]);

  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

  const notRetired = fleet.filter((v) => v.status !== "retired");
  const activeBookings = allBookings.filter((b) => b.status === "active");
  const pendingBookings = allBookings.filter((b) => b.status === "pending");
  const thisMonth = allBookings.filter((b) => new Date(b.createdAt) >= monthStart);

  const revenue = (list: typeof allBookings) =>
    list.filter((b) => b.status !== "cancelled").reduce((s, b) => s + b.totalCents, 0);

  const revenueMonth = revenue(thisMonth);
  const revenueLifetime = revenue(allBookings);

  // Last-6-months revenue buckets
  const buckets: RevenuePoint[] = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const label = d.toLocaleString("en-ZA", { month: "short" });
    const inMonth = allBookings.filter((b) => {
      const c = new Date(b.createdAt);
      return c.getFullYear() === d.getFullYear() && c.getMonth() === d.getMonth();
    });
    buckets.push({ label, totalCents: revenue(inMonth) });
  }

  // Fleet composition
  const composition = (Object.keys(VEHICLE_STATUS_META) as VehicleStatus[]).map(
    (status) => ({
      status,
      count: fleet.filter((v) => v.status === status).length,
    }),
  );

  // Top vehicles by lifetime revenue
  const byVehicle = new Map<number, { name: string; count: number; revenue: number }>();
  for (const b of allBookings) {
    if (b.status === "cancelled") continue;
    const entry = byVehicle.get(b.vehicleId) ?? {
      name: b.vehicle.name,
      count: 0,
      revenue: 0,
    };
    entry.count += 1;
    entry.revenue += b.totalCents;
    byVehicle.set(b.vehicleId, entry);
  }
  const topVehicles = [...byVehicle.values()]
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 4);

  const recent = allBookings.slice(0, 7);

  return (
    <>
      <AdminHeader
        title="Dashboard"
        sub={`${now.toLocaleDateString("en-ZA", { weekday: "long", day: "numeric", month: "long", year: "numeric" })} · All figures in ZAR`}
      >
        <Link
          href="/admin/vehicles/new"
          className="bg-gold px-5 py-3 font-mono text-[10px] font-bold tracking-[0.25em] text-carbon uppercase transition-colors hover:bg-gold-strong"
        >
          + Add vehicle
        </Link>
      </AdminHeader>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          icon={CarFront}
          label="Active fleet"
          value={String(notRetired.length)}
          sub={`${fleet.filter((v) => v.status === "available").length} available · ${fleet.filter((v) => v.status === "maintenance").length} in workshop`}
        />
        <StatCard
          icon={KeyRound}
          label="Vehicles out now"
          value={String(activeBookings.length)}
          sub={`${pendingBookings.length} pending request${pendingBookings.length === 1 ? "" : "s"}`}
          accent={activeBookings.length > 0}
        />
        <StatCard
          icon={CalendarDays}
          label="Bookings this month"
          value={String(thisMonth.length)}
          sub={`${allBookings.length} lifetime bookings`}
        />
        <StatCard
          icon={CircleDollarSign}
          label="Revenue this month"
          value={formatZARCompact(revenueMonth)}
          sub={`${formatZARCompact(revenueLifetime)} lifetime`}
        />
      </div>

      {/* Chart + composition */}
      <div className="mt-4 grid gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <RevenueChart data={buckets} />
        </div>

        <div className="flex flex-col gap-4">
          <div className="border border-line bg-panel p-6">
            <h3 className="font-display text-lg uppercase tracking-wide text-ink">
              Fleet status
            </h3>
            <div className="mt-5 space-y-4">
              {composition.map((c) => {
                const meta = VEHICLE_STATUS_META[c.status];
                const pct = fleet.length ? Math.round((c.count / fleet.length) * 100) : 0;
                return (
                  <div key={c.status}>
                    <div className="flex justify-between font-mono text-[10px] tracking-[0.2em] uppercase">
                      <span className="text-mute">{meta.label}</span>
                      <span className="text-ink">{c.count}</span>
                    </div>
                    <div className="mt-2 h-1.5 bg-carbon">
                      <div
                        className={`h-full ${meta.dot}`}
                        style={{ width: `${Math.max(4, pct)}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="border border-line bg-panel p-6">
            <div className="flex items-center justify-between">
              <h3 className="flex items-center gap-2 font-display text-lg uppercase tracking-wide text-ink">
                <AlertCircle className="size-4.5 text-gold" /> Pending
              </h3>
              <Link
                href="/admin/bookings?status=pending"
                className="font-mono text-[10px] tracking-[0.2em] text-gold uppercase hover:text-gold-strong"
              >
                Review →
              </Link>
            </div>
            <div className="mt-4 space-y-3">
              {pendingBookings.slice(0, 3).map((b) => (
                <div key={b.id} className="border border-line bg-carbon p-3.5">
                  <div className="flex justify-between font-mono text-xs">
                    <span className="text-gold">{b.reference}</span>
                    <span className="text-ink">{formatZAR(b.totalCents)}</span>
                  </div>
                  <p className="mt-1.5 text-xs text-mute">
                    {b.customer.fullName} · {b.vehicle.name}
                  </p>
                  <p className="mt-0.5 font-mono text-[10px] text-mute/70">
                    {formatDate(b.startDate)} → {formatDate(b.endDate)}
                  </p>
                </div>
              ))}
              {pendingBookings.length === 0 && (
                <p className="text-xs text-mute">No pending requests. All clear.</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Recent bookings + top vehicles */}
      <div className="mt-4 grid gap-4 lg:grid-cols-3">
        <div className="border border-line bg-panel lg:col-span-2">
          <div className="flex items-center justify-between border-b border-line px-6 py-4">
            <h3 className="font-display text-lg uppercase tracking-wide text-ink">
              Recent bookings
            </h3>
            <Link
              href="/admin/bookings"
              className="group flex items-center gap-2 font-mono text-[10px] tracking-[0.2em] text-mute uppercase transition-colors hover:text-gold"
            >
              All bookings
              <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-1" />
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-line font-mono text-[9px] tracking-[0.25em] text-mute uppercase">
                  <th className="px-6 py-3.5 font-medium">Ref</th>
                  <th className="px-4 py-3.5 font-medium">Customer</th>
                  <th className="hidden px-4 py-3.5 font-medium md:table-cell">Vehicle</th>
                  <th className="hidden px-4 py-3.5 font-medium lg:table-cell">Dates</th>
                  <th className="px-4 py-3.5 text-right font-medium">Total</th>
                  <th className="px-6 py-3.5 text-right font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {recent.map((b) => (
                  <tr key={b.id} className="border-b border-line/60 transition-colors last:border-0 hover:bg-raised/60">
                    <td className="px-6 py-4 font-mono text-xs text-gold">{b.reference}</td>
                    <td className="px-4 py-4">
                      <p className="text-ink">{b.customer.fullName}</p>
                      <p className="text-[11px] text-mute">{b.customer.email}</p>
                    </td>
                    <td className="hidden px-4 py-4 text-mute md:table-cell">{b.vehicle.name}</td>
                    <td className="hidden whitespace-nowrap px-4 py-4 font-mono text-[11px] text-mute lg:table-cell">
                      {formatDate(b.startDate)} → {formatDate(b.endDate)}
                    </td>
                    <td className="px-4 py-4 text-right font-mono text-xs text-ink">
                      {formatZAR(b.totalCents)}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <StatusPill kind="booking" status={b.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="border border-line bg-panel p-6">
          <h3 className="flex items-center gap-2 font-display text-lg uppercase tracking-wide text-ink">
            <TrendingUp className="size-4.5 text-gold" /> Top earners
          </h3>
          <div className="mt-5 space-y-4">
            {topVehicles.map((v, i) => (
              <div key={v.name} className="flex items-center gap-4">
                <span className="font-display text-2xl text-line">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm text-ink">{v.name}</p>
                  <p className="font-mono text-[10px] text-mute">
                    {v.count} rental{v.count === 1 ? "" : "s"}
                  </p>
                </div>
                <span className="font-mono text-sm font-bold text-gold">
                  {formatZARCompact(v.revenue)}
                </span>
              </div>
            ))}
            {topVehicles.length === 0 && (
              <p className="text-xs text-mute">No revenue recorded yet.</p>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
