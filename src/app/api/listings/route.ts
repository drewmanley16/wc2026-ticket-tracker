import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const matchId = searchParams.get("matchId");
  const source = searchParams.get("source");
  const sortBy = searchParams.get("sortBy") ?? "price";
  const order = searchParams.get("order") === "desc" ? "desc" : "asc";
  const maxPrice = searchParams.get("maxPrice");
  const minQty = searchParams.get("minQty");

  if (!matchId) {
    return NextResponse.json({ error: "matchId required" }, { status: 400 });
  }

  const listings = await prisma.listing.findMany({
    where: {
      matchId,
      ...(source ? { source } : {}),
      ...(maxPrice ? { price: { lte: parseFloat(maxPrice) } } : {}),
      ...(minQty ? { quantity: { gte: parseInt(minQty) } } : {}),
    },
    include: {
      priceHistory: {
        orderBy: { recordedAt: "desc" },
        take: 24,
      },
    },
    orderBy:
      sortBy === "quantity"
        ? { quantity: order }
        : sortBy === "source"
        ? { source: order }
        : { price: order },
  });

  return NextResponse.json(listings);
}
