/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        neuro: {
          bg: '#F8F9FC',            // Main background (very light grey/white)
          surface: '#FFFFFF',       // Pure white card surfaces
          card: '#FFFFFF',          // Card backgrounds
          purple: '#8B5CF6',        // Primary purple accent
          purpleHover: '#7C3AED',   // Darker purple hover state
          purpleLight: '#A78BFA',   // Secondary purple
          lavender: '#F1ECFF',      // Light lavender container / chip
          lavenderBg: '#F7F4FF',    // Soft lavender background tint
          text: '#202033',          // Primary high-contrast dark text
          textMuted: '#77788A',     // Secondary supportive text
          border: '#ECECF2',        // Subtle light border
          success: '#16A36A',       // Success state green
          error: '#EF4444',         // Error state red
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
      boxShadow: {
        'subtle': '0 1px 3px 0 rgba(0, 0, 0, 0.04), 0 1px 2px 0 rgba(0, 0, 0, 0.02)',
        'card': '0 4px 20px -2px rgba(32, 32, 51, 0.05), 0 2px 6px -1px rgba(32, 32, 51, 0.02)',
        'card-hover': '0 10px 25px -3px rgba(139, 92, 246, 0.08), 0 4px 10px -2px rgba(32, 32, 51, 0.03)',
        'purple-focus': '0 0 0 3px rgba(139, 92, 246, 0.15)',
        'purple-btn': '0 4px 14px 0 rgba(139, 92, 246, 0.25)',
      },
      borderRadius: {
        '2xl': '1rem',
        '3xl': '1.5rem',
      },
    },
  },
  plugins: [],
};
