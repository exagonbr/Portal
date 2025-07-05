'use client';

import React, { useState } from 'react';
import { useTheme } from '@/contexts/ThemeContext';
import { ThemeType } from '@/config/themes';
import { motion, AnimatePresence } from 'framer-motion';

interface ThemeOption {
  type: ThemeType;
  name: string;
  description: string;
  icon: string;
  preview: {
    primary: string;
    secondary: string;
    accent: string;
    bg: string;
  };
}

const themeOptions: ThemeOption[] = [
  {
    type: 'academic',
    name: 'Acadêmico',
    description: 'Profissional e focado em educação',
    icon: '🎓',
    preview: {
      primary: '#1e40af',
      secondary: '#059669',
      accent: '#dc2626',
      bg: '#ffffff',
    },
  },
  {
    type: 'corporate',
    name: 'Corporativo',
    description: 'Elegante e sofisticado',
    icon: '💼',
    preview: {
      primary: '#0f172a',
      secondary: '#7c3aed',
      accent: '#f59e0b',
      bg: '#ffffff',
    },
  },
  {
    type: 'modern',
    name: 'Moderno',
    description: 'Vibrante e contemporâneo',
    icon: '✨',
    preview: {
      primary: '#8b5cf6',
      secondary: '#06b6d4',
      accent: '#f43f5e',
      bg: '#0f0f0f',
    },
  },
];

export const ThemeSelector: React.FC = () => {
  const { themeType, setTheme } = useTheme();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:border-primary transition-all duration-300 shadow-sm hover:shadow-md"
      >
        <span className="text-2xl">
          {themeOptions.find(t => t.type === themeType)?.icon}
        </span>
        <span className="text-sm font-medium">
          {themeOptions.find(t => t.type === themeType)?.name}
        </span>
        <svg
          className={`w-4 h-4 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="absolute right-0 mt-2 w-80 bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden z-50"
          >
            <div className="p-4">
              <h3 className="text-lg font-semibold mb-3">Escolha um Tema</h3>
              <div className="space-y-3">
                {themeOptions.map((option) => (
                  <motion.button
                    key={option.type}
                    onClick={() => {
                      setTheme(option.type);
                      setIsOpen(false);
                    }}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className={`w-full p-4 rounded-lg border-2 transition-all duration-300 ${
                      themeType === option.type
                        ? 'border-primary bg-primary/10'
                        : 'border-gray-200 dark:border-gray-700 hover:border-primary/50'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <span className="text-3xl">{option.icon}</span>
                      <div className="flex-1 text-left">
                        <h4 className="font-semibold">{option.name}</h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {option.description}
                        </p>
                        <div className="flex gap-2 mt-2">
                          <div
                            className="w-6 h-6 rounded-full border-2 border-gray-300"
                            style={{ backgroundColor: option.preview.primary }}
                          />
                          <div
                            className="w-6 h-6 rounded-full border-2 border-gray-300"
                            style={{ backgroundColor: option.preview.secondary }}
                          />
                          <div
                            className="w-6 h-6 rounded-full border-2 border-gray-300"
                            style={{ backgroundColor: option.preview.accent }}
                          />
                        </div>
                      </div>
                    </div>
                  </motion.button>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export const ThemeSelectorCompact: React.FC = () => {
  const { themeType, toggleTheme } = useTheme();
  const currentTheme = themeOptions.find(t => t.type === themeType);

  return (
    <motion.button
      onClick={toggleTheme}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      className="p-2 rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:border-primary transition-all duration-300 shadow-sm hover:shadow-md"
      title={`Tema atual: ${currentTheme?.name}`}
    >
      <span className="text-2xl">{currentTheme?.icon}</span>
    </motion.button>
  );
}; 