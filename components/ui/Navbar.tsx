"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Menu, X } from "lucide-react";
import { navLinks } from "@/data/project";
import { cn } from "@/lib/utils";
import Logo from "./Logo";
import Magnetic from "./Magnetic";

/** Transparent navbar that turns into frosted glass once the page scrolls. */
export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
  }, [open]);

  return (
    <header
      className={cn(
        "no-print fixed inset-x-0 top-0 z-50 transition-all duration-700 ease-luxe",
        scrolled ? "border-b border-white/5 bg-charcoal/60 py-3 backdrop-blur-xl" : "bg-transparent py-6",
      )}
    >
      <nav className="container-luxe flex items-center justify-between" aria-label="Primary">
        <Link href="/" data-cursor="Home">
          <Logo />
          <span className="sr-only"> — home</span>
        </Link>

        <ul className="hidden items-center gap-8 lg:flex">
          {navLinks.map((l) => (
            <li key={l.href}>
              <Link href={l.href} className="group relative text-[11px] uppercase tracking-[0.22em] text-ivory/80 transition-colors hover:text-ivory">
                {l.label}
                <span className="absolute -bottom-1.5 left-0 h-px w-0 bg-gold transition-all duration-500 group-hover:w-full" />
              </Link>
            </li>
          ))}
        </ul>

        <div className="flex items-center gap-3">
          <Magnetic className="hidden sm:inline-block">
            <Link href="/contact?mode=video" className="btn-gold !px-5 !py-2.5 !text-[10.5px]" data-cursor="Book">
              Book Virtual Visit
            </Link>
          </Magnetic>
          <button
            type="button"
            className="flex h-10 w-10 items-center justify-center rounded-full border border-ivory/20 lg:hidden"
            onClick={() => setOpen((o) => !o)}
            aria-expanded={open}
            aria-controls="mobile-menu"
            aria-label={open ? "Close menu" : "Open menu"}
          >
            {open ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>
      </nav>

      <AnimatePresence>
        {open && (
          <motion.div
            id="mobile-menu"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 top-0 -z-10 flex flex-col justify-center bg-charcoal/95 px-8 backdrop-blur-xl lg:hidden"
          >
            <ul className="space-y-5">
              {navLinks.map((l, i) => (
                <motion.li key={l.href} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 * i }}>
                  <Link href={l.href} onClick={() => setOpen(false)} className="font-serif text-4xl text-ivory hover:text-gold">
                    {l.label}
                  </Link>
                </motion.li>
              ))}
            </ul>
            <Link href="/contact?mode=video" onClick={() => setOpen(false)} className="btn-gold mt-10 self-start">
              Book Virtual Visit
            </Link>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
