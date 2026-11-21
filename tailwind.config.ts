import type { Config } from "tailwindcss";

/** Design tokens for White Collar Realty — quiet luxury palette. */
const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        charcoal: { DEFAULT: "#0E0E10", 800: "#16161A", 700: "#1E1E23", 600: "#2A2A30" },
        ivory: { DEFAULT: "#F5F1EA", 200: "#EDE7DC", 300: "#E2DACB" },
        gold: { DEFAULT: "#C8A96A", light: "#DCC48F", dark: "#A88A4E" },
        stone: { DEFAULT: "#8A8580", light: "#B5B0AA" },
      },
      fontFamily: {
        serif: ["var(--font-serif)", "Georgia", "serif"],
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
      },
      letterSpacing: { luxe: "0.32em" },
      transitionTimingFunction: { luxe: "cubic-bezier(0.22, 1, 0.36, 1)" },
    },
  },
  plugins: [],
};

export default config;
