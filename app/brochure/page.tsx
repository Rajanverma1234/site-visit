import type { Metadata } from "next";
import { Suspense } from "react";
import Brochure from "@/components/sections/Brochure";

export const metadata: Metadata = {
  title: "Brochure",
  description: "Printable brochure for The Sovereign by White Collar Realty.",
  robots: { index: false },
};

export default function BrochurePage() {
  return (
    <Suspense fallback={null}>
      <Brochure />
    </Suspense>
  );
}
