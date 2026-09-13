import type { Config } from 'tailwindcss';

export default {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: [
          'Inter',
          'ui-sans-serif',
          'system-ui',
          '-apple-system',
          'BlinkMacSystemFont',
          'Segoe UI',
          'sans-serif',
        ],
      },
      boxShadow: {
        floating: '0 12px 40px rgba(0, 0, 0, 0.14)',
        panel: '0 8px 30px rgba(0, 0, 0, 0.10)',
      },
    },
  },
  plugins: [],
} satisfies Config;