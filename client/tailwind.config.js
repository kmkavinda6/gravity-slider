/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",  // This tells Tailwind where to look for classes
  ],
  theme: {
    extend: {
      // We can add custom theme extensions here if needed
      colors: {
        // Adding any custom colors used in the GravityControl component
        slate: {
          700: '#334155',
          800: '#1e293b',
          900: '#0f172a',
        },
      },
    },
  },
  plugins: [],
}
