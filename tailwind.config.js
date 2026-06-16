/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        void: "#07020f",
        midnight: "#090b22",
        plum: "#160725",
        mystic: "#7c3aed",
        aurora: "#d946ef",
        gold: "#d6a84f",
        darkgold: "#9f6b24",
        champagne: "#f6d98b"
      },
      fontFamily: {
        display: ["Cinzel", "Georgia", "serif"],
        body: ["Inter", "system-ui", "sans-serif"]
      },
      boxShadow: {
        gold: "0 0 28px rgba(214, 168, 79, 0.28)",
        violet: "0 0 32px rgba(124, 58, 237, 0.34)"
      }
    }
  },
  plugins: []
};
