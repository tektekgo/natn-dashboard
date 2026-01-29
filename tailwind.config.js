/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // NATN Lab brand colors — rich blue primary (Coinbase-inspired)
        primary: {
          50: '#eff6ff',
          100: '#dbeafe',
          200: '#bfdbfe',
          300: '#93c5fd',
          400: '#60a5fa',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
          800: '#1e40af',
          900: '#1e3a8a',
          950: '#172554',
        },
        accent: {
          50: '#fdf4ff',
          100: '#fae8ff',
          200: '#f5d0fe',
          300: '#f0abfc',
          400: '#e879f9',
          500: '#d946ef',
          600: '#c026d3',
          700: '#a21caf',
          800: '#86198f',
          900: '#701a75',
          950: '#4a044e',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['"Plus Jakarta Sans"', 'Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'card': '0 1px 3px 0 rgba(37, 99, 235, 0.06), 0 1px 2px -1px rgba(37, 99, 235, 0.06)',
        'card-hover': '0 4px 12px -1px rgba(37, 99, 235, 0.10), 0 2px 4px -2px rgba(37, 99, 235, 0.06)',
        'elevated': '0 10px 25px -3px rgba(37, 99, 235, 0.10), 0 4px 10px -4px rgba(37, 99, 235, 0.06)',
      },
    },
  },
  plugins: [],
}
