/**
 * Site-wide switches.
 *
 * NEXT_PUBLIC_IS_DEMO (default: true)
 *   - true  → search engines are told not to index the site and every
 *             "concept demo / illustrative / fictional" disclaimer is shown.
 *   - false → for a real launch: indexing allowed, demo disclaimers hidden.
 *             (Set it in Vercel → Project → Settings → Environment Variables.)
 */
export const IS_DEMO = process.env.NEXT_PUBLIC_IS_DEMO !== "false";

export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://site-visit-wcr.vercel.app";
