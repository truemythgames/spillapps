/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        bg: "#0A0A0F",
        surface: "#141420",
        "surface-light": "#1E1E2E",
        primary: "#C8A2FF",
        "primary-dark": "#9B6FDB",
        accent: "#FFD166",
      },
    },
  },
  plugins: [require("@tailwindcss/typography")],
};
