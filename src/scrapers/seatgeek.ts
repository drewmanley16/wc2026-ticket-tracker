// SeatGeek public API scraper
export interface ScrapedListing {
  source: string;
  externalId: string;
  price: number;
  quantity: number;
  section: string | null;
  row: string | null;
  listingUrl: string;
}

export async function scrapeSeatGeek(matchQuery: string, matchDate: Date): Promise<ScrapedListing[]> {
  const clientId = process.env.SEATGEEK_CLIENT_ID;
  if (!clientId) {
    console.warn("SEATGEEK_CLIENT_ID not set, skipping SeatGeek scrape");
    return [];
  }

  try {
    const dateStr = matchDate.toISOString().split("T")[0];
    const params = new URLSearchParams({
      q: `FIFA World Cup 2026 ${matchQuery}`,
      "datetime_utc.gte": `${dateStr}T00:00:00`,
      "datetime_utc.lte": `${dateStr}T23:59:59`,
      client_id: clientId,
      per_page: "100",
    });

    const res = await fetch(`https://api.seatgeek.com/2/events?${params}`);
    if (!res.ok) return [];

    const data = await res.json();
    const listings: ScrapedListing[] = [];

    for (const event of data.events ?? []) {
      if (!event.stats?.lowest_price) continue;
      listings.push({
        source: "seatgeek",
        externalId: String(event.id),
        price: event.stats.lowest_price,
        quantity: event.stats.listing_count ?? 1,
        section: null,
        row: null,
        listingUrl: event.url,
      });
    }

    return listings;
  } catch (err) {
    console.error("SeatGeek scrape error:", err);
    return [];
  }
}
