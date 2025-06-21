/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        'inter': ['Inter', 'system-ui', 'sans-serif'],
      },
      colors: {
        primary: {
          50: '#f8f9fa',
          900: '#101014',
          DEFAULT: '#101014',
        },
        accent: {
          DEFAULT: '#00D3FF',
          50: '#e6f9ff',
          100: '#b3ecff',
          500: '#00D3FF',
          600: '#00b8e6',
        },
        highlight: {
          DEFAULT: '#FFB547',
          50: '#fff7ed',
          100: '#ffedd5',
          500: '#FFB547',
          600: '#ea580c',
        },
        glass: {
          DEFAULT: 'rgba(255, 255, 255, 0.1)',
          dark: 'rgba(0, 0, 0, 0.2)',
        }
      },
      backdropBlur: {
        'xs': '2px',
      },
      boxShadow: {
        'glass': '0 4px 12px rgba(0, 0, 0, 0.1)',
        'glow': '0 0 20px rgba(0, 211, 255, 0.3)',
        'highlight-glow': '0 0 20px rgba(255, 181, 71, 0.3)',
      },
      animation: {
        'pulse-slow': 'pulse 3s ease-in-out infinite',
        'float': 'float 6s ease-in-out infinite',
        'glow': 'glow 2s ease-in-out infinite alternate',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        glow: {
          '0%': { boxShadow: '0 0 20px rgba(0, 211, 255, 0.3)' },
          '100%': { boxShadow: '0 0 30px rgba(0, 211, 255, 0.6)' },
        }
      }
    },
  },
  plugins: [],
};