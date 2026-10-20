import { NextResponse } from "next/server";
import { asc } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/db";
import { vehicles } from "@/db/schema";

export const dynamic = "force-dynamic";

const vehicleSchema = z.object({
  name: z.string().min(2),
  make: z.string().min(1),
  model: z.string().min(1),
  year: z.number().int().min(1990).max(2035),
  category: z.string().min(1),
  transmission: z.string().min(1),
  fuel: z.string().min(1),
  seats: z.number().int().min(1).max(24),
  doors: z.number().int().min(2).max(8),
  dailyRateCents: z.number().int().min(0),
  depositCents: z.number().int().min(0),
  mileage: z.number().int().min(0),
  color: z.string().min(1),
  licensePlate: z.string().min(1),
  status: z.enum(["available", "rented", "maintenance", "retired"]),
  features: z.array(z.string()),
  imageUrl: z.string().min(1),
  description: z.string(),
  location: z.string().min(1),
});

export async function GET() {
  try {
    const list = await db.select().from(vehicles).orderBy(asc(vehicles.id));
    return NextResponse.json(list);
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to load vehicles" },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = vehicleSchema.parse(await request.json());
    const [created] = await db.insert(vehicles).values(body).returning();
    return NextResponse.json(created, { status: 201 });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json(
        { error: err.issues[0]?.message ?? "Invalid vehicle data" },
        { status: 400 },
      );
    }
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to create vehicle" },
      { status: 500 },
    );
  }
}
