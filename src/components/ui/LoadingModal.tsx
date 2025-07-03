'use client'

import React from 'react'
import { motion } from 'framer-motion'

interface LoadingModalProps {
  message?: string
  subMessage?: string
  isOpen?: boolean
}

// Hook seguro para tema com fallback
function useThemeSafe() {
  try {
    const { useTheme } = require('@/contexts/ThemeContext');
    return useTheme();
  } catch (error) {
    console.log('⚠️ Erro ao carregar ThemeContext no LoadingModal:', error);
    return {
      theme: {
        colors: {
          primary: { DEFAULT: '#3b82f6' },
          background: { primary: '#f9fafb' },
          text: { primary: '#111827', secondary: '#6b7280' }
        }
      }
    };
  }
}

export default function LoadingModal({
  message = 'Aguarde enquanto preparamos tudo para você',
  subMessage = 'Estamos carregando os recursos necessários...',
  isOpen = true
}: LoadingModalProps) {
  const { theme } = useThemeSafe()

  if (!isOpen) return null

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center flex-col p-4"
      style={{ 
        backgroundColor: theme?.colors?.background?.primary || '#f9fafb',
        backdropFilter: 'blur(8px)'
      }}
    >
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        className="w-16 h-16 border-4 border-t-transparent rounded-full mb-6"
        style={{ 
          borderColor: theme?.colors?.primary?.DEFAULT || '#3b82f6',
          borderTopColor: 'transparent'
        }}
      />
      <h2 
        className="text-xl font-medium mb-2 text-center"
        style={{ color: theme?.colors?.text?.primary || '#111827' }}
      >
        {message}
      </h2>
      {subMessage && (
        <p
          className="text-sm text-center max-w-xs"
          style={{ color: theme?.colors?.text?.secondary || '#6b7280' }}
        >
          {subMessage}
        </p>
      )}
    </div>
  )
}

// Componente de recuperação de erro específico para o erro de factory
// Este componente não deve depender de hooks que podem falhar
export function ErrorRecoveryModal() {
  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center flex-col p-4"
      style={{ 
        backgroundColor: '#f9fafb',
        backdropFilter: 'blur(8px)'
      }}
    >
      <div
        className="w-16 h-16 border-4 border-t-transparent rounded-full mb-6 animate-spin"
        style={{ 
          borderColor: '#3b82f6',
          borderTopColor: 'transparent'
        }}
      />
      <h2 
        className="text-xl font-medium mb-2 text-center"
        style={{ color: '#111827' }}
      >
        Aguarde enquanto preparamos tudo para você
      </h2>
      <p
        className="text-sm text-center max-w-xs"
        style={{ color: '#6b7280' }}
      >
        Estamos resolvendo um problema técnico...
      </p>
    </div>
  )
} 