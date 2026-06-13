import twilio from "twilio";
import { prisma } from "./db";

function getTwilioClient() {
  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  if (!accountSid || !authToken) throw new Error("Twilio credentials missing");
  return twilio(accountSid, authToken);
}

export async function checkAndFireAlerts(matchId: string) {
  const match = await prisma.match.findUnique({ where: { id: matchId } });
  if (!match) return;

  const alerts = await prisma.alert.findMany({
    where: {
      active: true,
      OR: [
        { matchId },
        { teamFilter: { in: [match.homeTeam, match.awayTeam] } },
        { cityFilter: match.city },
        { matchId: null, teamFilter: null, cityFilter: null }, // global alerts
      ],
    },
  });

  if (alerts.length === 0) return;

  for (const alert of alerts) {
    // Cooldown: don't re-fire within 1 hour
    if (alert.lastTriggered) {
      const hourAgo = new Date(Date.now() - 60 * 60 * 1000);
      if (alert.lastTriggered > hourAgo) continue;
    }

    const cheapListing = await prisma.listing.findFirst({
      where: {
        matchId,
        price: { lte: alert.maxPrice },
        quantity: { gte: alert.minQuantity },
      },
      orderBy: { price: "asc" },
    });

    if (!cheapListing) continue;

    // Fire SMS
    try {
      const client = getTwilioClient();
      const matchLabel = `${match.homeTeam} vs ${match.awayTeam}`;
      const dateLabel = match.matchDate.toLocaleDateString("en-US", {
        weekday: "short",
        month: "short",
        day: "numeric",
      });

      await client.messages.create({
        from: process.env.TWILIO_PHONE_NUMBER!,
        to: alert.phoneNumber,
        body:
          `🎟 WC2026 DEAL ALERT!\n` +
          `${matchLabel}\n` +
          `📍 ${match.city} — ${dateLabel}\n` +
          `💰 $${cheapListing.price.toFixed(0)} on ${cheapListing.source}\n` +
          `🔗 Buy now: ${cheapListing.listingUrl}`,
      });

      await prisma.alert.update({
        where: { id: alert.id },
        data: { lastTriggered: new Date() },
      });

      await prisma.alertTrigger.create({
        data: {
          alertId: alert.id,
          listingUrl: cheapListing.listingUrl,
          price: cheapListing.price,
          source: cheapListing.source,
        },
      });
    } catch (err) {
      console.error(`Failed to send SMS for alert ${alert.id}:`, err);
    }
  }
}
