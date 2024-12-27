/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode:'class',
  content: [
    "./src/**/*.{html,ts}",
    "./node_modules/flowbite/**/*.js"
  ],
  theme: {
    extend: {
      screens:{
        "x":"520px"
      }
    },
  },
  plugins:[
    require('flowbite/plugin')
  ],
  plugins: [],
}

