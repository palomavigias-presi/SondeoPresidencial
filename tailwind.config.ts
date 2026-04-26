import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
  ],
  theme: {
    container: {
      center: true,
      padding: "1rem",
      screens: { "2xl": "1280px" },
    },
    extend: {
      colors: {
        brand: {
          // Azul institucional profundo (base oscura)
          deep: "#0D1B4B",
          DEFAULT: "#0D1B4B",
          // Azul Colombia bandera (acento vibrante)
          blue: "#003893",
          // Amarillo bandera (acento dorado tecnológico)
          accent: "#FFCD00",
          accentDark: "#D4A017",
          // Rojo bandera
          red: "#CE1126",
          redDark: "#A60E20",
          // Cian eléctrico para detalles "tech"
          cyan: "#22D3EE",
          // Fondos
          bg: "#F8FAFC",
          ink: "#0B1230",
          text: "#111827",
          muted: "#6B7280",
        },
        border: "hsl(214 32% 91%)",
        input: "hsl(214 32% 91%)",
        ring: "hsl(222 47% 25%)",
        background: "#F8FAFC",
        foreground: "#111827",
        primary: {
          DEFAULT: "#0D1B4B",
          foreground: "#FFFFFF",
        },
        secondary: {
          DEFAULT: "#E5E7EB",
          foreground: "#111827",
        },
        destructive: {
          DEFAULT: "#CE1126",
          foreground: "#FFFFFF",
        },
        muted: {
          DEFAULT: "#F1F5F9",
          foreground: "#6B7280",
        },
        accent: {
          DEFAULT: "#FFCD00",
          foreground: "#0B1230",
        },
        card: {
          DEFAULT: "#FFFFFF",
          foreground: "#111827",
        },
        popover: {
          DEFAULT: "#FFFFFF",
          foreground: "#111827",
        },
      },
      borderRadius: {
        lg: "0.75rem",
        md: "0.5rem",
        sm: "0.375rem",
      },
      fontFamily: {
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
        mono: ["var(--font-jetbrains)", "ui-monospace", "SFMono-Regular", "monospace"],
      },
      backgroundImage: {
        "grid-tech":
          "linear-gradient(to right, rgba(13,27,75,0.06) 1px, transparent 1px), linear-gradient(to bottom, rgba(13,27,75,0.06) 1px, transparent 1px)",
        "flag-gradient":
          "linear-gradient(135deg, #FFCD00 0%, #FFCD00 33%, #003893 33%, #003893 66%, #CE1126 66%, #CE1126 100%)",
        "hero-gradient":
          "radial-gradient(60% 80% at 20% 10%, rgba(255,205,0,0.18) 0%, transparent 60%), radial-gradient(50% 70% at 90% 30%, rgba(0,56,147,0.15) 0%, transparent 60%), linear-gradient(180deg, #ffffff 0%, #F8FAFC 100%)",
        "ink-gradient":
          "linear-gradient(135deg, #0B1230 0%, #0D1B4B 50%, #1E2A6B 100%)",
      },
      boxShadow: {
        glow: "0 0 0 1px rgba(13,27,75,0.08), 0 8px 32px -8px rgba(13,27,75,0.18)",
        accent: "0 0 0 1px rgba(255,205,0,0.4), 0 8px 24px -8px rgba(255,205,0,0.5)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
        "shine": {
          from: { backgroundPosition: "200% 0" },
          to: { backgroundPosition: "-200% 0" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "shine": "shine 6s linear infinite",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};

export default config;
