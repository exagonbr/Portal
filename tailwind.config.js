/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Cores do sistema baseadas nas variáveis CSS
        primary: {
          DEFAULT: '#1e40af',
          dark: '#1e3a8a',
          light: '#3b82f6',
          contrast: '#ffffff',
        },
        secondary: {
          DEFAULT: '#059669',
          dark: '#047857',
          light: '#10b981',
          contrast: '#ffffff',
        },
        accent: {
          DEFAULT: '#dc2626',
          dark: '#b91c1c',
          light: '#ef4444',
          contrast: '#ffffff',
        },
        background: {
          primary: '#ffffff',
          secondary: '#f8fafc',
          tertiary: '#f1f5f9',
          card: '#ffffff',
          hover: '#f8fafc',
        },
        text: {
          primary: '#1e293b',
          secondary: '#475569',
          tertiary: '#64748b',
          disabled: '#94a3b8',
          inverse: '#ffffff',
        },
        border: {
          DEFAULT: '#e2e8f0',
          light: '#f1f5f9',
          dark: '#cbd5e1',
          focus: '#3b82f6',
        },
        sidebar: {
          bg: '#1e3a8a',
          hover: '#1e40af',
          active: '#3b82f6',
          text: '#e0e7ff',
          textActive: '#ffffff',
          border: '#3b82f6',
        },
        status: {
          success: '#059669',
          warning: '#d97706',
          error: '#dc2626',
          info: '#2563eb',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
      boxShadow: {
        'sm': '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
        'md': '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
        'lg': '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
        'xl': '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
      },
      animation: {
        'fade-in': 'fade-in 0.3s ease-in-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'slide-down': 'slideDown 0.3s ease-out',
      },
      keyframes: {
        'fade-in': {
          from: {
            opacity: '0',
            transform: 'translateY(10px)',
          },
          to: {
            opacity: '1',
            transform: 'translateY(0)',
          },
        },
        slideUp: {
          from: {
            transform: 'translateY(100%)',
          },
          to: {
            transform: 'translateY(0)',
          },
        },
        slideDown: {
          from: {
            transform: 'translateY(-100%)',
          },
          to: {
            transform: 'translateY(0)',
          },
        },
      },
    },
  },
  plugins: [],
} 