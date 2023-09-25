/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      backgroundColor: {
        "erica-green": '#68D293',
        "erica-pink": '#FF9F9F'
      }
    },
  },
  plugins: [],
}

