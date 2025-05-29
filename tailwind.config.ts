import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Cores principais baseadas no Figma
        primary: {
          DEFAULT: '#1e293b', // Navy blue escuro da sidebar
          dark: '#0f172a',
          light: '#334155'
        },
        secondary: {
          DEFAULT: '#64748b',
          dark: '#475569',
          light: '#94a3b8'
        },
        accent: {
          blue: '#3b82f6',
          green: '#10b981',
          orange: '#f59e0b',
          purple: '#8b5cf6',
          yellow: '#eab308'
        },
        success: '#10b981',
        warning: '#f59e0b',
        error: '#ef4444',
        info: '#3b82f6',
        background: {
          primary: '#ffffff',
          secondary: '#f8fafc',
          tertiary: '#f1f5f9'
        },
        text: {
          primary: '#1e293b',
          secondary: '#64748b',
          tertiary: '#94a3b8'
        },
        border: {
          DEFAULT: '#e2e8f0',
          light: '#f1f5f9',
          dark: '#cbd5e1'
        },
        sidebar: {
          bg: '#1e293b',
          hover: '#334155',
          active: '#3b82f6',
          text: '#e2e8f0',
          textActive: '#ffffff'
        }
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease-in-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'slide-down': 'slideDown 0.3s ease-out'
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' }
        },
        slideUp: {
          '0%': { transform: 'translateY(100%)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' }
        },
        slideDown: {
          '0%': { transform: 'translateY(-100%)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' }
        }
      }
    },
  },
  plugins: [],
}

export default config
