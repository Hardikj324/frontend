/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx}",
  ],
  theme: {
    extend: {
      colors: {
        'dark-bg': '#0f1923',
        'dark-card': '#1a2940',
        'cyan-primary': '#64c8ff',
        'orange-accent': '#ff8c42',
      },
    },
  },
  plugins: [],
}