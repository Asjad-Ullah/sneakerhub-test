/** @type {import('tailwindcss').Config} */
export default {
    content: [
      './index.html',
      './src/**/*.{js,jsx,ts,tsx}',
    ],
    theme: {
      extend: {
        animation: {
          'fadeIn': 'fadeIn 0.3s ease-in-out',
          'modalFadeIn': 'modalFadeIn 0.3s ease-out',
          'modalFadeOut': 'modalFadeOut 0.3s ease-in',
        },
        keyframes: {
          fadeIn: {
            '0%': { opacity: '0' },
            '100%': { opacity: '1' },
          },
          modalFadeIn: {
            '0%': { opacity: '0', transform: 'scale(0.95)' },
            '100%': { opacity: '1', transform: 'scale(1)' },
          },
          modalFadeOut: {
            '0%': { opacity: '1', transform: 'scale(1)' },
            '100%': { opacity: '0', transform: 'scale(0.95)' },
          },
        },
      },
    },
    plugins: [],
  };