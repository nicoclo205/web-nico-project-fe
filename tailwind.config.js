/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{html,js,jsx,ts,tsx}"],
  theme: {
    extend: {

      colors: {
        'myBlack': '#121212',
        'myGreen': '#1E7D32',
        'myRed': '#A41E22',
        'myGray': '#2B2B2B',
        'myYellow': '#F2C94C',
        'myBlue': '#2B78E4',
      },
      fontFamily: {
        'sans': ['Inter', 'Roboto', 'system-ui', 'sans-serif'],
        'heading': ['Montserrat', 'sans-serif'],
      },

    },
  },
  plugins: [],
}
