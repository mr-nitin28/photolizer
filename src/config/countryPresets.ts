export interface DocumentPreset {
  id: string;
  name: string;
  country: string;
  document: string;
  widthMm: number;
  heightMm: number;
  recommendedBg: "white" | "off-white" | "blue" | "red" | "light-gray";
  aspectRatio: string;
  flagEmoji: string;
  notes?: string;
}

export interface PaperSizeConfig {
  id: string;
  name: string;
  widthMm: number;
  heightMm: number;
  description: string;
  isPopular?: boolean;
}

export const PAPER_SIZES: PaperSizeConfig[] = [
  {
    id: "4x6",
    name: "4 × 6 in (10 × 15 cm)",
    widthMm: 101.6,
    heightMm: 152.4,
    description: "Standard photo paper (Best for home inkjet & pharmacy kiosks)",
    isPopular: true,
  },
  {
    id: "5x7",
    name: "5 × 7 in (13 × 18 cm)",
    widthMm: 127.0,
    heightMm: 177.8,
    description: "Medium studio photo card",
  },
  {
    id: "a4",
    name: "A4 (210 × 297 mm)",
    widthMm: 210.0,
    heightMm: 297.0,
    description: "Standard international document sheet",
  },
  {
    id: "letter",
    name: "US Letter (8.5 × 11 in)",
    widthMm: 215.9,
    heightMm: 279.4,
    description: "North American office standard sheet",
  },
];

export const COUNTRY_PRESETS: DocumentPreset[] = [
  {
    id: "us-passport",
    name: "US Passport & Visa (2×2 in)",
    country: "United States",
    document: "Passport, Visa, Green Card",
    widthMm: 50.8,
    heightMm: 50.8,
    recommendedBg: "white",
    aspectRatio: "1:1",
    flagEmoji: "🇺🇸",
    notes: "Strict 2x2 inch square. Head between 1 and 1 3/8 inches from chin to top of hair.",
  },
  {
    id: "uk-passport",
    name: "UK Passport (35×45 mm)",
    country: "United Kingdom",
    document: "HMPO Passport & Driving Licence",
    widthMm: 35,
    heightMm: 45,
    recommendedBg: "off-white",
    aspectRatio: "35:45",
    flagEmoji: "🇬🇧",
    notes: "Cream or light grey background required. Pure white often rejected.",
  },
  {
    id: "schengen-visa",
    name: "Schengen Visa (35×45 mm)",
    country: "European Union",
    document: "Schengen Visa / EU Residency",
    widthMm: 35,
    heightMm: 45,
    recommendedBg: "light-gray",
    aspectRatio: "35:45",
    flagEmoji: "🇪🇺",
    notes: "Neutral light grey or off-white background. Face 70-80% of photo height.",
  },
  {
    id: "in-passport",
    name: "India Passport (35×45 mm)",
    country: "India",
    document: "Passport & OCI Card",
    widthMm: 35,
    heightMm: 45,
    recommendedBg: "white",
    aspectRatio: "35:45",
    flagEmoji: "🇮🇳",
    notes: "Plain white background, no shadows. Both ears visible.",
  },
  {
    id: "in-pan",
    name: "India PAN Card (25×35 mm)",
    country: "India",
    document: "PAN Card / Govt ID",
    widthMm: 25,
    heightMm: 35,
    recommendedBg: "white",
    aspectRatio: "25:35",
    flagEmoji: "🇮🇳",
    notes: "Standard 2.5 x 3.5 cm portrait.",
  },
  {
    id: "ca-passport",
    name: "Canada Passport (50×70 mm)",
    country: "Canada",
    document: "Passport",
    widthMm: 50,
    heightMm: 70,
    recommendedBg: "white",
    aspectRatio: "5:7",
    flagEmoji: "🇨🇦",
    notes: "50x70mm standard. Face height between 31mm and 36mm from chin to crown.",
  },
  {
    id: "au-passport",
    name: "Australia Passport (35×45 mm)",
    country: "Australia",
    document: "Australian Passport",
    widthMm: 35,
    heightMm: 45,
    recommendedBg: "light-gray",
    aspectRatio: "35:45",
    flagEmoji: "🇦🇺",
    notes: "Plain white or light grey background.",
  },
  {
    id: "cn-passport",
    name: "China Passport (33×48 mm)",
    country: "China",
    document: "Passport & Visa",
    widthMm: 33,
    heightMm: 48,
    recommendedBg: "white",
    aspectRatio: "33:48",
    flagEmoji: "🇨🇳",
    notes: "33x48mm standard with white background.",
  },
  {
    id: "jp-passport",
    name: "Japan Passport (35×45 mm)",
    country: "Japan",
    document: "Passport",
    widthMm: 35,
    heightMm: 45,
    recommendedBg: "white",
    aspectRatio: "35:45",
    flagEmoji: "🇯🇵",
    notes: "35x45mm plain light background.",
  },
  {
    id: "my-passport",
    name: "Malaysia Passport (35×50 mm)",
    country: "Malaysia",
    document: "Passport & Visa",
    widthMm: 35,
    heightMm: 50,
    recommendedBg: "blue",
    aspectRatio: "7:10",
    flagEmoji: "🇲🇾",
    notes: "Light blue background required for Malaysian passport.",
  },
  {
    id: "id-passport",
    name: "Indonesia Passport (35×45 mm)",
    country: "Indonesia",
    document: "Passport & ID",
    widthMm: 35,
    heightMm: 45,
    recommendedBg: "red",
    aspectRatio: "35:45",
    flagEmoji: "🇮🇩",
    notes: "Red background (even years) or blue background (odd years).",
  },
];

export interface BackgroundColorOption {
  id: string;
  name: string;
  color: string;
  hex: string;
  borderClass: string;
}

export const BACKGROUND_COLORS: BackgroundColorOption[] = [
  {
    id: "white",
    name: "Pure White",
    color: "#FFFFFF",
    hex: "#ffffff",
    borderClass: "border-neutral-300 dark:border-neutral-600",
  },
  {
    id: "off-white",
    name: "Off-White / Cream",
    color: "#F8F8F6",
    hex: "#f8f8f6",
    borderClass: "border-neutral-300 dark:border-neutral-600",
  },
  {
    id: "light-gray",
    name: "Light Grey",
    color: "#E2E8F0",
    hex: "#e2e8f0",
    borderClass: "border-neutral-300 dark:border-neutral-600",
  },
  {
    id: "blue",
    name: "Passport Sky Blue",
    color: "#38BDF8",
    hex: "#38bdf8",
    borderClass: "border-blue-400",
  },
  {
    id: "red",
    name: "Consular Red",
    color: "#EF4444",
    hex: "#ef4444",
    borderClass: "border-red-400",
  },
  {
    id: "transparent",
    name: "Transparent PNG",
    color: "transparent",
    hex: "transparent",
    borderClass: "border-dashed border-neutral-400",
  },
];
