"use client";

import { usePathname } from "next/navigation";
import { company, project } from "@/data/project";
import { WhatsappIcon } from "./SocialIcons";

export function whatsappLink(message: string) {
  return `https://wa.me/${company.whatsapp}?text=${encodeURIComponent(message)}`;
}

/** Floating WhatsApp button, visible on every page (hidden on the print brochure). */
export default function WhatsAppButton() {
  const pathname = usePathname() ?? "/";
  if (pathname.startsWith("/brochure")) return null;
  const onTour = pathname.startsWith("/virtual-tour");
  return (
    <a
      href={whatsappLink(`Hello ${company.name}, I'd like to know more about ${project.shortName}.`)}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chat with us on WhatsApp"
      data-cursor="Chat"
      className={`no-print fixed right-5 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] text-white shadow-[0_10px_40px_-10px_rgba(37,211,102,.7)] transition-transform duration-500 hover:scale-110 ${onTour ? "bottom-[118px] md:bottom-24" : "bottom-5"}`}
    >
      <WhatsappIcon />
    </a>
  );
}
