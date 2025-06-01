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
        // Cores principais baseadas nas variáveis CSS do globals.css
        primary: {
          DEFAULT: 'var(--primary)',
          dark: 'var(--primary-dark)',
          light: 'var(--primary-light)'
        },
        secondary: {
          DEFAULT: 'var(--secondary)',
          dark: 'var(--secondary-dark)',
          light: 'var(--secondary-light)'
        },
        // Cores de destaque
        accent: {
          blue: 'var(--accent-blue)',
          cyan: 'var(--accent-cyan)',
          green: 'var(--accent-green)',
          orange: 'var(--accent-orange)',
          purple: 'var(--accent-purple)',
          yellow: 'var(--accent-yellow)'
        },
        // Cores de status
        success: 'var(--success)',
        warning: 'var(--warning)',
        error: 'var(--error)',
        info: 'var(--info)',
        // Backgrounds
        background: {
          primary: 'var(--background-primary)',
          secondary: 'var(--background-secondary)',
          tertiary: 'var(--background-tertiary)',
          card: 'var(--background-card)',
          hover: 'var(--background-hover)'
        },
        // Textos
        text: {
          primary: 'var(--text-primary)',
          secondary: 'var(--text-secondary)',
          tertiary: 'var(--text-tertiary)',
          muted: 'var(--text-muted)'
        },
        // Bordas
        border: {
          DEFAULT: 'var(--border)',
          light: 'var(--border-light)',
          dark: 'var(--border-dark)'
        },
        // Sidebar
        sidebar: {
          bg: 'var(--sidebar-bg)',
          'bg-light': 'var(--sidebar-bg-light)',
          hover: 'var(--sidebar-hover)',
          active: 'var(--sidebar-active)',
          text: 'var(--sidebar-text)',
          'text-active': 'var(--sidebar-text-active)',
          border: 'var(--sidebar-border)'
        }
      },
      // Configuração para ring colors
      ringColor: {
        primary: 'var(--primary)',
        secondary: 'var(--secondary)',
        success: 'var(--success)',
        warning: 'var(--warning)',
        error: 'var(--error)',
        info: 'var(--info)',
      },
      // Configuração para border colors
      borderColor: {
        primary: 'var(--primary)',
        secondary: 'var(--secondary)',
        light: 'var(--border-light)',
        dark: 'var(--border-dark)',
        DEFAULT: 'var(--border)',
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
