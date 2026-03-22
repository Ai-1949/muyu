/** @type {import('tailwindcss').Config} */
// Tailwind：新中式禅意配色、圆角与字体扩展
module.exports = {
  darkMode: ['class'],
  content: [
    './app/**/*.{js,jsx}',
    './components/**/*.{js,jsx}',
  ],
  theme: {
    extend: {
      colors: {
        zen: {
          paper: '#f7f4ef',
          ink: '#2c2825',
          mist: '#8a8580',
          wood: '#6b5344',
          woodLight: '#a6907a',
          gold: '#c9a227',
          goldSoft: '#e8d48a',
          temple: '#8b3a3a',
          templeDeep: '#5c2424',
          night: '#1a1c24',
          nightMist: '#2d3142',
        },
      },
      fontFamily: {
        serif: ['var(--font-serif-zen)', 'Songti SC', 'serif'],
        sans: ['var(--font-sans-zen)', 'PingFang SC', 'sans-serif'],
      },
      boxShadow: {
        zen: '0 8px 32px rgba(44, 40, 37, 0.08)',
        zenInner: 'inset 0 2px 8px rgba(44, 40, 37, 0.06)',
      },
      keyframes: {
        'float-up': {
          '0%': { opacity: '1', transform: 'translateY(0) scale(1)' },
          '100%': { opacity: '0', transform: 'translateY(-48px) scale(0.6)' },
        },
        'count-pop': {
          '0%': { transform: 'scale(1)' },
          '50%': { transform: 'scale(1.08)' },
          '100%': { transform: 'scale(1)' },
        },
      },
      animation: {
        'float-up': 'float-up 1s ease-out forwards',
        'count-pop': 'count-pop 0.3s ease-out',
      },
    },
  },
  plugins: [],
};
