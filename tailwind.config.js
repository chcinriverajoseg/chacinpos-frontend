/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          50:  '#E1F5EE',
          100: '#9FE1CB',
          200: '#5DCAA5',
          400: '#1D9E75',
          600: '#0F6E56',
          700: '#0A5A45',
          800: '#085041',
          900: '#04342C',
        },
        warn: {
          50:  '#FAEEDA',
          400: '#BA7517',
          600: '#633806',
        },
      },
    },
  },
  plugins: [],
}
