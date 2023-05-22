/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    colors: {
      lightPine: '#005048',
      pine: '#007e74',
      offWhite: '#f6fbfb;',
      offGrey: '#9CA3AF',
    },
    extend: {
      fontFamily: {
        raleway: ['Raleway', 'sans-serif'],
      },
    },
  },
  plugins: [],
};