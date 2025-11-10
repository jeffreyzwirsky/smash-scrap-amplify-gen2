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
        // ✅ Keep your existing SMASH brand colors
        brand: {
          primary: '#c62828',
          secondary: '#d32f2f',
          dark: '#b71c1c',
        },
        
        // ✅ Enhanced dark mode palette (matches professional dashboard)
        dark: {
          // Background shades (darkest to lighter)
          bg: {
            primary: '#0d0e0f',    // Main app background (darkest)
            secondary: '#111213',  // Sidebar/card backgrounds
            tertiary: '#1a1b1e',   // Card content areas
            hover: '#1f2023',      // Hover states
            border: '#2d2e32',     // Borders and dividers
          },
          // Text shades
          text: {
            primary: '#ffffff',    // Main headings
            secondary: '#b0b0b0',  // Body text
            muted: '#808080',      // Subtle text
            disabled: '#606060',   // Disabled elements
          }
        },
        
        // ✅ Keep light mode support (future-ready)
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
        },
        
        // ✅ Add semantic colors for UI states
        success: {
          DEFAULT: '#4caf50',
          light: '#81c784',
          dark: '#388e3c',
        },
        warning: {
          DEFAULT: '#ff9800',
          light: '#ffb74d',
          dark: '#f57c00',
        },
        error: {
          DEFAULT: '#f44336',
          light: '#e57373',
          dark: '#d32f2f',
        },
        info: {
          DEFAULT: '#2196f3',
          light: '#64b5f6',
          dark: '#1976d2',
        }
      },
