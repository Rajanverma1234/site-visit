import type { Metadata, Viewport } from "next";
import { Cormorant_Garamond, Inter } from "next/font/google";
import "./globals.css";
import "lenis/dist/lenis.css";
import { SmoothScrollProvider } from "@/hooks/useLenis";
import CustomCursor from "@/components/ui/CustomCursor";
import WhatsAppButton from "@/components/ui/WhatsAppButton";
import SiteChrome from "@/components/ui/SiteChrome";
import { IS_DEMO, SITE_URL } from "@/lib/site";
import { company, project, seo } from "@/data/project";
import JsonLd from "@/components/ui/JsonLd";
import { images } from "@/data/images";

const serif = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["300", "400", "500"], // 600 unused — fewer font files to download
  style: ["normal", "italic"],
  variable: "--font-serif",
  display: "swap",
});
const sans = Inter({ subsets: ["latin"], variable: "--font-sans", display: "swap" });

const title = seo.title;
const description = seo.description + (IS_DEMO ? " Concept demo." : "");

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: { default: title, template: `%s | The Sovereign by ${company.name}` },
  description,
  keywords: seo.keywords,
  openGraph: {
    type: "website",
    locale: "en_IN",
    siteName: company.name,
    title,
    description,
    images: [{ url: images.og.src!, width: 1200, height: 630, alt: images.og.alt }],
  },
  twitter: { card: "summary_large_image", title, description, images: [images.og.src!] },
  // Concept demo with a fake RERA number → keep it out of search results until NEXT_PUBLIC_IS_DEMO=false.
  robots: IS_DEMO ? { index: false, follow: false, googleBot: { index: false, follow: false } } : { index: true, follow: true },
};

export const viewport: Viewport = {
  themeColor: "#0E0E10",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en-IN" className={`${serif.variable} ${sans.variable}`}>
      <body className="grain">
        <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:bg-gold focus:px-4 focus:py-2 focus:text-charcoal">
          Skip to content
        </a>
        <JsonLd
          data={{
            "@context": "https://schema.org",
            "@type": "Organization",
            name: company.name,
            url: SITE_URL,
            logo: `${SITE_URL}${images.developerLogo.src}`,
            email: company.email,
            telephone: company.phoneE164,
            address: { "@type": "PostalAddress", streetAddress: company.address, addressLocality: project.city, addressRegion: project.region, postalCode: project.postalCode, addressCountry: "IN" },
            sameAs: company.socials.map((s) => s.href),
          }}
        />
        <SmoothScrollProvider>
          <SiteChrome>{children}</SiteChrome>
          <WhatsAppButton />
        </SmoothScrollProvider>
        <CustomCursor />
      </body>
    </html>
  );
}
