/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: "#00b894",
        secondary: "#0984e3",
        dark: "#2d3436",
        light: "#dfe6e9",
      },
    },
  },
  plugins: [],
};
