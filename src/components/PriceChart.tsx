"use client";

import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import { format } from "date-fns";

type Snapshot = { price: number; quantity: number; recordedAt: string };

export default function PriceChart({ history }: { history: Snapshot[] }) {
  if (!history || history.length < 2) {
    return <p style={{ color: "#444", fontSize: "13px" }}>Not enough price history yet</p>;
  }

  const data = [...history]
    .sort((a, b) => new Date(a.recordedAt).getTime() - new Date(b.recordedAt).getTime())
    .map((s) => ({
      time: format(new Date(s.recordedAt), "MMM d HH:mm"),
      price: s.price,
    }));

  return (
    <ResponsiveContainer width="100%" height={180}>
      <LineChart data={data} margin={{ top: 4, right: 8, bottom: 4, left: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#1a1a1a" />
        <XAxis dataKey="time" tick={{ fill: "#555", fontSize: 11 }} axisLine={false} tickLine={false} />
        <YAxis
          tick={{ fill: "#555", fontSize: 11 }}
          axisLine={false}
          tickLine={false}
          tickFormatter={(v) => `$${v}`}
          width={50}
        />
        <Tooltip
          contentStyle={{ background: "#111", border: "1px solid #222", borderRadius: "8px", color: "#ededed" }}
          formatter={(v) => [`$${v ?? 0}`, "Price"]}
          labelStyle={{ color: "#666", fontSize: "11px" }}
        />
        <Line
          type="monotone"
          dataKey="price"
          stroke="#4ade80"
          strokeWidth={2}
          dot={false}
          activeDot={{ r: 4, fill: "#4ade80" }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
