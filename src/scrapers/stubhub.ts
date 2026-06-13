import type { ScrapedListing } from "./seatgeek";

// StubHub catalog API — requires OAuth2 token
export async function scrapeStubHub(homeTeam: string, awayTeam: string, matchDate: Date): Promise<ScrapedListing[]> {
  const token = process.env.STUBHUB_TOKEN;
  if (!token) {
    console.warn("STUBHUB_TOKEN not set, skipping StubHub scrape");
    return [];
  }

  try {
    const dateStr = matchDate.toISOString().split("T")[0];
    const query = encodeURIComponent(`FIFA World Cup 2026 ${homeTeam} ${awayTeam}`);

    const res = await fetch(
      `https://api.stubhub.com/sellers/search/events/v3?name=${query}&dateLocal=${dateStr}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
      }
    );
    if (!res.ok) return [];

    const data = await res.json();
    const listings: ScrapedListing[] = [];

    for (const event of data.events ?? []) {
      if (!event.minTicketPrice?.amount) continue;
      listings.push({
        source: "stubhub",
        externalId: String(event.id),
        price: event.minTicketPrice.amount,
        quantity: event.totalTickets ?? 1,
        section: null,
        row: null,
        listingUrl: `https://www.stubhub.com/event/${event.id}`,
      });
    }

    return listings;
  } catch (err) {
    console.error("StubHub scrape error:", err);
    return [];
  }
}
