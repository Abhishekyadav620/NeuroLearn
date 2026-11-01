/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        neuro: {
          bg: '#0B0B16',
          bgSecondary: '#111124',
          card: '#19192F',
          elevated: '#232340',
          purple: '#8B5CF6',
          purpleLight: '#A78BFA',
          pink: '#EC4899',
          text: '#F8FAFC',
          textMuted: '#9CA3AF',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
      boxShadow: {
        'soft-purple': '0 4px 20px -2px rgba(139, 92, 246, 0.15)',
        'elevated-card': '0 8px 30px rgba(0, 0, 0, 0.35)',
      },
      borderColor: {
        'subtle-purple': 'rgba(139, 92, 246, 0.15)',
        'card-border': 'rgba(167, 139, 250, 0.12)',
      },
    },
  },
  plugins: [],
};
