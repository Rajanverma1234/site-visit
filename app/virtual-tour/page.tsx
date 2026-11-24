import type { Metadata } from "next";
import { Suspense } from "react";
import TourExperience from "@/components/tour/TourExperience";
import Image from "next/image";
import { images } from "@/data/images";

export const metadata: Metadata = {
  title: "Virtual Tour",
  description: "Walk through a fully furnished 4 BHK residence at The Sovereign in 3D — switch day/night, interior styles and explore every room from home.",
};

export default function VirtualTourPage() {
  return (
    <Suspense fallback={<div className="fixed inset-0 bg-charcoal"><Image src={images.posters.virtualTour.src!} alt="" fill priority sizes="100vw" quality={65} className="object-cover" /></div>}>
      <TourExperience />
    </Suspense>
  );
}
