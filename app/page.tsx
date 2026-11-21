import Hero from "@/components/sections/Hero";
import StatsStrip from "@/components/sections/StatsStrip";
import ExperienceCards from "@/components/sections/ExperienceCards";
import FloorSelectorSection from "@/components/sections/FloorSelectorSection";
import Amenities from "@/components/sections/Amenities";
import Location from "@/components/sections/Location";
import Testimonials from "@/components/sections/Testimonials";
import FinalCTA from "@/components/sections/FinalCTA";

export default function HomePage() {
  return (
    <>
      <Hero />
      <StatsStrip />
      <ExperienceCards />
      <FloorSelectorSection />
      <Amenities />
      <Location />
      <Testimonials />
      <FinalCTA />
    </>
  );
}
