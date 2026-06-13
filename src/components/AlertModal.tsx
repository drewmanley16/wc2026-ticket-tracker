"use client";

import { useState } from "react";
import { WC2026_TEAMS, WC2026_CITIES } from "@/lib/matches";

type Match = {
  id: string;
  homeTeam: string;
  awayTeam: string;
  city: string;
  round: string;
  matchDate: string;
};

type AlertScope = "this-match" | "team" | "city" | "global";

export default function AlertModal({ match, onClose }: { match: Match | null; onClose: () => void }) {
  const [scope, setScope] = useState<AlertScope>("this-match");
  const [phone, setPhone] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [minQty, setMinQty] = useState("1");
  const [teamFilter, setTeamFilter] = useState(match?.homeTeam ?? "");
  const [cityFilter, setCityFilter] = useState(match?.city ?? "");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  if (!match) return null;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!phone || !maxPrice) return;

    setLoading(true);
    setError("");

    try {
      const body: Record<string, unknown> = {
        phoneNumber: phone,
        maxPrice: parseFloat(maxPrice),
        minQuantity: parseInt(minQty),
      };

      if (scope === "this-match") body.matchId = match!.id;
      else if (scope === "team") body.teamFilter = teamFilter;
      else if (scope === "city") body.cityFilter = cityFilter;
      // global: no filter

      const res = await fetch("/api/alerts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(JSON.stringify(data.error));
      }

      setSuccess(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create alert");
    } finally {
      setLoading(false);
    }
  }

  const input = "w-full rounded-lg px-3 py-2.5 text-sm outline-none";
  const inputStyle = { background: "#0d0d0d", border: "1px solid #2a2a2a", color: "#ededed" };

  const scopeOptions: { value: AlertScope; label: string; desc: string }[] = [
    { value: "this-match", label: "This match", desc: `${match.homeTeam} vs ${match.awayTeam}` },
    { value: "team", label: "Any match with team", desc: "Alert for all matches a team plays" },
    { value: "city", label: "Any match in city", desc: "Alert for any deal in a city" },
    { value: "global", label: "All matches", desc: "Alert for any WC2026 deal" },
  ];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.8)" }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        className="w-full max-w-md rounded-2xl p-6 space-y-5"
        style={{ background: "#111", border: "1px solid #222" }}
      >
        {success ? (
          <div className="text-center py-6 space-y-3">
            <p className="text-4xl">✅</p>
            <p className="font-bold text-lg">Alert created!</p>
            <p style={{ color: "#888" }} className="text-sm">
              You&apos;ll get a text with the link when prices drop below ${maxPrice}.
            </p>
            <button
              onClick={onClose}
              className="w-full py-2.5 rounded-xl font-medium mt-2"
              style={{ background: "#16a34a", color: "#fff" }}
            >
              Done
            </button>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between">
              <h2 className="font-bold text-lg">Set Price Alert</h2>
              <button onClick={onClose} style={{ color: "#666" }} className="text-xl leading-none">×</button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Alert scope */}
              <div className="space-y-1.5">
                <label className="text-xs font-medium" style={{ color: "#666" }}>Alert scope</label>
                <div className="grid grid-cols-2 gap-2">
                  {scopeOptions.map((o) => (
                    <button
                      key={o.value}
                      type="button"
                      onClick={() => setScope(o.value)}
                      className="text-left rounded-xl p-3 transition-colors"
                      style={{
                        background: scope === o.value ? "#16a34a22" : "#0d0d0d",
                        border: `1px solid ${scope === o.value ? "#16a34a44" : "#222"}`,
                      }}
                    >
                      <p className="text-xs font-semibold" style={{ color: scope === o.value ? "#4ade80" : "#ccc" }}>{o.label}</p>
                      <p className="text-xs mt-0.5" style={{ color: "#555" }}>{o.desc}</p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Dynamic scope filter */}
              {scope === "team" && (
                <div className="space-y-1.5">
                  <label className="text-xs font-medium" style={{ color: "#666" }}>Team</label>
                  <select value={teamFilter} onChange={(e) => setTeamFilter(e.target.value)} className={input} style={inputStyle}>
                    {WC2026_TEAMS.map((t) => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
              )}
              {scope === "city" && (
                <div className="space-y-1.5">
                  <label className="text-xs font-medium" style={{ color: "#666" }}>City</label>
                  <select value={cityFilter} onChange={(e) => setCityFilter(e.target.value)} className={input} style={inputStyle}>
                    {WC2026_CITIES.map((c) => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
              )}

              {/* Price limit */}
              <div className="space-y-1.5">
                <label className="text-xs font-medium" style={{ color: "#666" }}>Alert me when price drops below</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "#666" }}>$</span>
                  <input
                    type="number"
                    required
                    min={1}
                    placeholder="e.g. 150"
                    value={maxPrice}
                    onChange={(e) => setMaxPrice(e.target.value)}
                    className="w-full rounded-lg pl-7 pr-3 py-2.5 text-sm outline-none"
                    style={inputStyle}
                  />
                </div>
              </div>

              {/* Min tickets */}
              <div className="space-y-1.5">
                <label className="text-xs font-medium" style={{ color: "#666" }}>Minimum tickets available</label>
                <input
                  type="number"
                  min={1}
                  max={10}
                  value={minQty}
                  onChange={(e) => setMinQty(e.target.value)}
                  className={input}
                  style={inputStyle}
                />
              </div>

              {/* Phone */}
              <div className="space-y-1.5">
                <label className="text-xs font-medium" style={{ color: "#666" }}>Your phone number (SMS)</label>
                <input
                  type="tel"
                  required
                  placeholder="+1 555 000 0000"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className={input}
                  style={inputStyle}
                />
                <p style={{ color: "#444", fontSize: "11px" }}>You&apos;ll receive a text with price + direct buy link</p>
              </div>

              {error && (
                <p className="text-sm rounded-lg px-3 py-2" style={{ background: "#7c1d1d22", color: "#f87171", border: "1px solid #7c1d1d44" }}>
                  {error}
                </p>
              )}

              <button
                type="submit"
                disabled={loading || !phone || !maxPrice}
                className="w-full py-3 rounded-xl font-semibold text-sm transition-opacity"
                style={{
                  background: "#16a34a",
                  color: "#fff",
                  opacity: loading || !phone || !maxPrice ? 0.5 : 1,
                }}
              >
                {loading ? "Creating..." : "Create Alert"}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
