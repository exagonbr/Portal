'use client'

import React from 'react'
import { Check, AlertTriangle, X } from 'lucide-react'

interface NotificationMessagesProps {
  error: string | null
  success: string | null
  rateLimitWarning: boolean
  onClearError?: () => void
  onClearSuccess?: () => void
}

export const NotificationMessages: React.FC<NotificationMessagesProps> = ({
  error,
  success,
  rateLimitWarning,
  onClearError,
  onClearSuccess
}) => {
  return (
    <div className="space-y-4">
      {/* Mensagem de erro */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-start">
            <AlertTriangle className="h-5 w-5 text-red-600 mr-3 mt-0.5 flex-shrink-0" />
            <div className="flex-1">
              <h4 className="text-sm font-medium text-red-800 mb-1">
                Erro
              </h4>
              <p className="text-sm text-red-700">{error}</p>
            </div>
            {onClearError && (
              <button
                onClick={onClearError}
                className="ml-3 text-red-400 hover:text-red-600 transition-colors"
                title="Fechar"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>
      )}

      {/* Mensagem de sucesso */}
      {success && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-start">
            <Check className="h-5 w-5 text-green-600 mr-3 mt-0.5 flex-shrink-0" />
            <div className="flex-1">
              <h4 className="text-sm font-medium text-green-800 mb-1">
                Sucesso
              </h4>
              <p className="text-sm text-green-700">{success}</p>
            </div>
            {onClearSuccess && (
              <button
                onClick={onClearSuccess}
                className="ml-3 text-green-400 hover:text-green-600 transition-colors"
                title="Fechar"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>
      )}

      {/* Aviso de rate limiting */}
      {rateLimitWarning && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-start">
            <AlertTriangle className="h-5 w-5 text-yellow-600 mr-3 mt-0.5 flex-shrink-0" />
            <div className="flex-1">
              <h4 className="text-sm font-medium text-yellow-800 mb-1">
                Carregamento em andamento
              </h4>
              <p className="text-sm text-yellow-700">
                Os dados estão sendo carregados de forma sequencial para evitar sobrecarga do sistema. 
                Aguarde alguns segundos para ver todas as informações.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}