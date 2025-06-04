'use client'

import { useState } from 'react'

interface NotificationPreferences {
  email: boolean
  push: boolean
  sms: boolean
  categories: {
    academic: boolean
    system: boolean
    social: boolean
    administrative: boolean
  }
}

export default function NotificationSettings() {
  const [isOpen, setIsOpen] = useState(false)
  const [preferences, setPreferences] = useState<NotificationPreferences>({
    email: true,
    push: true,
    sms: false,
    categories: {
      academic: true,
      system: true,
      social: false,
      administrative: true
    }
  })

  const handlePreferenceChange = (key: keyof NotificationPreferences, value: boolean) => {
    if (key === 'categories') return
    setPreferences(prev => ({ ...prev, [key]: value }))
  }

  const handleCategoryChange = (category: keyof NotificationPreferences['categories'], value: boolean) => {
    setPreferences(prev => ({
      ...prev,
      categories: {
        ...prev.categories,
        [category]: value
      }
    }))
  }

  const savePreferences = () => {
    // Aqui você salvaria as preferências no backend
    console.log('Salvando preferências:', preferences)
    setIsOpen(false)
  }

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="flex items-center space-x-2 px-4 py-2 text-sm text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
      >
        <span className="material-symbols-outlined text-sm">
          settings
        </span>
        <span>Configurações</span>
      </button>
    )
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-700">
              Configurações de Notificação
            </h3>
            <button
              onClick={() => setIsOpen(false)}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <span className="material-symbols-outlined text-gray-500">
                close
              </span>
            </button>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Métodos de Notificação */}
          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-3">
              Métodos de Notificação
            </h4>
            <div className="space-y-3">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={preferences.email}
                  onChange={(e) => handlePreferenceChange('email', e.target.checked)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <span className="ml-3 text-sm text-gray-700">Email</span>
              </label>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={preferences.push}
                  onChange={(e) => handlePreferenceChange('push', e.target.checked)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <span className="ml-3 text-sm text-gray-700">Notificações Push</span>
              </label>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={preferences.sms}
                  onChange={(e) => handlePreferenceChange('sms', e.target.checked)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <span className="ml-3 text-sm text-gray-700">SMS</span>
              </label>
            </div>
          </div>

          {/* Categorias */}
          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-3">
              Categorias de Notificação
            </h4>
            <div className="space-y-3">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={preferences.categories.academic}
                  onChange={(e) => handleCategoryChange('academic', e.target.checked)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <span className="ml-3 text-sm text-gray-700">Acadêmico</span>
              </label>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={preferences.categories.system}
                  onChange={(e) => handleCategoryChange('system', e.target.checked)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <span className="ml-3 text-sm text-gray-700">Sistema</span>
              </label>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={preferences.categories.social}
                  onChange={(e) => handleCategoryChange('social', e.target.checked)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <span className="ml-3 text-sm text-gray-700">Social</span>
              </label>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={preferences.categories.administrative}
                  onChange={(e) => handleCategoryChange('administrative', e.target.checked)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <span className="ml-3 text-sm text-gray-700">Administrativo</span>
              </label>
            </div>
          </div>
        </div>

        <div className="p-6 border-t border-gray-200 flex justify-end space-x-3">
          <button
            onClick={() => setIsOpen(false)}
            className="px-4 py-2 text-sm text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={savePreferences}
            className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Salvar
          </button>
        </div>
      </div>
    </div>
  )
}