import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        lagoon: {
          50: '#E6F8F6',
          100: '#CCF0ED',
          200: '#99E2DB',
          300: '#66D4C9',
          400: '#33C6B7',
          500: '#00A896',
          600: '#008080', // Primary Lagoon Teal
          700: '#006666',
          800: '#004D4D',
          900: '#003333',
        },
        ocean: {
          50: '#EBF3F8',
          100: '#D6E7F1',
          200: '#ADCFE3',
          300: '#85B7D5',
          400: '#3D8BBF',
          500: '#0F4C81', // Atlantic Blue
          600: '#0C3E6B',
          700: '#093054',
          800: '#003B5C', // Deep Atlantic Navy
          900: '#022B42',
        },
        sand: {
          50: '#FFFDF9', // Warm Cream
          100: '#F7F4EF', // Warm Sand Background
          200: '#EAE3D2',
          300: '#E8C59C', // Light Dune
          400: '#DFB588',
          500: '#D4A373', // Golden Dune
          600: '#B58455',
          700: '#8C6239',
          800: '#634423',
          900: '#3D2811',
        },
        slate: {
          850: '#151E2E',
          950: '#0A0E17',
        },
      },
      fontFamily: {
        sans: ['Outfit', 'Plus Jakarta Sans', 'Inter', 'system-ui', 'sans-serif'],
        arabic: ['Tajawal', 'Cairo', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'soft-lg': '0 10px 30px -5px rgba(0, 128, 128, 0.08), 0 8px 16px -6px rgba(0, 59, 92, 0.06)',
        'dune': '0 8px 24px -4px rgba(212, 163, 115, 0.25)',
      },
    },
  },
  plugins: [],
};

export default config;
