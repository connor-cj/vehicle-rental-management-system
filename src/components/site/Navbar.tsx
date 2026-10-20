"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Menu, X, LockKeyhole, Zap } from "lucide-react";
import { cn } from "@/lib/utils";

const LINKS = [
  { href: "/", label: "Home" },
  { href: "/fleet", label: "Fleet" },
  { href: "/#experience", label: "Experience" },
  { href: "/#locations", label: "Branches" },
];

export default function Navbar() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => setOpen(false), [pathname]);

  return (
    <>
      <header
        className={cn(
          "fixed inset-x-0 top-0 z-50 transition-all duration-500",
          scrolled
            ? "border-b border-line bg-carbon/85 backdrop-blur-xl"
            : "border-b border-transparent bg-transparent",
        )}
      >
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-5 md:h-20 md:px-8">
          <Link href="/" className="group flex items-center gap-2.5">
            <span className="grid size-9 place-items-center bg-gold text-carbon transition-transform duration-300 group-hover:-rotate-6">
              <Zap className="size-4.5" strokeWidth={2.5} />
            </span>
            <span className="font-display text-xl tracking-[0.18em] text-ink">
              VELOCITY
              <span className="ml-1.5 font-mono text-[10px] font-normal tracking-[0.3em] text-gold">
                RENTALS
              </span>
            </span>
          </Link>

          <nav className="hidden items-center gap-8 md:flex">
            {LINKS.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className={cn(
                  "font-mono text-[11px] tracking-[0.25em] text-mute uppercase transition-colors hover:text-ink",
                  pathname === l.href && "text-gold hover:text-gold",
                )}
              >
                {l.label}
              </Link>
            ))}
            <Link
              href="/fleet"
              className="bg-gold px-5 py-2.5 font-mono text-[11px] font-bold tracking-[0.2em] text-carbon uppercase transition-all hover:bg-gold-strong hover:shadow-[0_0_28px_rgba(255,180,0,0.35)]"
            >
              Book Now
            </Link>
            <Link
              href="/admin"
              title="Admin portal"
              className="grid size-9 place-items-center border border-line text-mute transition-colors hover:border-gold/50 hover:text-gold"
            >
              <LockKeyhole className="size-4" />
            </Link>
          </nav>

          <button
            onClick={() => setOpen(!open)}
            className="grid size-10 place-items-center text-ink md:hidden"
            aria-label="Toggle menu"
          >
            {open ? <X className="size-5" /> : <Menu className="size-5" />}
          </button>
        </div>
      </header>

      {/* Mobile menu */}
      <div
        className={cn(
          "fixed inset-0 z-40 bg-carbon/97 backdrop-blur-2xl transition-all duration-500 md:hidden",
          open ? "visible opacity-100" : "invisible opacity-0",
        )}
      >
        <div className="flex h-full flex-col justify-center gap-2 px-8 pt-16">
          {LINKS.map((l, i) => (
            <Link
              key={l.href}
              href={l.href}
              className={cn(
                "border-b border-line py-5 font-display text-4xl tracking-wide text-ink uppercase transition-all duration-500",
                open ? "translate-y-0 opacity-100" : "translate-y-6 opacity-0",
              )}
              style={{ transitionDelay: `${i * 70}ms` }}
            >
              {l.label}
            </Link>
          ))}
          <Link
            href="/admin"
            className={cn(
              "border-b border-line py-5 font-display text-4xl tracking-wide text-gold uppercase transition-all duration-500",
              open ? "translate-y-0 opacity-100" : "translate-y-6 opacity-0",
            )}
            style={{ transitionDelay: "280ms" }}
          >
            Admin Portal
          </Link>
        </div>
      </div>
    </>
  );
}
