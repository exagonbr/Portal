'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { useTheme } from '@/contexts/ThemeContext'

interface UpdateNotificationCompactProps {
  isUpdateAvailable: boolean
  onUpdate: () => void
  isUpdating: boolean
}

export function UpdateNotificationCompact({ 
  isUpdateAvailable, 
  onUpdate, 
  isUpdating 
}: UpdateNotificationCompactProps) {
  const { theme } = useTheme()
  const [showTooltip, setShowTooltip] = useState(false)

  if (!isUpdateAvailable) return null

  const handleUpdate = () => {
    onUpdate()
  }

  return (
    <div className="relative">
      <motion.button
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={handleUpdate}
        disabled={isUpdating}
        className="p-2 rounded-lg transition-all duration-200 relative"
        style={{ 
          color: theme.colors.status.success,
          backgroundColor: 'transparent'
        }}
        onMouseEnter={(e) => {
          setShowTooltip(true)
          e.currentTarget.style.backgroundColor = `${theme.colors.status.success}20`
        }}
        onMouseLeave={(e) => {
          setShowTooltip(false)
          e.currentTarget.style.backgroundColor = 'transparent'
        }}
        title={isUpdating ? 'Atualizando...' : 'Nova versão disponível! Clique para atualizar'}
      >
        {isUpdating ? (
          <div className="animate-spin rounded-full h-5 w-5 border-2 border-current border-t-transparent"></div>
        ) : (
          <>
            <span className="material-symbols-outlined">system_update</span>
            {/* Indicador pulsante */}
            <motion.div
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="absolute -top-1 -right-1 w-3 h-3 rounded-full"
              style={{ backgroundColor: theme.colors.status.success }}
            />
          </>
        )}
      </motion.button>

      {/* Tooltip */}
      {showTooltip && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 10 }}
          className="absolute bottom-full right-0 mb-2 px-3 py-2 text-xs font-medium rounded-lg shadow-lg whitespace-nowrap z-50"
          style={{
            backgroundColor: theme.colors.background.card,
            color: theme.colors.text.primary,
            border: `1px solid ${theme.colors.border.DEFAULT}`
          }}
        >
          {isUpdating ? 'Atualizando...' : 'Nova versão!'}
          <div 
            className="absolute top-full right-3 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent"
            style={{ borderTopColor: theme.colors.background.card }}
          />
        </motion.div>
      )}
    </div>
  )
} 