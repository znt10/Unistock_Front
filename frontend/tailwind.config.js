// tailwind.config.js
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{html,js,jsx,ts,tsx}"],
  darkMode: ['class', '[data-theme="dark-blue"]'], 
  theme: {
    extend: {
      colors: {
        'theme-base': 'rgb(var(--color-base) / <alpha-value>)',
        'theme-card': 'rgb(var(--color-card) / <alpha-value>)',
        'theme-header': 'rgb(var(--color-header) / <alpha-value>)',
        'theme-border': 'rgb(var(--color-border) / <alpha-value>)',
        'theme-hover': 'rgb(var(--color-hover) / <alpha-value>)',
        
        // 👇 ESTAS DUAS ESTAVAM FALTANDO!
        'theme-text-title': 'rgb(var(--color-text-title) / <alpha-value>)',
        'theme-text-sub': 'rgb(var(--color-text-sub) / <alpha-value>)',

        'action-primary': '#ea580c', // orange-600 (logo)
        'status-success': '#4ade80', // green-400
      },
    },
  },
  plugins: [],
}