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
        brand: {
          primary: '#c62828',
          secondary: '#d32f2f',
          dark: '#b71c1c',
        },
        dark: {
          bg: {
            primary: '#1a1a1a',
            secondary: '#2a2a2a',
            card: '#2d2d2d',
          },
          text: {
            primary: '#ffffff',
            secondary: '#b0b0b0',
            muted: '#808080',
          }
        },
        light: {
          bg: {
            primary: '#f5f5f5',
            secondary: '#ffffff',
            card: '#ffffff',
          },
          text: {
            primary: '#212121',
            secondary: '#424242',
            muted: '#757575',
          }
        }
      },
    },
  },
  plugins: [],
}
