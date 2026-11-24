import type { Metadata } from "next";
import { Suspense } from "react";
import ContactContent from "@/components/sections/ContactContent";
import { project } from "@/data/project";

export const metadata: Metadata = {
  title: "Contact & Book a Visit",
  description: `Book a video-call tour or a site visit to ${project.shortName}, ${project.location}. Download the brochure.`,
};

export default function ContactPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-charcoal" />}>
      <ContactContent />
    </Suspense>
  );
}
