import Link from "next/link";
import { notFound } from "next/navigation";
import { eq, and, ne } from "drizzle-orm";
import {
  ArrowLeft,
  Users,
  Cog,
  Fuel,
  CarFront,
  Gauge,
  Palette,
  MapPin,
  BadgeCheck,
  ShieldCheck,
  CircleDollarSign,
} from "lucide-react";
import { db } from "@/db";
import { vehicles } from "@/db/schema";
import { formatKm, formatZAR } from "@/lib/format";
import { INCLUDED_KM_PER_DAY as KM } from "@/lib/constants";
import BookingWidget from "@/components/site/BookingWidget";
import VehicleCard from "@/components/site/VehicleCard";
import Reveal from "@/components/site/Reveal";

export const dynamic = "force-dynamic";

interface VehiclePageProps {
  params: Promise<{ id: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export default async function VehicleDetailPage({ params, searchParams }: VehiclePageProps) {
  const { id } = await params;
  const sp = await searchParams;
  const vehicleId = Number(id);
  if (!Number.isFinite(vehicleId)) notFound();

  const [vehicle] = await db
    .select()
    .from(vehicles)
    .where(eq(vehicles.id, vehicleId))
    .limit(1);

  if (!vehicle) notFound();

  const related = await db
    .select()
    .from(vehicles)
    .where(and(eq(vehicles.category, vehicle.category), ne(vehicles.id, vehicle.id)))
    .limit(3);

  const str = (v: string | string[] | undefined) =>
    typeof v === "string" ? v : undefined;

  const specs = [
    { icon: CarFront, label: "Year", value: String(vehicle.year) },
    { icon: Cog, label: "Gearbox", value: vehicle.transmission },
    { icon: Fuel, label: "Fuel", value: vehicle.fuel },
    { icon: Users, label: "Seats", value: `${vehicle.seats} seats` },
    { icon: CarFront, label: "Doors", value: `${vehicle.doors} doors` },
    { icon: Gauge, label: "Odometer", value: formatKm(vehicle.mileage) },
    { icon: Palette, label: "Colour", value: vehicle.color },
    { icon: MapPin, label: "Branch", value: vehicle.location },
  ];

  return (
    <div className="mx-auto max-w-7xl px-5 pt-28 pb-24 md:px-8 md:pt-36">
      <Link
        href="/fleet"
        className="group inline-flex items-center gap-2 font-mono text-[11px] tracking-[0.25em] text-mute uppercase transition-colors hover:text-gold"
      >
        <ArrowLeft className="size-4 transition-transform group-hover:-translate-x-1" />
        Back to fleet
      </Link>

      <div className="mt-8 grid gap-10 lg:grid-cols-[1fr_420px]">
        {/* -------------------------------------------- Left column */}
        <div>
          <Reveal>
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div>
                <p className="font-mono text-[11px] tracking-[0.3em] text-gold uppercase">
                  {vehicle.category} · {vehicle.location}
                </p>
                <h1 className="mt-3 font-display text-4xl uppercase leading-[0.95] text-ink md:text-6xl">
                  {vehicle.make}
                  <br />
                  <span className="text-outline">{vehicle.model}</span>
                </h1>
              </div>
              <div className="text-right">
                <p className="font-mono text-3xl font-bold text-gold">
                  {formatZAR(vehicle.dailyRateCents)}
                </p>
                <p className="font-mono text-[10px] tracking-[0.25em] text-mute uppercase">
                  per day · ZAR
                </p>
              </div>
            </div>
          </Reveal>

          <Reveal delay={0.1}>
            <div className="relative mt-8 overflow-hidden border border-line bg-panel">
              <img
                src={vehicle.imageUrl}
                alt={vehicle.name}
                className="aspect-[16/10] w-full object-cover md:aspect-[16/9]"
              />
              <div className="absolute left-5 top-5 flex gap-2">
                <span className="bg-carbon/80 px-3 py-1.5 font-mono text-[10px] tracking-[0.25em] text-gold uppercase backdrop-blur-sm">
                  {vehicle.category}
                </span>
                <span className="bg-carbon/80 px-3 py-1.5 font-mono text-[10px] tracking-[0.25em] text-ink uppercase backdrop-blur-sm">
                  {vehicle.licensePlate}
                </span>
              </div>
            </div>
          </Reveal>

          {/* Specs */}
          <Reveal delay={0.15}>
            <div className="mt-8 grid grid-cols-2 gap-px border border-line bg-line sm:grid-cols-4">
              {specs.map((s) => (
                <div key={s.label} className="bg-panel p-5">
                  <s.icon className="size-4.5 text-gold" />
                  <p className="mt-3 font-mono text-[9px] tracking-[0.25em] text-mute uppercase">
                    {s.label}
                  </p>
                  <p className="mt-1 text-sm font-medium text-ink">{s.value}</p>
                </div>
              ))}
            </div>
          </Reveal>

          {/* Description */}
          <Reveal delay={0.2}>
            <div className="mt-10">
              <h2 className="font-display text-2xl uppercase text-ink">About this vehicle</h2>
              <p className="mt-4 max-w-2xl leading-relaxed text-mute">
                {vehicle.description}
              </p>
            </div>
          </Reveal>

          {/* Features */}
          {vehicle.features.length > 0 && (
            <Reveal delay={0.25}>
              <div className="mt-10">
                <h2 className="font-display text-2xl uppercase text-ink">Equipment</h2>
                <div className="mt-5 flex flex-wrap gap-2">
                  {vehicle.features.map((f) => (
                    <span
                      key={f}
                      className="flex items-center gap-2 border border-line bg-panel px-4 py-2.5 text-xs text-ink"
                    >
                      <BadgeCheck className="size-3.5 text-gold" />
                      {f}
                    </span>
                  ))}
                </div>
              </div>
            </Reveal>
          )}

          {/* Policy */}
          <Reveal delay={0.3}>
            <div className="mt-10 grid gap-px border border-line bg-line sm:grid-cols-3">
              {[
                {
                  icon: CircleDollarSign,
                  title: "Refundable deposit",
                  body: `${formatZAR(vehicle.depositCents)} held on collection, released on return.`,
                },
                {
                  icon: Gauge,
                  title: `${KM} km per day included`,
                  body: "Additional distance billed at R 6.50 per km.",
                },
                {
                  icon: ShieldCheck,
                  title: "Driver requirements",
                  body: "Minimum age 23 with a licence held for 3+ years.",
                },
              ].map((p) => (
                <div key={p.title} className="bg-panel p-6">
                  <p.icon className="size-5 text-gold" />
                  <h3 className="mt-4 font-display text-base uppercase tracking-wide text-ink">
                    {p.title}
                  </h3>
                  <p className="mt-2 text-xs leading-relaxed text-mute">{p.body}</p>
                </div>
              ))}
            </div>
          </Reveal>
        </div>

        {/* -------------------------------------------- Right column */}
        <div>
          <div className="lg:sticky lg:top-28">
            <Reveal delay={0.15}>
              <BookingWidget
                vehicle={{
                  id: vehicle.id,
                  name: vehicle.name,
                  dailyRateCents: vehicle.dailyRateCents,
                  depositCents: vehicle.depositCents,
                  status: vehicle.status,
                }}
                initialStart={str(sp.start)}
                initialEnd={str(sp.end)}
                initialPickup={str(sp.pickup)}
              />
            </Reveal>
          </div>
        </div>
      </div>

      {/* Related */}
      {related.length > 0 && (
        <div className="mt-24">
          <Reveal>
            <div className="flex items-end justify-between border-b border-line pb-6">
              <h2 className="font-display text-3xl uppercase text-ink md:text-4xl">
                More <span className="text-outline-gold">{vehicle.category}s</span>
              </h2>
              <Link
                href={`/fleet?category=${encodeURIComponent(vehicle.category)}`}
                className="font-mono text-[11px] tracking-[0.25em] text-mute uppercase transition-colors hover:text-gold"
              >
                View all →
              </Link>
            </div>
          </Reveal>
          <div className="mt-8 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {related.map((v, i) => (
              <Reveal key={v.id} delay={0.05 * i} y={20}>
                <VehicleCard vehicle={v} />
              </Reveal>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
