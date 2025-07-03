'use client'

import { useState, useEffect } from 'react'

interface UpdateNotificationProps {
  isUpdateAvailable: boolean
  onUpdate: () => void
  isUpdating: boolean
  hideWhenCompactVisible?: boolean
}

export function UpdateNotification({ 
  isUpdateAvailable, 
  onUpdate, 
  isUpdating,
  hideWhenCompactVisible = false
}: UpdateNotificationProps) {
  const [isVisible, setIsVisible] = useState(false)
  const [isExpanded, setIsExpanded] = useState(false)

  useEffect(() => {
    if (isUpdateAvailable) {
      setIsVisible(true)
    }
  }, [isUpdateAvailable])

  if (!isVisible || hideWhenCompactVisible) return null

  const handleDismiss = () => {
    setIsVisible(false)
  }

  const handleUpdate = () => {
    onUpdate()
  }

  return (
    <div className="fixed top-4 right-4 z-50 transition-all duration-300 ease-in-out">
      <div 
        className={`
          bg-white border border-gray-200 rounded-lg shadow-lg
          ${isExpanded ? 'w-80' : 'w-12 h-12'}
          transition-all duration-300 ease-in-out
          hover:shadow-xl
        `}
        onMouseEnter={() => setIsExpanded(true)}
        onMouseLeave={() => setIsExpanded(false)}
      >
        {/* Ícone compacto */}
        <div className={`
          flex items-center justify-center
          ${isExpanded ? 'hidden' : 'w-12 h-12'}
        `}>
          {isUpdating ? (
            <div className="animate-spin rounded-full h-6 w-6 border-2 border-blue-500 border-t-transparent"></div>
          ) : (
            <div className="relative">
              <svg 
                className="w-6 h-6 text-blue-500" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" 
                />
              </svg>
              {/* Indicador de ponto vermelho */}
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
            </div>
          )}
        </div>

        {/* Conteúdo expandido */}
        <div className={`
          ${isExpanded ? 'block' : 'hidden'}
          p-4
        `}>
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center space-x-2">
              {isUpdating ? (
                <div className="animate-spin rounded-full h-5 w-5 border-2 border-blue-500 border-t-transparent"></div>
              ) : (
                <svg 
                  className="w-5 h-5 text-blue-500 flex-shrink-0" 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth={2} 
                    d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" 
                  />
                </svg>
              )}
              <h3 className="text-sm font-medium text-gray-900">
                {isUpdating ? 'Atualizando...' : 'Nova versão!'}
              </h3>
            </div>
            <button
              onClick={handleDismiss}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {!isUpdating && (
            <>
              <p className="text-xs text-gray-600 mb-3">
                Uma nova versão está disponível. Clique para atualizar.
              </p>
              <div className="flex space-x-2">
                <button
                  onClick={handleUpdate}
                  disabled={isUpdating}
                  className="
                    flex-1 px-3 py-1.5 text-xs font-medium
                    bg-blue-500 text-white rounded-md
                    hover:bg-blue-600 transition-colors
                    disabled:opacity-50 disabled:cursor-not-allowed
                  "
                >
                  Atualizar
                </button>
                <button
                  onClick={handleDismiss}
                  className="
                    px-3 py-1.5 text-xs font-medium
                    text-gray-600 border border-gray-300 rounded-md
                    hover:bg-gray-50 transition-colors
                  "
                >
                  Depois
                </button>
              </div>
            </>
          )}

          {isUpdating && (
            <div className="text-xs text-gray-600">
              Por favor, aguarde enquanto a atualização é aplicada...
            </div>
          )}
        </div>
      </div>
    </div>
  )
} 