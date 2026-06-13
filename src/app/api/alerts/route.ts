import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { z } from "zod";

const CreateAlertSchema = z.object({
  phoneNumber: z.string().regex(/^\+?[1-9]\d{7,14}$/, "Invalid phone number"),
  maxPrice: z.number().positive(),
  minQuantity: z.number().int().positive().default(1),
  matchId: z.string().optional(),
  teamFilter: z.string().optional(),
  cityFilter: z.string().optional(),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const data = CreateAlertSchema.parse(body);

    // Normalize phone to E.164
    const phone = data.phoneNumber.startsWith("+")
      ? data.phoneNumber
      : `+1${data.phoneNumber.replace(/\D/g, "")}`;

    const alert = await prisma.alert.create({
      data: {
        phoneNumber: phone,
        maxPrice: data.maxPrice,
        minQuantity: data.minQuantity,
        matchId: data.matchId ?? null,
        teamFilter: data.teamFilter ?? null,
        cityFilter: data.cityFilter ?? null,
      },
    });

    return NextResponse.json(alert, { status: 201 });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: err.issues }, { status: 400 });
    }
    console.error(err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const phone = searchParams.get("phone");

  if (!phone) return NextResponse.json([], { status: 200 });

  const normalized = phone.startsWith("+") ? phone : `+1${phone.replace(/\D/g, "")}`;

  const alerts = await prisma.alert.findMany({
    where: { phoneNumber: normalized },
    include: { match: true, triggers: { orderBy: { sentAt: "desc" }, take: 5 } },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(alerts);
}

export async function DELETE(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });

  await prisma.alert.update({ where: { id }, data: { active: false } });
  return NextResponse.json({ ok: true });
}
