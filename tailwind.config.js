/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          primary: '#c62828',
          secondary: '#d32f2f',
          dark: '#b71c1c',
        }
      }
    },
  },
  plugins: [],
}
