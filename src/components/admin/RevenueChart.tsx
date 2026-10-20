import { formatZARCompact } from "@/lib/format";

export interface RevenuePoint {
  label: string;
  totalCents: number;
}

export default function RevenueChart({ data }: { data: RevenuePoint[] }) {
  const max = Math.max(...data.map((d) => d.totalCents), 1);

  return (
    <div className="border border-line bg-panel p-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-display text-lg uppercase tracking-wide text-ink">
            Revenue
          </h3>
          <p className="mt-1 font-mono text-[10px] tracking-[0.25em] text-mute uppercase">
            Last 6 months · ZAR · excl. cancelled
          </p>
        </div>
        <span className="font-mono text-xl font-bold text-gold">
          {formatZARCompact(data.reduce((s, d) => s + d.totalCents, 0))}
        </span>
      </div>

      <div className="mt-8 flex h-44 items-end gap-3 md:gap-5">
        {data.map((d) => (
          <div key={d.label} className="group flex h-full flex-1 flex-col justify-end">
            <p className="mb-2 text-center font-mono text-[10px] text-mute opacity-0 transition-opacity group-hover:opacity-100">
              {formatZARCompact(d.totalCents)}
            </p>
            <div
              className="w-full bg-gradient-to-t from-gold/25 to-gold transition-all duration-500 group-hover:from-gold/50 group-hover:to-gold-strong"
              style={{ height: `${Math.max(3, (d.totalCents / max) * 100)}%` }}
            />
            <p className="mt-3 text-center font-mono text-[10px] tracking-[0.15em] text-mute uppercase">
              {d.label}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
