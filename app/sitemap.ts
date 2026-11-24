import type { MetadataRoute } from "next";
import { residences } from "@/data/residences";
import { SITE_URL } from "@/lib/site";

/** /sitemap.xml — public pages only (the printable brochure is excluded). */
export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  const pages = ["", "/virtual-tour", "/residences", "/contact", ...residences.map((r) => `/residences/${r.slug}`)];
  return pages.map((p) => ({ url: `${SITE_URL}${p}`, lastModified: now, changeFrequency: p === "" ? "weekly" : "monthly", priority: p === "" ? 1 : 0.7 }));
}
