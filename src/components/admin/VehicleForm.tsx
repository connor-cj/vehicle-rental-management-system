"use client";

import { useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Plus, Save, X, ImageIcon } from "lucide-react";
import type { Vehicle } from "@/db/schema";
import {
  CATEGORIES,
  CITIES,
  FEATURE_PRESETS,
  FUELS,
  TRANSMISSIONS,
  VEHICLE_STATUSES,
  VEHICLE_STATUS_META,
} from "@/lib/constants";
import { VEHICLE_IMAGE_PRESETS } from "@/lib/images";
import { formatZAR } from "@/lib/format";
import { cn } from "@/lib/utils";

interface VehicleFormProps {
  mode: "create" | "edit";
  initial?: Vehicle;
}

const inputCls =
  "w-full border border-line bg-carbon px-4 py-3 text-sm text-ink placeholder:text-mute/50 focus:border-gold/60 focus:outline-none transition-colors";
const labelCls = "mb-1.5 block font-mono text-[9px] tracking-[0.25em] text-mute uppercase";

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div>
      <label className={labelCls}>{label}</label>
      {children}
    </div>
  );
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="border border-line bg-panel p-6">
      <h3 className="mb-5 font-display text-lg uppercase tracking-wide text-ink">
        <span className="mr-2 text-gold">/</span>
        {title}
      </h3>
      {children}
    </div>
  );
}

export default function VehicleForm({ mode, initial }: VehicleFormProps) {
  const router = useRouter();

  const rands = (cents?: number) => (cents !== undefined ? String(cents / 100) : "");

  const [form, setForm] = useState({
    name: initial?.name ?? "",
    make: initial?.make ?? "",
    model: initial?.model ?? "",
    year: String(initial?.year ?? new Date().getFullYear()),
    category: initial?.category ?? CATEGORIES[0],
    transmission: initial?.transmission ?? TRANSMISSIONS[0],
    fuel: initial?.fuel ?? FUELS[0],
    seats: String(initial?.seats ?? 5),
    doors: String(initial?.doors ?? 4),
    dailyRate: rands(initial?.dailyRateCents),
    deposit: rands(initial?.depositCents ?? 250000),
    mileage: String(initial?.mileage ?? 0),
    color: initial?.color ?? "",
    licensePlate: initial?.licensePlate ?? "",
    status: initial?.status ?? "available",
    location: initial?.location ?? CITIES[0],
    imageUrl: initial?.imageUrl ?? "",
    description: initial?.description ?? "",
  });
  const [features, setFeatures] = useState<string[]>(initial?.features ?? []);
  const [customFeature, setCustomFeature] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const set = (key: keyof typeof form) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>,
  ) => setForm((f) => ({ ...f, [key]: e.target.value }));

  const toggleFeature = (f: string) =>
    setFeatures((prev) =>
      prev.includes(f) ? prev.filter((x) => x !== f) : [...prev, f],
    );

  const addCustomFeature = () => {
    const value = customFeature.trim();
    if (value && !features.includes(value)) setFeatures((p) => [...p, value]);
    setCustomFeature("");
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const toCents = (v: string) => Math.round((Number.parseFloat(v.replace(/\s/g, "")) || 0) * 100);
    const payload = {
      name: form.name.trim(),
      make: form.make.trim(),
      model: form.model.trim(),
      year: Number.parseInt(form.year) || new Date().getFullYear(),
      category: form.category,
      transmission: form.transmission,
      fuel: form.fuel,
      seats: Number.parseInt(form.seats) || 5,
      doors: Number.parseInt(form.doors) || 4,
      dailyRateCents: toCents(form.dailyRate),
      depositCents: toCents(form.deposit),
      mileage: Number.parseInt(form.mileage) || 0,
      color: form.color.trim() || "Black",
      licensePlate: form.licensePlate.trim().toUpperCase(),
      status: form.status,
      features,
      imageUrl: form.imageUrl.trim(),
      description: form.description.trim(),
      location: form.location,
    };

    if (payload.name.length < 2) return setError("Please give the vehicle a name.");
    if (!payload.imageUrl) return setError("Please provide an image — pick a preset or paste a URL.");
    if (payload.dailyRateCents <= 0) return setError("Daily rate must be greater than R 0.");

    setSaving(true);
    try {
      const res = await fetch(
        mode === "create" ? "/api/vehicles" : `/api/vehicles/${initial!.id}`,
        {
          method: mode === "create" ? "POST" : "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        },
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Save failed.");
      router.push("/admin/vehicles");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
      setSaving(false);
    }
  };

  const previewRateCents = Math.round((Number.parseFloat(form.dailyRate.replace(/\s/g, "")) || 0) * 100);

  return (
    <form onSubmit={submit} className="grid gap-5 lg:grid-cols-[1fr_340px]">
      <div className="space-y-5">
        <Section title="Identity">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <Field label="Listing name">
                <input required value={form.name} onChange={set("name")} placeholder="e.g. BMW X5 xDrive40i" className={inputCls} />
              </Field>
            </div>
            <Field label="Make">
              <input required value={form.make} onChange={set("make")} placeholder="BMW" className={inputCls} />
            </Field>
            <Field label="Model">
              <input required value={form.model} onChange={set("model")} placeholder="X5 xDrive40i" className={inputCls} />
            </Field>
            <Field label="Category">
              <select value={form.category} onChange={set("category")} className={inputCls}>
                {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
              </select>
            </Field>
            <Field label="Year">
              <input required type="number" min={1990} max={2035} value={form.year} onChange={set("year")} className={inputCls} />
            </Field>
            <Field label="Colour">
              <input value={form.color} onChange={set("color")} placeholder="Black Sapphire" className={inputCls} />
            </Field>
            <Field label="License plate">
              <input required value={form.licensePlate} onChange={set("licensePlate")} placeholder="CA 123-456" className={cn(inputCls, "font-mono uppercase")} />
            </Field>
            <Field label="Branch">
              <select value={form.location} onChange={set("location")} className={inputCls}>
                {CITIES.map((c) => <option key={c}>{c}</option>)}
              </select>
            </Field>
            <Field label="Status">
              <select value={form.status} onChange={set("status")} className={inputCls}>
                {VEHICLE_STATUSES.map((s) => (
                  <option key={s} value={s}>{VEHICLE_STATUS_META[s].label}</option>
                ))}
              </select>
            </Field>
          </div>
        </Section>

        <Section title="Technical">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Field label="Transmission">
              <select value={form.transmission} onChange={set("transmission")} className={inputCls}>
                {TRANSMISSIONS.map((t) => <option key={t}>{t}</option>)}
              </select>
            </Field>
            <Field label="Fuel">
              <select value={form.fuel} onChange={set("fuel")} className={inputCls}>
                {FUELS.map((f) => <option key={f}>{f}</option>)}
              </select>
            </Field>
            <Field label="Seats">
              <input type="number" min={1} max={24} value={form.seats} onChange={set("seats")} className={inputCls} />
            </Field>
            <Field label="Doors">
              <input type="number" min={2} max={8} value={form.doors} onChange={set("doors")} className={inputCls} />
            </Field>
            <div className="sm:col-span-2">
              <Field label="Odometer (km)">
                <input type="number" min={0} step={100} value={form.mileage} onChange={set("mileage")} className={inputCls} />
              </Field>
            </div>
          </div>
        </Section>

        <Section title="Commercials (ZAR)">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Daily rate (R)">
              <input required type="number" min={0} step={50} value={form.dailyRate} onChange={set("dailyRate")} placeholder="1850" className={inputCls} />
            </Field>
            <Field label="Refundable deposit (R)">
              <input type="number" min={0} step={100} value={form.deposit} onChange={set("deposit")} placeholder="5000" className={inputCls} />
            </Field>
          </div>
        </Section>

        <Section title="Equipment">
          <div className="flex flex-wrap gap-2">
            {FEATURE_PRESETS.map((f) => {
              const on = features.includes(f);
              return (
                <button
                  type="button"
                  key={f}
                  onClick={() => toggleFeature(f)}
                  className={cn(
                    "border px-3.5 py-2 text-xs transition-all",
                    on
                      ? "border-gold/60 bg-gold/10 text-gold"
                      : "border-line text-mute hover:text-ink",
                  )}
                >
                  {f}
                </button>
              );
            })}
          </div>
          <div className="mt-4 flex gap-2">
            <input
              value={customFeature}
              onChange={(e) => setCustomFeature(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addCustomFeature())}
              placeholder="Add custom feature…"
              className={cn(inputCls, "max-w-xs")}
            />
            <button
              type="button"
              onClick={addCustomFeature}
              className="flex items-center gap-2 border border-line px-4 font-mono text-[10px] tracking-[0.2em] text-mute uppercase transition-colors hover:border-gold/50 hover:text-gold"
            >
              <Plus className="size-3.5" /> Add
            </button>
          </div>
          {features.some((f) => !FEATURE_PRESETS.includes(f as (typeof FEATURE_PRESETS)[number])) && (
            <div className="mt-3 flex flex-wrap gap-2">
              {features
                .filter((f) => !FEATURE_PRESETS.includes(f as (typeof FEATURE_PRESETS)[number]))
                .map((f) => (
                  <span key={f} className="flex items-center gap-2 border border-gold/40 bg-gold/10 px-3 py-1.5 text-xs text-gold">
                    {f}
                    <button type="button" onClick={() => toggleFeature(f)}>
                      <X className="size-3" />
                    </button>
                  </span>
                ))}
            </div>
          )}
        </Section>

        <Section title="Media & description">
          <div className="space-y-4">
            <Field label="Image URL">
              <div className="flex items-center gap-2">
                <ImageIcon className="size-4 shrink-0 text-mute" />
                <input value={form.imageUrl} onChange={set("imageUrl")} placeholder="https://…" className={inputCls} />
              </div>
            </Field>
            <div>
              <p className={labelCls}>Or pick from the media library</p>
              <div className="no-scrollbar grid max-h-56 grid-cols-3 gap-2 overflow-y-auto pr-1 sm:grid-cols-4">
                {VEHICLE_IMAGE_PRESETS.map((p) => (
                  <button
                    type="button"
                    key={p.url}
                    onClick={() => setForm((f) => ({ ...f, imageUrl: p.url }))}
                    title={p.label}
                    className={cn(
                      "relative aspect-[4/3] overflow-hidden border-2 transition-all",
                      form.imageUrl === p.url
                        ? "border-gold shadow-[0_0_18px_rgba(255,180,0,0.25)]"
                        : "border-transparent opacity-60 hover:opacity-100",
                    )}
                  >
                    <img src={p.url} alt={p.label} className="size-full object-cover" loading="lazy" />
                  </button>
                ))}
              </div>
            </div>
            <Field label="Description">
              <textarea
                rows={4}
                value={form.description}
                onChange={set("description")}
                placeholder="Sell the drive — what makes this vehicle special?"
                className={cn(inputCls, "resize-none")}
              />
            </Field>
          </div>
        </Section>
      </div>

      {/* ------------------------------------------------ Preview column */}
      <div className="lg:sticky lg:top-8 lg:self-start">
        <div className="border border-line bg-panel">
          <div className="relative aspect-[16/10] overflow-hidden bg-raised">
            {form.imageUrl ? (
              <img src={form.imageUrl} alt="Preview" className="size-full object-cover" />
            ) : (
              <div className="grid size-full place-items-center font-mono text-[10px] tracking-[0.25em] text-mute uppercase">
                No image selected
              </div>
            )}
            <span className="absolute left-3 top-3 bg-carbon/80 px-2.5 py-1 font-mono text-[9px] tracking-[0.25em] text-gold uppercase">
              Preview
            </span>
          </div>
          <div className="p-5">
            <p className="font-display text-xl uppercase leading-tight text-ink">
              {form.name || "Vehicle name"}
            </p>
            <p className="mt-1.5 font-mono text-[10px] tracking-[0.2em] text-mute uppercase">
              {form.year} · {form.category} · {form.location}
            </p>
            <div className="mt-4 flex justify-between border-t border-line pt-4 font-mono text-xs">
              <span className="text-mute">Rate</span>
              <span className="font-bold text-gold">
                {previewRateCents > 0 ? `${formatZAR(previewRateCents)} / day` : "—"}
              </span>
            </div>
          </div>
        </div>

        {error && (
          <p className="mt-4 border border-rose-400/30 bg-rose-400/10 px-4 py-3 text-xs text-rose-300">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={saving}
          className={cn(
            "mt-4 flex w-full items-center justify-center gap-3 px-6 py-4 font-mono text-[11px] font-bold tracking-[0.25em] uppercase transition-all",
            saving
              ? "cursor-wait bg-raised text-mute"
              : "bg-gold text-carbon hover:bg-gold-strong hover:shadow-[0_0_30px_rgba(255,180,0,0.3)]",
          )}
        >
          {saving ? (
            <>
              <Loader2 className="size-4 animate-spin" /> Saving…
            </>
          ) : (
            <>
              <Save className="size-4" />
              {mode === "create" ? "Add to fleet" : "Save changes"}
            </>
          )}
        </button>
        <button
          type="button"
          onClick={() => router.push("/admin/vehicles")}
          className="mt-3 w-full border border-line px-6 py-3.5 font-mono text-[10px] tracking-[0.25em] text-mute uppercase transition-colors hover:text-ink"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
