import { NextRequest, NextResponse } from "next/server";
import { analyzeDeals } from "@/lib/ai-agent";

export async function GET(req: NextRequest) {
  const matchId = req.nextUrl.searchParams.get("matchId") ?? undefined;

  try {
    const analysis = await analyzeDeals(matchId);
    return NextResponse.json({ analysis });
  } catch (err) {
    console.error("AI deals error:", err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
