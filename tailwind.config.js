/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./app/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx}",
    "*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    container: {
      center: true,
      padding: {
        DEFAULT: "1.25rem", // 20px for mobile
        md: "2.5rem", // 40px for desktop
      },
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      fontFamily: {
        merriweather: ["var(--font-merriweather)", "serif"],
      },
      fontSize: {
        // Headings
        "display-1": ["3.5rem", { lineHeight: "1.1", fontWeight: "700" }], // 56px
        "heading-1": ["3rem", { lineHeight: "1.2", fontWeight: "700" }], // 48px
        "heading-2": ["2.5rem", { lineHeight: "1.2", fontWeight: "700" }], // 40px
        "heading-3": ["1.75rem", { lineHeight: "1.3", fontWeight: "700" }], // 28px
        "heading-4": ["1.25rem", { lineHeight: "1.4", fontWeight: "700" }], // 20px

        // Body text
        "paragraph-1": ["1rem", { lineHeight: "1.6", fontWeight: "400" }], // 16px
        "paragraph-2": ["0.875rem", { lineHeight: "1.6", fontWeight: "400" }], // 14px

        // Buttons & Links
        button: ["1rem", { lineHeight: "1.2", fontWeight: "700", letterSpacing: "0.05em" }], // 16px
        link: ["1rem", { lineHeight: "1.2", fontWeight: "600" }], // 16px
      },
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
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      boxShadow: {
        card: "0 4px 8px rgba(12, 12, 32, 0.15)", // Shadow 1
        button: "0 4px 8px rgba(12, 12, 32, 0.1)", // Shadow 2
        element: "0 2px 4px rgba(12, 12, 32, 0.1)", // Shadow 3
      },
      spacing: {
        section: "1.5rem", // 24px between sections
        paragraph: "1rem", // 16px between paragraphs
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
}

