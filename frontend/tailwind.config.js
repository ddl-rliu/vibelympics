/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'pastel-pink': '#FCCCC7',
        'pastel-mauve': '#E3AFBD',
        'pastel-cream': '#FAF7E4',
        'pastel-blue': '#BBE3F0',
        'pastel-peach': '#F4D4B2',
      },
      fontFamily: {
        'display': ['Righteous', 'cursive'],
        'body': ['Space Mono', 'monospace'],
      },
    },
  },
  plugins: [],
}

