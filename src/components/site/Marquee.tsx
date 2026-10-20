import { CITIES } from "@/lib/constants";

const WORDS = [
  "SUPERCARS",
  "LUXURY SUVS",
  "DOUBLE-CAB BAKKIES",
  "CONVERTIBLES",
  "EXECUTIVE SEDANS",
  "PEOPLE MOVERS",
];

function Row() {
  return (
    <div className="flex shrink-0 items-center">
      {WORDS.map((w) => (
        <span key={w} className="flex items-center">
          <span className="px-8 font-display text-4xl tracking-wide text-ink uppercase md:text-5xl">
            {w}
          </span>
          <span className="size-2 rotate-45 bg-gold" />
        </span>
      ))}
      {CITIES.slice(0, 3).map((c) => (
        <span key={c} className="flex items-center">
          <span className="px-8 font-display text-4xl tracking-wide text-outline uppercase md:text-5xl">
            {c}
          </span>
          <span className="size-2 rotate-45 bg-gold" />
        </span>
      ))}
    </div>
  );
}

export default function Marquee() {
  return (
    <div className="relative overflow-hidden border-y border-line bg-panel py-7">
      <div className="flex w-max animate-marquee">
        <Row />
        <Row />
      </div>
      <div className="pointer-events-none absolute inset-y-0 left-0 w-32 bg-gradient-to-r from-carbon to-transparent" />
      <div className="pointer-events-none absolute inset-y-0 right-0 w-32 bg-gradient-to-l from-carbon to-transparent" />
    </div>
  );
}
