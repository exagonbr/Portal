'use client';

import { useEffect, useState } from 'react';
import Script from 'next/script';

export default function ServiceWorkerDiagnostic() {
  const [status, setStatus] = useState<{
    swRegistered: boolean;
    swUtilsLoaded: boolean;
    swActive: boolean;
    swWaiting: boolean;
    swInstalling: boolean;
    swScope: string;
    caches: string[];
    scriptUrl: string;
    error: string | null;
    lastUpdated: string;
  }>({
    swRegistered: false,
    swUtilsLoaded: false,
    swActive: false,
    swWaiting: false,
    swInstalling: false,
    swScope: '',
    caches: [],
    scriptUrl: '',
    error: null,
    lastUpdated: '',
  });

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const checkStatus = async () => {
      try {
        // Verificar se o Service Worker está registrado
        const swRegistered = 'serviceWorker' in navigator;
        
        // Verificar se o swUtils está carregado
        const swUtilsLoaded = typeof window.swUtils !== 'undefined';
        
        // Verificar o status do Service Worker
        let swActive = false;
        let swWaiting = false;
        let swInstalling = false;
        let swScope = '';
        let scriptUrl = '';
        let caches: string[] = [];
        
        if (swRegistered) {
          const registration = await navigator.serviceWorker.getRegistration();
          if (registration) {
            swActive = !!registration.active;
            swWaiting = !!registration.waiting;
            swInstalling = !!registration.installing;
            swScope = registration.scope;
            
            if (registration.active) {
              scriptUrl = registration.active.scriptURL;
            }
          }
          
          // Listar caches
          if ('caches' in window) {
            caches = await window.caches.keys();
          }
        }
        
        setStatus({
          swRegistered,
          swUtilsLoaded,
          swActive,
          swWaiting,
          swInstalling,
          swScope,
          caches,
          scriptUrl,
          error: null,
          lastUpdated: new Date().toLocaleTimeString(),
        });
      } catch (error) {
        setStatus(prev => ({
          ...prev,
          error: error instanceof Error ? error.message : 'Erro desconhecido',
          lastUpdated: new Date().toLocaleTimeString(),
        }));
      }
    };
    
    // Verificar o status inicialmente
    checkStatus();
    
    // Verificar o status periodicamente
    const interval = setInterval(checkStatus, 5000);
    
    return () => {
      clearInterval(interval);
    };
  }, []);

  // Função para carregar manualmente o sw-utils.js
  const loadSwUtils = () => {
    const script = document.createElement('script');
    script.src = `/sw-utils.js?v=${Date.now()}`;
    document.head.appendChild(script);
  };

  // Função para registrar manualmente o Service Worker
  const registerSW = async () => {
    try {
      if ('serviceWorker' in navigator) {
        const registration = await navigator.serviceWorker.register('/worker.js', {
          scope: '/',
        });
        console.log('Service Worker registrado manualmente:', registration);
      }
    } catch (error) {
      console.error('Erro ao registrar Service Worker manualmente:', error);
    }
  };

  // Função para limpar todos os caches
  const clearCaches = async () => {
    try {
      if ('caches' in window) {
        const cacheNames = await window.caches.keys();
        await Promise.all(
          cacheNames.map(cacheName => window.caches.delete(cacheName))
        );
        console.log('Todos os caches foram limpos');
        
        // Atualizar o status
        setStatus(prev => ({
          ...prev,
          caches: [],
          lastUpdated: new Date().toLocaleTimeString(),
        }));
      }
    } catch (error) {
      console.error('Erro ao limpar caches:', error);
    }
  };

  // Função para desregistrar todos os Service Workers
  const unregisterSW = async () => {
    try {
      if ('serviceWorker' in navigator) {
        const registrations = await navigator.serviceWorker.getRegistrations();
        await Promise.all(
          registrations.map(registration => registration.unregister())
        );
        console.log('Service Workers desregistrados');
        
        // Atualizar o status
        setStatus(prev => ({
          ...prev,
          swActive: false,
          swWaiting: false,
          swInstalling: false,
          swScope: '',
          scriptUrl: '',
          lastUpdated: new Date().toLocaleTimeString(),
        }));
      }
    } catch (error) {
      console.error('Erro ao desregistrar Service Workers:', error);
    }
  };

  return (
    <div className="p-4 bg-gray-100 rounded-lg max-w-lg mx-auto my-8">
      <h2 className="text-xl font-bold mb-4">Diagnóstico do Service Worker</h2>
      
      <div className="mb-4 text-sm text-gray-500">
        Última atualização: {status.lastUpdated}
      </div>
      
      <div className="space-y-2 mb-4">
        <div className="flex justify-between">
          <span>Service Worker suportado:</span>
          <span className={status.swRegistered ? "text-green-600" : "text-red-600"}>
            {status.swRegistered ? "Sim" : "Não"}
          </span>
        </div>
        
        <div className="flex justify-between">
          <span>sw-utils.js carregado:</span>
          <span className={status.swUtilsLoaded ? "text-green-600" : "text-red-600"}>
            {status.swUtilsLoaded ? "Sim" : "Não"}
          </span>
        </div>
        
        <div className="flex justify-between">
          <span>Service Worker ativo:</span>
          <span className={status.swActive ? "text-green-600" : "text-red-600"}>
            {status.swActive ? "Sim" : "Não"}
          </span>
        </div>
        
        <div className="flex justify-between">
          <span>Service Worker aguardando:</span>
          <span className={status.swWaiting ? "text-yellow-600" : "text-gray-600"}>
            {status.swWaiting ? "Sim" : "Não"}
          </span>
        </div>
        
        <div className="flex justify-between">
          <span>Service Worker instalando:</span>
          <span className={status.swInstalling ? "text-blue-600" : "text-gray-600"}>
            {status.swInstalling ? "Sim" : "Não"}
          </span>
        </div>
        
        {status.swScope && (
          <div className="flex justify-between">
            <span>Escopo:</span>
            <span className="text-gray-800">{status.swScope}</span>
          </div>
        )}
        
        {status.scriptUrl && (
          <div className="flex justify-between">
            <span>Script URL:</span>
            <span className="text-gray-800 text-sm">{status.scriptUrl}</span>
          </div>
        )}
        
        {status.error && (
          <div className="bg-red-100 p-2 rounded text-red-700 mt-2">
            <strong>Erro:</strong> {status.error}
          </div>
        )}
      </div>
      
      <div className="mt-6 mb-4">
        <h3 className="font-bold mb-2">Caches ({status.caches.length})</h3>
        {status.caches.length > 0 ? (
          <ul className="bg-white rounded p-2 max-h-40 overflow-y-auto text-sm">
            {status.caches.map(cache => (
              <li key={cache} className="py-1 border-b border-gray-100 last:border-0">
                {cache}
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-gray-500 text-sm">Nenhum cache encontrado</p>
        )}
      </div>
      
      <div className="flex flex-wrap gap-2 mt-6">
        <button
          onClick={loadSwUtils}
          className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded text-sm"
        >
          Carregar sw-utils.js
        </button>
        
        <button
          onClick={registerSW}
          className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded text-sm"
        >
          Registrar SW
        </button>
        
        <button
          onClick={clearCaches}
          className="bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded text-sm"
          disabled={status.caches.length === 0}
        >
          Limpar Caches
        </button>
        
        <button
          onClick={unregisterSW}
          className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded text-sm"
          disabled={!status.swActive}
        >
          Desregistrar SW
        </button>
        
        <button
          onClick={() => window.location.reload()}
          className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded text-sm"
        >
          Recarregar Página
        </button>
      </div>

      {/* Carregar sw-utils.js usando Next.js Script */}
      <Script
        src="/sw-utils.js"
        strategy="lazyOnload"
        onLoad={() => {
          console.log('sw-utils.js carregado via Next.js Script');
          setStatus(prev => ({ ...prev, swUtilsLoaded: true }));
        }}
        onError={(e) => {
          console.error('Erro ao carregar sw-utils.js via Next.js Script:', e);
          setStatus(prev => ({ 
            ...prev, 
            error: 'Falha ao carregar sw-utils.js via Next.js Script' 
          }));
        }}
      />
    </div>
  );
}

// Adicionar declaração para TypeScript
declare global {
  interface Window {
    swUtils?: any;
  }
} 