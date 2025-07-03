'use client';

import { useContext } from 'react';
import { Theme, ThemeType, getTheme } from '@/config/themes';

interface ThemeContextType {
  theme: Theme;
  themeType: ThemeType;
  setTheme: (type: ThemeType) => void;
  toggleTheme: () => void;
}

// Tema padrão para fallback baseado na estrutura correta
const defaultTheme: Theme = {
  name: 'Padrão',
  type: 'academic',
  colors: {
    primary: {
      DEFAULT: '#1e40af',
      dark: '#1e3a8a',
      light: '#3b82f6',
      contrast: '#ffffff'
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
      secondary: '#f9fafb',
      tertiary: '#f3f4f6',
      card: '#ffffff',
      hover: '#f9fafb'
    },
    text: {
      primary: '#111827',
      secondary: '#4b5563',
      tertiary: '#6b7280',
      disabled: '#9ca3af',
      inverse: '#ffffff'
    },
    border: {
      DEFAULT: '#e5e7eb',
      light: '#f3f4f6',
      dark: '#d1d5db',
      focus: '#3b82f6'
    },
    gradient: {
      from: '#1e40af',
      via: '#3b82f6',
      to: '#60a5fa',
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
      warning: '#f59e0b',
      error: '#dc2626',
      info: '#3b82f6'
    }
  },
  shadows: {
    sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
    md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
    lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
    xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)'
  },
  animations: {
    hover: 'transform hover:scale-105 transition-transform duration-200',
    click: 'active:scale-95 transition-transform duration-100',
    transition: 'transition-all duration-300 ease-in-out',
  }
};

/**
 * Hook seguro para usar o tema que não quebra se o ThemeProvider não estiver disponível
 */
export function useThemeSafe() {
  try {
    // Tentar usar o hook useTheme do contexto
    const { useTheme } = require('@/contexts/ThemeContext');
    const context = useTheme();
    
    if (context && context.theme) {
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
    themeType: 'academic' as ThemeType,
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