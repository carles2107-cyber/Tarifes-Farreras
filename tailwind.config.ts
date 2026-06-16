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
          50: "#f0f7ff",
          100: "#e0effe",
          500: "#2563eb",
          600: "#1d4ed8",
          700: "#1e40af",
        },
        success: { 500: "#10b981", 100: "#d1fae5" },
        warning: { 500: "#f59e0b", 100: "#fef3c7" },
        danger:  { 500: "#ef4444", 100: "#fee2e2" },
        surface: "#f8fafc",
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};

export default config;
