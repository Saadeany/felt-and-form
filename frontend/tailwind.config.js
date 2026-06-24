/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        ink:      "#0C2340",
        charcoal: "#1A3A5C",
        stone:    "#7A9CB8",
        beige:    "#B8D4E8",
        cream:    "#E8F2F8",
        paper:    "#F4F9FC",
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
