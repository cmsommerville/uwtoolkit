import colors from "tailwindcss/colors";

/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-conic":
          "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
      },
      colors: {
        primary: colors.indigo,
      },
      fontSize: {
        "2xs": "0.625rem",
      },
      minHeight: {
        60: "60vh",
        70: "70vh",
        80: "80vh",
        90: "90vh",
      },
      scale: {
        102: "102%",
      },
    },
  },
  plugins: [],
};
