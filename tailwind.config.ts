import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        lagoon: {
          50: '#F0FAF8',
          100: '#E0F4F2',
          200: '#BFE7E2',
          300: '#8DD3CA',
          400: '#4AB8AB',
          500: '#00A896', // Vibrant Lagoon Cyan
          600: '#028090', // Deep Lagoon Teal
          700: '#036674',
          800: '#05515C',
          900: '#07424C',
          950: '#02242B',
        },
        ocean: {
          50: '#F2F6FA',
          100: '#E3ECF3',
          200: '#C2D7E6',
          300: '#95BBD4',
          400: '#6098BE',
          500: '#3477A4',
          600: '#235D85',
          700: '#1B4A6B',
          800: '#0F334E',
          900: '#072033', // Deep Atlantic Abyssal Navy
          950: '#03121F',
        },
        sand: {
          25: '#FDFBF7',  // Sun-bleached desert linen
          50: '#FAF6EE',  // Warm cream
          100: '#F4ECE0', // Soft dune background
          200: '#E7D8C4',
          300: '#D8C1A2',
          400: '#C9A980',
          500: '#B58E5E', // Golden Saharan Sand
          600: '#997448',
          700: '#7B5A35',
          800: '#5F4426',
          900: '#443019',
          950: '#281C0E',
        },
        terracotta: {
          50: '#FDF5F2',
          100: '#FBE8E2',
          200: '#F7D0C4',
          300: '#F0B19F',
          400: '#E58A71',
          500: '#D06041', // Saharan sunset terracotta
          600: '#B84A2D',
          700: '#94381F',
          800: '#752D19',
          900: '#572213',
        },
        slate: {
          850: '#151E2E',
          950: '#0A0E17',
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
        'soft-lg': '0 10px 30px -5px rgba(0, 128, 128, 0.08), 0 8px 16px -6px rgba(0, 59, 92, 0.06)',
        'dune': '0 12px 32px -4px rgba(181, 142, 94, 0.2)',
        'editorial': '0 20px 45px -15px rgba(7, 32, 51, 0.08), 0 0 1px 1px rgba(7, 32, 51, 0.04)',
        'editorial-hover': '0 28px 55px -15px rgba(7, 32, 51, 0.16), 0 0 1px 1px rgba(7, 32, 51, 0.06)',
        'glow-lagoon': '0 10px 30px -5px rgba(0, 168, 150, 0.3)',
      },
      letterSpacing: {
        'widest-editorial': '0.2em',
      },
      backgroundImage: {
        'noise-subtle': "radial-gradient(circle at 50% 50%, rgba(255,255,255,0.05) 0%, transparent 100%)",
      },
    },
  },
  plugins: [],
};

export default config;
