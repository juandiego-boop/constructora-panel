import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50:  "#eff6ff",
          100: "#dbeafe",
          500: "#1a5276",
          600: "#154360",
          700: "#0e2d3e",
        },
        accent: "#e74c3c",
      },
    },
  },
  plugins: [],
};
export default config;
