/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        sand: "#efe7db",
        clay: "#bb4f2b",
        forest: "#213631",
        ink: "#171411"
      },
      fontFamily: {
        sans: ["Manrope", "sans-serif"],
        display: ["Space Grotesk", "sans-serif"]
      },
      boxShadow: {
        panel: "0 28px 80px rgba(33, 54, 49, 0.14)"
      },
      backgroundImage: {
        atmosphere:
          "radial-gradient(circle at top left, rgba(187,79,43,0.2), transparent 25%), radial-gradient(circle at 85% 10%, rgba(33,54,49,0.16), transparent 20%), linear-gradient(180deg, #f4edde 0%, #ece2d2 100%)"
      }
    }
  },
  plugins: []
};
