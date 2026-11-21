# THE SOVEREIGN by White Collar Realty: concept demo

This is a demo website for a luxury real-estate project. It is built so that buyers who cannot visit the site can still "walk through" the property from home.

> **This is a concept demo.** The project, images and prices are illustrative only. The RERA number `DEMO-RERA-GGM-2026-001` is not real.

## What's inside

| Page | What it does |
| --- | --- |
| `/` Home | 3D glass towers at golden hour. They follow your mouse and zoom in as you scroll. Also on this page: animated stats, tilt cards, the **Interactive Floor Selector** (hover a floor to see live availability, click it for unit details), a pinned horizontal amenities scroll, a Leaflet map with nearby places, testimonials and a lead form. |
| `/virtual-tour` | A walk-through 3D 4 BHK apartment. You can look around with the mouse, drag to turn and scroll to zoom. Click the gold floor circles to walk, or use the room bar, the mini floor plan or keys 1–7. Hover over the glowing dots to see feature details. Day/Night toggle, Modern/Classic/Minimal style switcher, ambient sound, fullscreen. |
| `/residences` | 4 BHK, 5 BHK and Penthouse cards, plus an EMI calculator. |
| `/residences/[type]` | Interactive SVG floor plan (hover a room to see its size), specifications, price breakup with GST, and an EMI calculator. |
| `/contact` | Lead form with validation. Leads are saved in the browser's localStorage (demo only), and a "Continue on WhatsApp" link opens with a pre-filled message. |
| `/brochure` | A printable brochure generated from the data files. "Download Brochure" opens the print dialog, where you can choose "Save as PDF". |

All 3D content is **built in code** from simple shapes. There are no `.glb` models and no HDR files to download. Reflections come from procedural "light-former" environments, so the 3D works even offline.

## Run it locally

You need **Node.js 18.17 or newer** (Node 20/22 recommended).

```bash
npm install
npm run dev
```

Open http://localhost:3000.

To test the production build:

```bash
npm run build
npm start
```

## Deploy to Vercel

1. Push this folder to a GitHub/GitLab/Bitbucket repository.
2. Go to https://vercel.com/new and import the repository.
3. Keep the default settings (Framework: **Next.js**, Build command: `next build`).
4. Click **Deploy**. You don't need any environment variables or API keys.

Or from the command line:

```bash
npm i -g vercel
vercel        # preview deployment
vercel --prod # production deployment
```

After deploying, change `metadataBase` in `app/layout.tsx` to your real domain so social-share links are correct.

## Use it for a real project

Almost all content lives in the **`/data`** folder. Edit these files and the whole site updates.

| File | What to change |
| --- | --- |
| `data/project.ts` | Company name, tagline, phone, WhatsApp number (digits only, with `91`), email, address, project name, headline, RERA, possession date, stats, nav links, feature cards, testimonials. |
| `data/residences.ts` | Unit types, sizes, prices (in rupees), highlights, specifications, price breakup lines, and the **floor-plan rooms** (each room is a rectangle in feet: `x, y, w, h`). |
| `data/units.ts` | Floor-by-floor inventory for the Floor Selector. Replace `buildTower()` with your real inventory (for example a CRM or Excel export): one entry per unit with tower, floor, type, area, price, view and status. |
| `data/amenities.ts` | Amenity names, descriptions and image URLs. |
| `data/locations.ts` | Nearby places with coordinates, distance and drive time. Set the project pin in `data/project.ts → coordinates`. |
| `data/tour.ts` | Virtual-tour rooms (rectangles in metres), camera spots, door waypoints and the hover-info texts. |

Prices are stored as plain numbers in rupees. `lib/format.ts` shows them as **₹12.5 Cr / ₹45 Lakh** automatically.

### Replace the images

- Images are loaded from Unsplash URLs in the data files. Swap the URLs for your own.
- **To use your own photos:** put them in `/public/images/` and use paths like `/images/living.jpg`.
- **To use another image host:** add its hostname to `images.remotePatterns` in `next.config.mjs`.
- If an image fails to load, a warm gold gradient is shown instead, so the layout never breaks.

### Replace the 3D apartment with real assets

The demo apartment is drawn with boxes and cylinders in `components/three/Rooms.tsx`. To use a real model (for example one exported from SketchUp, Revit, 3ds Max or Blender):

1. Export it as **`.glb`** (use real-world metres, Y-up), and compress it with `npx gltf-transform optimize model.glb model-opt.glb`.
2. Put it in `/public/models/apartment.glb`.
3. In `components/three/Apartment.tsx`, replace `<Rooms />` with a small component like this:
   ```tsx
   import { useGLTF } from "@react-three/drei";
   function RealApartment() {
     const { scene } = useGLTF("/models/apartment.glb");
     return <primitive object={scene} />;
   }
   ```
4. Update `data/tour.ts` so the room rectangles, camera `spot`s and `exits` (door waypoints) match the new layout. The mini-map and camera glides use this data automatically.
5. To keep the hover labels, wrap the matching meshes with `<InfoHover info={infoPoints.xyz}>` (see `components/three/Hotspot.tsx`).

You can replace the hero towers (`components/three/Towers.tsx`) the same way. For a quick swap, keep the procedural towers and only change `FLOORS` and `TOWERS`.

### Connect the lead form to a real CRM

In `components/ui/LeadForm.tsx`, the `onSubmit` function saves to `localStorage`. Replace it with a `fetch()` to your CRM, Google Sheet webhook, or a Next.js Route Handler.

## Tech stack

Next.js 14 (App Router) · TypeScript · Tailwind CSS · three.js · @react-three/fiber · @react-three/drei · @react-three/postprocessing · GSAP + ScrollTrigger · Framer Motion · Lenis · Leaflet + react-leaflet (CARTO dark tiles on OpenStreetMap data, no key) · react-hook-form + zod · lucide-react.

## Project structure

```
app/                 routes (home, virtual-tour, residences, contact, brochure)
components/
  ui/                cursor, magnetic button, reveal, navbar, footer, lead form…
  sections/          home-page sections, contact, brochure
  three/             Towers, FloorSelector, Apartment, Rooms, Hotspot, CameraRig, materials
  tour/              virtual-tour overlay UI, mini-map, ambient sound
  residences/        cards, floor plan, EMI calculator
data/                ALL editable content
hooks/               useMouse, useLenis, useInView, useMediaQuery
lib/                 emi.ts, format.ts (₹ Cr/Lakh), utils
```

## Performance & accessibility notes

- Every 3D canvas is lazy-loaded (`ssr: false`) and shows a gold loader while it loads.
- Canvases pause when they scroll off-screen. The device pixel ratio is capped at 1.5, and `AdaptiveDpr` + `PerformanceMonitor` lower the quality on slower machines.
- Repeated geometry (windows, slabs, fins, trees, city blocks) is instanced.
- Touch devices get tap-friendly controls, native scrolling and simpler effects. `prefers-reduced-motion` turns off smooth scrolling, parallax and long animations.
- Every control can be reached with the keyboard and has a visible focus ring. The floor selector has a keyboard-friendly floor list, and the tour supports arrow keys, `+`/`-` zoom, `1–7` rooms, `N` night and `H` help.
