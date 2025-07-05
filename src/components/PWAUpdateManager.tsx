'use client'

import { useState, useEffect, createContext, useContext } from 'react'
import { UpdateNotification } from './UpdateNotification'
import { PWAInstallPromptSubtle } from './PWAInstallPromptSubtle'

// Context para compartilhar estado de atualização
interface UpdateContextType {
  isUpdateAvailable: boolean
  isUpdating: boolean
  handleUpdate: () => void
}

const UpdateContext = createContext<UpdateContextType | null>(null)

export const useUpdateStatus = () => {
  const context = useContext(UpdateContext)
  if (!context) {
    throw new Error('useUpdateStatus deve ser usado dentro de UpdateProvider')
  }
  return context
}

export function UpdateProvider({ children }: { children: React.ReactNode }) {
  const [isUpdateAvailable, setIsUpdateAvailable] = useState(false)
  const [isUpdating, setIsUpdating] = useState(false)
  const [registration, setRegistration] = useState<ServiceWorkerRegistration | null>(null)

  useEffect(() => {
    if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
      // Registrar service worker
      navigator.serviceWorker.register('/sw.js')
        .then((reg) => {
          console.log('✅ Service Worker registrado com sucesso')
          setRegistration(reg)

          // Verificar por atualizações
          reg.addEventListener('updatefound', () => {
            const newWorker = reg.installing
            if (newWorker) {
              newWorker.addEventListener('statechange', () => {
                if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                  console.log('🔄 Nova versão disponível')
                  setIsUpdateAvailable(true)
                }
              })
            }
          })

          // Verificar por atualizações periodicamente
          setInterval(() => {
            reg.update()
          }, 60000) // Verificar a cada minuto
        })
        .catch((error) => {
          console.log('❌ Erro ao registrar Service Worker:', error)
        })

      // Escutar mensagens do service worker
      navigator.serviceWorker.addEventListener('message', (event) => {
        if (event.data && event.data.type === 'SKIP_WAITING') {
          setIsUpdateAvailable(true)
        }
      })
    }
  }, [])

  const handleUpdate = async () => {
    if (!registration) return

    setIsUpdating(true)

    try {
      // Instruir o service worker a pular a espera
      if (registration.waiting) {
        registration.waiting.postMessage({ type: 'SKIP_WAITING' })
      }

      // Aguardar um pouco para o service worker ser ativado
      setTimeout(() => {
        window.location.reload()
      }, 1000)
    } catch (error) {
      console.log('❌ Erro ao atualizar:', error)
      setIsUpdating(false)
    }
  }

  return (
    <UpdateContext.Provider value={{ isUpdateAvailable, isUpdating, handleUpdate }}>
      {children}
    </UpdateContext.Provider>
  )
}

export function PWAUpdateManager() {
  const { isUpdateAvailable, isUpdating, handleUpdate } = useUpdateStatus()
  const [registration, setRegistration] = useState<ServiceWorkerRegistration | null>(null)

  useEffect(() => {
    if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
      navigator.serviceWorker.getRegistration('/sw.js')
        .then((reg) => {
          if (reg) {
            setRegistration(reg)
          }
        })
    }
  }, [])

  return (
    <>
      <UpdateNotification
        isUpdateAvailable={isUpdateAvailable}
        onUpdate={handleUpdate}
        isUpdating={isUpdating}
        hideWhenCompactVisible={true}
      />
      <PWAInstallPromptSubtle registration={registration || undefined} />
    </>
  )
}
