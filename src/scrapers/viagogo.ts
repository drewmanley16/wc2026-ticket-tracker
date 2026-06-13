import type { ScrapedListing } from "./seatgeek";

// Viagogo API v2 — requires OAuth2 client credentials
export async function scrapeViaGogo(homeTeam: string, awayTeam: string, matchDate: Date): Promise<ScrapedListing[]> {
  const clientId = process.env.VIAGOGO_CLIENT_ID;
  const clientSecret = process.env.VIAGOGO_CLIENT_SECRET;
  if (!clientId || !clientSecret) {
    console.warn("VIAGOGO credentials not set, skipping Viagogo scrape");
    return [];
  }

  try {
    // Get OAuth token
    const tokenRes = await fetch("https://accounts.viagogo.com/oauth2/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        grant_type: "client_credentials",
        client_id: clientId,
        client_secret: clientSecret,
        scope: "read:events read:listings",
      }),
    });
    if (!tokenRes.ok) return [];

    const { access_token } = await tokenRes.json();
    const dateStr = matchDate.toISOString().split("T")[0];

    const searchParams = new URLSearchParams({
      q: `FIFA World Cup 2026 ${homeTeam} vs ${awayTeam}`,
      minDate: dateStr,
      maxDate: dateStr,
      page: "1",
      pageSize: "50",
    });

    const res = await fetch(`https://api.viagogo.net/v2/events?${searchParams}`, {
      headers: {
        Authorization: `Bearer ${access_token}`,
        Accept: "application/json",
      },
    });
    if (!res.ok) return [];

    const data = await res.json();
    const listings: ScrapedListing[] = [];

    for (const event of data.items ?? []) {
      if (!event.min_ticket_price?.amount) continue;
      listings.push({
        source: "viagogo",
        externalId: String(event.id),
        price: event.min_ticket_price.amount,
        quantity: event.number_of_tickets ?? 1,
        section: null,
        row: null,
        listingUrl: event._links?.event?.href ?? `https://www.viagogo.com/ww/Sports/Soccer/FIFA-World-Cup/E-${event.id}`,
      });
    }

    return listings;
  } catch (err) {
    console.error("Viagogo scrape error:", err);
    return [];
  }
}
