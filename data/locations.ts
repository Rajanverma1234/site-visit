export interface Place {
  id: string;
  name: string;
  category: "Transit" | "Business" | "Leisure" | "Airport" | "Healthcare" | "Education" | "Shopping";
  distance: string;
  driveTime: string;
  coordinates: [number, number];
}

/** Approximate coordinates (demo). Distances are from THE SOVEREIGN site. */
export const places: Place[] = [
  { id: "metro", name: "Rapid Metro – Sector 54 Chowk", category: "Transit", distance: "600 m", driveTime: "2 min", coordinates: [28.4335, 77.1063] },
  { id: "cyber", name: "Cyber City", category: "Business", distance: "8 km", driveTime: "18 min", coordinates: [28.4951, 77.0891] },
  { id: "golf", name: "DLF Golf & Country Club", category: "Leisure", distance: "2 km", driveTime: "5 min", coordinates: [28.4532, 77.1001] },
  { id: "airport", name: "Aerocity / IGI Airport", category: "Airport", distance: "22 km", driveTime: "35 min", coordinates: [28.5507, 77.1215] },
  { id: "medanta", name: "Medanta Hospital", category: "Healthcare", distance: "7 km", driveTime: "16 min", coordinates: [28.4394, 77.0405] },
  { id: "shriram", name: "The Shri Ram School", category: "Education", distance: "3 km", driveTime: "8 min", coordinates: [28.4567, 77.0873] },
  { id: "galleria", name: "Galleria Market", category: "Shopping", distance: "4 km", driveTime: "10 min", coordinates: [28.4673, 77.0832] },
];
