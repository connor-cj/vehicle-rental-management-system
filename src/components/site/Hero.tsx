"use client";

import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { ArrowRight, MapPin, CalendarDays, ShieldCheck, Clock3 } from "lucide-react";
import { HERO_VIDEO, HERO_POSTER } from "@/lib/images";
import { CITIES } from "@/lib/constants";
import { addDaysISO, todayISO } from "@/lib/format";

interface HeroProps {
  fleetCount: number;
}

const ease = [0.16, 1, 0.3, 1] as const;

export default function Hero({ fleetCount }: HeroProps) {
  const router = useRouter();
  const [pickup, setPickup] = useState<string>(CITIES[0]);
  const [start, setStart] = useState(todayISO());
  const [end, setEnd] = useState(addDaysISO(todayISO(), 3));

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams({ pickup, start, end });
    router.push(`/fleet?${params.toString()}`);
  };

  return (
    <section className="relative flex min-h-svh flex-col overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0">
        <video
          className="size-full object-cover"
          autoPlay
          muted
          loop
          playsInline
          poster={HERO_POSTER}
        >
          <source src={HERO_VIDEO} type="video/mp4" />
        </video>
        <div className="absolute inset-0 bg-gradient-to-t from-carbon via-carbon/55 to-carbon/30" />
        <div className="absolute inset-0 bg-gradient-to-r from-carbon/80 via-transparent to-carbon/40" />
      </div>

      {/* Content */}
      <div className="relative z-10 mx-auto flex w-full max-w-7xl flex-1 flex-col justify-center px-5 pt-32 pb-10 md:px-8">
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2, ease }}
          className="mb-6 flex items-center gap-3 font-mono text-[11px] tracking-[0.35em] text-gold uppercase"
        >
          <span className="h-px w-10 bg-gold" />
          Premium Fleet · South Africa
        </motion.p>

        <h1 className="font-display uppercase leading-[0.9]">
          <span className="block overflow-hidden">
            <motion.span
              initial={{ y: "110%" }}
              animate={{ y: 0 }}
              transition={{ duration: 1, delay: 0.35, ease }}
              className="block text-[clamp(3.2rem,10vw,8.5rem)] text-ink"
            >
              Drive the
            </motion.span>
          </span>
          <span className="block overflow-hidden">
            <motion.span
              initial={{ y: "110%" }}
              animate={{ y: 0 }}
              transition={{ duration: 1, delay: 0.5, ease }}
              className="block text-[clamp(3.2rem,10vw,8.5rem)] text-outline"
            >
              Extra&shy;ordinary
            </motion.span>
          </span>
        </h1>

        <div className="mt-8 flex flex-col gap-10 md:flex-row md:items-end md:justify-between">
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.7, ease }}
            className="max-w-md text-base leading-relaxed text-mute md:text-lg"
          >
            From Huracáns to Hiluxes — a meticulously engineered fleet,
            transparent ZAR rates, and white-glove service across six South
            African cities.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.85, ease }}
            className="flex items-center gap-8 font-mono"
          >
            <div>
              <p className="text-3xl font-bold text-ink md:text-4xl">{fleetCount}+</p>
              <p className="mt-1 text-[10px] tracking-[0.25em] text-mute uppercase">Vehicles</p>
            </div>
            <div className="h-10 w-px bg-line" />
            <div>
              <p className="text-3xl font-bold text-ink md:text-4xl">06</p>
              <p className="mt-1 text-[10px] tracking-[0.25em] text-mute uppercase">Branches</p>
            </div>
            <div className="h-10 w-px bg-line" />
            <div>
              <p className="text-3xl font-bold text-gold md:text-4xl">4.9</p>
              <p className="mt-1 text-[10px] tracking-[0.25em] text-mute uppercase">Rating</p>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Booking bar */}
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1, delay: 1, ease }}
        className="relative z-10 mx-auto w-full max-w-7xl px-5 pb-10 md:px-8"
      >
        <form
          onSubmit={submit}
          className="flex flex-col gap-px border border-line bg-line md:flex-row"
        >
          <label className="flex flex-1 items-center gap-4 bg-carbon/85 px-6 py-5 backdrop-blur-xl">
            <MapPin className="size-4.5 shrink-0 text-gold" />
            <span className="flex-1">
              <span className="block font-mono text-[9px] tracking-[0.3em] text-mute uppercase">
                Pick-up Branch
              </span>
              <select
                value={pickup}
                onChange={(e) => setPickup(e.target.value)}
                className="mt-1 w-full appearance-none bg-transparent text-sm font-medium text-ink outline-none"
              >
                {CITIES.map((c) => (
                  <option key={c} value={c} className="bg-panel">
                    {c}
                  </option>
                ))}
              </select>
            </span>
          </label>

          <label className="flex flex-1 items-center gap-4 bg-carbon/85 px-6 py-5 backdrop-blur-xl">
            <CalendarDays className="size-4.5 shrink-0 text-gold" />
            <span className="flex-1">
              <span className="block font-mono text-[9px] tracking-[0.3em] text-mute uppercase">
                Collection Date
              </span>
              <input
                type="date"
                value={start}
                min={todayISO()}
                onChange={(e) => setStart(e.target.value)}
                className="mt-1 w-full bg-transparent text-sm font-medium text-ink outline-none"
              />
            </span>
          </label>

          <label className="flex flex-1 items-center gap-4 bg-carbon/85 px-6 py-5 backdrop-blur-xl">
            <CalendarDays className="size-4.5 shrink-0 text-gold" />
            <span className="flex-1">
              <span className="block font-mono text-[9px] tracking-[0.3em] text-mute uppercase">
                Return Date
              </span>
              <input
                type="date"
                value={end}
                min={start}
                onChange={(e) => setEnd(e.target.value)}
                className="mt-1 w-full bg-transparent text-sm font-medium text-ink outline-none"
              />
            </span>
          </label>

          <button
            type="submit"
            className="group flex items-center justify-center gap-3 bg-gold px-10 py-5 font-mono text-[11px] font-bold tracking-[0.25em] text-carbon uppercase transition-all hover:bg-gold-strong"
          >
            Find a Vehicle
            <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
          </button>
        </form>

        <div className="mt-4 flex flex-wrap items-center gap-x-8 gap-y-2 font-mono text-[10px] tracking-[0.2em] text-mute/80 uppercase">
          <span className="flex items-center gap-2">
            <ShieldCheck className="size-3.5 text-gold" /> Full-cover options available
          </span>
          <span className="flex items-center gap-2">
            <Clock3 className="size-3.5 text-gold" /> 24/7 roadside assistance
          </span>
          <span className="hidden items-center gap-2 sm:flex">
            <MapPin className="size-3.5 text-gold" /> Airport delivery on request
          </span>
        </div>
      </motion.div>
    </section>
  );
}
