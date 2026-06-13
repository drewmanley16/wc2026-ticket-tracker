"use client";

import { useState } from "react";

export default function AiDeals() {
  const [analysis, setAnalysis] = useState("");
  const [loading, setLoading] = useState(false);
  const [fetched, setFetched] = useState(false);

  async function fetchDeals() {
    setLoading(true);
    try {
      const res = await fetch("/api/ai-deals");
      const data = await res.json();
      setAnalysis(data.analysis ?? "No analysis available.");
      setFetched(true);
    } catch {
      setAnalysis("Failed to load AI analysis.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      className="rounded-xl p-5 space-y-3"
      style={{ background: "#0d1117", border: "1px solid #16a34a44" }}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-lg">✨</span>
          <h2 className="font-semibold text-sm" style={{ color: "#4ade80" }}>AI Deal Analysis</h2>
          <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: "#16a34a22", color: "#86efac" }}>
            Powered by Claude
          </span>
        </div>
        {!fetched && (
          <button
            onClick={fetchDeals}
            disabled={loading}
            className="text-xs px-3 py-1.5 rounded-lg font-medium"
            style={{ background: "#16a34a", color: "#fff", opacity: loading ? 0.6 : 1 }}
          >
            {loading ? "Analyzing..." : "Find best deals"}
          </button>
        )}
        {fetched && (
          <button
            onClick={fetchDeals}
            disabled={loading}
            className="text-xs px-2 py-1 rounded"
            style={{ color: "#555", opacity: loading ? 0.5 : 1 }}
          >
            {loading ? "..." : "Refresh"}
          </button>
        )}
      </div>

      {loading && (
        <div className="space-y-2">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-4 rounded animate-pulse" style={{ background: "#1a1a1a", width: `${70 + i * 8}%` }} />
          ))}
        </div>
      )}

      {!loading && analysis && (
        <div
          className="text-sm leading-relaxed whitespace-pre-wrap"
          style={{ color: "#aaa" }}
        >
          {analysis}
        </div>
      )}

      {!loading && !fetched && (
        <p className="text-sm" style={{ color: "#444" }}>
          Claude will scan all current listings and surface the best value deals across all markets.
        </p>
      )}
    </div>
  );
}
