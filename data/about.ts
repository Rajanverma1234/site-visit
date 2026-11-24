/**
 * Developer story — FICTIONAL demo content.
 * TODO(client): replace with the real company history, numbers and project photos.
 */

export const about = {
  title: "About White Collar Realty",
  story: [
    "Founded in Gurugram in 2008, White Collar Realty builds a small number of exceptional homes rather than a large number of ordinary ones.",
    "Every project is designed with international architects, built with tier-one contractors and handed over with a ten-year structural warranty — because the families who live in our buildings are the only advertisement we need.",
  ],
  stats: [
    { value: 18, suffix: "", label: "Years of building" },
    { value: 24, suffix: "", label: "Projects delivered" },
    { value: 6200, suffix: "+", label: "Families at home" },
    { value: 14.5, suffix: "M", label: "Sq ft delivered", decimals: 1 },
  ],
  projects: [
    {
      name: "The Aravalli Residences",
      location: "Sector 42, Gurugram",
      year: "Delivered 2016",
      detail: "312 homes · 4 towers",
      image: "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=1200&q=75",
    },
    {
      name: "Cyber Crest",
      location: "DLF Cyber City",
      year: "Delivered 2019",
      detail: "1.2M sq ft Grade-A offices",
      image: "https://images.unsplash.com/photo-1486325212027-8081e485255e?auto=format&fit=crop&w=1200&q=75",
    },
    {
      name: "Meridian Villas",
      location: "Sohna Road, Gurugram",
      year: "Delivered 2022",
      detail: "64 private villas",
      image: "https://images.unsplash.com/photo-1613977257363-707ba9348227?auto=format&fit=crop&w=1200&q=75",
    },
  ],
} as const;
