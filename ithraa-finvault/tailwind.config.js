/** @type {import('tailwindcss').Config} */
module.exports = {
  // FIX: Tailwind now scans ALL feature templates and JS files
  content: [
    "./*.html",
    "./js/**/*.{js,html}",
    "./js/features/**/*.{js,html}"
  ],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        cairo: ['Cairo', 'sans-serif'],
      },
      colors: {
        obsidian: {
          base: '#050505',
          surface: '#15121b',
          container: '#211e27',
        },
        ethereal: {
          violet: '#d0bcff',
          cyan: '#4cd7f6',
        },
        emerald: '#10b981',
        rose: '#f43f5e',
        gold: '#ffb869',
        purple: '#a855f7',
        orange: '#f97316',
        amber: '#f59e0b',
        pink: '#ec4899',
        cyan: '#06b6d4',
      },
      borderRadius: {
        'sm': '0.25rem',
        'DEFAULT': '0.5rem',
        'md': '0.75rem',
        'lg': '1rem',
        'xl': '1.5rem',
      }
    }
  },
  safelist: [
    {
      pattern: /(bg|text|border|shadow)-(emerald|rose|gold|purple|orange|amber|pink|cyan|blue|red|gray|indigo)(-(50|100|200|300|400|500|600|700|800|900))?(\/(5|10|20|30|50))?/,
      variants: ['hover', 'focus', 'group-hover', 'active'],
    },
    {
      // status badge classes for transfers/escrow
      pattern: /^(bg|text)-(amber|blue|emerald|rose|gray|cyan|purple|pink|orange|indigo)-(400|500)\/(10|20|30)/,
    }
  ],
  plugins: [],
}
