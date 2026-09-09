/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#1A1A1A",
        charcoal: "#2B2B2B",
        stone: "#A89F8E",
        beige: "#D8C9AE",
        cream: "#F4F1EA",
        paper: "#FAF8F4",
      },
      fontFamily: {
        display: ["'Fraunces'", "Georgia", "serif"],
        body: ["'Inter'", "Helvetica", "Arial", "sans-serif"],
      },
      letterSpacing: {
        widest2: "0.18em",
      },
    },
  },
  plugins: [],
};
