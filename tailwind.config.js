/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx}',
    './src/components/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          primary: 'var(--brand-primary, #2563eb)',
          secondary: 'var(--brand-secondary, #1e40af)',
          accent: 'var(--brand-accent, #3b82f6)',
        },
        score: {
          excellent: '#22c55e',
          good: '#84cc16',
          average: '#eab308',
          poor: '#f97316',
          critical: '#ef4444',
        },
      },
    },
  },
  plugins: [],
};
