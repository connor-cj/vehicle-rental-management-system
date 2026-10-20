/**
 * Seed script — populates vehicles, customers and bookings.
 * Run with: npx tsx src/db/seed.ts          (inserts only when empty)
 *           npx tsx src/db/seed.ts --force  (wipes and re-seeds)
 *
 * Reads the connection string from your .env file (DATABASE_URL).
 */

import "dotenv/config";
import type { NewBooking, NewVehicle } from "./schema";

process.env.DATABASE_URL ??=
  "postgresql://postgres:postgres@127.0.0.1:5432/app_db";

const DAYS = 86_400_000;
const now = Date.now();
const iso = (offsetDays: number) =>
  new Date(now + offsetDays * DAYS).toISOString().slice(0, 10);
const tsAgo = (offsetDays: number) => new Date(now - offsetDays * DAYS);

async function main() {
  const { db } = await import("./index");
  const { vehicles, customers, bookings } = await import("./schema");
  const { VEHICLE_IMAGE_PRESETS } = await import("../lib/images");
  const { EXTRAS } = await import("../lib/constants");
  const { sql } = await import("drizzle-orm");

  const img = (label: string) =>
    VEHICLE_IMAGE_PRESETS.find((p) => p.label === label)?.url ??
    VEHICLE_IMAGE_PRESETS[0].url;

  const force = process.argv.includes("--force");

  if (force) {
    console.log("Wiping existing data…");
    await db.delete(bookings);
    await db.delete(customers);
    await db.delete(vehicles);
  } else {
    const [{ n }] = await db
      .select({ n: sql<number>`count(*)::int` })
      .from(vehicles);
    if (n > 0) {
      console.log(`Database already has ${n} vehicles — skipping seed.`);
      process.exit(0);
    }
  }

  // ---------------------------------------------------------------------
  // vehicles
  // ---------------------------------------------------------------------
  const vehicleSeed: NewVehicle[] = [
    {
      name: "Lamborghini Huracán STO",
      make: "Lamborghini",
      model: "Huracán STO",
      year: 2023,
      category: "Supercar",
      transmission: "Automatic",
      fuel: "Petrol",
      seats: 2,
      doors: 2,
      dailyRateCents: 1_650_000,
      depositCents: 2_500_000,
      mileage: 12_400,
      color: "Arancio Borealis",
      licensePlate: "VX 001 GP",
      status: "available",
      features: ["Launch Control", "Paddle Shifters", "360° Camera", "Apple CarPlay", "Premium Sound", "Ambient Lighting"],
      imageUrl: img("Lamborghini Huracán STO"),
      description:
        "A street-legal racer with a 470 kW naturally-aspirated V10, rear-wheel steering and razor-honed aero. The STO is the sharpest Huracán ever built.",
      location: "Johannesburg",
    },
    {
      name: "Ferrari Roma",
      make: "Ferrari",
      model: "Roma",
      year: 2022,
      category: "Supercar",
      transmission: "Automatic",
      fuel: "Petrol",
      seats: 2,
      doors: 2,
      dailyRateCents: 1_580_000,
      depositCents: 2_500_000,
      mileage: 9_800,
      color: "Rosso Corsa",
      licensePlate: "FR 62 GT GP",
      status: "available",
      features: ["Launch Control", "Paddle Shifters", "Apple CarPlay", "Leather Seats", "Blind Spot Monitor", "Premium Sound"],
      imageUrl: img("Ferrari Roma"),
      description:
        "La nuova dolce vita. A twin-turbo V8 grand tourer that pairs 456 kW with timeless Italian elegance — the definitive weekend escape.",
      location: "Johannesburg",
    },
    {
      name: "Aston Martin Vantage",
      make: "Aston Martin",
      model: "Vantage",
      year: 2022,
      category: "Supercar",
      transmission: "Automatic",
      fuel: "Petrol",
      seats: 2,
      doors: 2,
      dailyRateCents: 1_390_000,
      depositCents: 2_000_000,
      mileage: 15_200,
      color: "Onyx Black",
      licensePlate: "AM V8 GP",
      status: "available",
      features: ["Paddle Shifters", "Launch Control", "Memory Seats", "360° Camera", "Apple CarPlay", "Premium Sound"],
      imageUrl: img("Aston Martin Vantage"),
      description:
        "A 4.0-litre twin-turbo V8 wrapped in uncompromising British design. Raw, vocal and utterly addictive on a mountain pass.",
      location: "Johannesburg",
    },
    {
      name: "Aston Martin DB12",
      make: "Aston Martin",
      model: "DB12",
      year: 2024,
      category: "Supercar",
      transmission: "Automatic",
      fuel: "Petrol",
      seats: 2,
      doors: 2,
      dailyRateCents: 1_490_000,
      depositCents: 2_000_000,
      mileage: 4_300,
      color: "Magnetic Silver",
      licensePlate: "DB 012 CA",
      status: "available",
      features: ["Paddle Shifters", "Adaptive Cruise Control", "Apple CarPlay", "Leather Seats", "Ambient Lighting", "Head-Up Display"],
      imageUrl: img("Aston Martin DB12"),
      description:
        "The world's first Super Tourer. 500 kW, a hand-crafted cabin and a chassis tuned for grand distances — arrive everywhere in style.",
      location: "Cape Town",
    },
    {
      name: "Chevrolet Camaro SS",
      make: "Chevrolet",
      model: "Camaro SS",
      year: 2021,
      category: "Sports",
      transmission: "Automatic",
      fuel: "Petrol",
      seats: 4,
      doors: 2,
      dailyRateCents: 495_000,
      depositCents: 750_000,
      mileage: 31_200,
      color: "Shadow Black",
      licensePlate: "YR 88 SS GP",
      status: "available",
      features: ["Launch Control", "Paddle Shifters", "Bluetooth", "Reverse Camera", "Premium Sound", "Heated Seats"],
      imageUrl: img("Chevrolet Camaro SS"),
      description:
        "An American icon with a 6.2-litre small-block V8 under the bonnet. Thunderous, theatrical and guaranteed to turn every head in traffic.",
      location: "Pretoria",
    },
    {
      name: "Mercedes-Benz S 580",
      make: "Mercedes-Benz",
      model: "S 580",
      year: 2023,
      category: "Luxury",
      transmission: "Automatic",
      fuel: "Hybrid",
      seats: 5,
      doors: 4,
      dailyRateCents: 685_000,
      depositCents: 1_000_000,
      mileage: 18_800,
      color: "Obsidian Black",
      licensePlate: "CA 902-114",
      status: "available",
      features: ["Air Suspension", "Adaptive Cruise Control", "Panoramic Roof", "Heated Seats", "Ambient Lighting", "Head-Up Display", "Memory Seats", "Premium Sound"],
      imageUrl: img("Mercedes-Benz S 580"),
      description:
        "The benchmark for executive travel. A whisper-quiet V8 with EQ Boost, rear-axle steering and a cabin that rivals a business lounge.",
      location: "Cape Town",
    },
    {
      name: "Genesis G80 3.5T",
      make: "Genesis",
      model: "G80",
      year: 2023,
      category: "Luxury",
      transmission: "Automatic",
      fuel: "Petrol",
      seats: 5,
      doors: 4,
      dailyRateCents: 325_000,
      depositCents: 500_000,
      mileage: 20_900,
      color: "Vanta Black",
      licensePlate: "G80 CA 412",
      status: "available",
      features: ["Leather Seats", "Heated Seats", "Adaptive Cruise Control", "360° Camera", "Apple CarPlay", "Blind Spot Monitor", "Lane Keep Assist"],
      imageUrl: img("Genesis G80"),
      description:
        "Understated luxury with a twin-turbo V6 and one of the finest interiors in its class. Executive presence without the badge tax.",
      location: "Cape Town",
    },
    {
      name: "Genesis G70 3.3T Sport",
      make: "Genesis",
      model: "G70",
      year: 2022,
      category: "Sedan",
      transmission: "Automatic",
      fuel: "Petrol",
      seats: 5,
      doors: 4,
      dailyRateCents: 245_000,
      depositCents: 400_000,
      mileage: 27_600,
      color: "Kavala Grey",
      licensePlate: "CA 317-880",
      status: "available",
      features: ["Paddle Shifters", "Leather Seats", "Apple CarPlay", "Android Auto", "Blind Spot Monitor", "Sunroof"],
      imageUrl: img("Genesis G70 Sport"),
      description:
        "A compact sports sedan with a 274 kW twin-turbo punch and rear-biased dynamics. The thinking driver's alternative to the German status quo.",
      location: "Cape Town",
    },
    {
      name: "Mercedes-AMG SL 43",
      make: "Mercedes-AMG",
      model: "SL 43",
      year: 2023,
      category: "Convertible",
      transmission: "Automatic",
      fuel: "Petrol",
      seats: 4,
      doors: 2,
      dailyRateCents: 745_000,
      depositCents: 1_200_000,
      mileage: 8_900,
      color: "Graphite Black",
      licensePlate: "SL 043 CA",
      status: "available",
      features: ["Air Suspension", "Paddle Shifters", "Heated Seats", "Apple CarPlay", "Ambient Lighting", "Premium Sound"],
      imageUrl: img("Mercedes-AMG SL 43"),
      description:
        "Roof down, coastal road ahead. The latest SL blends AMG punch with open-air glamour — made for Chapman's Peak at golden hour.",
      location: "Cape Town",
    },
    {
      name: "BMW X5 xDrive40i",
      make: "BMW",
      model: "X5 xDrive40i",
      year: 2023,
      category: "SUV",
      transmission: "Automatic",
      fuel: "Hybrid",
      seats: 5,
      doors: 4,
      dailyRateCents: 285_000,
      depositCents: 500_000,
      mileage: 22_400,
      color: "Black Sapphire",
      licensePlate: "KX 84 X5 GP",
      status: "rented",
      features: ["Panoramic Roof", "Air Suspension", "Adaptive Cruise Control", "360° Camera", "Heated Seats", "Apple CarPlay", "Android Auto"],
      imageUrl: img("BMW X5"),
      description:
        "The definitive luxury family SUV. Silky straight-six power, xDrive confidence and space for the whole clan plus luggage.",
      location: "Johannesburg",
    },
    {
      name: "Genesis GV80 3.5T",
      make: "Genesis",
      model: "GV80",
      year: 2023,
      category: "SUV",
      transmission: "Automatic",
      fuel: "Petrol",
      seats: 7,
      doors: 4,
      dailyRateCents: 295_000,
      depositCents: 500_000,
      mileage: 17_600,
      color: "Adriatic Blue",
      licensePlate: "GV 80 PT GP",
      status: "available",
      features: ["Panoramic Roof", "Heated Seats", "Adaptive Cruise Control", "360° Camera", "Blind Spot Monitor", "Premium Sound"],
      imageUrl: img("Genesis GV80"),
      description:
        "Seven seats of quilted-leather serenity with a twin-turbo V6. Arrive at the lodge looking like the reservation was someone's great idea.",
      location: "Pretoria",
    },
    {
      name: "Mercedes-Benz GLE 450",
      make: "Mercedes-Benz",
      model: "GLE 450",
      year: 2022,
      category: "SUV",
      transmission: "Automatic",
      fuel: "Hybrid",
      seats: 5,
      doors: 4,
      dailyRateCents: 265_000,
      depositCents: 500_000,
      mileage: 33_800,
      color: "Selenite Grey",
      licensePlate: "ND 511-208",
      status: "available",
      features: ["Air Suspension", "Panoramic Roof", "4x4 Low Range", "Adaptive Cruise Control", "Apple CarPlay", "Heated Seats"],
      imageUrl: img("Mercedes-Benz GLE 450"),
      description:
        "EQ-boosted six-cylinder smoothness with real gravel-road ability. From uMhlanga to the Berg, it simply never breaks a sweat.",
      location: "Durban",
    },
    {
      name: "Land Rover Defender 110",
      make: "Land Rover",
      model: "Defender 110 D300",
      year: 2023,
      category: "SUV",
      transmission: "Automatic",
      fuel: "Diesel",
      seats: 5,
      doors: 4,
      dailyRateCents: 295_000,
      depositCents: 600_000,
      mileage: 24_100,
      color: "Pangea Green",
      licensePlate: "CA 446-722",
      status: "rented",
      features: ["4x4 Low Range", "Diff Lock", "Air Suspension", "Roof Rails", "360° Camera", "Tow Bar", "Panoramic Roof"],
      imageUrl: img("Land Rover Defender 110"),
      description:
        "An icon rebuilt for the modern overlander. Torquey straight-six diesel, air suspension and unstoppable all-terrain composure.",
      location: "Cape Town",
    },
    {
      name: "Mitsubishi Pajero Sport 2.4",
      make: "Mitsubishi",
      model: "Pajero Sport 2.4 Di-D",
      year: 2022,
      category: "SUV",
      transmission: "Automatic",
      fuel: "Diesel",
      seats: 7,
      doors: 4,
      dailyRateCents: 145_000,
      depositCents: 300_000,
      mileage: 41_200,
      color: "White Diamond",
      licensePlate: "ND 388-416",
      status: "available",
      features: ["4x4 Low Range", "Diff Lock", "Tow Bar", "Reverse Camera", "Bluetooth", "Roof Rails"],
      imageUrl: img("Mitsubishi Pajero Sport"),
      description:
        "Seven seats, proper low range and a reputation earned on African dirt. The sensible choice for a KZN bush-and-beach holiday.",
      location: "Durban",
    },
    {
      name: "Volvo XC60 T6",
      make: "Volvo",
      model: "XC60 T6",
      year: 2022,
      category: "SUV",
      transmission: "Automatic",
      fuel: "Petrol",
      seats: 5,
      doors: 4,
      dailyRateCents: 185_000,
      depositCents: 350_000,
      mileage: 28_900,
      color: "Denim Blue",
      licensePlate: "WF 22 EC 668",
      status: "available",
      features: ["Panoramic Roof", "Adaptive Cruise Control", "Lane Keep Assist", "Blind Spot Monitor", "Heated Seats", "Apple CarPlay"],
      imageUrl: img("Volvo XC60"),
      description:
        "Scandinavian calm for long Eastern Cape roads. Super-safe, beautifully trimmed and effortlessly quick thanks to twin-charged power.",
      location: "Gqeberha",
    },
    {
      name: "Volkswagen Golf 8 GTI",
      make: "Volkswagen",
      model: "Golf 8 GTI",
      year: 2023,
      category: "Hatchback",
      transmission: "Automatic",
      fuel: "Petrol",
      seats: 5,
      doors: 4,
      dailyRateCents: 125_000,
      depositCents: 250_000,
      mileage: 16_900,
      color: "Kings Red",
      licensePlate: "CA 717-302",
      status: "rented",
      features: ["Paddle Shifters", "Launch Control", "Heated Seats", "Apple CarPlay", "Android Auto", "Ambient Lighting"],
      imageUrl: img("Volkswagen Golf GTI"),
      description:
        "South Africa's favourite hot hatch. 180 kW of everyday usable pace with a chassis that flatters every driver, every single day.",
      location: "Cape Town",
    },
    {
      name: "Hyundai i30 N",
      make: "Hyundai",
      model: "i30 N",
      year: 2022,
      category: "Hatchback",
      transmission: "Manual",
      fuel: "Petrol",
      seats: 5,
      doors: 4,
      dailyRateCents: 145_000,
      depositCents: 250_000,
      mileage: 21_500,
      color: "Shadow Grey",
      licensePlate: "NN 30 GP 481",
      status: "maintenance",
      features: ["Launch Control", "Paddle Shifters", "Bluetooth", "Apple CarPlay", "Android Auto", "Premium Sound"],
      imageUrl: img("Hyundai i30 N"),
      description:
        "A riot on three pedals. Crackling exhaust, rev-matching and a chassis honed at the Nürburgring — back on the fleet soon.",
      location: "Johannesburg",
    },
    {
      name: "Toyota Hilux GR-S III",
      make: "Toyota",
      model: "Hilux GR-S III",
      year: 2023,
      category: "Bakkie",
      transmission: "Automatic",
      fuel: "Diesel",
      seats: 5,
      doors: 4,
      dailyRateCents: 185_000,
      depositCents: 350_000,
      mileage: 38_700,
      color: "Glacier White",
      licensePlate: "FND 647 FS",
      status: "available",
      features: ["4x4 Low Range", "Diff Lock", "Tow Bar", "Reverse Camera", "Bluetooth", "Roof Rails"],
      imageUrl: img("Toyota Hilux GR-S"),
      description:
        "The legend, Gazoo Racing tuned. Wider track, uprated damping and the same bulletproof 2.8 GD-6 heart. Built for the Karoo and beyond.",
      location: "Bloemfontein",
    },
    {
      name: "Ford Ranger Wildtrak 3.0 V6",
      make: "Ford",
      model: "Ranger Wildtrak",
      year: 2023,
      category: "Bakkie",
      transmission: "Automatic",
      fuel: "Diesel",
      seats: 5,
      doors: 4,
      dailyRateCents: 165_000,
      depositCents: 350_000,
      mileage: 34_800,
      color: "Conquer Grey",
      licensePlate: "TR 91 WT GP",
      status: "available",
      features: ["4x4 Low Range", "Diff Lock", "Tow Bar", "360° Camera", "Adaptive Cruise Control", "Apple CarPlay"],
      imageUrl: img("Ford Ranger Wildtrak"),
      description:
        "A 184 kW V6 turbodiesel bakkie that tows 3.5 tonnes and cruises like an SUV. The most complete double-cab on sale today.",
      location: "Pretoria",
    },
    {
      name: "Mercedes-Benz V-Class V250d",
      make: "Mercedes-Benz",
      model: "V-Class V250d",
      year: 2022,
      category: "Van",
      transmission: "Automatic",
      fuel: "Diesel",
      seats: 7,
      doors: 4,
      dailyRateCents: 245_000,
      depositCents: 400_000,
      mileage: 19_200,
      color: "Obsidian Black",
      licensePlate: "CA 882-914",
      status: "available",
      features: ["Leather Seats", "Heated Seats", "Adaptive Cruise Control", "360° Camera", "Apple CarPlay", "Ambient Lighting"],
      imageUrl: img("Mercedes-Benz V-Class"),
      description:
        "Business-class travel for seven. Individual captain's chairs, hushed diesel power and luggage space for a full airport run.",
      location: "Cape Town",
    },
  ];

  const insertedVehicles = await db
    .insert(vehicles)
    .values(vehicleSeed)
    .returning();
  console.log(`Seeded ${insertedVehicles.length} vehicles.`);
  const vid = (name: string) =>
    insertedVehicles.find((v) => v.name === name)!.id;

  // ---------------------------------------------------------------------
  // customers
  // ---------------------------------------------------------------------
  const customerSeed = [
    { fullName: "Thandiwe Nkosi", email: "thandiwe.nkosi@gmail.com", phone: "+27 82 555 0134", licenseNumber: "NKOTH850221LC", city: "Cape Town" },
    { fullName: "Pieter van der Merwe", email: "pieter.vdm@outlook.com", phone: "+27 83 555 0921", licenseNumber: "VDMPIE771104LC", city: "Pretoria" },
    { fullName: "Sipho Dlamini", email: "sipho.dlamini@gmail.com", phone: "+27 72 555 0342", licenseNumber: "DLASIP900316LC", city: "Durban" },
    { fullName: "Ayesha Patel", email: "ayesha.patel@icloud.com", phone: "+27 84 555 0789", licenseNumber: "PATAYE880512LC", city: "Johannesburg" },
    { fullName: "Johan Botha", email: "johan.botha@gmail.com", phone: "+27 82 555 1104", licenseNumber: "BOTJOH810928LC", city: "Bloemfontein" },
    { fullName: "Lerato Mokoena", email: "lerato.mokoena@gmail.com", phone: "+27 73 555 0667", licenseNumber: "MOKLER940203LC", city: "Johannesburg" },
    { fullName: "Daniel Petersen", email: "d.petersen@gmail.com", phone: "+27 81 555 0458", licenseNumber: "PETDAN860730LC", city: "Cape Town" },
    { fullName: "Naledi Khumalo", email: "naledi.k@gmail.com", phone: "+27 79 555 0881", licenseNumber: "KHUNAL910417LC", city: "Durban" },
  ];

  const insertedCustomers = await db
    .insert(customers)
    .values(customerSeed)
    .returning();
  console.log(`Seeded ${insertedCustomers.length} customers.`);
  const cid = (email: string) =>
    insertedCustomers.find((c) => c.email === email)!.id;

  // ---------------------------------------------------------------------
  // bookings
  // ---------------------------------------------------------------------
  const extra = (name: string) => EXTRAS.find((e) => e.name === name)!;

  const makeBooking = (
    ref: string,
    vehicleName: string,
    email: string,
    startOff: number,
    endOff: number,
    pickup: string,
    dropoff: string,
    status: string,
    extras: string[],
    createdAgo: number,
    notes = "",
  ): NewBooking => {
    const vehicle = insertedVehicles.find((v) => v.name === vehicleName)!;
    const days = Math.max(1, endOff - startOff);
    const chosenExtras = extras.map(extra);
    const baseCents = days * vehicle.dailyRateCents;
    const extrasCents =
      days * chosenExtras.reduce((s, e) => s + e.dailyRateCents, 0);
    return {
      reference: ref,
      vehicleId: vehicle.id,
      customerId: cid(email),
      startDate: iso(startOff),
      endDate: iso(endOff),
      pickupLocation: pickup,
      dropoffLocation: dropoff,
      status,
      extras: chosenExtras,
      baseCents,
      extrasCents,
      totalCents: baseCents + extrasCents,
      notes,
      createdAt: tsAgo(createdAgo),
    };
  };

  const bookingSeed: NewBooking[] = [
    makeBooking("VX-7K2M4P", "BMW X5 xDrive40i", "ayesha.patel@icloud.com", -3, 2, "Johannesburg", "Johannesburg", "active", ["Full Cover Insurance"], 12, "Airport collection — OR Tambo."),
    makeBooking("VX-3C8RZT", "Land Rover Defender 110", "thandiwe.nkosi@gmail.com", -1, 4, "Cape Town", "Cape Town", "active", ["Child Seat", "GPS Navigation"], 8, "Heading up the West Coast."),
    makeBooking("VX-9Q4WEA", "Volkswagen Golf 8 GTI", "d.petersen@gmail.com", -2, 1, "Cape Town", "Cape Town", "active", [], 6, ""),
    makeBooking("VX-M5H2VX", "Lamborghini Huracán STO", "lerato.mokoena@gmail.com", 5, 7, "Johannesburg", "Johannesburg", "confirmed", ["Full Cover Insurance"], 2, "Weekend experience booking."),
    makeBooking("VX-T8N1QK", "Mercedes-Benz S 580", "naledi.k@gmail.com", 2, 6, "Cape Town", "Durban", "confirmed", [], 4, "One-way rental with chauffeur handover."),
    makeBooking("VX-B7Y3PL", "Toyota Hilux GR-S III", "johan.botha@gmail.com", 1, 5, "Bloemfontein", "Bloemfontein", "pending", ["Wi-Fi Hotspot"], 1, "Farm access roads — confirm availability."),
    makeBooking("VX-D6F9KS", "Ford Ranger Wildtrak 3.0 V6", "pieter.vdm@outlook.com", 3, 9, "Pretoria", "Pretoria", "pending", [], 0, ""),
    makeBooking("VX-Z2X8NM", "Ferrari Roma", "lerato.mokoena@gmail.com", -40, -36, "Johannesburg", "Johannesburg", "completed", ["Full Cover Insurance"], 45, "Anniversary weekend."),
    makeBooking("VX-J4T7BH", "Chevrolet Camaro SS", "sipho.dlamini@gmail.com", -70, -66, "Pretoria", "Durban", "completed", [], 75, "One-way coastal trip."),
    makeBooking("VX-P9W5VD", "Mercedes-Benz V-Class V250d", "thandiwe.nkosi@gmail.com", -100, -95, "Cape Town", "Cape Town", "completed", ["Additional Driver", "Child Seat"], 105, "Family holiday — Garden Route."),
    makeBooking("VX-K8M3RT", "Volvo XC60 T6", "d.petersen@gmail.com", -140, -136, "Gqeberha", "Gqeberha", "completed", [], 145, ""),
    makeBooking("VX-H6C2XW", "Genesis GV80 3.5T", "ayesha.patel@icloud.com", -170, -165, "Johannesburg", "Johannesburg", "completed", ["Full Cover Insurance"], 175, "Sun City conference."),
    makeBooking("VX-G1S9QE", "Mercedes-Benz GLE 450", "naledi.k@gmail.com", -20, -16, "Durban", "Durban", "cancelled", [], 25, "Client cancelled — rescheduling."),
    makeBooking("VX-U5V7LJ", "Mitsubishi Pajero Sport 2.4", "sipho.dlamini@gmail.com", 8, 12, "Durban", "Durban", "confirmed", ["GPS Navigation"], 3, "iSimangaliso trip."),
  ];

  await db.insert(bookings).values(bookingSeed);
  console.log(`Seeded ${bookingSeed.length} bookings.`);
  console.log("Seed complete.");
  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
