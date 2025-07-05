export type ThemeType = 'academic' | 'corporate' | 'modern';

export interface Theme {
  name: string;
  type: ThemeType;
  colors: {
    primary: {
      DEFAULT: string;
      dark: string;
      light: string;
      contrast: string;
    };
    secondary: {
      DEFAULT: string;
      dark: string;
      light: string;
      contrast: string;
    };
    accent: {
      DEFAULT: string;
      dark: string;
      light: string;
      contrast: string;
    };
    background: {
      primary: string;
      secondary: string;
      tertiary: string;
      card: string;
      hover: string;
    };
    text: {
      primary: string;
      secondary: string;
      tertiary: string;
      disabled: string;
      inverse: string;
    };
    border: {
      DEFAULT: string;
      light: string;
      dark: string;
      focus: string;
    };
    gradient: {
      from: string;
      via: string;
      to: string;
    };
    sidebar: {
      bg: string;
      hover: string;
      active: string;
      text: string;
      textActive: string;
      border: string;
    };
    status: {
      success: string;
      warning: string;
      error: string;
      info: string;
    };
  };
  shadows: {
    sm: string;
    md: string;
    lg: string;
    xl: string;
  };
  animations: {
    hover: string;
    click: string;
    transition: string;
  };
}

export const themes: Record<ThemeType, Theme> = {
  academic: {
    name: 'Acadêmico',
    type: 'academic',
    colors: {
      primary: {
        DEFAULT: '#1e40af', // Azul acadêmico profundo
        dark: '#1e3a8a',
        light: '#3b82f6',
        contrast: '#ffffff',
      },
      secondary: {
        DEFAULT: '#059669', // Verde esmeralda
        dark: '#047857',
        light: '#10b981',
        contrast: '#ffffff',
      },
      accent: {
        DEFAULT: '#dc2626', // Vermelho vibrante
        dark: '#b91c1c',
        light: '#ef4444',
        contrast: '#ffffff',
      },
      background: {
        primary: '#ffffff',
        secondary: '#f9fafb',
        tertiary: '#f3f4f6',
        card: '#ffffff',
        hover: '#f9fafb',
      },
      text: {
        primary: '#111827',
        secondary: '#4b5563',
        tertiary: '#6b7280',
        disabled: '#9ca3af',
        inverse: '#ffffff',
      },
      border: {
        DEFAULT: '#e5e7eb',
        light: '#f3f4f6',
        dark: '#d1d5db',
        focus: '#3b82f6',
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
        info: '#3b82f6',
      },
    },
    shadows: {
      sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
      md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
      lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
      xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
    },
    animations: {
      hover: 'transform hover:scale-105 transition-transform duration-200',
      click: 'active:scale-95 transition-transform duration-100',
      transition: 'transition-all duration-300 ease-in-out',
    },
  },
  corporate: {
    name: 'Corporativo',
    type: 'corporate',
    colors: {
      primary: {
        DEFAULT: '#0f172a', // Azul escuro corporativo
        dark: '#020617',
        light: '#1e293b',
        contrast: '#ffffff',
      },
      secondary: {
        DEFAULT: '#7c3aed', // Roxo elegante
        dark: '#6d28d9',
        light: '#8b5cf6',
        contrast: '#ffffff',
      },
      accent: {
        DEFAULT: '#f59e0b', // Dourado corporativo
        dark: '#d97706',
        light: '#fbbf24',
        contrast: '#000000',
      },
      background: {
        primary: '#ffffff',
        secondary: '#fafafa',
        tertiary: '#f5f5f5',
        card: '#ffffff',
        hover: '#f9fafb',
      },
      text: {
        primary: '#0f172a',
        secondary: '#475569',
        tertiary: '#64748b',
        disabled: '#94a3b8',
        inverse: '#ffffff',
      },
      border: {
        DEFAULT: '#e2e8f0',
        light: '#f1f5f9',
        dark: '#cbd5e1',
        focus: '#7c3aed',
      },
      gradient: {
        from: '#0f172a',
        via: '#1e293b',
        to: '#334155',
      },
      sidebar: {
        bg: '#0f172a',
        hover: '#1e293b',
        active: '#334155',
        text: '#e2e8f0',
        textActive: '#ffffff',
        border: '#7c3aed',
      },
      status: {
        success: '#16a34a',
        warning: '#f59e0b',
        error: '#dc2626',
        info: '#0ea5e9',
      },
    },
    shadows: {
      sm: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
      md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
      lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
      xl: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
    },
    animations: {
      hover: 'transform hover:translateY(-2px) transition-all duration-300',
      click: 'active:translateY(0) transition-transform duration-100',
      transition: 'transition-all duration-400 ease-out',
    },
  },
  modern: {
    name: 'Moderno',
    type: 'modern',
    colors: {
      primary: {
        DEFAULT: '#8b5cf6', // Roxo vibrante
        dark: '#7c3aed',
        light: '#a78bfa',
        contrast: '#ffffff',
      },
      secondary: {
        DEFAULT: '#06b6d4', // Ciano moderno
        dark: '#0891b2',
        light: '#22d3ee',
        contrast: '#ffffff',
      },
      accent: {
        DEFAULT: '#f43f5e', // Rosa vibrante
        dark: '#e11d48',
        light: '#fb7185',
        contrast: '#ffffff',
      },
      background: {
        primary: '#0f0f0f',
        secondary: '#1a1a1a',
        tertiary: '#262626',
        card: '#1a1a1a',
        hover: '#2a2a2a',
      },
      text: {
        primary: '#ffffff',
        secondary: '#e5e5e5',
        tertiary: '#a3a3a3',
        disabled: '#737373',
        inverse: '#0f0f0f',
      },
      border: {
        DEFAULT: '#404040',
        light: '#525252',
        dark: '#262626',
        focus: '#8b5cf6',
      },
      gradient: {
        from: '#8b5cf6',
        via: '#f43f5e',
        to: '#06b6d4',
      },
      sidebar: {
        bg: '#1a1a1a',
        hover: '#262626',
        active: '#404040',
        text: '#e5e5e5',
        textActive: '#ffffff',
        border: '#8b5cf6',
      },
      status: {
        success: '#10b981',
        warning: '#f59e0b',
        error: '#ef4444',
        info: '#3b82f6',
      },
    },
    shadows: {
      sm: '0 2px 4px 0 rgba(139, 92, 246, 0.1)',
      md: '0 4px 8px 0 rgba(139, 92, 246, 0.15)',
      lg: '0 8px 16px 0 rgba(139, 92, 246, 0.2)',
      xl: '0 16px 32px 0 rgba(139, 92, 246, 0.25)',
    },
    animations: {
      hover: 'transform hover:scale-105 hover:rotate-1 transition-all duration-300',
      click: 'active:scale-95 active:rotate-0 transition-all duration-150',
      transition: 'transition-all duration-500 cubic-bezier(0.4, 0, 0.2, 1)',
    },
  },
};

export const getTheme = (type: ThemeType): Theme => {
  return themes[type];
};

export const applyTheme = (theme: Theme) => {
  const root = document.documentElement;
  
  // Aplicar cores
  Object.entries(theme.colors).forEach(([category, values]) => {
    if (typeof values === 'object') {
      Object.entries(values).forEach(([key, value]) => {
        root.style.setProperty(`--color-${category}-${key}`, value);
      });
    } else {
      root.style.setProperty(`--color-${category}`, values);
    }
  });
  
  // Aplicar sombras
  Object.entries(theme.shadows).forEach(([key, value]) => {
    root.style.setProperty(`--shadow-${key}`, value);
  });
  
  // Salvar tema no localStorage
  localStorage.setItem('selectedTheme', theme.type);
};

export const getCurrentTheme = (): ThemeType => {
  if (typeof window !== 'undefined') {
    const savedTheme = localStorage.getItem('selectedTheme') as ThemeType;
    return savedTheme || 'academic';
  }
  return 'academic';
}; 