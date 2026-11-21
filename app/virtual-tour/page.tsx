import type { Metadata } from "next";
import { Suspense } from "react";
import TourExperience from "@/components/tour/TourExperience";
import SceneLoader from "@/components/ui/SceneLoader";

export const metadata: Metadata = {
  title: "Virtual Tour",
  description: "Walk through a fully furnished 4 BHK residence at The Sovereign in 3D — switch day/night, interior styles and explore every room from home.",
};

export default function VirtualTourPage() {
  return (
    <Suspense fallback={<SceneLoader label="Unlocking residence" />}>
      <TourExperience />
    </Suspense>
  );
}
