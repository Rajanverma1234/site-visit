/**
 * Buyer information: payment plan, specifications, FAQs.
 * TODO(client): replace every value here with the approved, RERA-registered terms.
 */

export interface PaymentStage {
  stage: string;
  percent: number;
  note?: string;
}

/** Construction-linked plan (CLP). Must add up to 100. */
export const paymentPlan: PaymentStage[] = [
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

export interface SpecGroup {
  title: string;
  items: string[];
}

export const specifications: SpecGroup[] = [
  { title: "Flooring", items: ["Imported Italian Statuario marble in living, dining & foyer", "Engineered oak in bedrooms", "Anti-skid stone deck on balconies"] },
  { title: "Kitchen", items: ["Italian modular kitchen with quartz island", "Bosch built-in appliances", "Separate wet & dry kitchen"] },
  { title: "Bathrooms", items: ["Kohler & Grohe sanitaryware", "Rain shower; freestanding tub in master", "Heated towel rails, anti-fog mirrors"] },
  { title: "Glazing", items: ["11 ft floor-to-ceiling double-glazed low-E glass", "Acoustic laminated panes on the road side", "Slim bronze-anodised frames"] },
  { title: "Smart Home", items: ["App & voice control for lights, curtains, climate", "Video door phone, biometric lock", "Leak & smoke sensors with alerts"] },
  { title: "HVAC", items: ["VRV air-conditioning in every room", "Fresh-air system with HEPA filtration", "Concealed ducting, individual thermostats"] },
];

export interface Faq {
  q: string;
  a: string;
}

export const faqs: Faq[] = [
  {
    q: "Is The Sovereign registered under RERA?",
    a: "This website is a concept demo, so the RERA number shown (DEMO-RERA-GGM-2026-001) is not real. For a live project, the HARERA registration number and QR code will be displayed here and on every advertisement.",
  },
  {
    q: "When is possession expected?",
    a: "Indicative possession is December 2029, with a grace period as permitted under RERA. Construction updates would be shared every quarter.",
  },
  {
    q: "What payment plans are available?",
    a: "A construction-linked plan (illustrated above) is standard. Down-payment and possession-linked options can be discussed with a relationship manager.",
  },
  {
    q: "Can NRIs buy a residence? What is the process?",
    a: "Yes. NRIs and OCIs can buy residential property in India without RBI approval. Payments must come through NRE/NRO/FCNR accounts or inward remittance. You can book after a video tour, sign documents digitally or via a Power of Attorney, and register through your representative.",
  },
  {
    q: "Are home loans available?",
    a: "Leading banks and NBFCs can finance up to 75–80% of the agreement value for eligible buyers, including NRIs. Use the EMI calculator on the Residences page for an indicative monthly figure.",
  },
  {
    q: "What will the maintenance charges be?",
    a: "Indicative maintenance is ₹12–14 per sq ft per month (plus GST), covering 24×7 security, concierge, facility management and common-area utilities. Club usage is billed separately.",
  },
  {
    q: "How many parking spaces does each residence get?",
    a: "3 covered spaces for a 4 BHK, 4 for a 5 BHK and 6 for a Penthouse, each with an EV charging point. Visitor parking is available at the podium level.",
  },
  {
    q: "Are pets allowed?",
    a: "Yes, The Sovereign is pet-friendly. There's a landscaped pet park, pet-washing station and dedicated service lifts for residents travelling with pets.",
  },
  {
    q: "Can I customise the interiors?",
    a: "Layout changes to internal partitions and a choice of three finish palettes (Modern, Classic, Minimal — try them in the virtual tour) are available up to the 20th-floor slab stage.",
  },
  {
    q: "How do I book a site visit or video tour?",
    a: "Use the 'Request Private Viewing' form. Choose Site Visit for a chauffeured tour of the sales gallery in Gurugram, or Video Call Tour for a live walkthrough in your own time zone.",
  },
];
