import type { MetadataRoute } from "next";
import { IS_DEMO, SITE_URL } from "@/lib/site";

/** Demo: block all crawlers. Real launch (NEXT_PUBLIC_IS_DEMO=false): allow everything. */
export default function robots(): MetadataRoute.Robots {
  return IS_DEMO
    ? { rules: { userAgent: "*", disallow: "/" } } // agrees with <meta name="robots" content="noindex, nofollow">
    : { rules: { userAgent: "*", allow: "/", disallow: ["/brochure", "/api/"] }, sitemap: `${SITE_URL}/sitemap.xml`, host: SITE_URL };
}
