/**
 * ─────────────────────────────────────────────────────────────────────────────
 *  THE SINGLE SOURCE OF TRUTH FOR PROJECT FACTS.
 *  Components never hard-code facts — they read them from here.
 *  Lines marked TODO(client) must be replaced with approved, real information.
 * ─────────────────────────────────────────────────────────────────────────────
 *  Related data files:
 *    images.ts     – every image slot (photos, renders, logo, og:image)
 *    inventory.json/ inventory.ts – every unit for the floor selector
 *    floorplans.ts – placeholder SVG floor-plan geometry
 *    tour.ts       – 3D virtual-tour layout
 *    countries.ts  – phone country codes
 */
import { CRORE, LAKH, ordinal, numberWords } from "@/lib/format";
import { images, type ImageSlot } from "./images";
import { IS_DEMO } from "@/lib/site";

/* ── Company & contact ─────────────────────────────────────────────────────── */

export const company = {
  name: "White Collar Realty",
  wordmark: "WHITE COLLAR REALTY",
  tagline: "Where Ambition Comes Home",
  /** ONE number drives the displayed text, tel: links and wa.me links. TODO(client) */
  phoneE164: "+919800000000",
  phone: "+91 98000 00000",
  /** Digits only (wa.me format) — derived, don't edit. */
  get whatsapp() {
    return this.phoneE164.replace(/\D/g, "");
  },
  email: "sales@whitecollarrealty.demo", // TODO(client)
  address: "Sales Gallery, Golf Course Road, Sector 54, Gurugram, Haryana 122011", // TODO(client)
  /** TODO(client): real social handles. */
  socials: [
    { label: "Instagram", href: "https://instagram.com/whitecollarrealty" },
    { label: "Facebook", href: "https://facebook.com/whitecollarrealty" },
    { label: "LinkedIn", href: "https://linkedin.com/company/whitecollarrealty" },
    { label: "YouTube", href: "https://youtube.com/@whitecollarrealty" },
  ],
  disclaimer: "This is a concept demo. Project, images and prices are illustrative only.",
  priceDisclaimer: "Excludes GST, stamp duty & other charges. Prices subject to change.",
} as const;

/* ── Building ──────────────────────────────────────────────────────────────── */

/** Floor stack per tower. Floor labels, "40th floor", "42 storeys" etc. all derive from this. */
export const building = {
  towers: ["A", "B"] as const,
  floors: 42,
  lobbyFloor: 1,
  skyLoungeFloor: 40,
  penthouseFloor: 42,
  greensAcres: 3,
  amenityFloorLabels: {
    1: "Grand Lobby & Concierge",
    40: "Sky Lounge · Residents only",
  } as Record<number, string>,
};

/* ── Project ───────────────────────────────────────────────────────────────── */

export const project = {
  name: "THE SOVEREIGN",
  shortName: "The Sovereign",
  /** Hero headline — kept here so it can be changed after advertising-compliance review. */
  headline: "Golf Course Road's Most Coveted Address",
  location: "Golf Course Road, Sector 54, Gurugram",
  city: "Gurugram",
  region: "Haryana",
  postalCode: "122011",
  coordinates: [28.4386, 77.1032] as [number, number],
  possession: "December 2029", // TODO(client)
  rera: "DEMO-RERA-GGM-2026-001", // TODO(client): HARERA registration number
  reraNote: "Demo registration number — not a real RERA ID",
  configurationsLine: "4 & 5 BHK Residences and Penthouses",
  intro: `Rising ${building.floors} storeys above Gurugram's most prestigious boulevard, The Sovereign is a pair of sculpted glass towers designed for those who have arrived. Every residence is a corner home with a private elevator lobby, floor-to-ceiling glazing and unobstructed views over the DLF Golf Course.`,
} as const;

export const seo = {
  title: "The Sovereign by White Collar Realty | Luxury Residences, Golf Course Road, Gurugram",
  description: `Walk through THE SOVEREIGN from home — interactive 3D towers, a live floor selector and a virtual tour of ultra-luxury ${project.configurationsLine.toLowerCase()} on ${project.location}.`,
  keywords: ["luxury apartments Gurugram", "Golf Course Road", "4 BHK", "5 BHK", "penthouse", "virtual tour", company.name],
};

export const navLinks = [
  { label: "The Sovereign", href: "/#sovereign" },
  { label: "Virtual Tour", href: "/virtual-tour" },
  { label: "Residences", href: "/residences" },
  { label: "Amenities", href: "/#amenities" },
  { label: "Location", href: "/#location" },
  { label: "Contact", href: "/contact" },
] as const;

/* ── Configurations (commercial facts; plan geometry lives in floorplans.ts) ── */

export type ResidenceSlug = "4-bhk" | "5-bhk" | "penthouse";
export type UnitType = "4 BHK" | "5 BHK" | "Penthouse";

export interface PriceLine {
  label: string;
  amount: number;
  note?: string;
}

export interface Configuration {
  slug: ResidenceSlug;
  type: UnitType;
  title: string;
  tagline: string;
  /** Super area, sq ft. */
  area: number;
  /** RERA carpet area, sq ft. */
  carpetArea: number;
  /** Starting price in rupees. null = on request. */
  priceFrom: number | null;
  bedrooms: number;
  bathrooms: number;
  parking: number;
  image: ImageSlot;
  highlights: string[];
  specs: { group: string; items: string[] }[];
  priceLines: PriceLine[] | null;
}

/** TODO(client): areas, prices and price breakup must match the approved price list. */
export const configurations: Configuration[] = [
  {
    slug: "4-bhk",
    type: "4 BHK",
    title: "The Sovereign 4 BHK",
    tagline: "Four bedrooms. Two views. One unforgettable address.",
    area: 4800,
    carpetArea: 3350,
    priceFrom: 12.5 * CRORE,
    bedrooms: 4,
    bathrooms: 5,
    parking: 3,
    image: images.interiors["4-bhk"],
    highlights: ["Private elevator lobby", "11 ft ceiling height", "46 ft wraparound balcony", "Staff room with separate entry"],
    specs: [
      { group: "Flooring", items: ["Imported Italian Statuario marble in living & dining", "Engineered oak wood in bedrooms", "Anti-skid porcelain on balconies"] },
      { group: "Kitchen", items: ["Modular kitchen with quartz island", "Bosch built-in appliances", "Separate wet & dry kitchen"] },
      { group: "Bathrooms", items: ["Kohler & Grohe sanitaryware", "Rain shower and freestanding tub in master", "Heated towel rails"] },
      { group: "Smart Home", items: ["App-controlled lighting & curtains", "VRV air-conditioning", "Video door phone & biometric lock"] },
    ],
    priceLines: [
      { label: "Base Price", amount: 12.5 * CRORE, note: "₹26,042 / sq ft" },
      { label: "Preferential Location Charge (PLC)", amount: 35 * LAKH, note: "Golf-facing" },
      { label: "Covered Parking (3)", amount: 24 * LAKH },
      { label: "Club Membership", amount: 15 * LAKH },
    ],
  },
  {
    slug: "5-bhk",
    type: "5 BHK",
    title: "The Sovereign 5 BHK",
    tagline: "Generational living, elevated above the greens.",
    area: 6200,
    carpetArea: 4350,
    priceFrom: 17 * CRORE,
    bedrooms: 5,
    bathrooms: 6,
    parking: 4,
    image: images.interiors["5-bhk"],
    highlights: ["Dual master suites", "Private study", "Double-height living", "Home theatre-ready den"],
    specs: [
      { group: "Flooring", items: ["Book-matched Statuario marble in living, dining & foyer", "Herringbone oak in bedrooms & study", "Stone-finish deck on balconies"] },
      { group: "Kitchen", items: ["Italian modular kitchen with marble island", "Bosch & Miele built-in appliances", "Wine fridge and walk-in pantry"] },
      { group: "Bathrooms", items: ["Villeroy & Boch sanitaryware", "Steam shower in both master baths", "Smart mirrors with demisters"] },
      { group: "Smart Home", items: ["Full home automation with scene control", "VRV air-conditioning with air purification", "Multi-room audio pre-wiring"] },
    ],
    priceLines: [
      { label: "Base Price", amount: 17 * CRORE, note: "₹27,419 / sq ft" },
      { label: "Preferential Location Charge (PLC)", amount: 50 * LAKH, note: "Golf-facing, high floor" },
      { label: "Covered Parking (4)", amount: 32 * LAKH },
      { label: "Club Membership", amount: 20 * LAKH },
    ],
  },
  {
    slug: "penthouse",
    type: "Penthouse",
    title: "The Sovereign Penthouse",
    tagline: "Only two exist. The sky is your neighbour.",
    area: 11500,
    carpetArea: 8100,
    priceFrom: null,
    bedrooms: 6,
    bathrooms: 8,
    parking: 6,
    image: images.interiors.penthouse,
    highlights: ["Private rooftop pool", "Full-floor residence", "360° panoramic views", "Dedicated butler's suite"],
    specs: [
      { group: "Flooring", items: ["Rare Calacatta Oro marble throughout", "Hand-finished walnut in suites", "Teak deck around private pool"] },
      { group: "Kitchen", items: ["Show kitchen + chef's kitchen", "Gaggenau appliance suite", "Temperature-controlled wine cellar"] },
      { group: "Wellness", items: ["Private heated infinity pool", "Home spa with sauna & steam", "Private gym studio"] },
      { group: "Smart Home", items: ["Crestron automation", "Private elevator with biometric access", "Dedicated security command"] },
    ],
    priceLines: null,
  },
];

/** GST for under-construction residential property (demo assumption). TODO(client): confirm. */
export const GST_RATE = 0.05;

/* ── Building-wide specifications ──────────────────────────────────────────── */

export const specifications: { title: string; items: string[] }[] = [
  { title: "Flooring", items: ["Imported Italian Statuario marble in living, dining & foyer", "Engineered oak in bedrooms", "Anti-skid stone deck on balconies"] },
  { title: "Kitchen", items: ["Italian modular kitchen with quartz island", "Bosch built-in appliances", "Separate wet & dry kitchen"] },
  { title: "Bathrooms", items: ["Kohler & Grohe sanitaryware", "Rain shower; freestanding tub in master", "Heated towel rails, anti-fog mirrors"] },
  { title: "Glazing", items: ["11 ft floor-to-ceiling double-glazed low-E glass", "Acoustic laminated panes on the road side", "Slim bronze-anodised frames"] },
  { title: "Smart Home", items: ["App & voice control for lights, curtains, climate", "Video door phone, biometric lock", "Leak & smoke sensors with alerts"] },
  { title: "HVAC", items: ["VRV air-conditioning in every room", "Fresh-air system with HEPA filtration", "Concealed ducting, individual thermostats"] },
  { title: "Power Backup", items: ["100% DG power backup for every residence", "Automatic changeover in under 10 seconds", "Rooftop solar for common areas"] },
  { title: "Lifts", items: ["4 high-speed passenger lifts per tower (6 m/s)", "Private lift lobby for every residence", "Dedicated service & fire lifts"] },
];

/* ── Payment plan (construction-linked; must total 100) ────────────────────── */

export const paymentPlan: { stage: string; percent: number; note?: string }[] = [
  { stage: "On booking", percent: 10, note: "Booking amount" },
  { stage: "Within 45 days of booking", percent: 10, note: "Agreement for sale" },
  { stage: "On start of excavation", percent: 10 },
  { stage: "On casting of 10th-floor slab", percent: 10 },
  { stage: "On casting of 20th-floor slab", percent: 10 },
  { stage: "On casting of 30th-floor slab", percent: 10 },
  { stage: "On casting of top-floor slab", percent: 10 },
  { stage: "On completion of façade & finishes", percent: 15 },
  { stage: "On offer of possession", percent: 15, note: "Plus stamp duty & registration" },
];

/* ── FAQ (also emitted as FAQPage structured data) ─────────────────────────── */

export const faqs: { q: string; a: string }[] = [
  {
    q: "Is The Sovereign registered under RERA?",
    a: IS_DEMO
      ? `This website is a concept demo, so the RERA number shown (${project.rera}) is not real. For a live project, the HARERA registration number and QR code will be displayed here and on every advertisement.`
      : `Yes. The Sovereign is registered with HARERA under registration no. ${project.rera}. Details are available on the HARERA website (haryanarera.gov.in).`,
  },
  { q: "When is possession expected?", a: `Indicative possession is ${project.possession}, with a grace period as permitted under RERA. Construction updates would be shared every quarter.` },
  { q: "What payment plans are available?", a: "A construction-linked plan (shown above) is standard. Down-payment and possession-linked options can be discussed with a relationship manager." },
  {
    q: "Can NRIs buy a residence? How do NRE/NRO payments work?",
    a: "Yes. NRIs and OCIs can buy residential property in India without RBI approval. Payments must be made in Indian rupees through normal banking channels — inward remittance from abroad, or from your NRE, NRO or FCNR account in India (not in foreign currency or traveller's cheques). Funds paid from an NRE/FCNR account can generally be repatriated on sale, within RBI limits. You can book after a video tour, sign digitally or via a Power of Attorney, and register through your representative.",
  },
  { q: "Are home loans available, including for NRIs?", a: "Leading banks and NBFCs can finance up to 75–80% of the agreement value for eligible buyers, including NRIs. Use the EMI calculator on the Residences page for an indicative monthly figure." },
  { q: "What will the maintenance charges be?", a: "Indicative maintenance is ₹12–14 per sq ft per month (plus GST), covering 24×7 security, concierge, facility management and common-area utilities. Club usage is billed separately." },
  { q: "How many parking spaces does each residence get?", a: "3 covered spaces for a 4 BHK, 4 for a 5 BHK and 6 for a Penthouse, each with an EV charging point. Visitor parking is available at podium level." },
  { q: "Are pets allowed?", a: "Yes, The Sovereign is pet-friendly, with a landscaped pet park, pet-washing station and dedicated service lifts for residents travelling with pets." },
  { q: "Can I customise the interiors?", a: "Layout changes to internal partitions and a choice of three finish palettes (Modern, Classic, Minimal — try them in the virtual tour) are available up to the 20th-floor slab stage." },
  { q: "How do I book a site visit or video tour?", a: "Use the 'Request Private Viewing' form. Choose Site Visit for a chauffeured tour of the sales gallery in Gurugram, or Video Call Tour for a live walkthrough in your own time zone." },
];

/* ── Developer (FICTIONAL demo content) ────────────────────────────────────── */

export const developer = {
  title: `About ${company.name}`,
  story: [
    "Founded in Gurugram in 2008, White Collar Realty builds a small number of exceptional homes rather than a large number of ordinary ones.",
    "Every project is designed with international architects, built with tier-one contractors and handed over with a ten-year structural warranty — because the families who live in our buildings are the only advertisement we need.",
  ],
  stats: [
    { value: 18, suffix: "", label: "Years of building", decimals: 0 },
    { value: 24, suffix: "", label: "Projects delivered", decimals: 0 },
    { value: 6200, suffix: "+", label: "Families at home", decimals: 0 },
    { value: 14.5, suffix: "M", label: "Sq ft delivered", decimals: 1 },
  ],
  projects: [
    { name: "The Aravalli Residences", location: "Sector 42, Gurugram", year: "Delivered 2016", detail: "312 homes · 4 towers", image: images.pastProjects.aravalli },
    { name: "Cyber Crest", location: "DLF Cyber City", year: "Delivered 2019", detail: "1.2M sq ft Grade-A offices", image: images.pastProjects.cyberCrest },
    { name: "Meridian Villas", location: "Sohna Road, Gurugram", year: "Delivered 2022", detail: "64 private villas", image: images.pastProjects.meridian },
  ],
};

/* ── Testimonials (FICTIONAL) ──────────────────────────────────────────────── */

export const testimonials = [
  {
    quote: "We were in London and could not fly down. The virtual tour was so precise that we booked our 5 BHK after a single video call. Possession can't come soon enough.",
    name: "Arjun & Meera Kapoor (fictional)",
    role: "NRI clients, London",
  },
  {
    quote: "The floor selector showed me exactly which units had the golf view. No brochures, no guesswork — the most transparent sales experience I have had in Gurugram.",
    name: "Rohan Malhotra (fictional)",
    role: "Founder, fintech start-up",
  },
  {
    quote: "The team walked my parents through the residence in 3D on their TV. Quiet, unhurried, genuinely luxurious — exactly like the building itself.",
    name: "Dr. Kavya Sethi (fictional)",
    role: "Cardiologist, Gurugram",
  },
] as const;

/* ── Experience cards ──────────────────────────────────────────────────────── */

export const experienceFeatures = [
  { title: "Virtual Walkthrough", description: "Glide room to room through a fully furnished 4 BHK residence — from your sofa.", href: "/virtual-tour", cta: "Enter", image: images.experience.walkthrough },
  { title: "Interactive Floor Selector", description: "Pick a floor on the 3D tower and see live availability, sizes and views.", href: "/#floor-selector", cta: "Explore", image: images.experience.floorSelector },
  { title: "Day & Night View", description: "Watch golden afternoon light turn into a glittering night skyline inside the residence.", href: "/virtual-tour?mode=night", cta: "Explore", image: images.experience.dayNight },
] as const;

/* ── Amenities ─────────────────────────────────────────────────────────────── */

export const amenities: { title: string; kicker: string; description: string; image: ImageSlot }[] = [
  { title: "Sky Lounge", kicker: `${ordinal(building.skyLoungeFloor)} Floor`, description: "A members-only lounge high above Gurugram, with a bar, private dining and sunset terraces.", image: images.amenities.skyLounge },
  { title: "Infinity Pool", kicker: "Temperature controlled", description: "A 40-metre edge pool that dissolves into the skyline, flanked by cabanas and a poolside café.", image: images.amenities.infinityPool },
  { title: "Private Theatre", kicker: "18 recliners · Dolby Atmos", description: "Screen premieres or the cricket final in a velvet-lined theatre bookable by residents.", image: images.amenities.theatre },
  { title: "Cigar Lounge", kicker: "Walk-in humidor", description: "Leather, walnut and single malts — an intimate club room with its own ventilation and humidor.", image: images.amenities.cigarLounge },
  { title: "The Spa", kicker: "Thermal suite", description: "Treatment rooms, steam, sauna and a cold plunge, curated by a five-star wellness partner.", image: images.amenities.spa },
  { title: "Golf Simulator", kicker: "Tour-grade tech", description: "Play 100+ championship courses year-round, minutes from the real DLF Golf & Country Club.", image: images.amenities.golfSimulator },
  { title: "24×7 Concierge", kicker: "Hotel-style service", description: "From airport transfers to restaurant reservations, a dedicated concierge desk handles it all.", image: images.amenities.concierge },
  { title: "EV Charging", kicker: "Every parking bay", description: "Fast-charging points at every residence's parking, with valet charging on request.", image: images.amenities.evCharging },
  { title: "3-Tier Security", kicker: "Biometric · CCTV · Guards", description: "Perimeter, lobby and residence-level security with private elevator lobbies for every home.", image: images.amenities.security },
];

export const amenitiesCopy = {
  headline: ["A private club,", `${numberWords(building.skyLoungeFloor)} floors up.`] as const,
  /** "Nine curated experiences…" — count derived from the list above. */
  intro: (residences: number) =>
    `${numberWords(amenities.length, true)} curated experiences, reserved exclusively for ${residences} families. Scroll to stroll through them.`,
};

/* ── Location ──────────────────────────────────────────────────────────────── */

export interface Place {
  id: string;
  name: string;
  category: "Transit" | "Business" | "Leisure" | "Airport" | "Healthcare" | "Education" | "Shopping";
  distance: string;
  driveTime: string;
  coordinates: [number, number];
}

/** Approximate coordinates (demo). Distances from the project site. */
export const places: Place[] = [
  { id: "metro", name: "Rapid Metro – Sector 54 Chowk", category: "Transit", distance: "600 m", driveTime: "2 min", coordinates: [28.4335, 77.1063] },
  { id: "cyber", name: "Cyber City", category: "Business", distance: "8 km", driveTime: "18 min", coordinates: [28.4951, 77.0891] },
  { id: "golf", name: "DLF Golf & Country Club", category: "Leisure", distance: "2 km", driveTime: "5 min", coordinates: [28.4532, 77.1001] },
  { id: "airport", name: "Aerocity / IGI Airport", category: "Airport", distance: "22 km", driveTime: "35 min", coordinates: [28.5507, 77.1215] },
  { id: "medanta", name: "Medanta Hospital", category: "Healthcare", distance: "7 km", driveTime: "16 min", coordinates: [28.4394, 77.0405] },
  { id: "shriram", name: "The Shri Ram School", category: "Education", distance: "3 km", driveTime: "8 min", coordinates: [28.4567, 77.0873] },
  { id: "galleria", name: "Galleria Market", category: "Shopping", distance: "4 km", driveTime: "10 min", coordinates: [28.4673, 77.0832] },
];
