/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
      },
      colors: {
        brand: {
          50:  "#eef2ff",
          100: "#e0e7ff",
          400: "#818cf8",
          500: "#6366f1",
          600: "#4f46e5",
          700: "#4338ca",
          900: "#1e1b4b",
        },
      },
      animation: {
        "spin-slow":    "spin 3s linear infinite",
        "pulse-slow":   "pulse 3s ease-in-out infinite",
        "bounce-slow":  "bounce 2s ease-in-out infinite",
        "fade-in":      "fadeIn 0.5s ease-out",
        "slide-up":     "slideUp 0.5s ease-out",
      },
      keyframes: {
        fadeIn:  { from: { opacity: 0 }, to: { opacity: 1 } },
        slideUp: { from: { opacity: 0, transform: "translateY(20px)" }, to: { opacity: 1, transform: "translateY(0)" } },
      },
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-conic":  "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
      },
      boxShadow: {
        "glow-sm":  "0 0 15px rgba(99,102,241,0.2)",
        "glow-md":  "0 0 30px rgba(99,102,241,0.3)",
        "glow-lg":  "0 0 60px rgba(99,102,241,0.25)",
        "inner-glow": "inset 0 1px 0 rgba(255,255,255,0.1)",
      },
    },
  },
  plugins: [],
};
