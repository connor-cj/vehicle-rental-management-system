// Currency & date formatting helpers — currency is South African Rand (ZAR)

export function formatZAR(cents: number, fractionDigits = 0): string {
  return new Intl.NumberFormat("en-ZA", {
    style: "currency",
    currency: "ZAR",
    minimumFractionDigits: fractionDigits,
    maximumFractionDigits: fractionDigits,
  }).format(cents / 100);
}

export function formatZARCompact(cents: number): string {
  const rands = cents / 100;
  if (rands >= 1_000_000) return `R ${(rands / 1_000_000).toFixed(1)}m`;
  if (rands >= 1_000) return `R ${(rands / 1_000).toFixed(1)}k`;
  return `R ${rands.toFixed(0)}`;
}

export function formatDate(iso: string | Date): string {
  const d = typeof iso === "string" ? new Date(iso + (iso.length === 10 ? "T00:00:00" : "")) : iso;
  return new Intl.DateTimeFormat("en-ZA", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(d);
}

export function formatDateTime(iso: string | Date): string {
  const d = typeof iso === "string" ? new Date(iso) : iso;
  return new Intl.DateTimeFormat("en-ZA", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(d);
}

export function formatKm(km: number): string {
  return `${new Intl.NumberFormat("en-ZA").format(km)} km`;
}

/** Number of billable rental days between two YYYY-MM-DD dates (min 1). */
export function rentalDays(start: string, end: string): number {
  const ms = Date.parse(end) - Date.parse(start);
  return Math.max(1, Math.round(ms / 86_400_000));
}

export function todayISO(): string {
  return new Date().toISOString().slice(0, 10);
}

export function addDaysISO(iso: string, days: number): string {
  const d = new Date(iso + "T00:00:00");
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}
