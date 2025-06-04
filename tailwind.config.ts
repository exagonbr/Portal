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
        // Cores principais para ambiente educacional, empresarial, universitário e escolar.
        // Paleta clara e profissional.
        primary: { // Azul principal: amigável, profissional e moderno.
          DEFAULT: '#4A90E2', // Azul médio (Tailwind blue-500ish)
          dark: '#357ABD',    // Tom mais escuro para hover/active
          light: '#7BB6F3'   // Tom mais claro para fundos ou destaques sutis
        },
        secondary: { // Cinza neutro: para texto secundário, bordas e fundos.
          DEFAULT: '#A0AEC0', // Cinza médio (Tailwind gray-400)
          dark: '#718096',    // Cinza mais escuro (Tailwind gray-500)
          light: '#E2E8F0'   // Cinza claro (Tailwind gray-300)
        },
        accent: { // Cores de destaque para interações e informações visuais.
          blue: {
            DEFAULT: '#3B82F6', // Azul vibrante (Tailwind blue-500)
            dark: '#2563EB',
            light: '#60A5FA'
          },
          green: {
            DEFAULT: '#10B981', // Verde positivo (Tailwind emerald-500)
            dark: '#059669',
            light: '#34D399'
          },
          orange: {
            DEFAULT: '#F59E0B', // Laranja para alertas (Tailwind amber-500)
            dark: '#D97706',
            light: '#FBBF24'
          },
          purple: { // Roxo suave para elementos criativos ou informativos.
            DEFAULT: '#8B5CF6', // (Tailwind violet-500)
            dark: '#7C3AED',
            light: '#A78BFA'
          },
          yellow: { // Amarelo quente para avisos leves ou destaques.
            DEFAULT: '#FBBF24', // (Tailwind amber-400)
            dark: '#F59E0B',
            light: '#FCD34D'
          }
        },
        // Cores de status semânticas
        success: {
          DEFAULT: '#10B981', // Verde (accent.green.DEFAULT)
          dark: '#059669',
          light: '#34D399',
          text: '#065F46' // Texto escuro para contraste em fundo claro de sucesso
        },
        warning: {
          DEFAULT: '#F59E0B', // Laranja (accent.orange.DEFAULT)
          dark: '#D97706',
          light: '#FBBF24',
          text: '#9A3412' // Texto escuro para contraste
        },
        error: {
          DEFAULT: '#EF4444', // Vermelho (Tailwind red-500)
          dark: '#DC2626',
          light: '#F87171',
          text: '#991B1B' // Texto escuro para contraste
        },
        info: {
          DEFAULT: '#3B82F6', // Azul (accent.blue.DEFAULT)
          dark: '#2563EB',
          light: '#60A5FA',
          text: '#1E40AF' // Texto escuro para contraste
        },
        // Fundos claros para manter a leveza.
        background: {
          primary: '#FFFFFF',    // Fundo principal branco
          secondary: '#F7FAFC',  // Cinza muito claro (Tailwind gray-50)
          tertiary: '#EDF2F7'   // Cinza suave (Tailwind gray-100)
        },
        // Textos com bom contraste sobre fundos claros.
        text: {
          primary: '#374151',   // Cinza médio (Tailwind gray-700) - mais claro que o anterior
          secondary: '#6B7280', // Cinza médio-claro (Tailwind gray-500) - mais claro
          tertiary: '#9CA3AF',  // Cinza claro (Tailwind gray-400) - mais claro
          disabled: '#D1D5DB'  // Cinza muito claro para texto desabilitado (Tailwind gray-300)
        },
        // Bordas suaves e claras.
        border: {
          DEFAULT: '#E2E8F0', // Cinza claro (Tailwind gray-300)
          light: '#EDF2F7',   // Cinza muito claro (Tailwind gray-200)
          dark: '#CBD5E0'    // Cinza médio-claro (Tailwind gray-400)
        },
        // Sidebar com tema claro.

        sidebar: {
          bg: '#0f3460',          // Fundo branco ou muito claro (background.primary)
          hover: '#1e4d82',       // Fundo de hover sutil (background.tertiary)
          active: '#1e40af',      // Fundo ativo com tom azulado claro (Tailwind indigo-100)
          text: '#e2e8f0',        // Texto escuro (text.secondary)
          textActive: '#ffffff',  // Texto ativo com cor primária ou de destaque (Tailwind indigo-700)
          border: '#E2E8F0'       // Borda do sidebar (border.DEFAULT)
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
