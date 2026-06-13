import { prisma } from "@/lib/db";
import { scrapeSeatGeek } from "./seatgeek";
import { scrapeTicketmaster } from "./ticketmaster";
import { scrapeStubHub } from "./stubhub";
import { scrapeViaGogo } from "./viagogo";
import type { ScrapedListing } from "./seatgeek";

export type { ScrapedListing };

export async function scrapeMatch(matchId: string) {
  const match = await prisma.match.findUnique({ where: { id: matchId } });
  if (!match) return;

  const query = `${match.homeTeam} vs ${match.awayTeam}`;

  const [seatgeek, ticketmaster, stubhub, viagogo] = await Promise.allSettled([
    scrapeSeatGeek(query, match.matchDate),
    scrapeTicketmaster(query, match.matchDate),
    scrapeStubHub(match.homeTeam, match.awayTeam, match.matchDate),
    scrapeViaGogo(match.homeTeam, match.awayTeam, match.matchDate),
  ]);

  const allListings: ScrapedListing[] = [
    ...(seatgeek.status === "fulfilled" ? seatgeek.value : []),
    ...(ticketmaster.status === "fulfilled" ? ticketmaster.value : []),
    ...(stubhub.status === "fulfilled" ? stubhub.value : []),
    ...(viagogo.status === "fulfilled" ? viagogo.value : []),
  ];

  // Upsert listings and record price snapshots
  for (const listing of allListings) {
    const existing = await prisma.listing.upsert({
      where: { source_externalId: { source: listing.source, externalId: listing.externalId } },
      create: {
        matchId,
        source: listing.source,
        externalId: listing.externalId,
        price: listing.price,
        quantity: listing.quantity,
        section: listing.section,
        row: listing.row,
        listingUrl: listing.listingUrl,
      },
      update: {
        price: listing.price,
        quantity: listing.quantity,
        updatedAt: new Date(),
      },
    });

    await prisma.priceSnapshot.create({
      data: {
        listingId: existing.id,
        price: listing.price,
        quantity: listing.quantity,
      },
    });
  }

  return allListings.length;
}

export async function scrapeAllMatches() {
  const matches = await prisma.match.findMany({
    where: { matchDate: { gte: new Date() } },
    orderBy: { matchDate: "asc" },
  });

  let total = 0;
  for (const match of matches) {
    const count = await scrapeMatch(match.id);
    total += count ?? 0;
  }
  return total;
}
