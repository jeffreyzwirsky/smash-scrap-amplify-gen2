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
            primary: '#0d0e0f',
            secondary: '#111213',
            tertiary: '#1a1b1e',
            hover: '#1f2023',
            border: '#2d2e32',
          },
          text: {
            primary: '#ffffff',
            secondary: '#b0b0b0',
            muted: '#808080',
            disabled: '#606060',
          }
        },
        success: '#4caf50',
        warning: '#ff9800',
        error: '#f44336',
        info: '#2196f3',
      },
    },
  },
  plugins: [],
}
