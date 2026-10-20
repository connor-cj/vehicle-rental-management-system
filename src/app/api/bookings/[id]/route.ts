import { NextResponse } from "next/server";
import { and, eq } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/db";
import { bookings, vehicles } from "@/db/schema";

export const dynamic = "force-dynamic";

const updateSchema = z
  .object({
    status: z.enum(["pending", "confirmed", "active", "completed", "cancelled"]),
    notes: z.string(),
  })
  .partial();

type Ctx = { params: Promise<{ id: string }> };

/** Keep the vehicle's availability in sync with its bookings. */
async function syncVehicleStatus(vehicleId: number) {
  const [stillActive] = await db
    .select({ id: bookings.id })
    .from(bookings)
    .where(and(eq(bookings.vehicleId, vehicleId), eq(bookings.status, "active")))
    .limit(1);

  const [vehicle] = await db
    .select()
    .from(vehicles)
    .where(eq(vehicles.id, vehicleId))
    .limit(1);

  if (!vehicle || vehicle.status === "maintenance" || vehicle.status === "retired") return;

  await db
    .update(vehicles)
    .set({ status: stillActive ? "rented" : "available" })
    .where(eq(vehicles.id, vehicleId));
}

export async function PATCH(request: Request, { params }: Ctx) {
  try {
    const { id } = await params;
    const body = updateSchema.parse(await request.json());

    const [existing] = await db
      .select()
      .from(bookings)
      .where(eq(bookings.id, Number(id)))
      .limit(1);
    if (!existing) {
      return NextResponse.json({ error: "Booking not found" }, { status: 404 });
    }

    const [updated] = await db
      .update(bookings)
      .set(body)
      .where(eq(bookings.id, Number(id)))
      .returning();

    if (body.status && body.status !== existing.status) {
      await syncVehicleStatus(updated.vehicleId);
    }

    return NextResponse.json(updated);
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json(
        { error: err.issues[0]?.message ?? "Invalid data" },
        { status: 400 },
      );
    }
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to update booking" },
      { status: 500 },
    );
  }
}

export async function DELETE(_req: Request, { params }: Ctx) {
  try {
    const { id } = await params;
    const [deleted] = await db
      .delete(bookings)
      .where(eq(bookings.id, Number(id)))
      .returning();
    if (!deleted) {
      return NextResponse.json({ error: "Booking not found" }, { status: 404 });
    }
    await syncVehicleStatus(deleted.vehicleId);
    return NextResponse.json({ ok: true });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to delete booking" },
      { status: 500 },
    );
  }
}
