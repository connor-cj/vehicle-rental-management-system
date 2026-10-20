import { NextResponse } from "next/server";
import { asc } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/db";
import { customers } from "@/db/schema";

export const dynamic = "force-dynamic";

const customerSchema = z.object({
  fullName: z.string().min(2),
  email: z.string().email(),
  phone: z.string().optional().default(""),
  licenseNumber: z.string().optional().default(""),
  idNumber: z.string().optional().default(""),
  city: z.string().optional().default(""),
  notes: z.string().optional().default(""),
});

export async function GET() {
  try {
    const list = await db.query.customers.findMany({
      with: { bookings: true },
      orderBy: [asc(customers.fullName)],
    });
    return NextResponse.json(list);
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to load customers" },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = customerSchema.parse(await request.json());
    const [created] = await db
      .insert(customers)
      .values({ ...body, email: body.email.toLowerCase() })
      .returning();
    return NextResponse.json(created, { status: 201 });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json(
        { error: err.issues[0]?.message ?? "Invalid customer data" },
        { status: 400 },
      );
    }
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to create customer" },
      { status: 500 },
    );
  }
}
