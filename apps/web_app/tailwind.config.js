/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // PriceBuddy Premium Dark Palette
        background: '#0B1117',
        surface: '#161B22',     // Card background
        surfaceHighlight: '#21262D', // Hover state
        border: '#30363D',      // Subtle borders

        // Brand Colors (Neon Accents)
        primary: '#4F7EFF',     // Vibrant Blue
        primaryHover: '#2E5CFF',

        // Semantic Colors
        success: '#238636',     // GitHub Green
        successNeon: '#3FB950', // Brighter Green for text
        danger: '#DA3633',      // Red
        dangerNeon: '#F85149',  // Brighter Red
        warning: '#D29922',

        // Text
        textMain: '#E6EDF3',
        textMuted: '#7D8590',
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        display: ['Outfit', 'sans-serif'],
      },
      boxShadow: {
        'neon-blue': '0 0 10px rgba(79, 126, 255, 0.3)',
        'neon-green': '0 0 10px rgba(63, 185, 80, 0.3)',
        'glass-card': '0 8px 32px 0 rgba(0, 0, 0, 0.37)',
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'fade-in': 'fadeIn 0.5s ease-out forwards',
        'slide-up': 'slideUp 0.5s ease-out forwards',
        'slide-down': 'slideDown 0.5s ease-out forwards',
        'scale-in': 'scaleIn 0.3s ease-out forwards',
        'float': 'float 6s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        slideDown: {
          '0%': { transform: 'translateY(-20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        scaleIn: {
          '0%': { transform: 'scale(0.95)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
      },
    },
  },
  plugins: [],
}

