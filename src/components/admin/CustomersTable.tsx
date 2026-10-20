"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Search,
  Pencil,
  Trash2,
  X,
  Loader2,
  AlertTriangle,
  UserPlus,
  Save,
} from "lucide-react";
import type { Booking, Customer } from "@/db/schema";
import { CITIES } from "@/lib/constants";
import { formatDate, formatZAR } from "@/lib/format";
import { cn } from "@/lib/utils";

export type CustomerWithBookings = Customer & { bookings: Booking[] };

const inputCls =
  "w-full border border-line bg-carbon px-4 py-3 text-sm text-ink placeholder:text-mute/50 focus:border-gold/60 focus:outline-none transition-colors";

export default function CustomersTable({ customers }: { customers: CustomerWithBookings[] }) {
  const router = useRouter();
  const [list, setList] = useState(customers);
  const [q, setQ] = useState("");
  const [editing, setEditing] = useState<CustomerWithBookings | "new" | null>(null);
  const [deleting, setDeleting] = useState<CustomerWithBookings | null>(null);
  const [busy, setBusy] = useState(false);

  const [form, setForm] = useState({
    fullName: "",
    email: "",
    phone: "",
    licenseNumber: "",
    idNumber: "",
    city: "",
    notes: "",
  });

  const filtered = useMemo(() => {
    if (!q.trim()) return list;
    const needle = q.trim().toLowerCase();
    return list.filter(
      (c) =>
        c.fullName.toLowerCase().includes(needle) ||
        c.email.toLowerCase().includes(needle) ||
        c.phone.includes(needle) ||
        c.city.toLowerCase().includes(needle),
    );
  }, [list, q]);

  const openEditor = (target: CustomerWithBookings | "new") => {
    if (target === "new") {
      setForm({ fullName: "", email: "", phone: "", licenseNumber: "", idNumber: "", city: "", notes: "" });
    } else {
      setForm({
        fullName: target.fullName,
        email: target.email,
        phone: target.phone,
        licenseNumber: target.licenseNumber,
        idNumber: target.idNumber,
        city: target.city,
        notes: target.notes,
      });
    }
    setEditing(target);
  };

  const save = async () => {
    setBusy(true);
    try {
      const isNew = editing === "new";
      const res = await fetch(
        isNew ? "/api/customers" : `/api/customers/${(editing as CustomerWithBookings).id}`,
        {
          method: isNew ? "POST" : "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(form),
        },
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Save failed");
      setEditing(null);
      router.refresh();
      // Optimistically patch local list
      if (isNew) {
        setList((l) => [...l, { ...(data as Customer), bookings: [] }]);
      } else {
        const id = (editing as CustomerWithBookings).id;
        setList((l) =>
          l.map((c) => (c.id === id ? { ...c, ...(data as Customer) } : c)),
        );
      }
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to save customer.");
    } finally {
      setBusy(false);
    }
  };

  const confirmDelete = async () => {
    if (!deleting) return;
    setBusy(true);
    try {
      const res = await fetch(`/api/customers/${deleting.id}`, { method: "DELETE" });
      if (!res.ok) throw new Error();
      setList((l) => l.filter((c) => c.id !== deleting.id));
      setDeleting(null);
      router.refresh();
    } catch {
      alert("Failed to delete customer.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="border border-line bg-panel">
      <div className="flex flex-wrap items-center gap-3 border-b border-line p-4">
        <label className="flex min-w-52 flex-1 items-center gap-3 border border-line bg-carbon px-4 py-2.5">
          <Search className="size-4 shrink-0 text-mute" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search name, email, phone, city…"
            className="w-full bg-transparent text-sm text-ink placeholder:text-mute/60 focus:outline-none"
          />
        </label>
        <span className="font-mono text-[10px] tracking-[0.2em] text-mute uppercase">
          {filtered.length} / {list.length}
        </span>
        <button
          onClick={() => openEditor("new")}
          className="flex items-center gap-2 bg-gold px-4 py-2.5 font-mono text-[10px] font-bold tracking-[0.2em] text-carbon uppercase transition-colors hover:bg-gold-strong"
        >
          <UserPlus className="size-4" /> Add customer
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[900px] text-left text-sm">
          <thead>
            <tr className="border-b border-line font-mono text-[9px] tracking-[0.25em] text-mute uppercase">
              <th className="px-5 py-3.5 font-medium">Customer</th>
              <th className="px-4 py-3.5 font-medium">Contact</th>
              <th className="px-4 py-3.5 font-medium">Licence</th>
              <th className="px-4 py-3.5 text-center font-medium">Rentals</th>
              <th className="px-4 py-3.5 text-right font-medium">Lifetime value</th>
              <th className="px-4 py-3.5 font-medium">Joined</th>
              <th className="px-5 py-3.5 text-right font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((c) => {
              const ltv = c.bookings
                .filter((b) => b.status !== "cancelled")
                .reduce((s, b) => s + b.totalCents, 0);
              return (
                <tr key={c.id} className="border-b border-line/60 transition-colors last:border-0 hover:bg-raised/60">
                  <td className="px-5 py-4">
                    <p className="font-medium text-ink">{c.fullName}</p>
                    <p className="text-[11px] text-mute">{c.city || "—"}</p>
                  </td>
                  <td className="px-4 py-4">
                    <p className="text-mute">{c.email}</p>
                    <p className="font-mono text-[11px] text-mute/70">{c.phone || "—"}</p>
                  </td>
                  <td className="px-4 py-4 font-mono text-xs text-mute">
                    {c.licenseNumber || "—"}
                  </td>
                  <td className="px-4 py-4 text-center font-mono text-xs text-ink">
                    {c.bookings.length}
                  </td>
                  <td className="px-4 py-4 text-right font-mono text-xs font-bold text-gold">
                    {formatZAR(ltv)}
                  </td>
                  <td className="px-4 py-4 font-mono text-[11px] text-mute">
                    {formatDate(c.createdAt)}
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => openEditor(c)}
                        title="Edit customer"
                        className="grid size-8 place-items-center border border-line text-mute transition-colors hover:border-gold/50 hover:text-gold"
                      >
                        <Pencil className="size-3.5" />
                      </button>
                      <button
                        onClick={() => setDeleting(c)}
                        title="Delete customer"
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
                  No customers found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Editor modal */}
      {editing && (
        <div className="fixed inset-0 z-50 grid place-items-center overflow-y-auto bg-carbon/80 p-4 backdrop-blur-sm">
          <div className="w-full max-w-lg border border-line bg-panel p-7">
            <h3 className="font-display text-xl uppercase text-ink">
              {editing === "new" ? "Add customer" : `Edit ${form.fullName}`}
            </h3>
            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <input
                  value={form.fullName}
                  onChange={(e) => setForm((f) => ({ ...f, fullName: e.target.value }))}
                  placeholder="Full name *"
                  className={inputCls}
                />
              </div>
              <input
                type="email"
                value={form.email}
                onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                placeholder="Email address *"
                className={inputCls}
              />
              <input
                value={form.phone}
                onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
                placeholder="Phone"
                className={inputCls}
              />
              <input
                value={form.licenseNumber}
                onChange={(e) => setForm((f) => ({ ...f, licenseNumber: e.target.value }))}
                placeholder="Licence number"
                className={cn(inputCls, "font-mono")}
              />
              <select
                value={form.city}
                onChange={(e) => setForm((f) => ({ ...f, city: e.target.value }))}
                className={inputCls}
              >
                <option value="">City…</option>
                {CITIES.map((c) => (
                  <option key={c}>{c}</option>
                ))}
              </select>
              <div className="sm:col-span-2">
                <textarea
                  value={form.notes}
                  onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
                  placeholder="Notes — preferences, watch-outs, VIP status…"
                  rows={2}
                  className={cn(inputCls, "resize-none")}
                />
              </div>
            </div>
            <div className="mt-7 flex justify-end gap-3">
              <button
                onClick={() => setEditing(null)}
                className="flex items-center gap-2 border border-line px-5 py-2.5 font-mono text-[10px] tracking-[0.2em] text-mute uppercase transition-colors hover:text-ink"
              >
                <X className="size-3.5" /> Cancel
              </button>
              <button
                onClick={save}
                disabled={busy || !form.fullName || !form.email}
                className={cn(
                  "flex items-center gap-2 px-5 py-2.5 font-mono text-[10px] font-bold tracking-[0.2em] uppercase transition-colors",
                  busy || !form.fullName || !form.email
                    ? "cursor-not-allowed bg-raised text-mute"
                    : "bg-gold text-carbon hover:bg-gold-strong",
                )}
              >
                {busy ? <Loader2 className="size-3.5 animate-spin" /> : <Save className="size-3.5" />}
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete modal */}
      {deleting && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-carbon/80 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md border border-line bg-panel p-7">
            <AlertTriangle className="size-7 text-rose-300" />
            <h3 className="mt-4 font-display text-xl uppercase text-ink">
              Delete {deleting.fullName}?
            </h3>
            <p className="mt-2 text-sm leading-relaxed text-mute">
              This removes the customer record and all {deleting.bookings.length}{" "}
              linked booking{deleting.bookings.length === 1 ? "" : "s"}.
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
