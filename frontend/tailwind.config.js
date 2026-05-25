/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        'outfit': ['Outfit', 'sans-serif'],
        'noto-ethiopic': ['Noto Sans Ethiopic', 'sans-serif'],
      },
      colors: {
        // Dark Mode Colors (Default)
        champagne: '#EACEAA',
        'honey-garlic': '#85431E',
        'whiskey-sour': '#D39858',
        'burnt-coffee': '#34150F',
        balsamico: '#150C0C',
        
        // Light Mode Colors (Best equivalents)
        light: {
          champagne: '#FDF8F0',      // Light creamy background
          'honey-garlic': '#A0522D',  // Sienna - warmer copper
          'whiskey-sour': '#E8B86B',  // Lighter golden tan
          'burnt-coffee': '#F5E6D3',  // Warm cream
          balsamico: '#F9F6F0',       // Off-white background
        },
        
        // Semantic color mappings
        primary: {
          DEFAULT: '#D39858',  // whiskey-sour
          dark: '#85431E',      // honey-garlic
          light: '#E8B86B',
        },
        secondary: {
          DEFAULT: '#34150F',   // burnt-coffee
          dark: '#150C0C',      // balsamico
          light: '#F5E6D3',
        },
        accent: {
          DEFAULT: '#EACEAA',   // champagne
          dark: '#EACEAA',
          light: '#FDF8F0',
        },
        background: {
          DEFAULT: '#150C0C',   // balsamico (dark mode default)
          light: '#F9F6F0',     // light mode background
        },
        text: {
          DEFAULT: '#EACEAA',    // champagne (dark mode text)
          dark: '#150C0C',       // balsamico (light mode text)
          muted: '#D39858',      // whiskey-sour
        },
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'fade-in-up': 'fadeInUp 0.6s ease-out',
        'fade-in-down': 'fadeInDown 0.6s ease-out',
        'slide-in': 'slideIn 0.4s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        fadeInUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        fadeInDown: {
          '0%': { opacity: '0', transform: 'translateY(-20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideIn: {
          '0%': { transform: 'translateX(-20px)', opacity: '0' },
          '100%': { transform: 'translateX(0)', opacity: '1' },
        },
      },
    },
  },
  plugins: [],
}