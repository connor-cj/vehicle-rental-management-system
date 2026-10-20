import { sql } from "drizzle-orm";
import {
  pgTable,
  serial,
  text,
  integer,
  timestamp,
  jsonb,
  date,
  index,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

// ---------------------------------------------------------------------------
// vehicles — the rental fleet
// ---------------------------------------------------------------------------
export const vehicles = pgTable("vehicles", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  make: text("make").notNull(),
  model: text("model").notNull(),
  year: integer("year").notNull(),
  category: text("category").notNull(), // SUV, Sedan, Sports, Supercar, Luxury, Hatchback, Bakkie, Convertible, Van
  transmission: text("transmission").notNull(), // Automatic | Manual
  fuel: text("fuel").notNull(), // Petrol | Diesel | Hybrid | Electric
  seats: integer("seats").notNull().default(5),
  doors: integer("doors").notNull().default(4),
  dailyRateCents: integer("daily_rate_cents").notNull(), // ZAR cents
  depositCents: integer("deposit_cents").notNull().default(0), // ZAR cents
  mileage: integer("mileage").notNull().default(0), // odometer km
  color: text("color").notNull().default("Black"),
  licensePlate: text("license_plate").notNull(),
  status: text("status").notNull().default("available"), // available | rented | maintenance | retired
  features: text("features")
    .array()
    .notNull()
    .default(sql`'{}'::text[]`),
  imageUrl: text("image_url").notNull(),
  description: text("description").notNull().default(""),
  location: text("location").notNull().default("Cape Town"), // branch city
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// ---------------------------------------------------------------------------
// customers
// ---------------------------------------------------------------------------
export const customers = pgTable("customers", {
  id: serial("id").primaryKey(),
  fullName: text("full_name").notNull(),
  email: text("email").notNull(),
  phone: text("phone").notNull().default(""),
  licenseNumber: text("license_number").notNull().default(""),
  idNumber: text("id_number").notNull().default(""),
  city: text("city").notNull().default(""),
  notes: text("notes").notNull().default(""),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// ---------------------------------------------------------------------------
// bookings
// ---------------------------------------------------------------------------
export type BookingExtra = { name: string; dailyRateCents: number };

export const bookings = pgTable(
  "bookings",
  {
    id: serial("id").primaryKey(),
    reference: text("reference").notNull().unique(),
    vehicleId: integer("vehicle_id")
      .notNull()
      .references(() => vehicles.id, { onDelete: "cascade" }),
    customerId: integer("customer_id")
      .notNull()
      .references(() => customers.id, { onDelete: "cascade" }),
    startDate: date("start_date").notNull(), // YYYY-MM-DD
    endDate: date("end_date").notNull(),
    pickupLocation: text("pickup_location").notNull(),
    dropoffLocation: text("dropoff_location").notNull(),
    status: text("status").notNull().default("pending"), // pending | confirmed | active | completed | cancelled
    extras: jsonb("extras")
      .$type<BookingExtra[]>()
      .notNull()
      .default(sql`'[]'::jsonb`),
    baseCents: integer("base_cents").notNull(),
    extrasCents: integer("extras_cents").notNull().default(0),
    totalCents: integer("total_cents").notNull(),
    notes: text("notes").notNull().default(""),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (t) => [
    index("bookings_vehicle_idx").on(t.vehicleId),
    index("bookings_status_idx").on(t.status),
    index("bookings_customer_idx").on(t.customerId),
  ],
);

// ---------------------------------------------------------------------------
// relations
// ---------------------------------------------------------------------------
export const vehiclesRelations = relations(vehicles, ({ many }) => ({
  bookings: many(bookings),
}));

export const customersRelations = relations(customers, ({ many }) => ({
  bookings: many(bookings),
}));

export const bookingsRelations = relations(bookings, ({ one }) => ({
  vehicle: one(vehicles, {
    fields: [bookings.vehicleId],
    references: [vehicles.id],
  }),
  customer: one(customers, {
    fields: [bookings.customerId],
    references: [customers.id],
  }),
}));

// ---------------------------------------------------------------------------
// types
// ---------------------------------------------------------------------------
export type Vehicle = typeof vehicles.$inferSelect;
export type NewVehicle = typeof vehicles.$inferInsert;
export type Customer = typeof customers.$inferSelect;
export type NewCustomer = typeof customers.$inferInsert;
export type Booking = typeof bookings.$inferSelect;
export type NewBooking = typeof bookings.$inferInsert;
