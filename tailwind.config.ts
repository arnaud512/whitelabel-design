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
      padding: "2rem",
      screens: { "2xl": "1400px" },
    },
    extend: {
      // shadcn semantic palette (HSL values live in app/globals.css)
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        warning: "#F59E0B",
        danger: "#C93838",
      },
      // 8pt grid spacing scale
      spacing: {
        xxs: "4px",
        xs: "8px",
        s: "12px",
        m: "16px",
        l: "24px",
        xl: "32px",
        xxl: "48px",
      },
      // iOS-style corner radius scale.
      // NOTE: keys `s` and `l` would collide with Tailwind's logical directional
      // classes (`rounded-s` = inline-start corners, `rounded-l` = left corners),
      // which silently override the size variant. Use `sm` and `lg` instead.
      borderRadius: {
        xxs: "2px",
        xs: "4px",
        sm: "8px",
        m: "12px",
        lg: "16px",
        xl: "24px",
      },
      fontFamily: {
        // Body / UI — self-hosted SF Pro Text (see globals.css @font-face)
        sans: [
          "SF Pro Text",
          "-apple-system",
          "BlinkMacSystemFont",
          "system-ui",
          "sans-serif",
        ],
        // Headings / display sizes >= 20px — self-hosted SF Pro Display
        display: [
          "SF Pro Display",
          "-apple-system",
          "BlinkMacSystemFont",
          "system-ui",
          "sans-serif",
        ],
      },
      fontSize: {
        h1: ["32px", { lineHeight: "1.15", fontWeight: "700" }],
        h2: ["24px", { lineHeight: "1.2", fontWeight: "700" }],
        h3: ["20px", { lineHeight: "1.25", fontWeight: "700" }],
        "title-large": ["28px", { lineHeight: "1.2", fontWeight: "600" }],
        "title-medium": ["24px", { lineHeight: "1.2", fontWeight: "600" }],
        "title-regular": ["20px", { lineHeight: "1.3", fontWeight: "500" }],
        // Body
        "body-large": ["17px", { lineHeight: "1.4" }],
        "body-regular": ["15px", { lineHeight: "1.4" }],
        "body-stat": ["20px", { lineHeight: "1.2", fontWeight: "600" }],
        "body-label": ["12px", { lineHeight: "1.3" }],
        "body-label-caps": ["12px", { lineHeight: "1.3", letterSpacing: "0.05em", fontWeight: "600" }],
      },
      // Mirrored from IconSize.swift
      width: {
        "icon-xs": "16px",
        "icon-s": "24px",
        "icon-m": "32px",
        "icon-l": "40px",
      },
      height: {
        "icon-xs": "16px",
        "icon-s": "24px",
        "icon-m": "32px",
        "icon-l": "40px",
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
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
    },
  },
  plugins: [
    require("tailwindcss-animate"),
    require("@tailwindcss/container-queries"),
  ],
};

export default config;
