/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'primary': '#3B82F6',
        'secondary': '#10B981',
        'lb-purple': '#4B3B8C',
        'lb-link': '#6B4FBB',
      },
    },
  },
  plugins: [],
}

// Made with Bob
