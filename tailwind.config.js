/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        background: {
          DEFAULT: '#1C2526', // Fondo oscuro / tarjetas
          header: '#003087',  // Azul profundo Atenea
          dark: '#000000',
        },
        primary: {
          DEFAULT: '#FFD700', // Dorado (Acentos positivos / botones)
          foreground: '#003087',
        },
        secondary: {
          DEFAULT: '#003087', // Azul profundo Atenea
          foreground: '#FFFFFF',
        },
        success: {
          DEFAULT: '#4CAF50', // Verde mapa (Seguridad / verificado)
          foreground: '#FFFFFF',
        },
        error: {
          DEFAULT: '#FF3B30', // Rojo (Alerta / pánico)
          foreground: '#FFFFFF',
        },
        muted: {
          DEFAULT: 'rgba(255, 255, 255, 0.05)',
          foreground: 'rgba(255, 255, 255, 0.6)',
        },
        card: {
          DEFAULT: '#1C2526',
          border: 'rgba(255, 255, 255, 0.1)',
        }
      },
      fontFamily: {
        display: ['Inter', 'sans-serif'],
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
      }
    },
  },
  plugins: [],
};
