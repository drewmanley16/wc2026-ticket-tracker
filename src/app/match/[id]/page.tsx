"use client";

import { useState, useEffect, use } from "react";
import Link from "next/link";
import AlertModal from "@/components/AlertModal";
import PriceChart from "@/components/PriceChart";

type Listing = {
  id: string;
  source: string;
  price: number;
  quantity: number;
  section: string | null;
  row: string | null;
  listingUrl: string;
  scrapedAt: string;
  priceHistory: { price: number; quantity: number; recordedAt: string }[];
};

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

const SORT_OPTS = [
  { value: "price-asc", label: "Price: Low → High" },
  { value: "price-desc", label: "Price: High → Low" },
  { value: "quantity-desc", label: "Most tickets" },
  { value: "quantity-asc", label: "Fewest tickets" },
  { value: "source", label: "Source" },
];

export default function MatchPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [match, setMatch] = useState<Match | null>(null);
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [sort, setSort] = useState("price-asc");
  const [source, setSource] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [minQty, setMinQty] = useState("");
  const [showAlert, setShowAlert] = useState(false);
  const [selectedListing, setSelectedListing] = useState<Listing | null>(null);

  useEffect(() => {
    async function load() {
      const [mRes, lRes] = await Promise.all([
        fetch(`/api/matches?id=${id}`),
        fetch(`/api/listings?matchId=${id}&sortBy=${sort.split("-")[0]}&order=${sort.split("-")[1] ?? "asc"}${source ? `&source=${source}` : ""}${maxPrice ? `&maxPrice=${maxPrice}` : ""}${minQty ? `&minQty=${minQty}` : ""}`),
      ]);
      // For match we just use listings endpoint which returns match data
      // Fetch match via matches route (no id filter yet — filter client side)
      const allMatches: Match[] = await mRes.json();
      const found = allMatches.find((m) => m.id === id) ?? null;
      setMatch(found);
      setListings(await lRes.json());
      setLoading(false);
    }
    load();
  }, [id, sort, source, maxPrice, minQty]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "#0a0a0a" }}>
        <div className="text-center space-y-2">
          <p className="text-4xl">⚽</p>
          <p style={{ color: "#666" }}>Loading prices...</p>
        </div>
      </div>
    );
  }

  if (!match) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "#0a0a0a" }}>
        <div className="text-center space-y-3">
          <p style={{ color: "#666" }}>Match not found</p>
          <Link href="/" className="text-sm" style={{ color: "#4ade80" }}>← Back to tracker</Link>
        </div>
      </div>
    );
  }

  const date = new Date(match.matchDate);
  const dateStr = date.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" });
  const cheapest = listings[0];

  const sources = [...new Set(listings.map((l) => l.source))];

  const select = "rounded-lg px-3 py-2 text-sm outline-none";
  const selectStyle = { background: "#1a1a1a", border: "1px solid #2a2a2a", color: "#ededed" };

  return (
    <div className="min-h-screen" style={{ background: "#0a0a0a", color: "#ededed" }}>
      {/* Header */}
      <header style={{ borderBottom: "1px solid #1a1a1a", background: "#0d0d0d" }} className="sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center gap-4">
          <Link href="/" style={{ color: "#666", fontSize: "13px" }}>← All matches</Link>
          <span style={{ color: "#333" }}>|</span>
          <span className="font-semibold text-sm">{match.homeTeam} vs {match.awayTeam}</span>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-6 space-y-6">
        {/* Match header */}
        <div style={{ background: "#111", border: "1px solid #1e1e1e" }} className="rounded-xl p-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <p className="text-sm font-medium" style={{ color: "#16a34a" }}>{match.round}</p>
              <h1 className="text-2xl font-bold mt-1">{match.homeTeam} vs {match.awayTeam}</h1>
              <p style={{ color: "#666", fontSize: "13px" }} className="mt-1">
                {match.venue} · {match.city}
              </p>
              <p style={{ color: "#555", fontSize: "12px" }} className="mt-0.5">{dateStr}</p>
            </div>
            <div className="flex flex-col items-end gap-2">
              {cheapest && (
                <div className="text-right">
                  <p style={{ color: "#555", fontSize: "12px" }}>Cheapest listing</p>
                  <p className="text-3xl font-bold" style={{ color: "#4ade80" }}>${cheapest.price.toFixed(0)}</p>
                  <p style={{ color: "#555", fontSize: "11px" }}>on {cheapest.source} · {cheapest.quantity} ticket{cheapest.quantity !== 1 ? "s" : ""}</p>
                </div>
              )}
              <button
                onClick={() => setShowAlert(true)}
                className="px-4 py-2 rounded-xl text-sm font-semibold"
                style={{ background: "#16a34a", color: "#fff" }}
              >
                Set price alert
              </button>
            </div>
          </div>
        </div>

        {/* Price history chart */}
        {selectedListing && (
          <div style={{ background: "#111", border: "1px solid #1e1e1e" }} className="rounded-xl p-4">
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm font-medium">Price history — {selectedListing.source} listing</p>
              <button onClick={() => setSelectedListing(null)} style={{ color: "#555" }}>×</button>
            </div>
            <PriceChart history={selectedListing.priceHistory} />
          </div>
        )}

        {/* Filters */}
        <div style={{ background: "#111", border: "1px solid #1e1e1e" }} className="rounded-xl p-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="flex flex-col gap-1">
              <label className="text-xs" style={{ color: "#666" }}>Sort</label>
              <select value={sort} onChange={(e) => setSort(e.target.value)} className={select} style={selectStyle}>
                {SORT_OPTS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs" style={{ color: "#666" }}>Source</label>
              <select value={source} onChange={(e) => setSource(e.target.value)} className={select} style={selectStyle}>
                <option value="">All</option>
                {sources.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs" style={{ color: "#666" }}>Max price ($)</label>
              <input type="number" placeholder="Any" value={maxPrice} onChange={(e) => setMaxPrice(e.target.value)} className={select} style={selectStyle} />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs" style={{ color: "#666" }}>Min tickets</label>
              <input type="number" placeholder="Any" value={minQty} onChange={(e) => setMinQty(e.target.value)} className={select} style={selectStyle} />
            </div>
          </div>
        </div>

        {/* Listings table */}
        <div style={{ background: "#111", border: "1px solid #1e1e1e" }} className="rounded-xl overflow-hidden">
          <div className="px-4 py-3 border-b flex items-center justify-between" style={{ borderColor: "#1e1e1e" }}>
            <p className="text-sm font-medium">{listings.length} listing{listings.length !== 1 ? "s" : ""}</p>
          </div>

          {listings.length === 0 ? (
            <div className="py-12 text-center" style={{ color: "#444" }}>
              <p>No listings match your filters</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr style={{ borderBottom: "1px solid #1a1a1a" }}>
                    {["Source", "Price", "Tickets", "Section", "Row", ""].map((h) => (
                      <th key={h} className="text-left px-4 py-3 font-medium" style={{ color: "#555", fontSize: "12px" }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {listings.map((l, i) => (
                    <tr
                      key={l.id}
                      style={{ borderBottom: i < listings.length - 1 ? "1px solid #141414" : "none" }}
                      className="hover:bg-white/[0.02] transition-colors"
                    >
                      <td className="px-4 py-3">
                        <span
                          className="text-xs font-medium px-2 py-0.5 rounded"
                          style={{ background: SOURCE_COLORS[l.source] + "22", color: SOURCE_COLORS[l.source] }}
                        >
                          {l.source}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="font-bold" style={{ color: i === 0 ? "#4ade80" : "#ededed" }}>
                          ${l.price.toFixed(0)}
                        </span>
                      </td>
                      <td className="px-4 py-3" style={{ color: "#888" }}>{l.quantity}</td>
                      <td className="px-4 py-3" style={{ color: "#666" }}>{l.section ?? "—"}</td>
                      <td className="px-4 py-3" style={{ color: "#666" }}>{l.row ?? "—"}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => setSelectedListing(selectedListing?.id === l.id ? null : l)}
                            className="text-xs px-2 py-1 rounded"
                            style={{ background: "#1a1a1a", color: "#888", border: "1px solid #2a2a2a" }}
                          >
                            {selectedListing?.id === l.id ? "Hide chart" : "Price history"}
                          </button>
                          <a
                            href={l.listingUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs px-3 py-1.5 rounded-lg font-semibold"
                            style={{ background: "#16a34a", color: "#fff" }}
                          >
                            Buy →
                          </a>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>

      {showAlert && <AlertModal match={match} onClose={() => setShowAlert(false)} />}
    </div>
  );
}
