"use client";

import { usePathname } from "next/navigation";
import Navbar from "./Navbar";
import Footer from "./Footer";

/** Shows the navbar & footer on regular pages; hides them on immersive / print routes. */
export default function SiteChrome({ children }: { children: React.ReactNode }) {
  const pathname = usePathname() ?? "/";
  const immersive = pathname.startsWith("/virtual-tour") || pathname.startsWith("/brochure");
  if (immersive) return <main id="main">{children}</main>;
  return (
    <>
      <Navbar />
      <main id="main">{children}</main>
      <Footer />
    </>
  );
}
