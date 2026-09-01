/** @type {import('tailwindcss').Config} */
export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        ink: {
          950: "#0D1210",
          900: "#141B18",
          800: "#1E2723",
          700: "#2B3833",
          600: "#425650",
          300: "#9BA39D",
        },
        paper: "#F5F3EC",
        accent: {
          50: "#EAF3EF",
          100: "#CFE4DA",
          300: "#7FD9B3",
          400: "#3D8A6E",
          500: "#256B52",
          600: "#1B5240",
          700: "#123C2F",
          900: "#0F2E22",
        },
      },
      fontFamily: {
        display: ["'Space Grotesk'", "sans-serif"],
        sans: ["Inter", "sans-serif"],
        mono: ["'IBM Plex Mono'", "monospace"],
      },
    },
  },
  plugins: [],
};
