import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/db";
import { vehicles } from "@/db/schema";

export const dynamic = "force-dynamic";

const updateSchema = z
  .object({
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
  })
  .partial();

type Ctx = { params: Promise<{ id: string }> };

export async function GET(_req: Request, { params }: Ctx) {
  try {
    const { id } = await params;
    const [vehicle] = await db
      .select()
      .from(vehicles)
      .where(eq(vehicles.id, Number(id)))
      .limit(1);
    if (!vehicle) return NextResponse.json({ error: "Vehicle not found" }, { status: 404 });
    return NextResponse.json(vehicle);
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to load vehicle" },
      { status: 500 },
    );
  }
}

export async function PATCH(request: Request, { params }: Ctx) {
  try {
    const { id } = await params;
    const body = updateSchema.parse(await request.json());
    const [updated] = await db
      .update(vehicles)
      .set(body)
      .where(eq(vehicles.id, Number(id)))
      .returning();
    if (!updated) return NextResponse.json({ error: "Vehicle not found" }, { status: 404 });
    return NextResponse.json(updated);
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json(
        { error: err.issues[0]?.message ?? "Invalid vehicle data" },
        { status: 400 },
      );
    }
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to update vehicle" },
      { status: 500 },
    );
  }
}

export async function DELETE(_req: Request, { params }: Ctx) {
  try {
    const { id } = await params;
    const [deleted] = await db
      .delete(vehicles)
      .where(eq(vehicles.id, Number(id)))
      .returning({ id: vehicles.id });
    if (!deleted) return NextResponse.json({ error: "Vehicle not found" }, { status: 404 });
    return NextResponse.json({ ok: true });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to delete vehicle" },
      { status: 500 },
    );
  }
}
