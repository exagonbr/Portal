'use client';

import { useContext } from 'react';
import { Theme, getTheme } from '@/config/themes';

// Importar o contexto diretamente para evitar dependência circular
import { createContext } from 'react';

interface ThemeContextType {
  theme: Theme;
  themeType: string;
  setTheme: (type: string) => void;
  toggleTheme: () => void;
}

// Tema padrão para fallback
const defaultTheme: Theme = {
  colors: {
    background: { 
      primary: '#ffffff', 
      secondary: '#f8f9fa',
      card: '#ffffff',
      hover: '#f1f3f4'
    },
    primary: { 
      DEFAULT: '#0f3460', 
      dark: '#0a2847', 
      light: '#1e4a73',
      contrast: '#ffffff' 
    },
    text: { 
      primary: '#1a1a1a', 
      secondary: '#6b7280',
      muted: '#9ca3af'
    },
    status: { 
      error: '#dc2626',
      success: '#16a34a',
      warning: '#d97706',
      info: '#2563eb'
    },
    border: {
      DEFAULT: '#e5e7eb',
      light: '#f3f4f6',
      dark: '#d1d5db'
    }
  },
  shadows: { 
    sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
    md: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
    lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
    xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1)'
  },
  spacing: {
    xs: '0.25rem',
    sm: '0.5rem',
    md: '1rem',
    lg: '1.5rem',
    xl: '2rem'
  },
  borderRadius: {
    sm: '0.25rem',
    md: '0.375rem',
    lg: '0.5rem',
    xl: '0.75rem'
  }
};

/**
 * Hook seguro para usar o tema que não quebra se o ThemeProvider não estiver disponível
 */
export function useThemeSafe() {
  try {
    // Tentar importar dinamicamente o contexto do tema
    const ThemeContext = require('@/contexts/ThemeContext').ThemeContext;
    const context = useContext(ThemeContext);
    
    if (context) {
      return {
        theme: context.theme,
        themeType: context.themeType,
        setTheme: context.setTheme,
        toggleTheme: context.toggleTheme,
        isAvailable: true
      };
    }
  } catch (error) {
    // Silenciosamente falhar e usar fallback
    console.debug('ThemeContext não disponível, usando tema padrão');
  }

  // Fallback quando o contexto não está disponível
  return {
    theme: defaultTheme,
    themeType: 'academic',
    setTheme: () => console.debug('setTheme não disponível - ThemeProvider não carregado'),
    toggleTheme: () => console.debug('toggleTheme não disponível - ThemeProvider não carregado'),
    isAvailable: false
  };
}

/**
 * Hook que retorna apenas o tema, com fallback automático
 */
export function useThemeOnly(): Theme {
  const { theme } = useThemeSafe();
  return theme;
}