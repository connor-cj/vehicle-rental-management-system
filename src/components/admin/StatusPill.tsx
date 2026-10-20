import {
  BOOKING_STATUS_META,
  VEHICLE_STATUS_META,
  type BookingStatus,
  type VehicleStatus,
} from "@/lib/constants";
import { cn } from "@/lib/utils";

interface StatusPillProps {
  kind: "booking" | "vehicle";
  status: string;
  className?: string;
}

export default function StatusPill({ kind, status, className }: StatusPillProps) {
  const meta =
    kind === "booking"
      ? BOOKING_STATUS_META[status as BookingStatus]
      : VEHICLE_STATUS_META[status as VehicleStatus];
  if (!meta) return null;

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 border px-2.5 py-1 font-mono text-[10px] tracking-[0.12em] uppercase",
        meta.classes,
        className,
      )}
    >
      <span className={cn("size-1.5 rounded-full", meta.dot)} />
      {meta.label}
    </span>
  );
}
