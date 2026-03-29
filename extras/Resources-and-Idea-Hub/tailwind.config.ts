import type { Config } from "tailwindcss";

export default {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        gold: "var(--gold)",
        "gold-light": "var(--gold-light)",
        bg2: "var(--bg2)",
        bg3: "var(--bg3)",
      },
      fontFamily: {
        syne: ["var(--font-syne)", "sans-serif"],
        sans: ["var(--font-dm-sans)", "sans-serif"],
      },
    },
  },
  plugins: [],
} satisfies Config;
