# Image brief: The Sovereign

Every image on the site has a named **slot** in [`data/images.ts`](../../data/images.ts). Today the slots hold stock photos or 3D renders, and each one shows an *"Illustrative image"* tag on the site. The table below lists what we need from the client for each slot.

## How to swap in a real image

1. Save the file in this folder using the **suggested file name** (create sub-folders as needed), e.g. `public/images/amenities/sky-lounge.jpg`.
2. In `data/images.ts`, set that slot's `src` to the new path (e.g. `"/images/amenities/sky-lounge.jpg"`) and change `placeholder: true` to `placeholder: false`. This removes the "Illustrative image" tag.
3. Update the `alt` text so it describes the real photo.
4. Run `npm run images:meta`. This records the real size and blur preview for each image.

**Formats:** JPG or PNG (WebP and AVIF are fine too). The site converts everything to AVIF/WebP automatically, so send the highest quality you have. Keep each file under 5 MB. Logos should be SVG.
**Framing:** the site reserves the aspect ratio shown below, so photos are cropped from the centre to fit it. Keep the subject near the middle of the frame.

| Slot | Used for | Aspect ratio | Minimum resolution | Suggested file name | Status |
| --- | --- | --- | --- | --- | --- |
| `hero.day` | Homepage hero poster, desktop | 16:10 | 2560×1600 | `hero/hero-day.jpg` | placeholder |
| `hero.mobile` | Homepage hero poster, phones | 9:19.5 | 1080×2340 | `hero/hero-mobile.jpg` | placeholder |
| `hero.night` | Reserved: night hero / campaign image | 16:10 | 2560×1600 | `hero/hero-night.jpg` | not supplied yet |
| `experience.walkthrough` | 'Virtual Walkthrough' card | 4:5 | 1200×1500 | `experience/walkthrough.jpg` | placeholder |
| `experience.floorSelector` | 'Interactive Floor Selector' card | 4:5 | 1200×1500 | `experience/floor-selector.jpg` | placeholder |
| `experience.dayNight` | 'Day & Night View' card | 4:5 | 1200×1500 | `experience/day-night.jpg` | placeholder |
| `amenities.skyLounge` | Amenity card: Sky Lounge | 4:5 | 1200×1500 | `amenities/sky-lounge.jpg` | placeholder |
| `amenities.infinityPool` | Amenity card: Infinity Pool | 4:5 | 1200×1500 | `amenities/infinity-pool.jpg` | placeholder |
| `amenities.theatre` | Amenity card: Private Theatre | 4:5 | 1200×1500 | `amenities/private-theatre.jpg` | placeholder |
| `amenities.cigarLounge` | Amenity card: Cigar Lounge | 4:5 | 1200×1500 | `amenities/cigar-lounge.jpg` | placeholder |
| `amenities.spa` | Amenity card: The Spa | 4:5 | 1200×1500 | `amenities/spa.jpg` | placeholder |
| `amenities.golfSimulator` | Amenity card: Golf Simulator | 4:5 | 1200×1500 | `amenities/golf-simulator.jpg` | placeholder |
| `amenities.concierge` | Amenity card: 24×7 Concierge | 4:5 | 1200×1500 | `amenities/concierge.jpg` | placeholder |
| `amenities.evCharging` | Amenity card: EV Charging | 4:5 | 1200×1500 | `amenities/ev-charging.jpg` | placeholder |
| `amenities.security` | Amenity card: 3-Tier Security | 4:5 | 1200×1500 | `amenities/security.jpg` | placeholder |
| `interiors.4-bhk` | 4 BHK card & detail-page hero | 3:2 | 2400×1600 | `interiors/4bhk-living.jpg` | placeholder |
| `interiors.5-bhk` | 5 BHK card & detail-page hero | 3:2 | 2400×1600 | `interiors/5bhk-living.jpg` | placeholder |
| `interiors.penthouse` | Penthouse card & detail-page hero | 3:2 | 2400×1600 | `interiors/penthouse.jpg` | placeholder |
| `floorPlans.4-bhk` | Floor-plan modal & 4 BHK page | 4:3 | 2400×1800 (or SVG/PDF) | `floor-plans/4bhk.png` | not supplied yet |
| `floorPlans.5-bhk` | Floor-plan modal & 5 BHK page | 4:3 | 2400×1800 (or SVG/PDF) | `floor-plans/5bhk.png` | not supplied yet |
| `floorPlans.penthouse` | Floor-plan modal & Penthouse page | 4:3 | 2400×1800 (or SVG/PDF) | `floor-plans/penthouse.png` | not supplied yet |
| `view` | Homepage intro — actual view from a high floor (drone shot) | 16:10 | 2560×1600 | `view/view-from-residence.jpg` | placeholder |
| `developerLogo` | Brand mark (header/footer use the inline version) | 260:64 | Vector (SVG) preferred | `brand/logo.svg` | placeholder |
| `pastProjects.aravalli` | About section, past project 1 | 4:3 | 1600×1200 | `past-projects/project-1.jpg` | placeholder |
| `pastProjects.cyberCrest` | About section, past project 2 | 4:3 | 1600×1200 | `past-projects/project-2.jpg` | placeholder |
| `pastProjects.meridian` | About section, past project 3 | 4:3 | 1600×1200 | `past-projects/project-3.jpg` | placeholder |
| `posters.floorSelector` | Shown until the 3D floor selector loads | 16:9 | Auto-generated render | `(keep)` | placeholder |
| `posters.virtualTour` | Shown until the virtual tour loads | 16:10 | Auto-generated render | `(keep)` | placeholder |
| `og` | Link preview (WhatsApp, LinkedIn, X…) | 1200:630 | 1200×630 exactly | `og/og.jpg` | placeholder |

## Notes

- **Floor plans:** while a floor-plan slot is empty (`src: null`), the site shows an interactive placeholder SVG built from `data/floorplans.ts`. Supplying an image (or a high-resolution PNG export of the architect's PDF) replaces it.
- **Posters (`posters.*`, `hero.day`, `hero.mobile`):** these are renders of the site's own 3D scenes, shown while the 3D loads. Replace them with real photography only if you also want the 3D intro to start from that photo.
- **og.jpg** is the preview image shown when the link is shared on WhatsApp, LinkedIn and similar apps. It must be exactly 1200×630.
- **Rights:** only use photos you hold the rights to. The current stock photos come from Unsplash and are for demonstration only.
