import Link from "next/link";
import { Zap, MapPin, Phone, Mail, LockKeyhole } from "lucide-react";
import { CITIES } from "@/lib/constants";

export default function Footer() {
  return (
    <footer className="relative border-t border-line bg-panel">
      <div className="mx-auto max-w-7xl px-5 py-16 md:px-8">
        <div className="grid gap-12 md:grid-cols-[1.4fr_1fr_1fr_1fr]">
          <div>
            <Link href="/" className="flex items-center gap-2.5">
              <span className="grid size-9 place-items-center bg-gold text-carbon">
                <Zap className="size-4.5" strokeWidth={2.5} />
              </span>
              <span className="font-display text-2xl tracking-[0.18em] text-ink">
                VELOCITY
                <span className="ml-1.5 font-mono text-[10px] font-normal tracking-[0.3em] text-gold">
                  RENTALS
                </span>
              </span>
            </Link>
            <p className="mt-5 max-w-xs text-sm leading-relaxed text-mute">
              South Africa&apos;s premium vehicle rental house. Supercars to
              double-cabs — engineered fleets, transparent ZAR rates, and
              service across six cities.
            </p>
            <div className="mt-6 space-y-2.5 font-mono text-xs text-mute">
              <p className="flex items-center gap-2.5">
                <Phone className="size-3.5 text-gold" /> +27 21 555 0180
              </p>
              <p className="flex items-center gap-2.5">
                <Mail className="size-3.5 text-gold" /> book@velocityrentals.co.za
              </p>
            </div>
          </div>

          <div>
            <h4 className="font-mono text-[10px] tracking-[0.3em] text-gold uppercase">
              Explore
            </h4>
            <ul className="mt-5 space-y-3 text-sm text-mute">
              <li><Link href="/fleet" className="transition-colors hover:text-ink">The Fleet</Link></li>
              <li><Link href="/#experience" className="transition-colors hover:text-ink">The Experience</Link></li>
              <li><Link href="/#locations" className="transition-colors hover:text-ink">Our Branches</Link></li>
              <li><Link href="/fleet?category=Supercar" className="transition-colors hover:text-ink">Supercar Hire</Link></li>
              <li><Link href="/fleet?category=Bakkie" className="transition-colors hover:text-ink">Bakkie Hire</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-mono text-[10px] tracking-[0.3em] text-gold uppercase">
              Branches
            </h4>
            <ul className="mt-5 space-y-3 text-sm text-mute">
              {CITIES.slice(0, 5).map((c) => (
                <li key={c} className="flex items-center gap-2">
                  <MapPin className="size-3.5 text-line" />
                  <Link href={`/fleet?pickup=${encodeURIComponent(c)}`} className="transition-colors hover:text-ink">
                    {c}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-mono text-[10px] tracking-[0.3em] text-gold uppercase">
              Company
            </h4>
            <ul className="mt-5 space-y-3 text-sm text-mute">
              <li><Link href="/admin" className="flex items-center gap-2 transition-colors hover:text-gold"><LockKeyhole className="size-3.5" /> Admin Portal</Link></li>
              <li><Link href="/admin/bookings" className="transition-colors hover:text-ink">Manage Bookings</Link></li>
              <li><Link href="/admin/vehicles" className="transition-colors hover:text-ink">Fleet Manager</Link></li>
              <li className="pt-2 font-mono text-xs text-mute/60">Reg. 2016/442103/07</li>
            </ul>
          </div>
        </div>

        <div className="mt-14 flex flex-col items-start justify-between gap-4 border-t border-line pt-8 font-mono text-[10px] tracking-[0.2em] text-mute/70 uppercase md:flex-row md:items-center">
          <p>© {new Date().getFullYear()} Velocity Rentals (Pty) Ltd — All rates in ZAR</p>
          <p>Cape Town · Johannesburg · Durban</p>
        </div>
      </div>
    </footer>
  );
}
