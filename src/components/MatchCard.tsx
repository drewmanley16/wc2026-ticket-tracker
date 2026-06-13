"use client";

import { useState } from "react";
import Link from "next/link";

type Match = {
  id: string;
  homeTeam: string;
  awayTeam: string;
  city: string;
  venue: string;
  matchDate: string;
  round: string;
  listings: { price: number; source: string; quantity: number }[];
  _count: { listings: number };
};

const SOURCE_COLORS: Record<string, string> = {
  stubhub: "#00b050",
  seatgeek: "#e85d04",
  ticketmaster: "#026cdf",
  viagogo: "#7c3aed",
};

const ROUND_COLORS: Record<string, string> = {
  "Group Stage": "#334155",
  "Round of 32": "#1e3a5f",
  "Round of 16": "#1e4d2b",
  "Quarter Final": "#4c1d95",
  "Semi Final": "#7c2d12",
  "Third Place": "#374151",
  Final: "#7c2d12",
};

export default function MatchCard({ match, onSetAlert }: { match: Match; onSetAlert: () => void }) {
  const [hovered, setHovered] = useState(false);
  const cheapest = match.listings[0];
  const date = new Date(match.matchDate);
  const dateStr = date.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });
  const timeStr = date.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: hovered ? "#161616" : "#111111",
        border: `1px solid ${hovered ? "#2a2a2a" : "#1e1e1e"}`,
        transition: "all 0.15s ease",
      }}
      className="rounded-xl p-4 flex flex-col gap-3"
    >
      {/* Round badge + date */}
      <div className="flex items-center justify-between">
        <span
          className="text-xs font-medium px-2 py-0.5 rounded-full"
          style={{ background: ROUND_COLORS[match.round] ?? "#1e1e1e", color: "#ddd" }}
        >
          {match.round}
        </span>
        <span style={{ color: "#555", fontSize: "12px" }}>
          {dateStr} · {timeStr}
        </span>
      </div>

      {/* Teams */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex-1 text-center">
          <p className="font-bold text-base leading-tight">{match.homeTeam}</p>
        </div>
        <div className="shrink-0">
          <span style={{ color: "#444", fontSize: "13px", fontWeight: 600 }}>VS</span>
        </div>
        <div className="flex-1 text-center">
          <p className="font-bold text-base leading-tight">{match.awayTeam}</p>
        </div>
      </div>

      {/* Venue */}
      <p style={{ color: "#555", fontSize: "12px" }} className="text-center">
        📍 {match.venue}, {match.city}
      </p>

      {/* Price */}
      <div style={{ background: "#0d0d0d", borderRadius: "8px", padding: "10px 12px" }} className="flex items-center justify-between">
        {cheapest ? (
          <>
            <div>
              <p style={{ color: "#888", fontSize: "11px" }}>Lowest price</p>
              <p className="font-bold text-xl" style={{ color: "#4ade80" }}>
                ${cheapest.price.toFixed(0)}
              </p>
            </div>
            <div className="text-right">
              <span
                className="text-xs font-medium px-2 py-0.5 rounded"
                style={{ background: SOURCE_COLORS[cheapest.source] + "22", color: SOURCE_COLORS[cheapest.source] }}
              >
                {cheapest.source}
              </span>
              <p style={{ color: "#555", fontSize: "11px", marginTop: "3px" }}>
                {match._count.listings} listing{match._count.listings !== 1 ? "s" : ""}
                {cheapest.quantity > 1 ? ` · ${cheapest.quantity} avail` : ""}
              </p>
            </div>
          </>
        ) : (
          <p style={{ color: "#444", fontSize: "13px" }}>No listings yet</p>
        )}
      </div>

      {/* Actions */}
      <div className="flex gap-2">
        <Link
          href={`/match/${match.id}`}
          className="flex-1 text-center text-sm py-2 rounded-lg font-medium transition-colors"
          style={{ background: "#1a1a1a", border: "1px solid #2a2a2a", color: "#ccc" }}
        >
          View all prices
        </Link>
        <button
          onClick={onSetAlert}
          className="flex-1 text-sm py-2 rounded-lg font-medium transition-colors"
          style={{ background: "#16a34a22", border: "1px solid #16a34a44", color: "#4ade80" }}
        >
          Set alert
        </button>
      </div>
    </div>
  );
}
