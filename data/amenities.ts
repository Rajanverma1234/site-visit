export interface Amenity {
  title: string;
  kicker: string;
  description: string;
  image: string;
}

const u = (id: string) => `https://images.unsplash.com/${id}?auto=format&fit=crop&w=1400&q=80`;

export const amenities: Amenity[] = [
  {
    title: "Sky Lounge",
    kicker: "40th Floor",
    description: "A members-only lounge suspended 160 metres above Gurugram, with a bar, private dining and sunset terraces.",
    image: u("photo-1514933651103-005eec06c04b"),
  },
  {
    title: "Infinity Pool",
    kicker: "Temperature controlled",
    description: "A 40-metre edge pool that dissolves into the skyline, flanked by cabanas and a poolside café.",
    image: u("photo-1571896349842-33c89424de2d"),
  },
  {
    title: "Private Theatre",
    kicker: "18 recliners · Dolby Atmos",
    description: "Screen premieres or the cricket final in a velvet-lined theatre bookable by residents.",
    image: u("photo-1489599849927-2ee91cede3ba"),
  },
  {
    title: "Cigar Lounge",
    kicker: "Walk-in humidor",
    description: "Leather, walnut and single malts — an intimate club room with its own ventilation and humidor.",
    image: u("photo-1470337458703-46ad1756a187"),
  },
  {
    title: "The Spa",
    kicker: "Thermal suite",
    description: "Treatment rooms, steam, sauna and a cold plunge, curated by a five-star wellness partner.",
    image: u("photo-1540555700478-4be289fbecef"),
  },
  {
    title: "Golf Simulator",
    kicker: "Tour-grade tech",
    description: "Play 100+ championship courses year-round, minutes from the real DLF Golf & Country Club.",
    image: u("photo-1535131749006-b7f58c99034b"),
  },
  {
    title: "24×7 Concierge",
    kicker: "Hotel-style service",
    description: "From airport transfers to restaurant reservations, a dedicated concierge desk handles it all.",
    image: u("photo-1582719478250-c89cae4dc85b"),
  },
  {
    title: "EV Charging",
    kicker: "Every parking bay",
    description: "Fast-charging points at every residence's parking, with valet charging on request.",
    image: u("photo-1593941707882-a5bba14938c7"),
  },
  {
    title: "3-Tier Security",
    kicker: "Biometric · CCTV · Guards",
    description: "Perimeter, lobby and residence-level security with private elevator lobbies for every home.",
    image: u("photo-1558002038-1055907df827"),
  },
];
