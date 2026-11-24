import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        // Coastal Dakhla Palette
        ocean: {
          DEFAULT: '#176B87',
          blue: '#176B87',
          hover: '#13586F',
          900: '#176B87',
          950: '#0F475A',
        },
        turquoise: {
          DEFAULT: '#35A7A0',
          hover: '#2E938D',
          600: '#35A7A0',
          700: '#2E938D',
        },
        sand: {
          DEFAULT: '#D8B67A',
          warm: '#D8B67A',
          soft: '#F3E8D2',
          accent: '#D8B67A',
          bg: '#FCFBF8',
          50: '#FCFBF8',
          100: '#F3E8D2',
          200: '#E8E5DE',
          300: '#D8B67A',
        },
        surface: {
          bg: '#FCFBF8',
          card: '#FFFFFF',
          border: '#E8E5DE',
        },
        text: {
          primary: '#1F2933',
          secondary: '#667580',
        },
        // Platform Aliases for Stability
        atlantic: {
          DEFAULT: '#176B87',
          900: '#176B87',
          950: '#0F475A',
        },
        teal: {
          DEFAULT: '#35A7A0',
          600: '#35A7A0',
          700: '#2E938D',
        },
        lagoon: {
          50: '#F0FAF8',
          100: '#E0F4F2',
          200: '#BFE7E2',
          300: '#8DD3CA',
          400: '#4AB8AB',
          500: '#0B7A75', // Dakhla Teal
          600: '#08635F',
          700: '#074F4C',
          800: '#053C3A',
          900: '#073B4C', // Deep Atlantic
          950: '#04222C',
        },
        ocean: {
          50: '#F2F6FA',
          100: '#E3ECF3',
          200: '#C2D7E6',
          300: '#95BBD4',
          400: '#6098BE',
          500: '#0B7A75',
          600: '#08635F',
          700: '#074F4C',
          800: '#073B4C', // Deep Atlantic
          900: '#073B4C',
          950: '#04222C',
        },
        slate: {
          850: '#172A32',
          950: '#172A32',
        },
      },
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'system-ui', '-apple-system', 'sans-serif'],
        serif: ['"Plus Jakarta Sans"', 'system-ui', '-apple-system', 'sans-serif'],
        display: ['"Plus Jakarta Sans"', 'system-ui', '-apple-system', 'sans-serif'],
        arabic: ['Tajawal', 'system-ui', 'sans-serif'],
        'arabic-serif': ['Tajawal', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'soft-sm': '0 1px 3px 0 rgba(7, 59, 76, 0.04), 0 1px 2px -1px rgba(7, 59, 76, 0.04)',
        'soft-md': '0 4px 16px -2px rgba(7, 59, 76, 0.06), 0 2px 6px -2px rgba(7, 59, 76, 0.04)',
        'soft-lg': '0 12px 28px -4px rgba(7, 59, 76, 0.08), 0 4px 10px -4px rgba(7, 59, 76, 0.04)',
        'card': '0 2px 8px -2px rgba(23, 42, 50, 0.05)',
        'card-hover': '0 8px 24px -4px rgba(23, 42, 50, 0.1)',
      },
      backgroundImage: {
        'ai-gradient': 'linear-gradient(135deg, #0B7A75 0%, #073B4C 100%)',
      },
    },
  },
  plugins: [],
};

export default config;
