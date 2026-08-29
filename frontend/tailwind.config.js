/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        // Design tokens mapping to CSS custom properties
        bg: {
          main: "var(--bg-main)",
          subtle: "var(--bg-subtle)",
          card: "var(--bg-card)",
          hover: "var(--bg-hover)",
        },
        text: {
          main: "var(--text-main)",
          muted: "var(--text-muted)",
          subtle: "var(--text-subtle)",
        },
        border: {
          main: "var(--border-main)",
          subtle: "var(--border-subtle)",
        },
        accent: {
          main: "var(--accent-main)",
          hover: "var(--accent-hover)",
          fg: "var(--accent-fg)",
        },
      },
      fontFamily: {
        sans: ["Inter", "Manrope", "system-ui", "-apple-system", "sans-serif"],
      },
      boxShadow: {
        card: "0 1px 3px 0 rgba(0, 0, 0, 0.05), 0 1px 2px 0 rgba(0, 0, 0, 0.03)",
        "card-hover": "0 10px 25px -5px rgba(0, 0, 0, 0.08), 0 8px 10px -6px rgba(0, 0, 0, 0.04)",
        drawer: "-4px 0 25px rgba(0, 0, 0, 0.15)",
      },
    },
  },
  plugins: [],
};
