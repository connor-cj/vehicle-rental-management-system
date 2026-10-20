"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Pencil, Trash2, Search, X, Loader2, AlertTriangle } from "lucide-react";
import type { Vehicle } from "@/db/schema";
import { CATEGORIES, VEHICLE_STATUSES, VEHICLE_STATUS_META, type VehicleStatus } from "@/lib/constants";
import { formatKm, formatZAR } from "@/lib/format";
import { cn } from "@/lib/utils";

export default function VehiclesTable({ vehicles }: { vehicles: Vehicle[] }) {
  const router = useRouter();
  const [list, setList] = useState(vehicles);
  const [q, setQ] = useState("");
  const [category, setCategory] = useState("All");
  const [status, setStatus] = useState("All");
  const [deleting, setDeleting] = useState<Vehicle | null>(null);
  const [busy, setBusy] = useState(false);

  const filtered = useMemo(() => {
    let out = list;
    if (q.trim()) {
      const needle = q.trim().toLowerCase();
      out = out.filter(
        (v) =>
          v.name.toLowerCase().includes(needle) ||
          v.licensePlate.toLowerCase().includes(needle) ||
          v.make.toLowerCase().includes(needle),
      );
    }
    if (category !== "All") out = out.filter((v) => v.category === category);
    if (status !== "All") out = out.filter((v) => v.status === status);
    return out;
  }, [list, q, category, status]);

  const updateStatus = async (id: number, next: string) => {
    const prev = list;
    setList((l) => l.map((v) => (v.id === id ? { ...v, status: next } : v)));
    try {
      const res = await fetch(`/api/vehicles/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: next }),
      });
      if (!res.ok) throw new Error();
      router.refresh();
    } catch {
      setList(prev);
      alert("Failed to update status — reverted.");
    }
  };

  const confirmDelete = async () => {
    if (!deleting) return;
    setBusy(true);
    try {
      const res = await fetch(`/api/vehicles/${deleting.id}`, { method: "DELETE" });
      if (!res.ok) throw new Error();
      setList((l) => l.filter((v) => v.id !== deleting.id));
      setDeleting(null);
      router.refresh();
    } catch {
      alert("Failed to delete vehicle.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="border border-line bg-panel">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-3 border-b border-line p-4">
        <label className="flex min-w-52 flex-1 items-center gap-3 border border-line bg-carbon px-4 py-2.5">
          <Search className="size-4 shrink-0 text-mute" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search name, make or plate…"
            className="w-full bg-transparent text-sm text-ink placeholder:text-mute/60 focus:outline-none"
          />
        </label>
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="appearance-none border border-line bg-carbon px-4 py-2.5 text-sm text-ink focus:outline-none"
        >
          <option value="All">All categories</option>
          {CATEGORIES.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="appearance-none border border-line bg-carbon px-4 py-2.5 text-sm text-ink focus:outline-none"
        >
          <option value="All">All statuses</option>
          {VEHICLE_STATUSES.map((s) => (
            <option key={s} value={s}>{VEHICLE_STATUS_META[s].label}</option>
          ))}
        </select>
        <span className="ml-auto font-mono text-[10px] tracking-[0.2em] text-mute uppercase">
          {filtered.length} / {list.length}
        </span>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full min-w-[900px] text-left text-sm">
          <thead>
            <tr className="border-b border-line font-mono text-[9px] tracking-[0.25em] text-mute uppercase">
              <th className="px-5 py-3.5 font-medium">Vehicle</th>
              <th className="px-4 py-3.5 font-medium">Category</th>
              <th className="px-4 py-3.5 font-medium">Branch</th>
              <th className="px-4 py-3.5 font-medium">Odometer</th>
              <th className="px-4 py-3.5 text-right font-medium">Rate / day</th>
              <th className="px-4 py-3.5 font-medium">Status</th>
              <th className="px-5 py-3.5 text-right font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((v) => {
              const meta = VEHICLE_STATUS_META[v.status as VehicleStatus];
              return (
                <tr key={v.id} className="border-b border-line/60 transition-colors last:border-0 hover:bg-raised/60">
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-4">
                      <div className="relative h-12 w-20 shrink-0 overflow-hidden bg-raised">
                        <img src={v.imageUrl} alt="" className="size-full object-cover" loading="lazy" />
                      </div>
                      <div>
                        <p className="font-medium text-ink">{v.name}</p>
                        <p className="font-mono text-[10px] text-mute">
                          {v.year} · {v.licensePlate}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3.5 text-mute">{v.category}</td>
                  <td className="px-4 py-3.5 text-mute">{v.location}</td>
                  <td className="px-4 py-3.5 font-mono text-xs text-mute">{formatKm(v.mileage)}</td>
                  <td className="px-4 py-3.5 text-right font-mono text-xs font-bold text-ink">
                    {formatZAR(v.dailyRateCents)}
                  </td>
                  <td className="px-4 py-3.5">
                    <select
                      value={v.status}
                      onChange={(e) => updateStatus(v.id, e.target.value)}
                      className={cn(
                        "appearance-none border bg-transparent px-2.5 py-1.5 font-mono text-[10px] tracking-[0.12em] uppercase focus:outline-none",
                        meta?.classes,
                      )}
                    >
                      {VEHICLE_STATUSES.map((s) => (
                        <option key={s} value={s} className="bg-panel text-ink">
                          {VEHICLE_STATUS_META[s].label}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="px-5 py-3.5">
                    <div className="flex items-center justify-end gap-2">
                      <Link
                        href={`/admin/vehicles/${v.id}`}
                        title="Edit vehicle"
                        className="grid size-8 place-items-center border border-line text-mute transition-colors hover:border-gold/50 hover:text-gold"
                      >
                        <Pencil className="size-3.5" />
                      </Link>
                      <button
                        onClick={() => setDeleting(v)}
                        title="Delete vehicle"
                        className="grid size-8 place-items-center border border-line text-mute transition-colors hover:border-rose-400/50 hover:text-rose-300"
                      >
                        <Trash2 className="size-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={7} className="px-5 py-14 text-center text-sm text-mute">
                  No vehicles match your filters.
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
              Delete {deleting.name}?
            </h3>
            <p className="mt-2 text-sm leading-relaxed text-mute">
              This permanently removes the vehicle and every booking linked to
              it. This action cannot be undone.
            </p>
            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={() => setDeleting(null)}
                className="border border-line px-5 py-2.5 font-mono text-[10px] tracking-[0.2em] text-mute uppercase transition-colors hover:text-ink"
              >
                <span className="flex items-center gap-2">
                  <X className="size-3.5" /> Cancel
                </span>
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
