import type { Metadata } from "next";
import { asc } from "drizzle-orm";
import { db } from "@/db";
import { vehicles } from "@/db/schema";
import FleetExplorer from "@/components/site/FleetExplorer";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "The Fleet",
  description:
    "Browse the full Velocity Rentals fleet — supercars, luxury SUVs, bakkies and more. Transparent daily rates in ZAR.",
};

interface FleetPageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export default async function FleetPage({ searchParams }: FleetPageProps) {
  const fleet = await db
    .select()
    .from(vehicles)
    .orderBy(asc(vehicles.dailyRateCents));

  const sp = await searchParams;
  const str = (v: string | string[] | undefined) =>
    typeof v === "string" ? v : undefined;

  return (
    <div className="mx-auto max-w-7xl px-5 pt-28 pb-24 md:px-8 md:pt-36">
      <div className="flex flex-col gap-4 border-b border-line pb-10">
        <p className="flex items-center gap-3 font-mono text-[11px] tracking-[0.35em] text-gold uppercase">
          <span className="h-px w-10 bg-gold" />
          The Fleet
        </p>
        <h1 className="font-display text-5xl uppercase leading-[0.95] text-ink md:text-7xl">
          Every vehicle.
          <br />
          <span className="text-outline">Every road.</span>
        </h1>
        <p className="max-w-xl text-mute">
          {fleet.filter((v) => v.status === "available").length} vehicles ready
          right now across six branches. All rates in ZAR, all backed by 24/7
          support.
        </p>
      </div>

      <FleetExplorer
        vehicles={fleet}
        initialCategory={str(sp.category)}
        initialPickup={str(sp.pickup)}
        initialStart={str(sp.start)}
        initialEnd={str(sp.end)}
      />
    </div>
  );
}
