import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        prime: {
          50: "#f1f8f1",
          100: "#dcedda",
          200: "#bbdcb8",
          300: "#8ec48a",
          400: "#5ea658",
          500: "#3d8838",
          600: "#2c6b29",
          700: "#245523",
          800: "#1f441f",
          900: "#1a381b",
          950: "#0c1f0d",
        },
        sand: "#f7f5ef",
      },
      fontFamily: {
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};
export default config;
