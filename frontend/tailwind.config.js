/****** Tailwind CSS Config ******/
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{js,jsx,ts,tsx}'
  ],
  theme: {
    extend: {
      colors: {
        good: '#10B981',
        moderate: '#F59E0B',
        poor: '#EF4444'
      }
    },
  },
  plugins: [],
}
