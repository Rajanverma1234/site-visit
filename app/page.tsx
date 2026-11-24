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
import JsonLd from "@/components/ui/JsonLd";
import { company, project } from "@/data/project";
import { images } from "@/data/images";
import { residences, startingPrice } from "@/data/residences";
import { allUnits } from "@/data/inventory";
import { SITE_URL } from "@/lib/site";

export default function HomePage() {
  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "RealEstateListing",
          name: `${project.shortName} — ${project.configurationsLine}`,
          description: project.intro,
          url: SITE_URL,
          image: `${SITE_URL}${images.og.src}`,
          provider: { "@type": "Organization", name: company.name },
          about: {
            "@type": "ApartmentComplex",
            name: project.shortName,
            numberOfAccommodationUnits: allUnits.length,
            address: { "@type": "PostalAddress", streetAddress: project.location, addressLocality: project.city, addressRegion: project.region, postalCode: project.postalCode, addressCountry: "IN" },
            geo: { "@type": "GeoCoordinates", latitude: project.coordinates[0], longitude: project.coordinates[1] },
          },
          offers: {
            "@type": "AggregateOffer",
            priceCurrency: "INR",
            lowPrice: startingPrice(),
            offerCount: residences.length,
            availability: "https://schema.org/PreOrder",
          },
        }}
      />
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
