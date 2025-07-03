'use client';

import { useEffect, useState } from 'react';
import { Workbox } from 'workbox-window';
import { PWAInstallPrompt } from './PWAInstallPrompt';
import { IOSInstallBanner } from './IOSInstallBanner';
import { OfflineIndicator } from './OfflineIndicator';
import { startPWALoopMonitoring, isPWALoopActive, emergencyPWAFix } from '@/utils/pwa-fix';
import { setupRequestLoopDetection, setupLoginLoopProtection } from '@/utils/request-loop-detector';

export function PWARegistration() {
  const [isOnline, setIsOnline] = useState(true);
  const [isUpdateAvailable, setIsUpdateAvailable] = useState(false);
  const [registration, setRegistration] = useState<ServiceWorkerRegistration | null>(null);
  const [workbox, setWorkbox] = useState<Workbox | null>(null);
  const [loopDetected, setLoopDetected] = useState(false);
  const [swRedundant, setSwRedundant] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [updateProgress, setUpdateProgress] = useState(0);

  useEffect(() => {
    const registerSW = async () => {
      // 1. Configurar proteções contra loops ANTES de qualquer coisa
      setupRequestLoopDetection();
      setupLoginLoopProtection();
      startPWALoopMonitoring();

      // 2. Verificar se há loop ativo antes de prosseguir
      if (isPWALoopActive()) {
        console.warn('🚨 Loop PWA detectado, executando correção de emergência...');
        setLoopDetected(true);
        await emergencyPWAFix();
        return;
      }

      // 3. Registrar Service Worker com proteções
      if ('serviceWorker' in navigator) {
        const wb = new Workbox('/sw.js');

        // Add event listeners for service worker updates
        wb.addEventListener('installed', (event) => {
          if (event.isUpdate) {
            setIsUpdateAvailable(true);
            // Iniciar atualização automática após 3 segundos
            setTimeout(() => {
              handleAutoUpdate();
            }, 3000);
          }
        });

        wb.addEventListener('waiting', () => {
          setIsUpdateAvailable(true);
          // Iniciar atualização automática após 3 segundos
          setTimeout(() => {
            handleAutoUpdate();
          }, 3000);
        });

        // Adicionar listener para detectar problemas
        wb.addEventListener('redundant', () => {
          setSwRedundant(true);
          
          // Verificar se há um novo service worker disponível
          if (navigator.serviceWorker.controller) {
            setIsUpdateAvailable(true);
            setTimeout(() => {
              handleAutoUpdate();
            }, 3000);
          } else {
            console.warn('🚨 Service Worker redundante sem substituto, pode ser necessário recarregar');
          }
        });

        // Register the service worker com timeout
        const registrationPromise = wb.register();
        const timeoutPromise = new Promise((_, reject) => {
          setTimeout(() => reject(new Error('Service Worker registration timeout')), 10000);
        });

        const reg = await Promise.race([registrationPromise, timeoutPromise]) as ServiceWorkerRegistration;
        
        if (reg) {
          setRegistration(reg);
          setWorkbox(wb);
        }
      }
    };
        
    registerSW();

    // Set up online/offline detection
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Set initial online status
    setIsOnline(navigator.onLine);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const handleAutoUpdate = async () => {
    if (!workbox || isUpdating) return;

    setIsUpdating(true);
    setUpdateProgress(0);

    try {
      // Preservar configurações importantes do localStorage antes da atualização
      const pwaInstalled = localStorage.getItem('pwa-installed');
      const pwaPromptNeverShow = localStorage.getItem('pwa-prompt-never-show');
      const pwaPromptInteracted = localStorage.getItem('pwa-prompt-interacted');
      
      // Marcar que uma atualização está em progresso
      localStorage.setItem('pwa-updating', 'true');
      
      // Simular progresso da atualização
      const progressInterval = setInterval(() => {
        setUpdateProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 200);

      await workbox.messageSkipWaiting();
      
      // Completar progresso
      setUpdateProgress(100);
      
      // Restaurar configurações importantes após a atualização
      if (pwaInstalled) localStorage.setItem('pwa-installed', pwaInstalled);
      if (pwaPromptNeverShow) localStorage.setItem('pwa-prompt-never-show', pwaPromptNeverShow);
      if (pwaPromptInteracted) localStorage.setItem('pwa-prompt-interacted', pwaPromptInteracted);
      
      // Aguardar um pouco para mostrar 100% antes de recarregar
      setTimeout(() => {
        window.location.reload();
      }, 500);
      
    } catch (error) {
      console.log('Failed to update service worker:', error);
      setIsUpdating(false);
      setUpdateProgress(0);
      // Remover flag de atualização em caso de erro
      localStorage.removeItem('pwa-updating');
    }
  };

  const handleManualUpdate = async () => {
    await handleAutoUpdate();
  };

  return (
    <>
      <IOSInstallBanner />
      <OfflineIndicator isOnline={isOnline} />

      {loopDetected && (
        <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 p-4 bg-red-500 text-white rounded-lg shadow-lg border border-red-600 max-w-md">
          <div className="flex items-center space-x-2">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
            <p className="text-sm font-medium">
              Loop PWA detectado - Aplicando correção...
            </p>
          </div>
          <p className="text-xs mt-1 opacity-90">
            A página será recarregada automaticamente
          </p>
        </div>
      )}

      {/* Atualização automática com visual elegante */}
      {(isUpdateAvailable || isUpdating) && (
        <div className="fixed bottom-20 right-4 z-[60] max-w-sm">
          <div className={`
            relative bg-gradient-to-r from-blue-500 via-indigo-600 to-blue-500 
            text-white rounded-2xl shadow-2xl overflow-hidden
            transform transition-all duration-300 hover:scale-105
            border border-white/20 backdrop-blur-sm
          `}>
            {/* Efeito de brilho animado */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -skew-x-12 animate-shimmer" />
            
            {/* Efeito de onda na parte inferior */}
            <div className="absolute bottom-0 left-0 right-0 h-12 opacity-20">
              <div className="absolute inset-0 bg-white rounded-t-full translate-y-6 animate-wave-slow"></div>
              <div className="absolute inset-0 bg-white rounded-t-full translate-y-6 translate-x-8 animate-wave-fast"></div>
            </div>
            
            <div className="p-5 relative">
              <div className="flex items-center gap-4 mb-3">
                <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent"></div>
                  {isUpdating ? (
                    <div className="animate-spin rounded-full h-6 w-6 border-2 border-white border-t-transparent relative z-10" />
                  ) : (
                    <svg className="w-6 h-6 relative z-10" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
                    </svg>
                  )}
                </div>
                <div>
                  <h3 className="font-bold text-lg text-white">
                    {isUpdating ? 'Atualizando...' : 'Nova versão disponível!'}
                  </h3>
                  <p className="text-sm opacity-90 text-white">
                    {isUpdating ? 'Aplicando melhorias' : 'Atualização automática em 3s'}
                  </p>
                </div>
              </div>
              
              {/* Barra de progresso */}
              {isUpdating && (
                <div className="mb-4">
                  <div className="w-full bg-white/20 rounded-full h-2 overflow-hidden">
                    <div 
                      className="bg-white h-full rounded-full transition-all duration-300 ease-out"
                      style={{ width: `${updateProgress}%` }}
                    />
                  </div>
                  <p className="text-xs text-white/80 mt-1 text-center">
                    {updateProgress}% concluído
                  </p>
                </div>
              )}
              
              {/* Botão de ação manual (só aparece se não estiver atualizando) */}
              {!isUpdating && (
                <button
                  onClick={handleManualUpdate}
                  className="w-full px-4 py-3 bg-white text-blue-600 font-bold 
                           rounded-xl hover:bg-gray-50 transition-all duration-300 
                           transform hover:scale-[1.02] active:scale-[0.98]
                           shadow-lg hover:shadow-xl relative overflow-hidden group"
                >
                  {/* Efeito de brilho no hover */}
                  <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-blue-100 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                  
                  <span className="flex items-center justify-center gap-3 relative z-10">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
                    </svg>
                    Atualizar Agora
                  </span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      <PWAInstallPrompt registration={registration} />
    </>
  );
}
