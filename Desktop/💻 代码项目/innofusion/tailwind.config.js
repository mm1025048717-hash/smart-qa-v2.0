/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Inter", "system-ui", "Segoe UI", "Roboto", "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", "sans-serif"],
        display: ["Plus Jakarta Sans", "Inter", "system-ui", "sans-serif"],
      },
      colors: {
        // 蓝白极简配色
        'bfl-surface': '#ffffff',
        'bfl-surface-2': '#f8fafc', // slate-50
        'bfl-border': '#e2e8f0',   // slate-200
        'bfl-primary': '#2563eb',  // blue-600
        'bfl-primary-500': '#3b82f6',
        'bfl-secondary': '#0ea5e9',
        'bfl-accent': '#22c55e',
        'bfl-text': '#0f172a',      // slate-900
        'bfl-text-dim': '#475569'   // slate-600
      },
      animation: {
        'ping-once': 'ping 0.6s cubic-bezier(0, 0, 0.2, 1) 1',
        'scale-up': 'scaleUp 0.3s ease-out',
        'explode': 'explode 0.6s ease-out forwards',
        'fade-in': 'fadeIn 0.3s ease-out'
      },
      keyframes: {
        scaleUp: {
          '0%': { transform: 'scale(0.8)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' }
        },
        explode: {
          '0%': { transform: 'scale(1)', opacity: '1' },
          '50%': { transform: 'scale(1.2)', opacity: '0.8' },
          '100%': { transform: 'scale(0)', opacity: '0' }
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' }
        }
      }
    },
  },
  plugins: [],
}
