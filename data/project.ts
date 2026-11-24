/**
 * Single source of truth for project & company content.
 * To reuse this site for a real project, edit the values in this folder only.
 */

export const company = {
  name: "White Collar Realty",
  wordmark: "WHITE COLLAR REALTY",
  tagline: "Where Ambition Comes Home",
  /**
   * ONE phone number drives everything: the displayed text, tel: links and wa.me links.
   * TODO(client): replace the demo placeholder with the real sales number.
   */
  phoneE164: "+919800000000",
  phone: "+91 98000 00000",
  /** Digits only (wa.me format) — derived from phoneE164, don't edit separately. */
  get whatsapp() {
    return this.phoneE164.replace(/\D/g, "");
  },
  email: "sales@whitecollarrealty.demo",
  address: "Sales Gallery, Golf Course Road, Sector 54, Gurugram, Haryana 122011",
  /** TODO(client): replace placeholder handles with the real social accounts. */
  socials: [
    { label: "Instagram", href: "https://instagram.com/whitecollarrealty" },
    { label: "Facebook", href: "https://facebook.com/whitecollarrealty" },
    { label: "LinkedIn", href: "https://linkedin.com/company/whitecollarrealty" },
    { label: "YouTube", href: "https://youtube.com/@whitecollarrealty" },
  ],
  disclaimer: "This is a concept demo. Project, images and prices are illustrative only.",
} as const;

export const project = {
  name: "THE SOVEREIGN",
  shortName: "The Sovereign",
  headline: "Golf Course Road's Most Coveted Address",
  location: "Golf Course Road, Sector 54, Gurugram",
  type: "2 iconic glass towers · 42 floors each · Ultra-luxury 4 & 5 BHK residences + 2 Penthouses",
  towers: 2,
  floors: 42,
  residences: 164,
  greensAcres: 3,
  possession: "December 2029",
  rera: "DEMO-RERA-GGM-2026-001",
  reraNote: "Demo registration number — not a real RERA ID",
  coordinates: [28.4386, 77.1032] as [number, number],
  intro:
    "Rising 42 storeys above Gurugram's most prestigious boulevard, The Sovereign is a pair of sculpted glass towers designed for those who have arrived. Every residence is a corner home with a private elevator lobby, floor-to-ceiling glazing and unobstructed views over the DLF Golf Course.",
} as const;

export const stats = [
  { value: 42, label: "Floors", suffix: "" },
  { value: 2, label: "Towers", suffix: "" },
  { value: 164, label: "Residences", suffix: "" },
  { value: 3, label: "Acres of Greens", suffix: "" },
] as const;

export const navLinks = [
  { label: "The Sovereign", href: "/#sovereign" },
  { label: "Virtual Tour", href: "/virtual-tour" },
  { label: "Residences", href: "/residences" },
  { label: "Amenities", href: "/#amenities" },
  { label: "Location", href: "/#location" },
  { label: "Contact", href: "/contact" },
] as const;

/** Feature cards for "Walk Through Before You Visit". */
export const experienceFeatures = [
  {
    title: "Virtual Walkthrough",
    description: "Glide room to room through a fully furnished 4 BHK residence — from your sofa.",
    href: "/virtual-tour",
    cta: "Enter",
    image: "https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=1200&q=80",
  },
  {
    title: "Interactive Floor Selector",
    description: "Hover over the tower, pick a floor and see live availability, sizes and views.",
    href: "/#floor-selector",
    cta: "Explore",
    image: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1200&q=80",
  },
  {
    title: "Day & Night View",
    description: "Watch golden afternoon light turn into a glittering night skyline inside the residence.",
    href: "/virtual-tour?mode=night",
    cta: "Explore",
    image: "https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?auto=format&fit=crop&w=1200&q=80",
  },
] as const;

export const testimonials = [
  {
    quote:
      "We were in London and could not fly down. The virtual tour was so precise that we booked our 5 BHK after a single video call. Possession can't come soon enough.",
    name: "Arjun & Meera Kapoor (fictional)",
    role: "NRI clients, London",
  },
  {
    quote:
      "The floor selector showed me exactly which units had the golf view. No brochures, no guesswork — the most transparent sales experience I have had in Gurugram.",
    name: "Rohan Malhotra (fictional)",
    role: "Founder, fintech start-up",
  },
  {
    quote:
      "The team walked my parents through the residence in 3D on their TV. Quiet, unhurried, genuinely luxurious — exactly like the building itself.",
    name: "Dr. Kavya Sethi (fictional)",
    role: "Cardiologist, Gurugram",
  },
] as const;
