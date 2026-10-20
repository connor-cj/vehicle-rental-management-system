"use client";

import { useMemo, useState } from "react";
import { Search, SlidersHorizontal, X } from "lucide-react";
import type { Vehicle } from "@/db/schema";
import { CATEGORIES, CITIES } from "@/lib/constants";
import { formatZAR, rentalDays, todayISO } from "@/lib/format";
import VehicleCard from "./VehicleCard";
import Reveal from "./Reveal";
import { cn } from "@/lib/utils";

interface FleetExplorerProps {
  vehicles: Vehicle[];
  initialCategory?: string;
  initialPickup?: string;
  initialStart?: string;
  initialEnd?: string;
}

const VALID_CATEGORIES = new Set<string>([...CATEGORIES]);

export default function FleetExplorer({
  vehicles,
  initialCategory,
  initialPickup,
  initialStart,
  initialEnd,
}: FleetExplorerProps) {
  const [q, setQ] = useState("");
  const [category, setCategory] = useState(
    initialCategory && VALID_CATEGORIES.has(initialCategory) ? initialCategory : "All",
  );
  const [location, setLocation] = useState(initialPickup ?? "All");
  const [transmission, setTransmission] = useState("All");
  const [sort, setSort] = useState("price-asc");
  const [maxRate, setMaxRate] = useState<number | null>(null);
  const [showFilters, setShowFilters] = useState(false);

  const maxFleetRate = useMemo(
    () => Math.max(...vehicles.map((v) => v.dailyRateCents), 0),
    [vehicles],
  );

  const tripDays = useMemo(() => {
    if (!initialStart || !initialEnd) return null;
    if (initialStart < todayISO() || initialEnd <= initialStart) return null;
    return rentalDays(initialStart, initialEnd);
  }, [initialStart, initialEnd]);

  const filtered = useMemo(() => {
    let list = vehicles.filter((v) => v.status !== "retired");
    if (q.trim()) {
      const needle = q.trim().toLowerCase();
      list = list.filter(
        (v) =>
          v.name.toLowerCase().includes(needle) ||
          v.make.toLowerCase().includes(needle) ||
          v.category.toLowerCase().includes(needle),
      );
    }
    if (category !== "All") list = list.filter((v) => v.category === category);
    if (location !== "All") list = list.filter((v) => v.location === location);
    if (transmission !== "All") list = list.filter((v) => v.transmission === transmission);
    if (maxRate !== null) list = list.filter((v) => v.dailyRateCents <= maxRate);

    switch (sort) {
      case "price-desc":
        list = [...list].sort((a, b) => b.dailyRateCents - a.dailyRateCents);
        break;
      case "seats":
        list = [...list].sort((a, b) => b.seats - a.seats);
        break;
      case "year":
        list = [...list].sort((a, b) => b.year - a.year);
        break;
      default:
        list = [...list].sort((a, b) => a.dailyRateCents - b.dailyRateCents);
    }
    // Push unavailable to the back
    return [...list].sort((a, b) => {
      const rank = (s: string) => (s === "available" ? 0 : s === "rented" ? 1 : 2);
      return rank(a.status) - rank(b.status);
    });
  }, [vehicles, q, category, location, transmission, maxRate, sort]);

  const hasActiveFilters =
    q || category !== "All" || location !== "All" || transmission !== "All" || maxRate !== null;

  const clearAll = () => {
    setQ("");
    setCategory("All");
    setLocation("All");
    setTransmission("All");
    setMaxRate(null);
    setSort("price-asc");
  };

  return (
    <div className="mt-10">
      {tripDays && (
        <div className="mb-8 flex flex-wrap items-center gap-x-6 gap-y-2 border border-gold/30 bg-gold/5 px-5 py-4 font-mono text-xs text-gold">
          <span className="tracking-[0.2em] uppercase">
            Trip quote · {initialStart} → {initialEnd}
          </span>
          <span className="text-ink">
            {tripDays} day{tripDays > 1 ? "s" : ""} — pricing shown is your total per vehicle
          </span>
        </div>
      )}

      {/* Toolbar */}
      <div className="sticky top-16 z-30 -mx-5 border-y border-line bg-carbon/90 px-5 py-4 backdrop-blur-xl md:top-20 md:mx-0 md:border md:px-4">
        <div className="flex flex-wrap items-center gap-3">
          <label className="flex min-w-52 flex-1 items-center gap-3 border border-line bg-panel px-4 py-3">
            <Search className="size-4 shrink-0 text-mute" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search make, model, category…"
              className="w-full bg-transparent text-sm text-ink placeholder:text-mute/60 focus:outline-none"
            />
          </label>

          <select
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            className="appearance-none border border-line bg-panel px-4 py-3 text-sm text-ink focus:outline-none"
          >
            <option value="All">All branches</option>
            {CITIES.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>

          <select
            value={sort}
            onChange={(e) => setSort(e.target.value)}
            className="appearance-none border border-line bg-panel px-4 py-3 text-sm text-ink focus:outline-none"
          >
            <option value="price-asc">Price · low → high</option>
            <option value="price-desc">Price · high → low</option>
            <option value="year">Newest first</option>
            <option value="seats">Most seats</option>
          </select>

          <button
            onClick={() => setShowFilters(!showFilters)}
            className={cn(
              "flex items-center gap-2 border px-4 py-3 font-mono text-[11px] tracking-[0.2em] uppercase transition-colors",
              showFilters
                ? "border-gold bg-gold/10 text-gold"
                : "border-line text-mute hover:text-ink",
            )}
          >
            <SlidersHorizontal className="size-4" />
            Filters
          </button>

          {hasActiveFilters && (
            <button
              onClick={clearAll}
              className="flex items-center gap-2 border border-line px-4 py-3 font-mono text-[11px] tracking-[0.2em] text-mute uppercase transition-colors hover:border-rose-400/50 hover:text-rose-300"
            >
              <X className="size-4" /> Clear
            </button>
          )}
        </div>

        {/* Category chips */}
        <div className="no-scrollbar mt-3 flex gap-2 overflow-x-auto pb-1">
          {["All", ...CATEGORIES].map((c) => (
            <button
              key={c}
              onClick={() => setCategory(c)}
              className={cn(
                "shrink-0 border px-4 py-2 font-mono text-[10px] tracking-[0.2em] uppercase transition-all",
                category === c
                  ? "border-gold bg-gold text-carbon font-bold"
                  : "border-line text-mute hover:border-gold/50 hover:text-ink",
              )}
            >
              {c}
            </button>
          ))}
        </div>

        {/* Extended filters */}
        {showFilters && (
          <div className="mt-4 grid gap-6 border-t border-line pt-5 sm:grid-cols-2 lg:grid-cols-3">
            <div>
              <p className="mb-2 font-mono text-[10px] tracking-[0.25em] text-mute uppercase">
                Transmission
              </p>
              <div className="flex gap-2">
                {["All", "Automatic", "Manual"].map((t) => (
                  <button
                    key={t}
                    onClick={() => setTransmission(t)}
                    className={cn(
                      "border px-4 py-2 font-mono text-[10px] tracking-[0.15em] uppercase transition-all",
                      transmission === t
                        ? "border-gold bg-gold/10 text-gold"
                        : "border-line text-mute hover:text-ink",
                    )}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>
            <div className="lg:col-span-2">
              <p className="mb-2 flex justify-between font-mono text-[10px] tracking-[0.25em] text-mute uppercase">
                <span>Max daily rate</span>
                <span className="text-gold">
                  {maxRate === null ? "No limit" : `${formatZAR(maxRate)} / day`}
                </span>
              </p>
              <input
                type="range"
                min={100000}
                max={maxFleetRate}
                step={50000}
                value={maxRate ?? maxFleetRate}
                onChange={(e) => {
                  const val = Number(e.target.value);
                  setMaxRate(val >= maxFleetRate ? null : val);
                }}
                className="w-full"
              />
            </div>
          </div>
        )}
      </div>

      {/* Results */}
      <p className="mt-8 font-mono text-[11px] tracking-[0.25em] text-mute uppercase">
        Showing <span className="text-gold">{filtered.length}</span> of {vehicles.filter((v) => v.status !== "retired").length} vehicles
      </p>

      {filtered.length > 0 ? (
        <div className="mt-6 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {filtered.map((v, i) => (
            <Reveal key={v.id} delay={Math.min(i, 8) * 0.04} y={20}>
              <VehicleCard vehicle={v} tripDays={tripDays} />
            </Reveal>
          ))}
        </div>
      ) : (
        <div className="mt-6 border border-dashed border-line p-16 text-center">
          <p className="font-display text-2xl uppercase text-mute">No vehicles match</p>
          <p className="mt-2 text-sm text-mute/70">
            Try widening your filters or searching a different branch.
          </p>
          <button
            onClick={clearAll}
            className="mt-6 border border-line px-6 py-3 font-mono text-[11px] tracking-[0.2em] text-ink uppercase transition-colors hover:border-gold hover:text-gold"
          >
            Reset filters
          </button>
        </div>
      )}
    </div>
  );
}
