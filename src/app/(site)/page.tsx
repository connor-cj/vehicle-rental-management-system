import Link from "next/link";
import { asc } from "drizzle-orm";
import {
  ArrowRight,
  ArrowUpRight,
  ShieldCheck,
  Headset,
  Gauge,
  Plane,
  MapPin,
  KeyRound,
  CalendarCheck,
  Route,
} from "lucide-react";
import { db } from "@/db";
import { vehicles } from "@/db/schema";
import { CATEGORIES, INCLUDED_KM_PER_DAY } from "@/lib/constants";
import { formatZAR } from "@/lib/format";
import Hero from "@/components/site/Hero";
import Marquee from "@/components/site/Marquee";
import VehicleCard from "@/components/site/VehicleCard";
import Reveal from "@/components/site/Reveal";

export const dynamic = "force-dynamic";

const BRANCH_ADDRESSES: Record<string, string> = {
  "Cape Town": "12 Portswood Rd, V&A Waterfront",
  Johannesburg: "O.R. Tambo International Airport",
  Pretoria: "Menlyn Maine Central Square",
  Durban: "King Shaka International Airport",
  Gqeberha: "Boardwalk Mall, Marine Drive",
  Bloemfontein: "Bram Fischer International Airport",
};

function Kicker({ children }: { children: string }) {
  return (
    <p className="flex items-center gap-3 font-mono text-[11px] tracking-[0.35em] text-gold uppercase">
      <span className="h-px w-10 bg-gold" />
      {children}
    </p>
  );
}

export default async function HomePage() {
  const fleet = await db
    .select()
    .from(vehicles)
    .orderBy(asc(vehicles.dailyRateCents));

  const active = fleet.filter((v) => v.status !== "retired");
  const featured = [...fleet]
    .filter((v) => v.status === "available" || v.status === "rented")
    .sort((a, b) => b.dailyRateCents - a.dailyRateCents)
    .slice(0, 6);

  const categoryRows = CATEGORIES.map((c) => {
    const list = fleet.filter((v) => v.category === c);
    return {
      name: c,
      count: list.length,
      from: list.length ? Math.min(...list.map((v) => v.dailyRateCents)) : 0,
    };
  });

  return (
    <>
      <Hero fleetCount={active.length} />
      <Marquee />

      {/* ------------------------------------------------ Featured fleet */}
      <section className="mx-auto max-w-7xl px-5 py-24 md:px-8 md:py-32">
        <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <Reveal>
            <Kicker>01 — The Fleet</Kicker>
            <h2 className="mt-5 max-w-2xl font-display text-4xl uppercase leading-[0.95] text-ink md:text-6xl">
              Engineered for <span className="text-outline-gold">every road</span>
            </h2>
          </Reveal>
          <Reveal delay={0.1}>
            <Link
              href="/fleet"
              className="group inline-flex items-center gap-3 border border-line px-6 py-3.5 font-mono text-[11px] tracking-[0.25em] text-ink uppercase transition-all hover:border-gold hover:text-gold"
            >
              View full fleet
              <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </Reveal>
        </div>

        {featured.length > 0 ? (
          <Reveal delay={0.15} className="mt-14">
            <div className="grid gap-5 lg:grid-cols-12">
              <div className="lg:col-span-8">
                <div className="h-full min-h-[420px]">
                  <VehicleCard vehicle={featured[0]} large />
                </div>
              </div>
              <div className="grid content-start gap-5 lg:col-span-4">
                {featured.slice(1, 3).map((v) => (
                  <VehicleCard key={v.id} vehicle={v} />
                ))}
              </div>
              {featured.slice(3, 6).map((v) => (
                <div key={v.id} className="lg:col-span-4">
                  <VehicleCard vehicle={v} />
                </div>
              ))}
            </div>
          </Reveal>
        ) : (
          <p className="mt-14 border border-dashed border-line p-12 text-center font-mono text-sm text-mute">
            Fleet incoming — check back shortly.
          </p>
        )}
      </section>

      {/* ------------------------------------------------ Experience */}
      <section id="experience" className="border-y border-line bg-panel">
        <div className="mx-auto grid max-w-7xl gap-14 px-5 py-24 md:px-8 md:py-32 lg:grid-cols-2">
          <Reveal className="relative">
            <div className="relative h-full min-h-[380px] overflow-hidden border border-line">
              <img
                src="https://images.pexels.com/photos/94272/sports-car-pkw-auto-vehicle-94272.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940"
                alt="Aston Martin Vantage at night"
                className="size-full object-cover"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-panel via-transparent to-transparent" />
              <div className="absolute bottom-6 left-6 right-6 flex items-end justify-between">
                <div>
                  <p className="font-display text-2xl uppercase text-ink">Est. 2016</p>
                  <p className="mt-1 font-mono text-[10px] tracking-[0.3em] text-gold uppercase">
                    Cape Town HQ
                  </p>
                </div>
                <p className="font-mono text-[10px] tracking-[0.2em] text-mute uppercase">
                  12 400+ rentals
                </p>
              </div>
            </div>
          </Reveal>

          <div className="flex flex-col justify-center">
            <Reveal>
              <Kicker>02 — The Experience</Kicker>
              <h2 className="mt-5 font-display text-4xl uppercase leading-[0.95] text-ink md:text-5xl">
                Rental, minus the <span className="text-outline">friction</span>
              </h2>
              <p className="mt-6 max-w-lg leading-relaxed text-mute">
                We rebuilt vehicle hire around one idea: your time is worth more
                than paperwork. Book in minutes online, and we handle the rest —
                from airport handover to 24/7 support anywhere in the country.
              </p>
            </Reveal>

            <div className="mt-10 space-y-1">
              {[
                {
                  icon: ShieldCheck,
                  title: "Full-cover insurance options",
                  body: "Zero-excess cover available on every vehicle in the fleet.",
                },
                {
                  icon: Headset,
                  title: "24/7 human support",
                  body: "A real person, anywhere in South Africa, day or night.",
                },
                {
                  icon: Gauge,
                  title: `${INCLUDED_KM_PER_DAY} km included daily`,
                  body: "Generous distance allowance with unlimited-km upgrades.",
                },
                {
                  icon: Plane,
                  title: "Airport meet & greet",
                  body: "We hand over at arrivals at all major SA airports.",
                },
              ].map((f, i) => (
                <Reveal key={f.title} delay={0.08 * i}>
                  <div className="group flex gap-5 border-b border-line py-5 transition-colors">
                    <span className="mt-0.5 grid size-11 shrink-0 place-items-center border border-line text-gold transition-all group-hover:border-gold/50 group-hover:shadow-[0_0_20px_rgba(255,180,0,0.15)]">
                      <f.icon className="size-5" />
                    </span>
                    <div>
                      <h3 className="font-display text-lg uppercase tracking-wide text-ink">
                        {f.title}
                      </h3>
                      <p className="mt-1 text-sm text-mute">{f.body}</p>
                    </div>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ------------------------------------------------ Categories */}
      <section className="mx-auto max-w-7xl px-5 py-24 md:px-8 md:py-32">
        <Reveal>
          <Kicker>03 — Categories</Kicker>
          <h2 className="mt-5 max-w-2xl font-display text-4xl uppercase leading-[0.95] text-ink md:text-6xl">
            Pick your <span className="text-outline-gold">poison</span>
          </h2>
        </Reveal>

        <div className="mt-14 grid gap-px border border-line bg-line sm:grid-cols-2 lg:grid-cols-3">
          {categoryRows.map((c, i) => (
            <Reveal key={c.name} delay={0.05 * i} className="h-full">
              <Link
                href={`/fleet?category=${encodeURIComponent(c.name)}`}
                className="group flex h-full flex-col justify-between gap-10 bg-panel p-7 transition-colors hover:bg-raised"
              >
                <div className="flex items-start justify-between">
                  <span className="font-mono text-[10px] tracking-[0.3em] text-mute uppercase">
                    {String(c.count).padStart(2, "0")} vehicles
                  </span>
                  <ArrowUpRight className="size-4.5 text-mute transition-all group-hover:translate-x-1 group-hover:-translate-y-1 group-hover:text-gold" />
                </div>
                <div>
                  <h3 className="font-display text-3xl uppercase text-ink transition-colors group-hover:text-gold">
                    {c.name}
                  </h3>
                  <p className="mt-2 font-mono text-xs text-mute">
                    {c.count > 0 ? `from ${formatZAR(c.from)} / day` : "coming soon"}
                  </p>
                </div>
              </Link>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ------------------------------------------------ How it works */}
      <section className="border-y border-line bg-panel">
        <div className="mx-auto max-w-7xl px-5 py-24 md:px-8 md:py-32">
          <Reveal>
            <Kicker>04 — How it works</Kicker>
            <h2 className="mt-5 font-display text-4xl uppercase leading-[0.95] text-ink md:text-6xl">
              Three steps to the <span className="text-outline">open road</span>
            </h2>
          </Reveal>

          <div className="mt-14 grid gap-px border border-line bg-line md:grid-cols-3">
            {[
              {
                icon: CalendarCheck,
                step: "Step 01",
                title: "Book online",
                body: "Choose your dates, extras and branch. Instant ZAR pricing — no surprises at the counter.",
              },
              {
                icon: KeyRound,
                step: "Step 02",
                title: "Collect or get delivery",
                body: "Pick up at any of six branches, or have the vehicle delivered to your door or arrivals hall.",
              },
              {
                icon: Route,
                step: "Step 03",
                title: "Drive & drop",
                body: "Hit the road with 24/7 backup. Return to any branch nationwide — one-way fees waived over 5 days.",
              },
            ].map((s, i) => (
              <Reveal key={s.step} delay={0.08 * i} className="h-full">
                <div className="group flex h-full flex-col bg-carbon p-8 transition-colors hover:bg-raised">
                  <div className="flex items-center justify-between">
                    <s.icon className="size-7 text-gold" />
                    <span className="font-mono text-[10px] tracking-[0.3em] text-mute uppercase">
                      {s.step}
                    </span>
                  </div>
                  <h3 className="mt-16 font-display text-2xl uppercase text-ink">
                    {s.title}
                  </h3>
                  <p className="mt-3 text-sm leading-relaxed text-mute">{s.body}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ------------------------------------------------ Locations */}
      <section id="locations" className="mx-auto max-w-7xl px-5 py-24 md:px-8 md:py-32">
        <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <Reveal>
            <Kicker>05 — Branches</Kicker>
            <h2 className="mt-5 font-display text-4xl uppercase leading-[0.95] text-ink md:text-6xl">
              Six cities. <span className="text-outline-gold">One standard.</span>
            </h2>
          </Reveal>
          <Reveal delay={0.1}>
            <p className="max-w-sm text-sm leading-relaxed text-mute">
              Every branch is staffed by our own team — never a franchise
              call-centre. One-way rentals available between all locations.
            </p>
          </Reveal>
        </div>

        <div className="mt-14 grid gap-px border border-line bg-line sm:grid-cols-2 lg:grid-cols-3">
          {Object.entries(BRANCH_ADDRESSES).map(([city, address], i) => (
            <Reveal key={city} delay={0.05 * i} className="h-full">
              <Link
                href={`/fleet?pickup=${encodeURIComponent(city)}`}
                className="group flex h-full items-center justify-between gap-6 bg-panel p-7 transition-colors hover:bg-raised"
              >
                <div>
                  <p className="font-mono text-[10px] tracking-[0.3em] text-gold uppercase">
                    {String(i + 1).padStart(2, "0")}
                  </p>
                  <h3 className="mt-3 font-display text-2xl uppercase text-ink transition-colors group-hover:text-gold">
                    {city}
                  </h3>
                  <p className="mt-2 flex items-center gap-2 text-xs text-mute">
                    <MapPin className="size-3.5 shrink-0" /> {address}
                  </p>
                </div>
                <ArrowUpRight className="size-5 shrink-0 text-mute transition-all group-hover:rotate-45 group-hover:text-gold" />
              </Link>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ------------------------------------------------ CTA */}
      <section className="relative overflow-hidden border-t border-line">
        <img
          src="/images/hero-poster.jpg"
          alt=""
          className="absolute inset-0 size-full object-cover opacity-40"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-carbon via-carbon/60 to-carbon" />
        <div className="relative mx-auto max-w-7xl px-5 py-28 text-center md:px-8 md:py-40">
          <Reveal>
            <p className="font-mono text-[11px] tracking-[0.35em] text-gold uppercase">
              Ready when you are
            </p>
            <h2 className="mx-auto mt-6 max-w-4xl font-display text-5xl uppercase leading-[0.95] text-ink md:text-8xl">
              Your next drive is <span className="text-outline">waiting</span>
            </h2>
            <div className="mt-12 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Link
                href="/fleet"
                className="group flex items-center gap-3 bg-gold px-10 py-4 font-mono text-[11px] font-bold tracking-[0.25em] text-carbon uppercase transition-all hover:bg-gold-strong hover:shadow-[0_0_40px_rgba(255,180,0,0.35)]"
              >
                Browse the fleet
                <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
              </Link>
              <Link
                href="mailto:book@velocityrentals.co.za"
                className="border border-line px-10 py-4 font-mono text-[11px] tracking-[0.25em] text-ink uppercase transition-all hover:border-gold hover:text-gold"
              >
                Speak to our team
              </Link>
            </div>
          </Reveal>
        </div>
      </section>
    </>
  );
}
