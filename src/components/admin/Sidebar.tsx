"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  CarFront,
  CalendarDays,
  Users,
  Zap,
  ArrowUpRight,
} from "lucide-react";
import { cn } from "@/lib/utils";

const NAV = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { href: "/admin/vehicles", label: "Fleet", icon: CarFront, exact: false },
  { href: "/admin/bookings", label: "Bookings", icon: CalendarDays, exact: false },
  { href: "/admin/customers", label: "Customers", icon: Users, exact: false },
];

export default function Sidebar() {
  const pathname = usePathname();

  const renderLink = (item: (typeof NAV)[number], mobile = false) => {
    const active = item.exact ? pathname === item.href : pathname.startsWith(item.href);
    return (
      <Link
        key={item.href}
        href={item.href}
        className={cn(
          "flex items-center gap-3 border-l-2 px-4 py-3 font-mono text-[11px] tracking-[0.2em] uppercase transition-all",
          mobile && "shrink-0 border-l-0 border-b-2 px-3 py-2.5",
          active
            ? "border-gold bg-gold/10 text-gold"
            : "border-transparent text-mute hover:bg-raised hover:text-ink",
        )}
      >
        <item.icon className="size-4" />
        {item.label}
      </Link>
    );
  };

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-60 flex-col border-r border-line bg-panel md:flex">
        <Link href="/admin" className="flex items-center gap-2.5 border-b border-line px-6 py-6">
          <span className="grid size-9 place-items-center bg-gold text-carbon">
            <Zap className="size-4.5" strokeWidth={2.5} />
          </span>
          <span>
            <span className="block font-display text-lg tracking-[0.15em] text-ink">
              VELOCITY
            </span>
            <span className="block font-mono text-[9px] tracking-[0.35em] text-gold uppercase">
              Control Room
            </span>
          </span>
        </Link>

        <nav className="flex-1 space-y-1 px-3 py-6">
          {NAV.map((item) => renderLink(item))}
        </nav>

        <div className="border-t border-line p-4">
          <Link
            href="/"
            className="flex items-center justify-between border border-line px-4 py-3 font-mono text-[10px] tracking-[0.2em] text-mute uppercase transition-colors hover:border-gold/50 hover:text-gold"
          >
            View live site
            <ArrowUpRight className="size-3.5" />
          </Link>
          <p className="mt-4 px-1 font-mono text-[9px] tracking-[0.2em] text-mute/50 uppercase">
            v1.0 · ZAR · en-ZA
          </p>
        </div>
      </aside>

      {/* Mobile top bar */}
      <div className="sticky top-0 z-40 border-b border-line bg-panel/95 backdrop-blur-xl md:hidden">
        <div className="flex items-center justify-between px-4 py-4">
          <Link href="/admin" className="flex items-center gap-2">
            <span className="grid size-8 place-items-center bg-gold text-carbon">
              <Zap className="size-4" strokeWidth={2.5} />
            </span>
            <span className="font-display text-base tracking-[0.15em] text-ink">
              VELOCITY
              <span className="ml-1 font-mono text-[8px] tracking-[0.3em] text-gold">ADMIN</span>
            </span>
          </Link>
          <Link
            href="/"
            className="flex items-center gap-1.5 font-mono text-[10px] tracking-[0.2em] text-mute uppercase"
          >
            Live site <ArrowUpRight className="size-3.5" />
          </Link>
        </div>
        <nav className="no-scrollbar flex gap-1 overflow-x-auto px-3 pb-2">
          {NAV.map((item) => renderLink(item, true))}
        </nav>
      </div>
    </>
  );
}
