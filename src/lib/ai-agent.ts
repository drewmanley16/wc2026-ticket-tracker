import { generateText } from "ai";
import { createAnthropic } from "@ai-sdk/anthropic";
import { prisma } from "./db";

const anthropic = createAnthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export async function analyzeDeals(matchId?: string) {
  const where = matchId ? { matchId } : {};

  const listings = await prisma.listing.findMany({
    where,
    include: { match: true },
    orderBy: { price: "asc" },
    take: 50,
  });

  if (listings.length === 0) return "No listings found to analyze.";

  const summary = listings.slice(0, 20).map((l) => ({
    match: `${l.match.homeTeam} vs ${l.match.awayTeam}`,
    city: l.match.city,
    date: l.match.matchDate.toLocaleDateString(),
    round: l.match.round,
    source: l.source,
    price: `$${l.price.toFixed(0)}`,
    quantity: l.quantity,
    url: l.listingUrl,
  }));

  const { text } = await generateText({
    model: anthropic("claude-sonnet-4-6"),
    system:
      "You are a FIFA World Cup 2026 ticket deal analyst. " +
      "Analyze ticket listings and identify the best value deals. " +
      "Consider price, match significance, city, round, and quantity available. " +
      "Be concise — bullet points only.",
    prompt: `Here are current WC2026 ticket listings. Identify the top 3-5 best deals and explain why:\n\n${JSON.stringify(summary, null, 2)}`,
  });

  return text;
}
