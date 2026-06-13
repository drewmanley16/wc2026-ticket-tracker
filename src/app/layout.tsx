import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "WC2026 Ticket Tracker",
  description: "Live World Cup 2026 ticket prices — track deals, set alerts, get texted when prices drop",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="h-full">
      <body className="min-h-full flex flex-col antialiased">{children}</body>
    </html>
  );
}
