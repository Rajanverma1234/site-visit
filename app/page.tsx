import Hero from "@/components/sections/Hero";
import StatsStrip from "@/components/sections/StatsStrip";
import ExperienceCards from "@/components/sections/ExperienceCards";
import ResidencesSummary from "@/components/sections/ResidencesSummary";
import FloorSelectorSection from "@/components/sections/FloorSelectorSection";
import { Faq, PaymentPlan, Specifications } from "@/components/sections/BuyerInfo";
import Amenities from "@/components/sections/Amenities";
import Location from "@/components/sections/Location";
import About from "@/components/sections/About";
import Testimonials from "@/components/sections/Testimonials";
import FinalCTA from "@/components/sections/FinalCTA";

export default function HomePage() {
  return (
    <>
      <Hero /> {/* dark */}
      <StatsStrip /> {/* light */}
      <ExperienceCards /> {/* dark */}
      <ResidencesSummary /> {/* light */}
      <FloorSelectorSection /> {/* dark */}
      <Specifications /> {/* light */}
      <PaymentPlan /> {/* dark */}
      <Amenities /> {/* light */}
      <Location /> {/* dark */}
      <About /> {/* light */}
      <Faq /> {/* dark */}
      <Testimonials /> {/* light */}
      <FinalCTA /> {/* dark */}
    </>
  );
}
