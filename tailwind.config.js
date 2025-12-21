/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{vue,ts}'],
  theme: {
    extend: {
      colors: {
        primary: '#0f766e',
        secondary: '#1e3a8a',
        accent: '#f59e0b',
        ink: '#0b1021',
        muted: '#6b7280',
        surface: '#f5f7fb',
      },
      fontFamily: {
        sans: ['Inter', 'Manrope', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
