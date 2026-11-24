# Handover: swapping in real images and data

Everything client-specific lives in **`/data`** and **`/public/images`**. You shouldn't need to edit any component.

## 1. Project facts → `data/project.ts`

One file holds every fact the site shows. Search it for `TODO(client)`.

| What | Where in `project.ts` |
| --- | --- |
| Phone (drives the displayed number, `tel:` and WhatsApp links), email, address, social handles | `company` |
| Floors, towers, Sky Lounge floor, penthouse floor | `building` (all floor labels and "40th floor" / "forty floors up" text come from here) |
| Name, headline (for advertising-compliance review), location, RERA number, possession date | `project` |
| Page title, description, keywords | `seo` |
| 4 BHK / 5 BHK / Penthouse: areas, prices, price breakup, highlights | `configurations` |
| Building specifications, payment plan, FAQ | `specifications`, `paymentPlan`, `faqs` |
| Developer story, stats, past projects; testimonials | `developer`, `testimonials` |
| Amenities, nearby places | `amenities`, `places` |

Prices are plain numbers in rupees (use the `CRORE` and `LAKH` constants). They display as ₹12.5 Cr / ₹45 Lakh automatically.

## 2. Unit inventory → `data/inventory.json`

There is one object per unit:

```json
{ "id": "A-2301", "tower": "A", "floor": 23, "unitNumber": "2301", "configuration": "4 BHK",
  "carpetArea": 3350, "facing": "City view", "price": 133400000, "status": "available" }
```

- `status` is `available`, `booked` or `on_hold`.
- `price` is `null` when the price is on request.
- The floor selector, the "X matching residences" counts, the unit totals and the "164 residences" claim all read from this file. Replace it with your CRM export in the same shape.

## 3. Images → `/public/images` + `data/images.ts`

1. See **`public/images/README.md`** for every slot, its aspect ratio, minimum resolution and suggested file name.
2. Copy the file into `public/images/…`.
3. In `data/images.ts`, update the slot's `src`, set `placeholder: false` (this removes the "Illustrative image" tag) and update its `alt` text.
4. Run `npm run images:meta` to refresh the real dimensions and blur previews.

**Floor plans:** set `images.floorPlans[slug].src` to show a real plan image. Until then, the interactive SVG in `data/floorplans.ts` is shown.
**Brochure:** replace `public/brochure/the-sovereign-brochure.pdf` with the approved PDF, keeping the same name.

## 4. Going live

| Variable | Set to |
| --- | --- |
| `NEXT_PUBLIC_IS_DEMO` | `false`. This allows indexing, switches `robots.txt` to allow all and advertise the sitemap, and hides every demo disclaimer. |
| `NEXT_PUBLIC_SITE_URL` | Your real domain. |
| `RESEND_API_KEY`, `LEAD_TO_EMAIL`, `LEAD_FROM_EMAIL` | Lead emails. Without them, leads are only logged in Vercel's function logs. |

Set these in Vercel → Project → Settings → Environment Variables, then redeploy. See `.env.example`.

Before launch, also:
- Remove "(fictional)" from the testimonials, and use only real, consented testimonials.
- Replace the developer stats and past projects with real ones.
- Confirm the viewing slots in `components/ui/LeadForm.tsx` (`IST_SLOTS`).
