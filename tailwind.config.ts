import type { Config } from "tailwindcss";
import typography from "@tailwindcss/typography";

const config: Config = {
  content: [
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
    "./content/**/*.{md,mdx,json}",
  ],
  theme: {
    extend: {
      colors: {
        ink: "#071A2B",
        coal: "#0B1524",
        ember: "#2563EB",
        "ember-dark": "#1D4ED8",
        "tech-cyan": "#06B6D4",
        "cognitive-violet": "#7C3AED",
        "line-soft": "#DCE5F0",
        "paper-soft": "#F5F8FC",
        "neural-night": "#07091A",
        "neural-panel": "#0C1029",
        "neural-blue": "#336EFF",
        "neural-magenta": "#F43CB0",
        "neural-muted": "#A3AECF",
      },
      boxShadow: {
        soft: "0 10px 28px rgba(7, 26, 43, 0.09)",
        card: "0 1px 2px rgba(7, 26, 43, 0.08), 0 10px 18px rgba(37, 99, 235, 0.07)",
      },
    },
  },
  plugins: [typography],
};

export default config;
