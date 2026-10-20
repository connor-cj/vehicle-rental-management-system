import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/db";
import { customers } from "@/db/schema";

export const dynamic = "force-dynamic";

const updateSchema = z
  .object({
    fullName: z.string().min(2),
    email: z.string().email(),
    phone: z.string(),
    licenseNumber: z.string(),
    idNumber: z.string(),
    city: z.string(),
    notes: z.string(),
  })
  .partial();

type Ctx = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, { params }: Ctx) {
  try {
    const { id } = await params;
    const body = updateSchema.parse(await request.json());
    const [updated] = await db
      .update(customers)
      .set(body.email ? { ...body, email: body.email.toLowerCase() } : body)
      .where(eq(customers.id, Number(id)))
      .returning();
    if (!updated) {
      return NextResponse.json({ error: "Customer not found" }, { status: 404 });
    }
    return NextResponse.json(updated);
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json(
        { error: err.issues[0]?.message ?? "Invalid customer data" },
        { status: 400 },
      );
    }
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to update customer" },
      { status: 500 },
    );
  }
}

export async function DELETE(_req: Request, { params }: Ctx) {
  try {
    const { id } = await params;
    const [deleted] = await db
      .delete(customers)
      .where(eq(customers.id, Number(id)))
      .returning({ id: customers.id });
    if (!deleted) {
      return NextResponse.json({ error: "Customer not found" }, { status: 404 });
    }
    return NextResponse.json({ ok: true });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to delete customer" },
      { status: 500 },
    );
  }
}
