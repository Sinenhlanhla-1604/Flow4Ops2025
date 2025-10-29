import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        neonBlue: {
          500: '#1BFFFF',
          600: '#17e0e0',
          700: '#14c2c2',
        },
      },
    },
  },
  plugins: [],
};

export default config;