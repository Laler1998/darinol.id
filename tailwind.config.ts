import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    // Category colour classes live in lib/categories.ts; without this glob
    // Tailwind purges them and every chip silently renders grey.
    "./lib/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        darinol: {
          background: "var(--color-background)",
          surface: "var(--color-surface)",
          primary: "#FF7A45",
          primaryFill: "var(--color-primary-fill)",
          primaryInk: "var(--color-primary-ink)",
          text: "var(--color-text)",
          muted: "var(--color-muted)",
          border: "var(--color-border)",
          success: "#22C55E",
        },
      },
      fontFamily: {
        heading: ["var(--font-poppins)", "Poppins", "sans-serif"],
        body: ["var(--font-be-vietnam)", "Be Vietnam Pro", "sans-serif"],
      },
      boxShadow: {
        soft: "0 18px 45px rgba(26, 26, 26, 0.06)",
      },
    },
  },
  plugins: [],
};

export default config;
