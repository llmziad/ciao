import type { Config } from "tailwindcss";

/**
 * ICAO Modern design tokens — see docs/05-design-system.md
 * Proposed palette; swap in official ICAO hex values when provided.
 */
const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        icao: {
          blue: "#0055A5", // sampled from the official ICAO logo
          navy: "#002B5C",
          cyan: "#00B5E2",
        },
        ink: "#0F172A",
        muted: "#5B6B7F",
        surface: "#FFFFFF",
        bg: "#F5F8FB",
        line: "#E2E8F0",
        success: "#16A34A",
        warning: "#D97706",
        danger: "#DC2626",
      },
      fontFamily: {
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
        display: ["var(--font-space-grotesk)", "var(--font-inter)", "system-ui", "sans-serif"],
      },
      boxShadow: {
        card: "0 1px 2px rgba(15,23,42,0.04), 0 8px 24px rgba(15,23,42,0.06)",
        pop: "0 12px 40px rgba(0,43,92,0.18)",
      },
      borderRadius: {
        xl: "0.9rem",
        "2xl": "1.25rem",
      },
    },
  },
  plugins: [],
};

export default config;
