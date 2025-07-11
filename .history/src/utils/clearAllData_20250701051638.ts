/**
 * Utilitário para limpeza completa de todos os dados do cliente
 * Usado quando há redirecionamento para login com erro de unauthorized
 */

/**
 * Limpa todos os dados do localStorage
 */
const clearLocalStorage = (): void => {
  if (typeof window === 'undefined') return;
  
  try {
    localStorage.clear();
    console.log('✅ localStorage limpo');
  } catch (error) {
    console.log('❌ Erro ao limpar localStorage:', error);
  }
};

/**
 * Limpa todos os dados do sessionStorage
 */
const clearSessionStorage = (): void => {
  if (typeof window === 'undefined') return;
  
  try {
    sessionStorage.clear();
    console.log('✅ sessionStorage limpo');
  } catch (error) {
    console.log('❌ Erro ao limpar sessionStorage:', error);
  }
};

/**
 * Limpa todos os cookies
 */
const clearAllCookies = (): void => {
  if (typeof window === 'undefined') return;
  
  try {
    // Obter todos os cookies
    const cookies = document.cookie.split(';');
    
    // Para cada cookie, definir sua expiração para uma data passada
    for (let cookie of cookies) {
      const eqPos = cookie.indexOf('=');
      const name = eqPos > -1 ? cookie.substr(0, eqPos).trim() : cookie.trim();
      
      if (name) {
        // Tentar diferentes combinações de path e domain para garantir remoção completa
        const domains = ['', window.location.hostname, `.${window.location.hostname}`];
        const paths = ['/', ''];
        
        domains.forEach(domain => {
          paths.forEach(path => {
            const domainPart = domain ? `;domain=${domain}` : '';
            const pathPart = path ? `;path=${path}` : '';
            document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT${pathPart}${domainPart}`;
          });
        });
      }
    }
    console.log('✅ Cookies limpos');
  } catch (error) {
    console.log('❌ Erro ao limpar cookies:', error);
  }
};

/**
 * Limpa todos os bancos de dados IndexedDB
 */
const clearIndexedDB = async (): Promise<void> => {
  if (typeof window === 'undefined' || !('indexedDB' in window)) return;
  
  try {
    // Obter lista de todos os bancos de dados
    if ('databases' in indexedDB) {
      const databases = await indexedDB.databases();
      
      // Deletar cada banco de dados
      const deletePromises = databases.map(db => {
        if (db.name) {
          return new Promise<void>((resolve, reject) => {
            const deleteReq = indexedDB.deleteDatabase(db.name!);
            deleteReq.onsuccess = () => {
              console.log(`✅ IndexedDB '${db.name}' deletado`);
              resolve();
            };
            deleteReq.onerror = () => {
              console.log(`❌ Erro ao deletar IndexedDB '${db.name}'`);
              reject(deleteReq.error);
            };
            deleteReq.onblocked = () => {
              console.warn(`⚠️ Deleção do IndexedDB '${db.name}' bloqueada`);
              // Tentar resolver mesmo assim após um timeout
              setTimeout(() => resolve(), 1000);
            };
          });
        }
        return Promise.resolve();
      });
      
      await Promise.allSettled(deletePromises);
    } else {
      // Fallback para navegadores mais antigos - tentar deletar bancos conhecidos
      const knownDatabases = [
        'sabercon-portal',
        'portal-cache',
        'user-data',
        'course-data',
        'offline-data'
      ];
      
      const deletePromises = knownDatabases.map(dbName => {
        return new Promise<void>((resolve) => {
          const deleteReq = indexedDB.deleteDatabase(dbName);
          deleteReq.onsuccess = () => {
            console.log(`✅ IndexedDB '${dbName}' deletado`);
            resolve();
          };
          deleteReq.onerror = () => {
            console.log(`ℹ️ IndexedDB '${dbName}' não existia ou erro ao deletar`);
            resolve(); // Não falhar se o banco não existir
          };
          deleteReq.onblocked = () => {
            console.warn(`⚠️ Deleção do IndexedDB '${dbName}' bloqueada`);
            setTimeout(() => resolve(), 1000);
          };
        });
      });
      
      await Promise.allSettled(deletePromises);
    }
    
    console.log('✅ IndexedDB limpo');
  } catch (error) {
    console.log('❌ Erro ao limpar IndexedDB:', error);
  }
};

/**
 * Limpa todos os caches do Service Worker
 */
const clearServiceWorkerCache = async (): Promise<void> => {
  if (typeof window === 'undefined' || !('caches' in window)) return;
  
  try {
    const cacheNames = await caches.keys();
    const deletePromises = cacheNames.map(cacheName => {
      return caches.delete(cacheName).then(success => {
        if (success) {
          console.log(`✅ Cache '${cacheName}' deletado`);
        } else {
          console.warn(`⚠️ Falha ao deletar cache '${cacheName}'`);
        }
      });
    });
    
    await Promise.allSettled(deletePromises);
    console.log('✅ Service Worker cache limpo');
  } catch (error) {
    console.log('❌ Erro ao limpar Service Worker cache:', error);
  }
};

/**
 * Limpa o cache do navegador (quando possível)
 */
const clearBrowserCache = async (): Promise<void> => {
  if (typeof window === 'undefined') return;
  
  try {
    // Tentar limpar cache usando a API de Storage
    if ('storage' in navigator && 'estimate' in navigator.storage) {
      // Não há uma API direta para limpar cache do navegador,
      // mas podemos tentar algumas estratégias
      
      // Recarregar a página com cache bypass
      if (window.location.search.includes('cache-cleared')) {
        console.log('✅ Cache do navegador bypass aplicado');
      }
    }
  } catch (error) {
    console.log('❌ Erro ao tentar limpar cache do navegador:', error);
  }
};

/**
 * Função principal para limpeza completa de todos os dados
 * Deve ser chamada antes de redirecionar para login com erro de unauthorized
 */
export const clearAllDataForUnauthorized = async (): Promise<void> => {
  console.log('🧹 Iniciando limpeza completa de dados para redirecionamento unauthorized...');
  
  try {
    // Executar limpezas em paralelo quando possível
    await Promise.allSettled([
      clearIndexedDB(),
      clearServiceWorkerCache(),
      clearBrowserCache()
    ]);
    
    // Executar limpezas síncronas
    clearLocalStorage();
    clearSessionStorage();
    clearAllCookies();
    
    console.log('✅ Limpeza completa de dados concluída');
  } catch (error) {
    console.log('❌ Erro durante limpeza completa de dados:', error);
    // Mesmo com erro, continuar com o redirecionamento
  }
};

/**
 * Função para limpeza rápida (apenas dados de autenticação)
 */
export const clearAuthDataOnly = (): void => {
  if (typeof window === 'undefined') return;
  
  console.log('🧹 Limpando apenas dados de autenticação...');
  
  try {
    // Limpar chaves específicas do localStorage
    const authKeys = [
      'auth_token',
      'session_id',
      'user',
      'user_data',
      'auth_expires_at',
      'refresh_token'
    ];
    
    authKeys.forEach(key => {
      localStorage.removeItem(key);
      sessionStorage.removeItem(key);
    });
    
    // Limpar cookies de autenticação
    const authCookies = [
      'auth_token',
      'session_id',
      'user_data',
      'refresh_token',
      'next-auth.session-token',
      'next-auth.csrf-token',
      '__Secure-next-auth.session-token',
      '__Host-next-auth.csrf-token'
    ];
    
    authCookies.forEach(cookieName => {
      const domains = ['', window.location.hostname, `.${window.location.hostname}`];
      const paths = ['/', ''];
      
      domains.forEach(domain => {
        paths.forEach(path => {
          const domainPart = domain ? `;domain=${domain}` : '';
          const pathPart = path ? `;path=${path}` : '';
          document.cookie = `${cookieName}=;expires=Thu, 01 Jan 1970 00:00:00 GMT${pathPart}${domainPart}`;
        });
      });
    });
    
    console.log('✅ Dados de autenticação limpos');
  } catch (error) {
    console.log('❌ Erro ao limpar dados de autenticação:', error);
  }
};

export default {
  clearAllDataForUnauthorized,
  clearAuthDataOnly
}; 