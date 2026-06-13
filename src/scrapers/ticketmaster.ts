import type { ScrapedListing } from "./seatgeek";

export async function scrapeTicketmaster(matchQuery: string, matchDate: Date): Promise<ScrapedListing[]> {
  const apiKey = process.env.TICKETMASTER_API_KEY;
  if (!apiKey) {
    console.warn("TICKETMASTER_API_KEY not set, skipping Ticketmaster scrape");
    return [];
  }

  try {
    const dateStr = matchDate.toISOString().split("T")[0];
    const params = new URLSearchParams({
      keyword: `FIFA World Cup 2026`,
      startDateTime: `${dateStr}T00:00:00Z`,
      endDateTime: `${dateStr}T23:59:59Z`,
      apikey: apiKey,
      size: "100",
    });

    const res = await fetch(
      `https://app.ticketmaster.com/discovery/v2/events.json?${params}`
    );
    if (!res.ok) return [];

    const data = await res.json();
    const events = data?._embedded?.events ?? [];
    const listings: ScrapedListing[] = [];

    for (const event of events) {
      const minPrice = event.priceRanges?.[0]?.min;
      if (!minPrice) continue;

      const url = event.url ?? `https://www.ticketmaster.com/event/${event.id}`;
      listings.push({
        source: "ticketmaster",
        externalId: String(event.id),
        price: minPrice,
        quantity: 1,
        section: null,
        row: null,
        listingUrl: url,
      });
    }

    return listings;
  } catch (err) {
    console.error("Ticketmaster scrape error:", err);
    return [];
  }
}
