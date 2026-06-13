import { NextRequest, NextResponse } from "next/server";
import { scrapeAllMatches, scrapeMatch } from "@/scrapers";
import { checkAndFireAlerts } from "@/lib/alerts";
import { prisma } from "@/lib/db";

// Called by Vercel Cron every 30 minutes
export async function GET(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const matchId = req.nextUrl.searchParams.get("matchId");

  try {
    if (matchId) {
      const count = await scrapeMatch(matchId);
      await checkAndFireAlerts(matchId);
      return NextResponse.json({ scraped: count, matchId });
    }

    const count = await scrapeAllMatches();

    // Check alerts for all upcoming matches
    const upcomingMatches = await prisma.match.findMany({
      where: { matchDate: { gte: new Date() } },
      select: { id: true },
    });
    await Promise.allSettled(upcomingMatches.map((m) => checkAndFireAlerts(m.id)));

    return NextResponse.json({ scraped: count });
  } catch (err) {
    console.error("Scrape error:", err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
