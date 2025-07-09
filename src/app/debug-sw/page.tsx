'use client';

import { useState, useEffect } from 'react';
import styles from './debug-sw.module.css';

interface SWStatus {
  active: boolean;
  installing: boolean;
  waiting: boolean;
  scope: string;
  updateAvailable: boolean;
}

export default function ServiceWorkerDebugPage() {
  const [status, setStatus] = useState<SWStatus | null>(null);
  const [message, setMessage] = useState<string>('');
  const [cacheKeys, setCacheKeys] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  useEffect(() => {
    // Verificar se o navegador suporta Service Workers
    if (!('serviceWorker' in navigator)) {
      setMessage('Este navegador não suporta Service Workers');
      return;
    }

    // Carregar status inicial
    checkStatus();
    listCaches();
  }, []);

  const checkStatus = async () => {
    setIsLoading(true);
    try {
      if (typeof window !== 'undefined' && 'swUtils' in window) {
        const swStatus = await (window as any).swUtils.checkServiceWorkerStatus();
        setStatus(swStatus);
        setMessage(swStatus ? 'Status atualizado' : 'Service Worker não encontrado');
      } else {
        // Fallback se o script de utilidades não estiver carregado
        const registration = await navigator.serviceWorker.ready;
        const swStatus = {
          active: !!registration.active,
          installing: !!registration.installing,
          waiting: !!registration.waiting,
          scope: registration.scope,
          updateAvailable: !!registration.waiting,
        };
        setStatus(swStatus);
        setMessage('Status atualizado (modo fallback)');
      }
    } catch (error) {
      console.error('Erro ao verificar status:', error);
      setMessage(`Erro: ${error instanceof Error ? error.message : String(error)}`);
    } finally {
      setIsLoading(false);
    }
  };

  const listCaches = async () => {
    try {
      if ('caches' in window) {
        const keys = await window.caches.keys();
        setCacheKeys(keys);
      }
    } catch (error) {
      console.error('Erro ao listar caches:', error);
    }
  };

  const clearCache = async () => {
    setIsLoading(true);
    try {
      if (typeof window !== 'undefined' && 'swUtils' in window) {
        const result = await (window as any).swUtils.clearServiceWorkerCache();
        setMessage(result ? 'Cache limpo com sucesso' : 'Falha ao limpar cache');
      } else {
        // Fallback
        const cacheNames = await window.caches.keys();
        await Promise.all(
          cacheNames.map(cacheName => window.caches.delete(cacheName))
        );
        setMessage('Cache limpo com sucesso (modo fallback)');
      }
      await listCaches();
    } catch (error) {
      console.error('Erro ao limpar cache:', error);
      setMessage(`Erro: ${error instanceof Error ? error.message : String(error)}`);
    } finally {
      setIsLoading(false);
    }
  };

  const unregisterSW = async () => {
    setIsLoading(true);
    try {
      if (typeof window !== 'undefined' && 'swUtils' in window) {
        const result = await (window as any).swUtils.unregisterServiceWorkers();
        setMessage(result ? 'Service Workers desregistrados' : 'Falha ao desregistrar');
      } else {
        // Fallback
        const registrations = await navigator.serviceWorker.getRegistrations();
        await Promise.all(
          registrations.map(registration => registration.unregister())
        );
        setMessage('Service Workers desregistrados (modo fallback)');
      }
      setStatus(null);
    } catch (error) {
      console.error('Erro ao desregistrar SW:', error);
      setMessage(`Erro: ${error instanceof Error ? error.message : String(error)}`);
    } finally {
      setIsLoading(false);
    }
  };

  const updateSW = async () => {
    setIsLoading(true);
    try {
      if (typeof window !== 'undefined' && 'swUtils' in window) {
        const result = await (window as any).swUtils.updateServiceWorker();
        setMessage(result ? 'Atualização iniciada' : 'Nenhuma atualização disponível');
      } else {
        // Fallback
        const registration = await navigator.serviceWorker.ready;
        await registration.update();
        
        if (registration.waiting) {
          registration.waiting.postMessage({ type: 'SKIP_WAITING' });
          setMessage('Atualização iniciada (modo fallback)');
        } else {
          setMessage('Nenhuma atualização disponível (modo fallback)');
        }
      }
      await checkStatus();
    } catch (error) {
      console.error('Erro ao atualizar SW:', error);
      setMessage(`Erro: ${error instanceof Error ? error.message : String(error)}`);
    } finally {
      setIsLoading(false);
    }
  };

  const reloadPage = () => {
    window.location.reload();
  };

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Diagnóstico do Service Worker</h1>
      
      {message && (
        <div className={`${styles.message} ${message.includes('Erro') ? styles.error : styles.success}`}>
          {message}
        </div>
      )}
      
      <div className={styles.statusContainer}>
        <h2>Status Atual</h2>
        {status ? (
          <div className={styles.statusInfo}>
            <p><strong>Ativo:</strong> {status.active ? '✅ Sim' : '❌ Não'}</p>
            <p><strong>Instalando:</strong> {status.installing ? '✅ Sim' : '❌ Não'}</p>
            <p><strong>Aguardando:</strong> {status.waiting ? '✅ Sim' : '❌ Não'}</p>
            <p><strong>Escopo:</strong> {status.scope}</p>
            <p><strong>Atualização disponível:</strong> {status.updateAvailable ? '✅ Sim' : '❌ Não'}</p>
          </div>
        ) : (
          <p>Nenhum Service Worker ativo</p>
        )}
      </div>
      
      <div className={styles.cacheContainer}>
        <h2>Caches ({cacheKeys.length})</h2>
        {cacheKeys.length > 0 ? (
          <ul className={styles.cacheList}>
            {cacheKeys.map(key => (
              <li key={key}>{key}</li>
            ))}
          </ul>
        ) : (
          <p>Nenhum cache encontrado</p>
        )}
      </div>
      
      <div className={styles.actions}>
        <button 
          onClick={checkStatus} 
          disabled={isLoading} 
          className={styles.button}
        >
          Verificar Status
        </button>
        <button 
          onClick={clearCache} 
          disabled={isLoading || cacheKeys.length === 0} 
          className={styles.button}
        >
          Limpar Cache
        </button>
        <button 
          onClick={unregisterSW} 
          disabled={isLoading || !status} 
          className={`${styles.button} ${styles.warning}`}
        >
          Desregistrar SW
        </button>
        <button 
          onClick={updateSW} 
          disabled={isLoading || !status} 
          className={styles.button}
        >
          Atualizar SW
        </button>
        <button 
          onClick={reloadPage} 
          className={styles.button}
        >
          Recarregar Página
        </button>
      </div>
    </div>
  );
} 