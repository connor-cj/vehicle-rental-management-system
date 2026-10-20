"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  CalendarDays,
  MapPin,
  CheckCircle2,
  Loader2,
  AlertTriangle,
  ArrowRight,
  Plus,
} from "lucide-react";
import { CITIES, EXTRAS } from "@/lib/constants";
import { addDaysISO, formatZAR, rentalDays, todayISO } from "@/lib/format";
import { cn } from "@/lib/utils";

interface BookingWidgetProps {
  vehicle: {
    id: number;
    name: string;
    dailyRateCents: number;
    depositCents: number;
    status: string;
  };
  initialStart?: string;
  initialEnd?: string;
  initialPickup?: string;
}

interface BookingResult {
  reference: string;
  totalCents: number;
  days: number;
}

export default function BookingWidget({
  vehicle,
  initialStart,
  initialEnd,
  initialPickup,
}: BookingWidgetProps) {
  const today = todayISO();
  const [start, setStart] = useState(initialStart && initialStart >= today ? initialStart : today);
  const [end, setEnd] = useState(
    initialEnd && initialEnd > (initialStart ?? today) ? initialEnd : addDaysISO(today, 3),
  );
  const [pickup, setPickup] = useState(initialPickup ?? CITIES[0]);
  const [dropoff, setDropoff] = useState(initialPickup ?? CITIES[0]);
  const [selected, setSelected] = useState<string[]>([]);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [licenseNumber, setLicenseNumber] = useState("");
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<BookingResult | null>(null);

  const valid = end > start;
  const days = valid ? rentalDays(start, end) : 0;
  const chosenExtras = EXTRAS.filter((e) => selected.includes(e.name));
  const baseCents = days * vehicle.dailyRateCents;
  const extrasCents =
    days * chosenExtras.reduce((s, e) => s + e.dailyRateCents, 0);
  const totalCents = baseCents + extrasCents;

  const canBook = vehicle.status === "available";

  const toggleExtra = (name: string) =>
    setSelected((prev) =>
      prev.includes(name) ? prev.filter((n) => n !== name) : [...prev, name],
    );

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!valid) {
      setError("Return date must be after the collection date.");
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          vehicleId: vehicle.id,
          startDate: start,
          endDate: end,
          pickupLocation: pickup,
          dropoffLocation: dropoff,
          fullName,
          email,
          phone,
          licenseNumber,
          notes,
          extras: selected,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Booking failed — please try again.");
      setResult({ reference: data.reference, totalCents: data.totalCents, days: data.days });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setSubmitting(false);
    }
  };

  // ------------------------------------------------ Confirmation state
  if (result) {
    return (
      <div className="border border-gold/40 bg-panel p-7">
        <span className="grid size-14 place-items-center bg-gold text-carbon">
          <CheckCircle2 className="size-7" />
        </span>
        <h2 className="mt-6 font-display text-3xl uppercase leading-none text-ink">
          Booking received
        </h2>
        <p className="mt-3 text-sm leading-relaxed text-mute">
          Your reservation request is in. Our team will confirm availability
          within the hour and email your collection pack.
        </p>

        <div className="mt-7 space-y-3 border border-line bg-carbon p-5 font-mono text-xs">
          <div className="flex justify-between">
            <span className="tracking-[0.2em] text-mute uppercase">Reference</span>
            <span className="font-bold text-gold">{result.reference}</span>
          </div>
          <div className="flex justify-between">
            <span className="tracking-[0.2em] text-mute uppercase">Vehicle</span>
            <span className="text-ink">{vehicle.name}</span>
          </div>
          <div className="flex justify-between">
            <span className="tracking-[0.2em] text-mute uppercase">Days</span>
            <span className="text-ink">{result.days}</span>
          </div>
          <div className="flex justify-between border-t border-line pt-3">
            <span className="tracking-[0.2em] text-mute uppercase">Total (ZAR)</span>
            <span className="font-bold text-ink">{formatZAR(result.totalCents, 2)}</span>
          </div>
        </div>

        <Link
          href="/fleet"
          className="group mt-7 flex items-center justify-center gap-3 bg-gold px-6 py-4 font-mono text-[11px] font-bold tracking-[0.25em] text-carbon uppercase transition-colors hover:bg-gold-strong"
        >
          Back to the fleet
          <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
        </Link>
      </div>
    );
  }

  // ------------------------------------------------ Unavailable state
  if (!canBook) {
    return (
      <div className="border border-line bg-panel p-7">
        <AlertTriangle className="size-7 text-orange-300" />
        <h2 className="mt-5 font-display text-2xl uppercase text-ink">
          Currently unavailable
        </h2>
        <p className="mt-3 text-sm leading-relaxed text-mute">
          This vehicle is{" "}
          {vehicle.status === "rented" ? "out on a rental" : "in the workshop for scheduled maintenance"}{" "}
          right now. Browse similar vehicles or check back soon.
        </p>
        <Link
          href={`/fleet?category=${encodeURIComponent("")}`}
          className="mt-6 block border border-line px-6 py-4 text-center font-mono text-[11px] tracking-[0.25em] text-ink uppercase transition-colors hover:border-gold hover:text-gold"
        >
          Browse alternatives
        </Link>
      </div>
    );
  }

  // ------------------------------------------------ Booking form
  return (
    <form onSubmit={submit} className="border border-line bg-panel">
      <div className="border-b border-line p-6">
        <p className="font-mono text-[10px] tracking-[0.3em] text-gold uppercase">
          Reserve this vehicle
        </p>
        <div className="mt-3 flex items-baseline gap-2">
          <span className="font-mono text-3xl font-bold text-ink">
            {formatZAR(vehicle.dailyRateCents)}
          </span>
          <span className="font-mono text-[10px] tracking-[0.2em] text-mute uppercase">
            / day · ZAR
          </span>
        </div>
      </div>

      <div className="space-y-5 p-6">
        <div className="grid grid-cols-2 gap-3">
          <label className="border border-line bg-carbon px-4 py-3">
            <span className="flex items-center gap-2 font-mono text-[9px] tracking-[0.25em] text-mute uppercase">
              <CalendarDays className="size-3.5 text-gold" /> Collect
            </span>
            <input
              type="date"
              value={start}
              min={today}
              onChange={(e) => {
                setStart(e.target.value);
                if (end <= e.target.value) setEnd(addDaysISO(e.target.value, 1));
              }}
              className="mt-1.5 w-full bg-transparent text-sm text-ink focus:outline-none"
            />
          </label>
          <label className="border border-line bg-carbon px-4 py-3">
            <span className="flex items-center gap-2 font-mono text-[9px] tracking-[0.25em] text-mute uppercase">
              <CalendarDays className="size-3.5 text-gold" /> Return
            </span>
            <input
              type="date"
              value={end}
              min={addDaysISO(start, 1)}
              onChange={(e) => setEnd(e.target.value)}
              className="mt-1.5 w-full bg-transparent text-sm text-ink focus:outline-none"
            />
          </label>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <label className="border border-line bg-carbon px-4 py-3">
            <span className="flex items-center gap-2 font-mono text-[9px] tracking-[0.25em] text-mute uppercase">
              <MapPin className="size-3.5 text-gold" /> Pick-up
            </span>
            <select
              value={pickup}
              onChange={(e) => setPickup(e.target.value)}
              className="mt-1.5 w-full appearance-none bg-transparent text-sm text-ink focus:outline-none"
            >
              {CITIES.map((c) => (
                <option key={c} value={c} className="bg-panel">{c}</option>
              ))}
            </select>
          </label>
          <label className="border border-line bg-carbon px-4 py-3">
            <span className="flex items-center gap-2 font-mono text-[9px] tracking-[0.25em] text-mute uppercase">
              <MapPin className="size-3.5 text-gold" /> Drop-off
            </span>
            <select
              value={dropoff}
              onChange={(e) => setDropoff(e.target.value)}
              className="mt-1.5 w-full appearance-none bg-transparent text-sm text-ink focus:outline-none"
            >
              {CITIES.map((c) => (
                <option key={c} value={c} className="bg-panel">{c}</option>
              ))}
            </select>
          </label>
        </div>

        {/* Extras */}
        <div>
          <p className="mb-3 font-mono text-[9px] tracking-[0.25em] text-mute uppercase">
            Optional extras
          </p>
          <div className="space-y-2">
            {EXTRAS.map((x) => {
              const on = selected.includes(x.name);
              return (
                <button
                  type="button"
                  key={x.name}
                  onClick={() => toggleExtra(x.name)}
                  className={cn(
                    "flex w-full items-center justify-between border px-4 py-3 text-left text-sm transition-all",
                    on
                      ? "border-gold/60 bg-gold/10 text-ink"
                      : "border-line bg-carbon text-mute hover:text-ink",
                  )}
                >
                  <span className="flex items-center gap-3">
                    <span
                      className={cn(
                        "grid size-5 place-items-center border transition-all",
                        on ? "border-gold bg-gold text-carbon" : "border-line",
                      )}
                    >
                      {on && <Plus className="size-3 rotate-45" strokeWidth={3} />}
                    </span>
                    {x.name}
                  </span>
                  <span className="font-mono text-xs text-gold">
                    +{formatZAR(x.dailyRateCents)}/day
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Customer details */}
        <div className="space-y-3">
          <p className="font-mono text-[9px] tracking-[0.25em] text-mute uppercase">
            Your details
          </p>
          <input
            required
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            placeholder="Full name *"
            className="w-full border border-line bg-carbon px-4 py-3 text-sm text-ink placeholder:text-mute/60 focus:border-gold/60 focus:outline-none"
          />
          <input
            required
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email address *"
            className="w-full border border-line bg-carbon px-4 py-3 text-sm text-ink placeholder:text-mute/60 focus:border-gold/60 focus:outline-none"
          />
          <div className="grid grid-cols-2 gap-3">
            <input
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="Phone"
              className="w-full border border-line bg-carbon px-4 py-3 text-sm text-ink placeholder:text-mute/60 focus:border-gold/60 focus:outline-none"
            />
            <input
              value={licenseNumber}
              onChange={(e) => setLicenseNumber(e.target.value)}
              placeholder="Licence no."
              className="w-full border border-line bg-carbon px-4 py-3 text-sm text-ink placeholder:text-mute/60 focus:border-gold/60 focus:outline-none"
            />
          </div>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Notes — airport delivery, flight number, anything we should know…"
            rows={2}
            className="w-full resize-none border border-line bg-carbon px-4 py-3 text-sm text-ink placeholder:text-mute/60 focus:border-gold/60 focus:outline-none"
          />
        </div>

        {/* Summary */}
        <div className="space-y-2.5 border border-line bg-carbon p-5 font-mono text-xs">
          <div className="flex justify-between text-mute">
            <span>
              {formatZAR(vehicle.dailyRateCents)} × {days} day{days === 1 ? "" : "s"}
            </span>
            <span className="text-ink">{formatZAR(baseCents)}</span>
          </div>
          {chosenExtras.map((x) => (
            <div key={x.name} className="flex justify-between text-mute">
              <span>{x.name}</span>
              <span className="text-ink">{formatZAR(x.dailyRateCents * days)}</span>
            </div>
          ))}
          <div className="flex justify-between border-t border-line pt-3 text-sm">
            <span className="tracking-[0.2em] text-mute uppercase">Total</span>
            <span className="font-bold text-gold">{formatZAR(totalCents, 2)}</span>
          </div>
          <p className="pt-1 text-[10px] leading-relaxed text-mute/70">
            Refundable deposit of {formatZAR(vehicle.depositCents)} payable on
            collection. No charge until your booking is confirmed.
          </p>
        </div>

        {error && (
          <p className="flex items-start gap-2 border border-rose-400/30 bg-rose-400/10 px-4 py-3 text-xs text-rose-300">
            <AlertTriangle className="mt-0.5 size-4 shrink-0" />
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={submitting || !valid || !fullName || !email}
          className={cn(
            "group flex w-full items-center justify-center gap-3 px-6 py-4 font-mono text-[11px] font-bold tracking-[0.25em] uppercase transition-all",
            submitting || !valid || !fullName || !email
              ? "cursor-not-allowed bg-raised text-mute"
              : "bg-gold text-carbon hover:bg-gold-strong hover:shadow-[0_0_30px_rgba(255,180,0,0.3)]",
          )}
        >
          {submitting ? (
            <>
              <Loader2 className="size-4 animate-spin" /> Reserving…
            </>
          ) : (
            <>
              Reserve now
              <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
            </>
          )}
        </button>
      </div>
    </form>
  );
}
