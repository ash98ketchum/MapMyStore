import scrollbarHide from 'tailwind-scrollbar-hide';

/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        inter: ['Inter', 'system-ui', 'sans-serif'],
      },
      colors: {
        primary: {
          DEFAULT: '#101014',
          50: '#f8f9fa',
          900: '#101014',
        },
        accent: {
          DEFAULT: '#00D3FF',
          50: '#e6f9ff',
          100: '#b3ecff',
          500: '#00D3FF',
          600: '#00b8e6',
        },
        highlight: {
          DEFAULT: '#7F00FF',
          50: '#f3e8ff',
          100: '#e9d5ff',
          500: '#7F00FF',
          600: '#6C00E6',
        },
        textDark: '#111827',
        textMuted: '#6B7280',
        glass: {
          DEFAULT: 'rgba(255, 255, 255, 0.1)',
          dark: 'rgba(0, 0, 0, 0.2)',
        },
      },
      backgroundImage: {
        'hero-gradient': 'linear-gradient(to right, #f8f9ff, #fef6ff, #f1faff)',
        'button-gradient': 'linear-gradient(to right, #7F00FF, #00D3FF)',
      },
      backdropBlur: {
        xs: '2px',
      },
      boxShadow: {
        glass: '0 4px 12px rgba(0, 0, 0, 0.1)',
        glow: '0 0 20px rgba(0, 211, 255, 0.3)',
        'highlight-glow': '0 0 20px rgba(127, 0, 255, 0.3)',
      },
      animation: {
        'pulse-slow': 'pulse 3s ease-in-out infinite',
        float: 'float 6s ease-in-out infinite',
        glow: 'glow 2s ease-in-out infinite alternate',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        glow: {
          '0%': { boxShadow: '0 0 20px rgba(127, 0, 255, 0.3)' },
          '100%': { boxShadow: '0 0 30px rgba(127, 0, 255, 0.6)' },
        },
      },
    },
  },
  plugins: [scrollbarHide],
};
