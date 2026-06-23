/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        mono: ['JetBrains Mono', 'ui-monospace', 'SFMono-Regular', 'monospace'],
      },
      colors: {
        // Steam (Valve) palette — dark navy + cyan accent.
        brand: {
          50:  '#e6f4fb',
          400: '#66c0f4', // Steam cyan
          500: '#1a9fff', // hover / link cyan
          600: '#2a475e', // panel background
          700: '#1b2838', // page background
          800: '#171a21', // deepest surface
        },
        accept: '#a4d007', // Steam action green
        reject: '#ef4444',
      },
      keyframes: {
        pulseRing: {
          '0%': { boxShadow: '0 0 0 0 rgba(102,192,244,0.6)' },
          '100%': { boxShadow: '0 0 0 18px rgba(102,192,244,0)' },
        },
      },
      animation: {
        pulseRing: 'pulseRing 1.4s ease-out infinite',
      },
    },
  },
  plugins: [],
};
