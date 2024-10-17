/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      backgroundImage: {
        'green-mana': "url('assets/mana/green.png')",
        'white-mana': "url('/assets/mana/white.png')",
        'blue-mana': "url('/assets/mana/blue.png')",
        'red-mana': "url('/assets/mana/red.png')",
        'black-mana': "url('/assets/mana/black.png')",
      }
    },
  },
  plugins: [],
}