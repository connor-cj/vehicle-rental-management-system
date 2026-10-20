import type { LucideIcon } from "lucide-react";

interface StatCardProps {
  icon: LucideIcon;
  label: string;
  value: string;
  sub?: string;
  accent?: boolean;
}

export default function StatCard({ icon: Icon, label, value, sub, accent }: StatCardProps) {
  return (
    <div className="group relative overflow-hidden border border-line bg-panel p-6 transition-colors hover:border-gold/30">
      <div className="flex items-start justify-between">
        <span className="grid size-11 place-items-center border border-line bg-carbon text-gold">
          <Icon className="size-5" />
        </span>
        {accent && (
          <span className="border border-gold/30 bg-gold/10 px-2 py-1 font-mono text-[9px] tracking-[0.2em] text-gold uppercase">
            Live
          </span>
        )}
      </div>
      <p className="mt-6 font-mono text-3xl font-bold tracking-tight text-ink">
        {value}
      </p>
      <p className="mt-1 font-mono text-[10px] tracking-[0.25em] text-mute uppercase">
        {label}
      </p>
      {sub && <p className="mt-3 text-xs text-mute/80">{sub}</p>}
    </div>
  );
}
