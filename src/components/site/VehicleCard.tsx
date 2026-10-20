import Link from "next/link";
import { ArrowUpRight, Users, Cog, Fuel } from "lucide-react";
import type { Vehicle } from "@/db/schema";
import { formatZAR } from "@/lib/format";
import { cn } from "@/lib/utils";

interface VehicleCardProps {
  vehicle: Vehicle;
  tripDays?: number | null;
  large?: boolean;
}

export default function VehicleCard({ vehicle, tripDays, large }: VehicleCardProps) {
  return (
    <Link
      href={`/fleet/${vehicle.id}`}
      className={cn(
        "group relative flex flex-col overflow-hidden border border-line bg-panel transition-all duration-500 hover:border-gold/40",
        large && "h-full",
      )}
    >
      <div
        className={cn(
          "relative overflow-hidden bg-raised",
          large ? "aspect-[16/8] md:aspect-auto md:flex-1" : "aspect-[16/10]",
        )}
      >
        <img
          src={vehicle.imageUrl}
          alt={vehicle.name}
          loading="lazy"
          className="size-full object-cover transition-transform duration-[1.2s] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.06]"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-panel via-transparent to-transparent" />

        <div className="absolute left-4 top-4 flex items-center gap-2">
          <span className="bg-carbon/80 px-3 py-1.5 font-mono text-[10px] tracking-[0.25em] text-gold uppercase backdrop-blur-sm">
            {vehicle.category}
          </span>
          {vehicle.status === "rented" && (
            <span className="bg-carbon/80 px-3 py-1.5 font-mono text-[10px] tracking-[0.25em] text-mute uppercase backdrop-blur-sm">
              On Rent
            </span>
          )}
          {vehicle.status === "maintenance" && (
            <span className="bg-carbon/80 px-3 py-1.5 font-mono text-[10px] tracking-[0.25em] text-orange-300 uppercase backdrop-blur-sm">
              In Workshop
            </span>
          )}
        </div>

        <span className="absolute right-4 top-4 grid size-10 translate-y-2 place-items-center bg-gold text-carbon opacity-0 transition-all duration-500 group-hover:translate-y-0 group-hover:opacity-100">
          <ArrowUpRight className="size-4.5" strokeWidth={2.5} />
        </span>
      </div>

      <div className="flex flex-1 flex-col justify-between gap-5 p-5">
        <div>
          <div className="flex items-start justify-between gap-3">
            <h3
              className={cn(
                "font-display uppercase leading-none text-ink transition-colors group-hover:text-gold",
                large ? "text-3xl md:text-4xl" : "text-2xl",
              )}
            >
              {vehicle.name}
            </h3>
          </div>
          <p className="mt-2 font-mono text-[10px] tracking-[0.25em] text-mute uppercase">
            {vehicle.year} · {vehicle.location}
          </p>
        </div>

        <div className="flex items-end justify-between gap-4 border-t border-line pt-4">
          <div className="flex items-center gap-4 font-mono text-[11px] text-mute">
            <span className="flex items-center gap-1.5">
              <Users className="size-3.5 text-gold/70" /> {vehicle.seats}
            </span>
            <span className="flex items-center gap-1.5">
              <Cog className="size-3.5 text-gold/70" /> {vehicle.transmission === "Automatic" ? "Auto" : "Manual"}
            </span>
            <span className="hidden items-center gap-1.5 sm:flex">
              <Fuel className="size-3.5 text-gold/70" /> {vehicle.fuel}
            </span>
          </div>
          <div className="text-right">
            {tripDays && tripDays > 0 ? (
              <>
                <p className="font-mono text-base font-bold text-ink">
                  {formatZAR(vehicle.dailyRateCents * tripDays)}
                </p>
                <p className="font-mono text-[9px] tracking-[0.2em] text-mute uppercase">
                  {tripDays} day{tripDays > 1 ? "s" : "s"} total
                </p>
              </>
            ) : (
              <>
                <p className="font-mono text-base font-bold text-ink">
                  {formatZAR(vehicle.dailyRateCents)}
                </p>
                <p className="font-mono text-[9px] tracking-[0.2em] text-mute uppercase">
                  per day
                </p>
              </>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}
