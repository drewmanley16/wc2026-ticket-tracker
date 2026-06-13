"use client";

import { useState, useEffect, useCallback } from "react";
import MatchCard from "@/components/MatchCard";
import AlertModal from "@/components/AlertModal";
import AiDeals from "@/components/AiDeals";
import { WC2026_CITIES, WC2026_TEAMS } from "@/lib/matches";

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

const ROUNDS = ["Group Stage", "Round of 32", "Round of 16", "Quarter Final", "Semi Final", "Third Place", "Final"];
const SOURCES = ["stubhub", "seatgeek", "ticketmaster", "viagogo"];
const SORT_OPTIONS = [
  { value: "date-asc", label: "Date (soonest)" },
  { value: "price-asc", label: "Price: Low to High" },
  { value: "price-desc", label: "Price: High to Low" },
  { value: "listings-desc", label: "Most Listings" },
];

export default function HomePage() {
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);
  const [city, setCity] = useState("");
  const [team, setTeam] = useState("");
  const [round, setRound] = useState("");
  const [source, setSource] = useState("");
  const [sort, setSort] = useState("date-asc");
  const [maxPrice, setMaxPrice] = useState("");
  const [alertMatch, setAlertMatch] = useState<Match | null>(null);
  const [showAi, setShowAi] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const fetchMatches = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (city) params.set("city", city);
    if (team) params.set("team", team);
    if (round) params.set("round", round);

    const res = await fetch(`/api/matches?${params}`);
    let data: Match[] = await res.json();

    if (maxPrice) data = data.filter((m) => (m.listings[0]?.price ?? Infinity) <= parseFloat(maxPrice));
    if (source) data = data.filter((m) => m.listings[0]?.source === source);

    data = [...data].sort((a, b) => {
      if (sort === "price-asc") return (a.listings[0]?.price ?? Infinity) - (b.listings[0]?.price ?? Infinity);
      if (sort === "price-desc") return (b.listings[0]?.price ?? 0) - (a.listings[0]?.price ?? 0);
      if (sort === "listings-desc") return b._count.listings - a._count.listings;
      return new Date(a.matchDate).getTime() - new Date(b.matchDate).getTime();
    });

    setMatches(data);
    setLastUpdated(new Date());
    setLoading(false);
  }, [city, team, round, source, sort, maxPrice]);

  useEffect(() => {
    fetchMatches();
    const iv = setInterval(fetchMatches, 5 * 60 * 1000);
    return () => clearInterval(iv);
  }, [fetchMatches]);

  const select = "rounded-lg px-3 py-2 text-sm outline-none w-full";
  const selectStyle = { background: "#1a1a1a", border: "1px solid #2a2a2a", color: "#ededed" };

  return (
    <div className="min-h-screen" style={{ background: "#0a0a0a", color: "#ededed" }}>
      {/* Header */}
      <header style={{ borderBottom: "1px solid #1a1a1a", background: "#0d0d0d" }} className="sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="text-2xl">⚽</span>
            <div>
              <h1 className="font-bold text-base leading-tight">WC2026 Ticket Tracker</h1>
              <p style={{ color: "#666", fontSize: "11px" }}>
                StubHub · SeatGeek · Viagogo · Ticketmaster — refreshes every 30 min
              </p>
            </div>
          </div>
          <button
            onClick={() => setShowAi(!showAi)}
            className="px-3 py-1.5 rounded-lg text-sm font-medium shrink-0"
            style={{
              background: showAi ? "#16a34a" : "#1a1a1a",
              color: showAi ? "#fff" : "#ccc",
              border: "1px solid #2a2a2a",
            }}
          >
            ✨ AI Deals
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-6 space-y-5">
        {showAi && <AiDeals />}

        {/* Filters */}
        <div style={{ background: "#111", border: "1px solid #1e1e1e" }} className="rounded-xl p-4">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
            {[
              {
                label: "City", value: city, set: setCity,
                options: [{ v: "", l: "All Cities" }, ...WC2026_CITIES.map((c) => ({ v: c, l: c }))],
              },
              {
                label: "Team", value: team, set: setTeam,
                options: [{ v: "", l: "All Teams" }, ...WC2026_TEAMS.map((t) => ({ v: t, l: t }))],
              },
              {
                label: "Round", value: round, set: setRound,
                options: [{ v: "", l: "All Rounds" }, ...ROUNDS.map((r) => ({ v: r, l: r }))],
              },
              {
                label: "Source", value: source, set: setSource,
                options: [{ v: "", l: "All Sources" }, ...SOURCES.map((s) => ({ v: s, l: s.charAt(0).toUpperCase() + s.slice(1) }))],
              },
              {
                label: "Sort By", value: sort, set: setSort,
                options: SORT_OPTIONS.map((o) => ({ v: o.value, l: o.label })),
              },
            ].map((f) => (
              <div key={f.label} className="flex flex-col gap-1">
                <label className="text-xs font-medium" style={{ color: "#666" }}>{f.label}</label>
                <select value={f.value} onChange={(e) => f.set(e.target.value)} className={select} style={selectStyle}>
                  {f.options.map((o) => <option key={o.v} value={o.v}>{o.l}</option>)}
                </select>
              </div>
            ))}

            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium" style={{ color: "#666" }}>Max Price ($)</label>
              <input
                type="number"
                placeholder="Any"
                value={maxPrice}
                onChange={(e) => setMaxPrice(e.target.value)}
                className={select}
                style={selectStyle}
              />
            </div>
          </div>
        </div>

        {/* Results bar */}
        <div className="flex items-center justify-between">
          <p style={{ color: "#666" }} className="text-sm">
            {loading ? "Loading prices..." : `${matches.length} match${matches.length !== 1 ? "es" : ""}`}
            {lastUpdated && !loading && (
              <span style={{ color: "#444" }}> · updated {lastUpdated.toLocaleTimeString()}</span>
            )}
          </p>
          <button
            onClick={fetchMatches}
            disabled={loading}
            className="text-xs px-3 py-1.5 rounded-lg"
            style={{ background: "#1a1a1a", border: "1px solid #2a2a2a", color: "#888" }}
          >
            {loading ? "Refreshing..." : "Refresh"}
          </button>
        </div>

        {/* Cards */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 9 }).map((_, i) => (
              <div key={i} className="rounded-xl h-48 animate-pulse" style={{ background: "#111" }} />
            ))}
          </div>
        ) : matches.length === 0 ? (
          <div className="text-center py-24" style={{ color: "#555" }}>
            <p className="text-5xl mb-4">⚽</p>
            <p className="text-lg font-medium" style={{ color: "#888" }}>No matches found</p>
            <p className="text-sm mt-1">Adjust your filters or check back after scraping runs</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {matches.map((m) => (
              <MatchCard key={m.id} match={m} onSetAlert={() => setAlertMatch(m)} />
            ))}
          </div>
        )}
      </main>

      {alertMatch && <AlertModal match={alertMatch} onClose={() => setAlertMatch(null)} />}
    </div>
  );
}
