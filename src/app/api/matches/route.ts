import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const city = searchParams.get("city");
  const team = searchParams.get("team");
  const round = searchParams.get("round");

  const matches = await prisma.match.findMany({
    where: {
      matchDate: { gte: new Date() },
      ...(city ? { city } : {}),
      ...(round ? { round } : {}),
      ...(team
        ? { OR: [{ homeTeam: { contains: team, mode: "insensitive" } }, { awayTeam: { contains: team, mode: "insensitive" } }] }
        : {}),
    },
    include: {
      listings: {
        orderBy: { price: "asc" },
        take: 1,
        select: { price: true, source: true, quantity: true },
      },
      _count: { select: { listings: true } },
    },
    orderBy: { matchDate: "asc" },
  });

  return NextResponse.json(matches);
}
