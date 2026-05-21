/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{html,ts}"
  ],
  corePlugins: {
    preflight: false
  },
  theme: {
    extend: {
      colors: {
        edaara: {
          primary: '#0d9488',   // teal-600
          accent:  '#f59e0b',   // amber-500
          dark:    '#0f172a',   // slate-900
          light:   '#f8fafc'
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif']
      }
    }
  },
  plugins: []
};
