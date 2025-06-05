'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { Theme, ThemeType, getTheme, applyTheme, getCurrentTheme } from '@/config/themes';

interface ThemeContextType {
  theme: Theme;
  themeType: ThemeType;
  setTheme: (type: ThemeType) => void;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme deve ser usado dentro de um ThemeProvider');
  }
  return context;
};

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [themeType, setThemeType] = useState<ThemeType>('academic');
  const [theme, setThemeState] = useState<Theme>(getTheme('academic'));

  useEffect(() => {
    const savedTheme = getCurrentTheme();
    const initialTheme = getTheme(savedTheme);
    setThemeType(savedTheme);
    setThemeState(initialTheme);
    applyTheme(initialTheme);
  }, []);

  const setTheme = (type: ThemeType) => {
    const newTheme = getTheme(type);
    setThemeType(type);
    setThemeState(newTheme);
    applyTheme(newTheme);
  };

  const toggleTheme = () => {
    const themes: ThemeType[] = ['academic', 'corporate', 'modern'];
    const currentIndex = themes.indexOf(themeType);
    const nextIndex = (currentIndex + 1) % themes.length;
    setTheme(themes[nextIndex]);
  };

  return (
    <ThemeContext.Provider value={{ theme, themeType, setTheme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}; 