'use client'

import { useState, useEffect } from 'react'
import { UpdateNotification } from './UpdateNotification'
import { PWAInstallPromptSubtle } from './PWAInstallPromptSubtle'

export function PWAUpdateManager() {
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
          console.error('❌ Erro ao registrar Service Worker:', error)
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
      console.error('❌ Erro ao atualizar:', error)
      setIsUpdating(false)
    }
  }

  return (
    <>
      <UpdateNotification
        isUpdateAvailable={isUpdateAvailable}
        onUpdate={handleUpdate}
        isUpdating={isUpdating}
      />
      <PWAInstallPromptSubtle registration={registration || undefined} />
    </>
  )
}
