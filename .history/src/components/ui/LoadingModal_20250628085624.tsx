'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { useTheme } from '@/contexts/ThemeContext'

interface LoadingModalProps {
  message?: string
  subMessage?: string
  isOpen?: boolean
}

export default function LoadingModal({
  message = 'Aguarde enquanto preparamos tudo para você',
  subMessage = 'Estamos carregando os recursos necessários...',
  isOpen = true
}: LoadingModalProps) {
  const { theme } = useTheme()

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
export function ErrorRecoveryModal() {
  return (
    <LoadingModal 
      message="Aguarde enquanto preparamos tudo para você" 
      subMessage="Estamos resolvendo um problema técnico..." 
    />
  )
} 