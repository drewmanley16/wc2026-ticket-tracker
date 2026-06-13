// FIFA World Cup 2026 match data — seeded into DB on first run
export const WC2026_MATCHES = [
  // Group Stage cities and venues
  { city: "New York/New Jersey", venue: "MetLife Stadium" },
  { city: "Los Angeles", venue: "SoFi Stadium" },
  { city: "Dallas", venue: "AT&T Stadium" },
  { city: "San Francisco Bay Area", venue: "Levi's Stadium" },
  { city: "Seattle", venue: "Lumen Field" },
  { city: "Kansas City", venue: "Arrowhead Stadium" },
  { city: "Philadelphia", venue: "Lincoln Financial Field" },
  { city: "Miami", venue: "Hard Rock Stadium" },
  { city: "Atlanta", venue: "Mercedes-Benz Stadium" },
  { city: "Houston", venue: "NRG Stadium" },
  { city: "Boston/Foxborough", venue: "Gillette Stadium" },
  { city: "Vancouver", venue: "BC Place" },
  { city: "Toronto", venue: "BMO Field" },
  { city: "Guadalajara", venue: "Estadio Akron" },
  { city: "Mexico City", venue: "Estadio Azteca" },
  { city: "Monterrey", venue: "Estadio BBVA" },
];

export const WC2026_TEAMS = [
  "Argentina", "France", "England", "Brazil", "Spain", "Portugal",
  "Germany", "Netherlands", "Belgium", "Croatia", "Uruguay", "Italy",
  "Denmark", "Switzerland", "Mexico", "USA", "Canada", "Japan",
  "South Korea", "Morocco", "Senegal", "Australia", "Ecuador", "Iran",
  "Saudi Arabia", "Ghana", "Cameroon", "Serbia", "Poland", "Wales",
  "Qatar", "Costa Rica", "Tunisia", "South Africa", "Algeria", "Nigeria",
  "Chile", "Peru", "Colombia", "Venezuela", "Turkey", "Czech Republic",
  "Slovakia", "Ukraine", "Greece", "Sweden", "Norway", "Austria",
];

export const WC2026_CITIES = WC2026_MATCHES.map((m) => m.city);
