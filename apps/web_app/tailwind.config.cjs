/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: "#4F7EFF",
        primaryHover: "#3E63DD",
        successNeon: "#12B981",
        surface: "rgba(255, 255, 255, 0.05)",
        surfaceHighlight: "rgba(255, 255, 255, 0.08)",
        border: "rgba(255, 255, 255, 0.1)",
        textMain: "rgba(255, 255, 255, 0.92)",
        textMuted: "rgba(255, 255, 255, 0.6)",
      },
      fontFamily: {
        display: ["ui-sans-serif", "system-ui", "sans-serif"],
      },
      boxShadow: {
        "neon-blue": "0 0 20px rgba(79, 126, 255, 0.3), 0 0 40px rgba(79, 126, 255, 0.1)",
        "glass-card": "0 8px 32px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.1)",
        "card-hover": "0 20px 60px rgba(0, 0, 0, 0.5), 0 0 40px rgba(79, 126, 255, 0.2)",
      },
      animation: {
        "fade-in": "fadeIn 0.5s ease-in",
        "slide-up": "slideUp 0.5s ease-out",
        "pulse-slow": "pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideUp: {
          "0%": { transform: "translateY(20px)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
      },
    },
  },
  plugins: [],
};
