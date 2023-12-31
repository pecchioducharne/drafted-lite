module.exports = {
  purge: ['./src/**/*.{js,jsx,ts,tsx}', './public/index.html'],
  darkMode: false, // or 'media' or 'class'
  theme: {
    extend: {
      colors: {
        customGreen: '#00BF63',
        customGreenDark: '#009950', // Define the darker shade of green
      },
    },
  },
  variants: {
    extend: {},
  },
  plugins: [],
}
