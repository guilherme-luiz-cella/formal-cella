/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        mono: ['JetBrains Mono', 'ui-monospace', 'SFMono-Regular', 'monospace'],
      },
      colors: {
        brand: {
          50: '#eef2ff',
          400: '#818cf8',
          500: '#6366f1',
          600: '#4f46e5',
        },
        accept: '#22c55e',
        reject: '#ef4444',
      },
      keyframes: {
        pulseRing: {
          '0%': { boxShadow: '0 0 0 0 rgba(99,102,241,0.6)' },
          '100%': { boxShadow: '0 0 0 18px rgba(99,102,241,0)' },
        },
      },
      animation: {
        pulseRing: 'pulseRing 1.4s ease-out infinite',
      },
    },
  },
  plugins: [],
};
