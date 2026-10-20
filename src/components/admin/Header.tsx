import type { ReactNode } from "react";

interface AdminHeaderProps {
  title: string;
  sub?: string;
  children?: ReactNode;
}

export default function AdminHeader({ title, sub, children }: AdminHeaderProps) {
  return (
    <div className="mb-8 flex flex-col gap-4 border-b border-line pb-6 md:flex-row md:items-end md:justify-between">
      <div>
        <p className="font-mono text-[10px] tracking-[0.35em] text-gold uppercase">
          Velocity Control Room
        </p>
        <h1 className="mt-2 font-display text-3xl uppercase leading-none text-ink md:text-4xl">
          {title}
        </h1>
        {sub && <p className="mt-2 text-sm text-mute">{sub}</p>}
      </div>
      {children && <div className="flex shrink-0 items-center gap-3">{children}</div>}
    </div>
  );
}
