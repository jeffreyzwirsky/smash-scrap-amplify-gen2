/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // SMASH Brand Colors - Primary palette
        brand: {
          teal: '#21808d',      // Primary brand color (teal)
          tealDark: '#1c6c78',  // Darker teal for hover states
          red: '#c0152f',       // Secondary brand color (red)
          redDark: '#a0111e',   // Darker red for hover states
          cream: '#fcfcf9',     // Accent cream color
        },
        
        // Navy/Dark theme colors - Background and surfaces
        navy: {
          50: '#e8eaf6',
          100: '#c5cae9',
          200: '#9fa8da',
          300: '#7986cb',
          400: '#5c6bc0',
          500: '#3f51b5',
          600: '#3949ab',
          700: '#303f9f',
          800: '#283593',
          900: '#1a237e',
          950: '#111c44',       // Sidebar background
        },
        
        // Main dark backgrounds
        dark: {
          DEFAULT: '#0b1437',   // Main app background
          50: '#1a2454',        // Lighter variant
          100: '#111c44',       // Sidebar/card background
          200: '#0d1437',       // Slightly darker
          300: '#0a0f2b',       // Darkest variant
        },
        
        // Gray scale for borders and text
        slate: {
          50: '#f8fafc',
          100: '#f1f5f9',
          200: '#e2e8f0',
          300: '#cbd5e1',       // Muted text
          400: '#94a3b8',       // Secondary text
          500: '#64748b',
          600: '#475569',       // Border color
          700: '#334155',       // Primary border
          800: '#1e293b',       // Dark border
          900: '#0f172a',       // Darkest border
        },
      },
      
      fontFamily: {
        sans: [
          'Inter',
          '-apple-system',
          'BlinkMacSystemFont',
          '"Segoe UI"',
          'Roboto',
          'Oxygen',
          'Ubuntu',
          'Cantarell',
          '"Fira Sans"',
          '"Droid Sans"',
          '"Helvetica Neue"',
          'sans-serif'
        ],
        mono: [
          'source-code-pro',
          'Menlo',
          'Monaco',
          'Consolas',
          '"Courier New"',
          'monospace'
        ]
      },
      
      boxShadow: {
        'glow-red': '0 0 20px rgba(192, 21, 47, 0.3)',
        'glow-teal': '0 0 20px rgba(33, 128, 141, 0.3)',
        'card': '0 1px 0 0 rgba(148, 163, 184, 0.12), 0 8px 24px rgba(2, 6, 23, 0.35)',
        'card-hover': '0 2px 0 0 rgba(148, 163, 184, 0.16), 0 12px 32px rgba(2, 6, 23, 0.45)',
        'inner-card': '0 4px 6px -1px rgba(0, 0, 0, 0.3), 0 2px 4px -1px rgba(0, 0, 0, 0.2)',
      },
      
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
        '128': '32rem',
      },
      
      borderRadius: {
        'xl': '1rem',
        '2xl': '1.5rem',
        '3xl': '2rem',
      },
      
      animation: {
        'fade-in': 'fadeIn 0.3s ease-in-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'slide-down': 'slideDown 0.3s ease-out',
      },
      
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        slideDown: {
          '0%': { transform: 'translateY(-10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
      },
    },
  },
  plugins: [],
}
