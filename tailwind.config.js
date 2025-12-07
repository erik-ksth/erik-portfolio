/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      backgroundImage: {},
      fontFamily: {
        sans: ["var(--font-inter)", "sans-serif"],
      },
      colors: {
        black: "#1a1a1a", // Overriding default black to dark gray
      },
      animation: {
        marquee: "marquee 300s linear infinite",
        marquee2: "marquee2 300s linear infinite",
        "marquee-reverse": "marquee-reverse 300s linear infinite",
        "marquee-reverse2": "marquee-reverse2 300s linear infinite",
      },
      keyframes: {
        marquee: {
          "0%": { transform: "translateX(0%)" },
          "100%": { transform: "translateX(-100%)" },
        },
        marquee2: {
          "0%": { transform: "translateX(100%)" },
          "100%": { transform: "translateX(0%)" },
        },
        "marquee-reverse": {
          "0%": { transform: "translateX(-100%)" },
          "100%": { transform: "translateX(0%)" },
        },
        "marquee-reverse2": {
          "0%": { transform: "translateX(0%)" },
          "100%": { transform: "translateX(100%)" },
        },
      },
    },
  },
  plugins: [],
  darkMode: "class",
};
