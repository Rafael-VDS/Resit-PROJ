module.exports = {
  darkMode: 'class',
  content: ['./src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        light: {
          primary: '#2F80ED',
          hover: '#1C6DD0',
          text: '#0F4C81',
          surface: '#EAF4FF',
          border: '#D0E2F2'
        },
        dark: {
          primary: '#4A90E2',
          hover: '#68A6FF',
          text: '#AFCBFF',
          surface: '#1A2B3C',
          border: '#2C3E50',
          background: '#0D1B2A'
        }
      },
      keyframes: {
        fadeInUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' }
        }
      },
      animation: {
        fadeInUp: 'fadeInUp 0.6s ease-out forwards'
      }
    }
  },
  plugins: []
}
