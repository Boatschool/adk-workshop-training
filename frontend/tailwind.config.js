/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: ['class', '[data-theme="dark"]'],
  theme: {
    extend: {
      colors: {
        // GraymatterStudio Brand Colors
        'gms-matte-black': '#1E1E1E',
        'gms-bright-blue': '#00AAE7',
        'gms-papaya-orange': '#FFA613',
        'gms-silver-gray': '#D0D0D0',
        // Primary scale
        primary: {
          50: 'var(--color-primary-50, #e6f7fc)',
          100: 'var(--color-primary-100, #b3e5f5)',
          200: 'var(--color-primary-200, #80d3ee)',
          300: 'var(--color-primary-300, #4dc1e7)',
          400: 'var(--color-primary-400, #26b3e1)',
          500: 'var(--color-primary-500, #00AAE7)',
          600: 'var(--color-primary-600, #008bc0)',
          700: 'var(--color-primary-700, #006c99)',
          800: 'var(--color-primary-800, #004d72)',
          900: 'var(--color-primary-900, #002e4b)',
        },
        // Accent scale
        accent: {
          50: 'var(--color-accent-50, #fff5e6)',
          100: 'var(--color-accent-100, #ffe0b3)',
          200: 'var(--color-accent-200, #ffcc80)',
          300: 'var(--color-accent-300, #ffb84d)',
          400: 'var(--color-accent-400, #ffa826)',
          500: 'var(--color-accent-500, #FFA613)',
          600: 'var(--color-accent-600, #cc8500)',
          700: 'var(--color-accent-700, #996300)',
          800: 'var(--color-accent-800, #664200)',
          900: 'var(--color-accent-900, #332100)',
        },
        // Healthcare compliance colors
        healthcare: {
          'phi': '#f59e0b',      // Amber for PHI indicators
          'hipaa': '#10b981',    // Green for HIPAA compliance
          'audit': '#3b82f6',    // Blue for audit logging
          'a2a': '#06b6d4',      // Cyan for A2A flows
        },
        // Node type colors
        node: {
          'adk-agent': '#3b82f6',   // Blue
          'static': '#10b981',      // Green
          'trigger': '#f97316',     // Orange
          'decision': '#8b5cf6',    // Purple
          'tool': '#06b6d4',        // Cyan
          'webhook': '#ec4899',     // Pink
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'Menlo', 'monospace'],
      },
      boxShadow: {
        'card': '0 1px 3px rgba(0, 0, 0, 0.1), 0 1px 2px rgba(0, 0, 0, 0.06)',
        'modal': '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
        'dropdown': '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
      },
      animation: {
        'fade-in': 'fadeIn 0.2s ease-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [],
}
