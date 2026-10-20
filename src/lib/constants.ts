// Shared domain constants for Velocity Rentals

export const BRAND = "VELOCITY";
export const BRAND_SUFFIX = "RENTALS";

export const CATEGORIES = [
  "SUV",
  "Sedan",
  "Sports",
  "Supercar",
  "Luxury",
  "Hatchback",
  "Bakkie",
  "Convertible",
  "Van",
] as const;

export const CITIES = [
  "Cape Town",
  "Johannesburg",
  "Pretoria",
  "Durban",
  "Gqeberha",
  "Bloemfontein",
] as const;

export const TRANSMISSIONS = ["Automatic", "Manual"] as const;
export const FUELS = ["Petrol", "Diesel", "Hybrid", "Electric"] as const;

export const VEHICLE_STATUSES = [
  "available",
  "rented",
  "maintenance",
  "retired",
] as const;
export type VehicleStatus = (typeof VEHICLE_STATUSES)[number];

export const BOOKING_STATUSES = [
  "pending",
  "confirmed",
  "active",
  "completed",
  "cancelled",
] as const;
export type BookingStatus = (typeof BOOKING_STATUSES)[number];

// Optional add-ons charged per day, in ZAR cents
export const EXTRAS = [
  { name: "Full Cover Insurance", dailyRateCents: 25000 },
  { name: "Additional Driver", dailyRateCents: 15000 },
  { name: "Child Seat", dailyRateCents: 9500 },
  { name: "GPS Navigation", dailyRateCents: 7500 },
  { name: "Wi-Fi Hotspot", dailyRateCents: 6000 },
] as const;

export const FEATURE_PRESETS = [
  "Apple CarPlay",
  "Android Auto",
  "Bluetooth",
  "Leather Seats",
  "Heated Seats",
  "Panoramic Roof",
  "Sunroof",
  "Adaptive Cruise Control",
  "Reverse Camera",
  "360° Camera",
  "Blind Spot Monitor",
  "Lane Keep Assist",
  "Paddle Shifters",
  "Launch Control",
  "Air Suspension",
  "Tow Bar",
  "4x4 Low Range",
  "Diff Lock",
  "Roof Rails",
  "USB-C Fast Charge",
  "Premium Sound",
  "Ambient Lighting",
  "Memory Seats",
  "Head-Up Display",
] as const;

export const INCLUDED_KM_PER_DAY = 250;

export const VEHICLE_STATUS_META: Record<
  VehicleStatus,
  { label: string; dot: string; classes: string }
> = {
  available: {
    label: "Available",
    dot: "bg-emerald-400",
    classes: "border-emerald-400/25 bg-emerald-400/10 text-emerald-300",
  },
  rented: {
    label: "On Rent",
    dot: "bg-gold",
    classes: "border-gold/30 bg-gold/10 text-gold",
  },
  maintenance: {
    label: "Maintenance",
    dot: "bg-orange-400",
    classes: "border-orange-400/25 bg-orange-400/10 text-orange-300",
  },
  retired: {
    label: "Retired",
    dot: "bg-zinc-500",
    classes: "border-zinc-400/25 bg-zinc-400/10 text-zinc-400",
  },
};

export const BOOKING_STATUS_META: Record<
  BookingStatus,
  { label: string; dot: string; classes: string }
> = {
  pending: {
    label: "Pending",
    dot: "bg-amber-300",
    classes: "border-amber-300/25 bg-amber-300/10 text-amber-200",
  },
  confirmed: {
    label: "Confirmed",
    dot: "bg-sky-400",
    classes: "border-sky-400/25 bg-sky-400/10 text-sky-300",
  },
  active: {
    label: "Active",
    dot: "bg-gold",
    classes: "border-gold/30 bg-gold/10 text-gold",
  },
  completed: {
    label: "Completed",
    dot: "bg-emerald-400",
    classes: "border-emerald-400/25 bg-emerald-400/10 text-emerald-300",
  },
  cancelled: {
    label: "Cancelled",
    dot: "bg-rose-400",
    classes: "border-rose-400/25 bg-rose-400/10 text-rose-300",
  },
};
