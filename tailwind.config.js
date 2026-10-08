/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
        display: ["var(--font-display)", "system-ui", "sans-serif"],
        mono: ["var(--font-mono)", "ui-monospace", "monospace"],
      },
      colors: {
        // Mirrors the CSS variables in globals.css; hex so `/opacity` modifiers work.
        paper: "#f4f4f1",
        ink: "#0a0a0a",
        night: "#0a0a0a",
        muted: "#6b6b66",
        graphite: "#8a8a85",
        line: "rgba(10, 10, 10, 0.14)",
        signal: "#ffd60a",
      },
    },
  },
  plugins: [],
};
