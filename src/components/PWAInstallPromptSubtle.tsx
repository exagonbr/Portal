'use client'

import { useState, useEffect } from 'react'

interface PWAInstallPromptProps {
  registration?: ServiceWorkerRegistration
}

export function PWAInstallPromptSubtle({ registration }: PWAInstallPromptProps) {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null)
  const [showPrompt, setShowPrompt] = useState(false)
  const [isInstalling, setIsInstalling] = useState(false)
  const [isExpanded, setIsExpanded] = useState(false)

  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault()
      setDeferredPrompt(e)
      setShowPrompt(true)
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
    }
  }, [])

  const handleInstall = async () => {
    if (!deferredPrompt) return

    setIsInstalling(true)

    try {
      deferredPrompt.prompt()
      const { outcome } = await deferredPrompt.userChoice
      
      if (outcome === 'accepted') {
        console.log('✅ PWA instalado com sucesso')
      } else {
        console.log('❌ Instalação do PWA cancelada')
      }
      
      setDeferredPrompt(null)
      setShowPrompt(false)
    } catch (error) {
      console.error('❌ Erro ao instalar PWA:', error)
    } finally {
      setIsInstalling(false)
    }
  }

  const handleDismiss = () => {
    setShowPrompt(false)
    setDeferredPrompt(null)
  }

  if (!showPrompt) return null

  return (
    <div className="fixed bottom-4 right-4 z-50 transition-all duration-300 ease-in-out">
      <div 
        className={`
          bg-white border border-gray-200 rounded-lg shadow-lg
          ${isExpanded ? 'w-80' : 'w-14 h-14'}
          transition-all duration-300 ease-in-out
          hover:shadow-xl
        `}
        onMouseEnter={() => setIsExpanded(true)}
        onMouseLeave={() => setIsExpanded(false)}
      >
        {/* Ícone compacto */}
        <div className={`
          flex items-center justify-center
          ${isExpanded ? 'hidden' : 'w-14 h-14'}
        `}>
          {isInstalling ? (
            <div className="animate-spin rounded-full h-6 w-6 border-2 border-blue-500 border-t-transparent"></div>
          ) : (
            <div className="relative">
              <svg 
                className="w-7 h-7 text-blue-500" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" 
                />
              </svg>
              {/* Indicador de download */}
              <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full">
                <svg 
                  className="w-2 h-2 text-white ml-0.5 mt-0.5" 
                  fill="currentColor" 
                  viewBox="0 0 20 20"
                >
                  <path 
                    fillRule="evenodd" 
                    d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" 
                    clipRule="evenodd" 
                  />
                </svg>
              </div>
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
              {isInstalling ? (
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
                    d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" 
                  />
                </svg>
              )}
              <h3 className="text-sm font-medium text-gray-900">
                {isInstalling ? 'Instalando...' : 'Instalar App'}
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

          {!isInstalling && (
            <>
              <p className="text-xs text-gray-600 mb-3">
                Instale o app para uma experiência melhor e acesso offline.
              </p>
              <div className="flex space-x-2">
                <button
                  onClick={handleInstall}
                  disabled={isInstalling}
                  className="
                    flex-1 px-3 py-1.5 text-xs font-medium
                    bg-blue-500 text-white rounded-md
                    hover:bg-blue-600 transition-colors
                    disabled:opacity-50 disabled:cursor-not-allowed
                  "
                >
                  Instalar
                </button>
                <button
                  onClick={handleDismiss}
                  className="
                    px-3 py-1.5 text-xs font-medium
                    text-gray-600 border border-gray-300 rounded-md
                    hover:bg-gray-50 transition-colors
                  "
                >
                  Agora não
                </button>
              </div>
            </>
          )}

          {isInstalling && (
            <div className="text-xs text-gray-600">
              Preparando a instalação do aplicativo...
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
