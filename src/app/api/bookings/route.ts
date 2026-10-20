import { NextResponse } from "next/server";
import { and, eq, inArray, desc } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/db";
import { bookings, customers, vehicles } from "@/db/schema";
import { EXTRAS } from "@/lib/constants";
import { generateReference } from "@/lib/utils";

export const dynamic = "force-dynamic";

const createSchema = z.object({
  vehicleId: z.number().int(),
  startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  pickupLocation: z.string().min(1),
  dropoffLocation: z.string().min(1),
  fullName: z.string().min(2),
  email: z.string().email(),
  phone: z.string().optional().default(""),
  licenseNumber: z.string().optional().default(""),
  notes: z.string().optional().default(""),
  extras: z.array(z.string()).optional().default([]),
});

export async function GET() {
  try {
    const list = await db.query.bookings.findMany({
      with: { vehicle: true, customer: true },
      orderBy: [desc(bookings.createdAt)],
    });
    return NextResponse.json(list);
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to load bookings" },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = createSchema.parse(await request.json());

    if (body.endDate <= body.startDate) {
      return NextResponse.json(
        { error: "Return date must be after the collection date." },
        { status: 400 },
      );
    }

    const [vehicle] = await db
      .select()
      .from(vehicles)
      .where(eq(vehicles.id, body.vehicleId))
      .limit(1);

    if (!vehicle) {
      return NextResponse.json({ error: "Vehicle not found." }, { status: 404 });
    }
    if (vehicle.status === "maintenance" || vehicle.status === "retired") {
      return NextResponse.json(
        { error: "This vehicle is currently unavailable." },
        { status: 409 },
      );
    }

    // Availability — clash with pending / confirmed / active bookings
    const existing = await db
      .select()
      .from(bookings)
      .where(
        and(
          eq(bookings.vehicleId, vehicle.id),
          inArray(bookings.status, ["pending", "confirmed", "active"]),
        ),
      );
    const clash = existing.some(
      (b) => !(b.endDate <= body.startDate || b.startDate >= body.endDate),
    );
    if (clash) {
      return NextResponse.json(
        { error: "This vehicle is already booked for the selected dates." },
        { status: 409 },
      );
    }

    // Find or create the customer by email
    let [customer] = await db
      .select()
      .from(customers)
      .where(eq(customers.email, body.email.toLowerCase()))
      .limit(1);

    if (!customer) {
      [customer] = await db
        .insert(customers)
        .values({
          fullName: body.fullName,
          email: body.email.toLowerCase(),
          phone: body.phone,
          licenseNumber: body.licenseNumber,
        })
        .returning();
    }

    const days = Math.max(
      1,
      Math.round((Date.parse(body.endDate) - Date.parse(body.startDate)) / 86_400_000),
    );
    const chosenExtras = EXTRAS.filter((e) => body.extras.includes(e.name)).map(
      (e) => ({ name: e.name, dailyRateCents: e.dailyRateCents }),
    );
    const baseCents = days * vehicle.dailyRateCents;
    const extrasCents =
      days * chosenExtras.reduce((s, e) => s + e.dailyRateCents, 0);

    const [created] = await db
      .insert(bookings)
      .values({
        reference: generateReference(),
        vehicleId: vehicle.id,
        customerId: customer.id,
        startDate: body.startDate,
        endDate: body.endDate,
        pickupLocation: body.pickupLocation,
        dropoffLocation: body.dropoffLocation,
        status: "pending",
        extras: chosenExtras,
        baseCents,
        extrasCents,
        totalCents: baseCents + extrasCents,
        notes: body.notes,
      })
      .returning();

    return NextResponse.json(
      {
        id: created.id,
        reference: created.reference,
        totalCents: created.totalCents,
        days,
      },
      { status: 201 },
    );
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json(
        { error: err.issues[0]?.message ?? "Invalid booking data" },
        { status: 400 },
      );
    }
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to create booking" },
      { status: 500 },
    );
  }
}
