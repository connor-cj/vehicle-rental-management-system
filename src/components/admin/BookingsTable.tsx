"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Search,
  ChevronDown,
  Trash2,
  X,
  Loader2,
  AlertTriangle,
  NotebookPen,
} from "lucide-react";
import type { Booking, Customer, Vehicle } from "@/db/schema";
import { BOOKING_STATUSES, BOOKING_STATUS_META, type BookingStatus } from "@/lib/constants";
import { formatDate, formatDateTime, formatZAR, rentalDays } from "@/lib/format";
import { cn } from "@/lib/utils";
import StatusPill from "./StatusPill";

export type BookingWithRelations = Booking & {
  vehicle: Vehicle;
  customer: Customer;
};

interface BookingsTableProps {
  bookings: BookingWithRelations[];
  initialStatus?: string;
}

export default function BookingsTable({ bookings, initialStatus }: BookingsTableProps) {
  const router = useRouter();
  const [list, setList] = useState(bookings);
  const [tab, setTab] = useState(
    initialStatus && BOOKING_STATUSES.includes(initialStatus as BookingStatus)
      ? initialStatus
      : "All",
  );
  const [q, setQ] = useState("");
  const [expanded, setExpanded] = useState<number | null>(null);
  const [deleting, setDeleting] = useState<BookingWithRelations | null>(null);
  const [busy, setBusy] = useState(false);

  const counts = useMemo(() => {
    const map = new Map<string, number>();
    for (const b of list) map.set(b.status, (map.get(b.status) ?? 0) + 1);
    return map;
  }, [list]);

  const filtered = useMemo(() => {
    let out = list;
    if (tab !== "All") out = out.filter((b) => b.status === tab);
    if (q.trim()) {
      const needle = q.trim().toLowerCase();
      out = out.filter(
        (b) =>
          b.reference.toLowerCase().includes(needle) ||
          b.customer.fullName.toLowerCase().includes(needle) ||
          b.customer.email.toLowerCase().includes(needle) ||
          b.vehicle.name.toLowerCase().includes(needle),
      );
    }
    return out;
  }, [list, tab, q]);

  const updateStatus = async (id: number, status: string) => {
    const prev = list;
    setList((l) => l.map((b) => (b.id === id ? { ...b, status } : b)));
    try {
      const res = await fetch(`/api/bookings/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (!res.ok) throw new Error();
      router.refresh();
    } catch {
      setList(prev);
      alert("Failed to update booking — reverted.");
    }
  };

  const confirmDelete = async () => {
    if (!deleting) return;
    setBusy(true);
    try {
      const res = await fetch(`/api/bookings/${deleting.id}`, { method: "DELETE" });
      if (!res.ok) throw new Error();
      setList((l) => l.filter((b) => b.id !== deleting.id));
      setDeleting(null);
      router.refresh();
    } catch {
      alert("Failed to delete booking.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="border border-line bg-panel">
      {/* Tabs + search */}
      <div className="flex flex-wrap items-center gap-3 border-b border-line p-4">
        <div className="no-scrollbar flex gap-1.5 overflow-x-auto">
          {["All", ...BOOKING_STATUSES].map((s) => {
            const active = tab === s;
            const count = s === "All" ? list.length : (counts.get(s) ?? 0);
            return (
              <button
                key={s}
                onClick={() => setTab(s)}
                className={cn(
                  "flex shrink-0 items-center gap-2 border px-3.5 py-2 font-mono text-[10px] tracking-[0.15em] uppercase transition-all",
                  active
                    ? "border-gold bg-gold/10 text-gold"
                    : "border-line text-mute hover:text-ink",
                )}
              >
                {s === "All" ? "All" : BOOKING_STATUS_META[s as BookingStatus].label}
                <span className={cn("text-[9px]", active ? "text-gold/70" : "text-mute/60")}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>
        <label className="ml-auto flex min-w-52 items-center gap-3 border border-line bg-carbon px-4 py-2">
          <Search className="size-4 shrink-0 text-mute" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search ref, customer, vehicle…"
            className="w-full bg-transparent text-sm text-ink placeholder:text-mute/60 focus:outline-none"
          />
        </label>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full min-w-[1000px] text-left text-sm">
          <thead>
            <tr className="border-b border-line font-mono text-[9px] tracking-[0.25em] text-mute uppercase">
              <th className="px-5 py-3.5 font-medium">Reference</th>
              <th className="px-4 py-3.5 font-medium">Customer</th>
              <th className="px-4 py-3.5 font-medium">Vehicle</th>
              <th className="px-4 py-3.5 font-medium">Trip</th>
              <th className="px-4 py-3.5 text-right font-medium">Total</th>
              <th className="px-4 py-3.5 font-medium">Status</th>
              <th className="px-5 py-3.5 text-right font-medium"> </th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((b) => {
              const meta = BOOKING_STATUS_META[b.status as BookingStatus];
              const days = rentalDays(b.startDate, b.endDate);
              const isOpen = expanded === b.id;
              return (
                <>
                  <tr key={b.id} className="border-b border-line/60 transition-colors hover:bg-raised/60">
                    <td className="px-5 py-4">
                      <p className="font-mono text-xs font-bold text-gold">{b.reference}</p>
                      <p className="mt-0.5 font-mono text-[10px] text-mute/70">
                        {formatDateTime(b.createdAt)}
                      </p>
                    </td>
                    <td className="px-4 py-4">
                      <p className="text-ink">{b.customer.fullName}</p>
                      <p className="text-[11px] text-mute">{b.customer.email}</p>
                    </td>
                    <td className="px-4 py-4">
                      <p className="text-ink">{b.vehicle.name}</p>
                      <p className="font-mono text-[10px] text-mute">{b.vehicle.licensePlate}</p>
                    </td>
                    <td className="px-4 py-4">
                      <p className="whitespace-nowrap font-mono text-[11px] text-ink">
                        {formatDate(b.startDate)} → {formatDate(b.endDate)}
                      </p>
                      <p className="mt-0.5 font-mono text-[10px] text-mute">
                        {days} day{days === 1 ? "" : "s"} · {b.pickupLocation}
                        {b.pickupLocation !== b.dropoffLocation && ` → ${b.dropoffLocation}`}
                      </p>
                    </td>
                    <td className="px-4 py-4 text-right font-mono text-xs font-bold text-ink">
                      {formatZAR(b.totalCents)}
                    </td>
                    <td className="px-4 py-4">
                      <select
                        value={b.status}
                        onChange={(e) => updateStatus(b.id, e.target.value)}
                        className={cn(
                          "appearance-none border bg-transparent px-2.5 py-1.5 font-mono text-[10px] tracking-[0.12em] uppercase focus:outline-none",
                          meta?.classes,
                        )}
                      >
                        {BOOKING_STATUSES.map((s) => (
                          <option key={s} value={s} className="bg-panel text-ink">
                            {BOOKING_STATUS_META[s].label}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => setExpanded(isOpen ? null : b.id)}
                          title="Details"
                          className={cn(
                            "grid size-8 place-items-center border transition-colors",
                            isOpen
                              ? "border-gold/50 text-gold"
                              : "border-line text-mute hover:text-ink",
                          )}
                        >
                          <ChevronDown className={cn("size-3.5 transition-transform", isOpen && "rotate-180")} />
                        </button>
                        <button
                          onClick={() => setDeleting(b)}
                          title="Delete booking"
                          className="grid size-8 place-items-center border border-line text-mute transition-colors hover:border-rose-400/50 hover:text-rose-300"
                        >
                          <Trash2 className="size-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                  {isOpen && (
                    <tr key={`${b.id}-detail`} className="border-b border-line/60 bg-carbon/60">
                      <td colSpan={7} className="px-5 py-4">
                        <div className="grid gap-4 sm:grid-cols-3">
                          <div>
                            <p className="mb-2 font-mono text-[9px] tracking-[0.25em] text-mute uppercase">
                              Extras
                            </p>
                            {b.extras.length > 0 ? (
                              <div className="flex flex-wrap gap-1.5">
                                {b.extras.map((x) => (
                                  <span key={x.name} className="border border-line bg-panel px-2.5 py-1 text-[11px] text-ink">
                                    {x.name} · {formatZAR(x.dailyRateCents)}/day
                                  </span>
                                ))}
                              </div>
                            ) : (
                              <p className="text-xs text-mute">None selected</p>
                            )}
                          </div>
                          <div>
                            <p className="mb-2 font-mono text-[9px] tracking-[0.25em] text-mute uppercase">
                              Price breakdown
                            </p>
                            <p className="font-mono text-xs text-mute">
                              Base {formatZAR(b.baseCents)} + extras {formatZAR(b.extrasCents)}
                            </p>
                            <p className="mt-1 font-mono text-xs font-bold text-gold">
                              Total {formatZAR(b.totalCents, 2)}
                            </p>
                          </div>
                          <div>
                            <p className="mb-2 flex items-center gap-2 font-mono text-[9px] tracking-[0.25em] text-mute uppercase">
                              <NotebookPen className="size-3.5" /> Notes
                            </p>
                            <p className="text-xs leading-relaxed text-mute">
                              {b.notes || "No notes on this booking."}
                            </p>
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </>
              );
            })}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={7} className="px-5 py-14 text-center text-sm text-mute">
                  No bookings in this view.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Delete modal */}
      {deleting && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-carbon/80 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md border border-line bg-panel p-7">
            <AlertTriangle className="size-7 text-rose-300" />
            <h3 className="mt-4 font-display text-xl uppercase text-ink">
              Delete {deleting.reference}?
            </h3>
            <p className="mt-2 text-sm leading-relaxed text-mute">
              The booking for {deleting.customer.fullName} ({deleting.vehicle.name},{" "}
              {formatDate(deleting.startDate)}) will be permanently removed.
            </p>
            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={() => setDeleting(null)}
                className="flex items-center gap-2 border border-line px-5 py-2.5 font-mono text-[10px] tracking-[0.2em] text-mute uppercase transition-colors hover:text-ink"
              >
                <X className="size-3.5" /> Cancel
              </button>
              <button
                onClick={confirmDelete}
                disabled={busy}
                className="flex items-center gap-2 border border-rose-400/40 bg-rose-400/15 px-5 py-2.5 font-mono text-[10px] tracking-[0.2em] text-rose-300 uppercase transition-colors hover:bg-rose-400/25"
              >
                {busy ? <Loader2 className="size-3.5 animate-spin" /> : <Trash2 className="size-3.5" />}
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
