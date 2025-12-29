/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Apple-like Color System
        primary: {
          50: '#F2F8FF',
          100: '#E6F2FF',
          200: '#C2E0FF',
          300: '#99CDFF',
          400: '#66A3FF',
          500: '#007AFF', // iOS Blue
          600: '#0062CC',
          700: '#004999',
          800: '#003166',
          900: '#001833',
        },
        apple: {
          bg: '#F5F5F7',      // Apple System Gray
          card: '#FFFFFF',
          text: '#1D1D1F',    // Almost Black
          gray: '#86868B',    // Secondary Text
          border: '#E5E5EA',  // Light Border
          hover: '#F5F5F7',
        },
        success: {
          50: '#ECFDF5',
          100: '#D1FAE5',
          200: '#A7F3D0',
          300: '#6EE7B7',
          400: '#34D399',
          500: '#10B981',
          600: '#059669',
          700: '#047857',
          800: '#065F46',
          900: '#064E3B',
        },
        danger: {
          50: '#FEF2F2',
          100: '#FEE2E2',
          200: '#FECACA',
          300: '#FCA5A5',
          400: '#F87171',
          500: '#EF4444',
          600: '#DC2626',
          700: '#B91C1C',
          800: '#991B1B',
          900: '#7F1D1D',
        },
        warning: {
          50: '#FFFBEB',
          100: '#FEF3C7',
          200: '#FDE68A',
          300: '#FCD34D',
          400: '#FBBF24',
          500: '#F59E0B',
          600: '#D97706',
          700: '#B45309',
          800: '#92400E',
          900: '#78350F',
        },
      },
      boxShadow: {
        card: '0 10px 30px rgba(15, 23, 42, 0.05)',
        'card-hover': '0 18px 45px rgba(15, 23, 42, 0.12)',
        apple: '0 4px 24px rgba(0, 0, 0, 0.04)',
        'apple-hover': '0 8px 32px rgba(0, 0, 0, 0.08)',
        float: '0 20px 40px rgba(0, 0, 0, 0.08)',
      },
      backdropBlur: {
        'xs': '2px',
      }
    },
  },
  plugins: [],
}
