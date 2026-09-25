/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          primary: '#1B3A6B',
          secondary: '#2E86DE',
          light: '#E8F4FD',
          green: '#2ECC71',
          orange: '#F39C12',
          danger: '#E74C3C',
        },
        surface: '#F0FAF5',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      animation: {
        'spin-slow': 'spin 1.2s linear infinite',
        'fade-in': 'fadeIn 0.3s ease-in-out',
        'slide-up': 'slideUp 0.35s ease-out',
        'pulse-led': 'pulseLed 2s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(16px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        pulseLed: {
          '0%, 100%': { boxShadow: '0 0 6px 2px rgba(46,204,113,0.4)' },
          '50%': { boxShadow: '0 0 14px 6px rgba(46,204,113,0.8)' },
        },
      },
    },
  },
  plugins: [],
}


