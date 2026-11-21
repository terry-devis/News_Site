/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/component/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#f0fdf4',
          100: '#dcfce7',
          500: '#22c55e',
          600: '#16a34a',
          700: '#15803d',
          800: '#166534',
          900: '#14532d',
        },
        newsroom: {
          sidebar: '#0a2618',
          'sidebar-surface': '#0e3321',
          'sidebar-active': '#184e2d',
          'sidebar-text': '#9ebba8',
          'sidebar-border': '#15452b',
          canvas: '#f9f8f5',
          card: '#ffffff',
          'card-border': '#e5e2da',
          'card-header': '#f4f2ec',
          primary: '#124e2b',
          'primary-hover': '#0b381e',
          'text-main': '#18221b',
          'text-muted': '#5e6b62',
          'text-faint': '#8a968e',
        },
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', '-apple-system', 'sans-serif'],
        nastaliq: ['"Noto Nastaliq Urdu"', '"Jameel Noori Nastaleeq"', '"Noto Naskh Arabic"', 'serif'],
        inter: ['Inter', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
