import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
      },
      colors: {
        // Brand khaki-gold (#b9b080 is the 500 stop) — full tonal scale so
        // it can be used for text, borders, hovers and tints, not just
        // solid fills.
        brand: {
          50: "#f7f6f3",
          100: "#edece3",
          200: "#ddd9c5",
          300: "#cbc5a4",
          400: "#c1b98f",
          500: "#b9b080",
          600: "#aa9e5f",
          700: "#8c814b",
          800: "#6a6339",
          900: "#4f492b",
          950: "#302d1c",
        },
      },
    },
  },
  plugins: [],
};

export default config;
