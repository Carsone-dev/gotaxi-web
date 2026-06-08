import type { Config } from "tailwindcss";

export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  darkMode: ["class"],
  theme: {
    extend: {
      colors: {
        border: "hsl(var(--border))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        ring: "hsl(var(--ring))",
        primary: {
          DEFAULT: "#009542",
          50: "#E8F5EE",
          100: "#C8E5D5",
          400: "#00C957",
          500: "#009542",
          600: "#007A36",
          700: "#006B30",
          900: "#004520",
        },
        accent: {
          yellow: "#FFD700",
          "yellow-dark": "#BA9700",
        },
        ink: {
          DEFAULT: "#1c1c1a",
          soft: "#2D2D29",
        },
        surface: {
          DEFAULT: "#F8FAF9",
          alt: "#F1EFE8",
        },
        success: { DEFAULT: "#009542", bg: "#EAF6EF", text: "#0F6E56" },
        warning: { DEFAULT: "#FFD700", bg: "#FAEEDA", text: "#854F0B" },
        error: { DEFAULT: "#FF4D4D", bg: "#FCEBEB", text: "#A32D2D" },
        info: { DEFAULT: "#0066FF", bg: "#E6F1FB", text: "#185FA5" },
        mtn: "#FFD700",
        moov: "#00B7E2",
        orange: "#FF6600",
      },
      fontFamily: {
        sans: ['"Inter"', "system-ui", "sans-serif"],
      },
      fontSize: {
        "2xs": ["0.625rem", "0.875rem"],
      },
      borderRadius: {
        "4xl": "2rem",
      },
      boxShadow: {
        soft: "0 2px 8px rgba(0,0,0,0.05)",
        card: "0 4px 12px rgba(0,0,0,0.08)",
        elevated: "0 20px 40px rgba(0,0,0,0.15)",
      },
      backgroundImage: {
        "gradient-primary": "linear-gradient(135deg, #00C957, #006B30)",
        "gradient-dark": "linear-gradient(135deg, #1c1c1a, #2D2D29)",
        "gradient-hero": "linear-gradient(135deg, #1c1c1a 0%, #2D2D29 50%, #006B30 100%)",
      },
      animation: {
        "fade-in": "fadeIn 0.3s ease-in-out",
        "slide-up": "slideUp 0.4s ease-out",
        "pulse-soft": "pulseSoft 2s ease-in-out infinite",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideUp: {
          "0%": { opacity: "0", transform: "translateY(10px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        pulseSoft: {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.6" },
        },
      },
    },
  },
  plugins: [
    require("tailwindcss-animate"),
    require("@tailwindcss/typography"),
    require("@tailwindcss/forms"),
  ],
} satisfies Config;
