import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#faf5f0',
          100: '#f0e6d9',
          200: '#e0ccb3',
          300: '#c9a87e',
          400: '#b58b54',
          500: '#a8753d',
          600: '#8c5e31',
          700: '#734a29',
          800: '#5e3d24',
          900: '#4f3420',
        },
      },
    },
  },
  plugins: [],
};
export default config;
