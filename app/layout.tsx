import type { Metadata, Viewport } from "next";
import { Cormorant_Garamond, Inter } from "next/font/google";
import "./globals.css";
import "lenis/dist/lenis.css";
import { SmoothScrollProvider } from "@/hooks/useLenis";
import CustomCursor from "@/components/ui/CustomCursor";
import WhatsAppButton from "@/components/ui/WhatsAppButton";
import SiteChrome from "@/components/ui/SiteChrome";

const serif = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  style: ["normal", "italic"],
  variable: "--font-serif",
  display: "swap",
});
const sans = Inter({ subsets: ["latin"], variable: "--font-sans", display: "swap" });

const title = "The Sovereign by White Collar Realty | Luxury Residences, Golf Course Road, Gurugram";
const description =
  "Walk through THE SOVEREIGN from home — interactive 3D towers, a live floor selector and a virtual tour of ultra-luxury 4 & 5 BHK residences and penthouses on Golf Course Road, Gurugram. Concept demo.";

export const metadata: Metadata = {
  metadataBase: new URL("https://the-sovereign.vercel.app"),
  title: { default: title, template: "%s | The Sovereign by White Collar Realty" },
  description,
  keywords: ["luxury apartments Gurugram", "Golf Course Road", "4 BHK", "5 BHK", "penthouse", "virtual tour", "White Collar Realty"],
  openGraph: {
    type: "website",
    locale: "en_IN",
    siteName: "White Collar Realty",
    title,
    description,
  },
  twitter: { card: "summary_large_image", title, description },
  robots: { index: true, follow: true },
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
        <SmoothScrollProvider>
          <SiteChrome>{children}</SiteChrome>
          <WhatsAppButton />
        </SmoothScrollProvider>
        <CustomCursor />
      </body>
    </html>
  );
}
