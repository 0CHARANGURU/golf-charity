/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        navy: {
          DEFAULT: '#101827',
          50: '#1e293b',
          100: '#182234',
          900: '#101827',
          950: '#0b101b',
        },
        lime: {
          DEFAULT: '#C5F36A',
          hover: '#b5e855',
          light: '#dcf89b',
          dark: '#9ecc39',
        },
        charcoal: {
          DEFAULT: '#252A32',
          card: '#1e232b',
          border: '#333945',
          light: '#2d333d',
        },
        offWhite: {
          DEFAULT: '#F7F7F2',
          muted: '#94A3B8',
          subtle: '#CBD5E1',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
    },
  },
  plugins: [],
}
