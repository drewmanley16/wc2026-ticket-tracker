import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

// Seed WC2026 matches — run once via POST /api/seed
const MATCHES = [
  // Opening matches and high-profile group stage games
  { homeTeam: "Mexico", awayTeam: "TBD", city: "Mexico City", venue: "Estadio Azteca", date: "2026-06-11", round: "Group Stage" },
  { homeTeam: "USA", awayTeam: "TBD", city: "Los Angeles", venue: "SoFi Stadium", date: "2026-06-12", round: "Group Stage" },
  { homeTeam: "Brazil", awayTeam: "TBD", city: "Dallas", venue: "AT&T Stadium", date: "2026-06-13", round: "Group Stage" },
  { homeTeam: "Argentina", awayTeam: "TBD", city: "New York/New Jersey", venue: "MetLife Stadium", date: "2026-06-14", round: "Group Stage" },
  { homeTeam: "England", awayTeam: "TBD", city: "Atlanta", venue: "Mercedes-Benz Stadium", date: "2026-06-14", round: "Group Stage" },
  { homeTeam: "France", awayTeam: "TBD", city: "San Francisco Bay Area", venue: "Levi's Stadium", date: "2026-06-15", round: "Group Stage" },
  { homeTeam: "Germany", awayTeam: "TBD", city: "Seattle", venue: "Lumen Field", date: "2026-06-15", round: "Group Stage" },
  { homeTeam: "Spain", awayTeam: "TBD", city: "Miami", venue: "Hard Rock Stadium", date: "2026-06-16", round: "Group Stage" },
  { homeTeam: "Portugal", awayTeam: "TBD", city: "Kansas City", venue: "Arrowhead Stadium", date: "2026-06-16", round: "Group Stage" },
  { homeTeam: "Netherlands", awayTeam: "TBD", city: "Philadelphia", venue: "Lincoln Financial Field", date: "2026-06-17", round: "Group Stage" },
  { homeTeam: "Canada", awayTeam: "TBD", city: "Toronto", venue: "BMO Field", date: "2026-06-17", round: "Group Stage" },
  { homeTeam: "Morocco", awayTeam: "TBD", city: "Vancouver", venue: "BC Place", date: "2026-06-18", round: "Group Stage" },
  { homeTeam: "Croatia", awayTeam: "TBD", city: "Houston", venue: "NRG Stadium", date: "2026-06-18", round: "Group Stage" },
  { homeTeam: "Uruguay", awayTeam: "TBD", city: "Boston/Foxborough", venue: "Gillette Stadium", date: "2026-06-19", round: "Group Stage" },
  { homeTeam: "Japan", awayTeam: "TBD", city: "Guadalajara", venue: "Estadio Akron", date: "2026-06-19", round: "Group Stage" },
  { homeTeam: "South Korea", awayTeam: "TBD", city: "Monterrey", venue: "Estadio BBVA", date: "2026-06-20", round: "Group Stage" },
  // More group stage
  { homeTeam: "Italy", awayTeam: "TBD", city: "New York/New Jersey", venue: "MetLife Stadium", date: "2026-06-21", round: "Group Stage" },
  { homeTeam: "Belgium", awayTeam: "TBD", city: "Dallas", venue: "AT&T Stadium", date: "2026-06-22", round: "Group Stage" },
  { homeTeam: "USA", awayTeam: "TBD", city: "Atlanta", venue: "Mercedes-Benz Stadium", date: "2026-06-25", round: "Group Stage" },
  { homeTeam: "Mexico", awayTeam: "TBD", city: "Guadalajara", venue: "Estadio Akron", date: "2026-06-26", round: "Group Stage" },
  // Round of 32 (new in 2026)
  { homeTeam: "TBD", awayTeam: "TBD", city: "New York/New Jersey", venue: "MetLife Stadium", date: "2026-07-01", round: "Round of 32" },
  { homeTeam: "TBD", awayTeam: "TBD", city: "Los Angeles", venue: "SoFi Stadium", date: "2026-07-02", round: "Round of 32" },
  { homeTeam: "TBD", awayTeam: "TBD", city: "Dallas", venue: "AT&T Stadium", date: "2026-07-03", round: "Round of 32" },
  { homeTeam: "TBD", awayTeam: "TBD", city: "Miami", venue: "Hard Rock Stadium", date: "2026-07-04", round: "Round of 32" },
  // Round of 16
  { homeTeam: "TBD", awayTeam: "TBD", city: "New York/New Jersey", venue: "MetLife Stadium", date: "2026-07-06", round: "Round of 16" },
  { homeTeam: "TBD", awayTeam: "TBD", city: "Los Angeles", venue: "SoFi Stadium", date: "2026-07-07", round: "Round of 16" },
  { homeTeam: "TBD", awayTeam: "TBD", city: "Dallas", venue: "AT&T Stadium", date: "2026-07-08", round: "Round of 16" },
  { homeTeam: "TBD", awayTeam: "TBD", city: "Seattle", venue: "Lumen Field", date: "2026-07-09", round: "Round of 16" },
  // Quarter Finals
  { homeTeam: "TBD", awayTeam: "TBD", city: "New York/New Jersey", venue: "MetLife Stadium", date: "2026-07-11", round: "Quarter Final" },
  { homeTeam: "TBD", awayTeam: "TBD", city: "Los Angeles", venue: "SoFi Stadium", date: "2026-07-11", round: "Quarter Final" },
  { homeTeam: "TBD", awayTeam: "TBD", city: "Dallas", venue: "AT&T Stadium", date: "2026-07-12", round: "Quarter Final" },
  { homeTeam: "TBD", awayTeam: "TBD", city: "Atlanta", venue: "Mercedes-Benz Stadium", date: "2026-07-12", round: "Quarter Final" },
  // Semi Finals
  { homeTeam: "TBD", awayTeam: "TBD", city: "Dallas", venue: "AT&T Stadium", date: "2026-07-14", round: "Semi Final" },
  { homeTeam: "TBD", awayTeam: "TBD", city: "New York/New Jersey", venue: "MetLife Stadium", date: "2026-07-15", round: "Semi Final" },
  // Third Place
  { homeTeam: "TBD", awayTeam: "TBD", city: "Miami", venue: "Hard Rock Stadium", date: "2026-07-18", round: "Third Place" },
  // Final
  { homeTeam: "TBD", awayTeam: "TBD", city: "New York/New Jersey", venue: "MetLife Stadium", date: "2026-07-19", round: "Final" },
];

export async function POST(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let seeded = 0;
  for (const m of MATCHES) {
    await prisma.match.upsert({
      where: { externalId: `wc2026-${m.homeTeam}-${m.awayTeam}-${m.date}` },
      create: {
        externalId: `wc2026-${m.homeTeam}-${m.awayTeam}-${m.date}`,
        homeTeam: m.homeTeam,
        awayTeam: m.awayTeam,
        city: m.city,
        venue: m.venue,
        matchDate: new Date(`${m.date}T18:00:00Z`),
        round: m.round,
      },
      update: {},
    });
    seeded++;
  }

  return NextResponse.json({ seeded });
}
