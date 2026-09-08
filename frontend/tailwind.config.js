/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        dark: {
          bg: "#050505",
          panel: "#0a0a0d",
          card: "#121216",
          border: "#22222a",
        },
        yellow: {
          neon: "#FFD400",
          bright: "#FFE600",
        },
        gold: {
          warm: "#FFB800",
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['Fira Code', 'JetBrains Mono', 'monospace'],
      },
      boxShadow: {
        'glow-yellow': '0 0 25px -3px rgba(255, 212, 0, 0.45)',
        'glow-gold': '0 0 25px -3px rgba(255, 184, 0, 0.4)',
        'glow-red': '0 0 25px -3px rgba(239, 68, 68, 0.45)',
        'glow-green': '0 0 25px -3px rgba(16, 185, 129, 0.45)',
      },
      animation: {
        'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'spin-slow': 'spin 12s linear infinite',
      }
    },
  },
  plugins: [],
}
