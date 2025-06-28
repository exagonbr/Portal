/**
 * Serviço de Logout Ultra-Completo
 * Limpa TUDO TUDO TUDO e volta para o login
 */

export class UltraLogoutService {
  private static readonly CLEANUP_DELAY = 1000; // 1 segundo para garantir limpeza
  private static readonly MAX_CLEANUP_ATTEMPTS = 3;
  
  /**
   * LOGOUT ULTRA-COMPLETO - LIMPA TUDO E VOLTA PARA LOGIN
   */
  static async performUltraLogout(): Promise<void> {
    console.log('🚨 ULTRA LOGOUT: Iniciando limpeza TOTAL do sistema...');
    
    try {
      // Mostrar loading para o usuário
      this.showLogoutLoading();
      
      // Executar múltiplas tentativas de limpeza para garantir
      for (let attempt = 1; attempt <= this.MAX_CLEANUP_ATTEMPTS; attempt++) {
        console.log(`🔄 ULTRA LOGOUT: Tentativa ${attempt}/${this.MAX_CLEANUP_ATTEMPTS}`);
        await this.executeCompleteCleaning(attempt);
        
        // Aguardar entre tentativas
        if (attempt < this.MAX_CLEANUP_ATTEMPTS) {
          await new Promise(resolve => setTimeout(resolve, 200));
        }
      }
      
      // Notificar backend sobre logout
      await this.notifyBackendLogout();
      
      // Aguardar para garantir que tudo foi processado
      await new Promise(resolve => setTimeout(resolve, this.CLEANUP_DELAY));
      
      // Forçar redirecionamento para login
      await this.forceRedirectToLogin();
      
    } catch (error) {
      console.error('❌ ULTRA LOGOUT: Erro durante logout:', error);
      
      // Limpeza de emergência
      await this.emergencyCleanup();
      
      // Redirecionar mesmo com erro
      await this.forceRedirectToLogin();
    }
  }
  
  /**
   * Executa limpeza completa de dados
   */
  private static async executeCompleteCleaning(attempt: number): Promise<void> {
    console.log(`🧹 ULTRA LOGOUT: Limpeza completa - tentativa ${attempt}`);
    
    if (typeof window === 'undefined') return;
    
    // 1. LIMPAR LOCAL STORAGE COMPLETAMENTE
    await this.clearLocalStorage(attempt);
    
    // 2. LIMPAR SESSION STORAGE COMPLETAMENTE
    await this.clearSessionStorage(attempt);
    
    // 3. LIMPAR TODOS OS COOKIES
    await this.clearAllCookies(attempt);
    
    // 4. LIMPAR CACHES DO NAVEGADOR
    await this.clearBrowserCaches(attempt);
    
    // 5. LIMPAR INDEXED DB
    await this.clearIndexedDB(attempt);
    
    // 6. LIMPAR SERVICE WORKER CACHE
    await this.clearServiceWorkerCache(attempt);
    
    // 7. LIMPAR MEMÓRIA DE COMPONENTES
    await this.clearComponentMemory(attempt);
    
    // 8. LIMPAR HISTORY/STATE
    await this.clearBrowserHistory(attempt);
  }
  
  /**
   * Limpa localStorage completamente
   */
  private static async clearLocalStorage(attempt: number): Promise<void> {
    try {
      console.log(`🗂️ ULTRA LOGOUT: Limpando localStorage (tentativa ${attempt})`);
      
      // Primeiro, remover chaves específicas conhecidas
      const knownKeys = [
        'auth_token', 'refresh_token', 'session_id', 'user', 'user_data',
        'auth_expires_at', 'next-auth.session-token', 'next-auth.csrf-token',
        '__Secure-next-auth.session-token', '__Host-next-auth.csrf-token',
        'selectedRole', 'theme', 'user_preferences', 'cached_data', 'app_cache',
        'token', 'authToken', 'userData', 'userSession', 'loginData',
        'dashboard_data', 'courses_cache', 'books_cache', 'notifications_cache',
        'activity_cache', 'analytics_cache', 'settings_cache', 'profile_cache'
      ];
      
      knownKeys.forEach(key => {
        try {
          localStorage.removeItem(key);
        } catch (error) {
          console.warn(`⚠️ Erro ao remover ${key}:`, error);
        }
      });
      
      // Depois, fazer limpeza completa
      try {
        localStorage.clear();
      } catch (error) {
        console.warn('⚠️ Erro na limpeza completa do localStorage:', error);
      }
      
      // Verificar se realmente foi limpo
      if (localStorage.length > 0) {
        console.warn(`⚠️ localStorage ainda tem ${localStorage.length} itens, tentando limpeza forçada...`);
        
        // Limpeza forçada item por item
        const remainingKeys = Object.keys(localStorage);
        remainingKeys.forEach(key => {
          try {
            localStorage.removeItem(key);
          } catch (error) {
            console.warn(`⚠️ Erro ao forçar remoção de ${key}:`, error);
          }
        });
      }
      
      console.log('✅ localStorage limpo completamente');
    } catch (error) {
      console.error('❌ Erro crítico na limpeza do localStorage:', error);
    }
  }
  
  /**
   * Limpa sessionStorage completamente
   */
  private static async clearSessionStorage(attempt: number): Promise<void> {
    try {
      console.log(`🗂️ ULTRA LOGOUT: Limpando sessionStorage (tentativa ${attempt})`);
      
      // Limpeza direta
      sessionStorage.clear();
      
      // Verificar se foi limpo
      if (sessionStorage.length > 0) {
        console.warn(`⚠️ sessionStorage ainda tem ${sessionStorage.length} itens`);
        
        // Limpeza forçada
        const keys = Object.keys(sessionStorage);
        keys.forEach(key => {
          try {
            sessionStorage.removeItem(key);
          } catch (error) {
            console.warn(`⚠️ Erro ao remover ${key} do sessionStorage:`, error);
          }
        });
      }
      
      console.log('✅ sessionStorage limpo completamente');
    } catch (error) {
      console.error('❌ Erro na limpeza do sessionStorage:', error);
    }
  }
  
  /**
   * Limpa TODOS os cookies de TODAS as formas possíveis
   */
  private static async clearAllCookies(attempt: number): Promise<void> {
    try {
      console.log(`🍪 ULTRA LOGOUT: Limpando TODOS os cookies (tentativa ${attempt})`);
      
      const cookiesToClear = [
        'auth_token', 'refresh_token', 'session_id', 'user_data',
        'next-auth.session-token', 'next-auth.csrf-token',
        '__Secure-next-auth.session-token', '__Host-next-auth.csrf-token',
        'redirect_count', 'theme', 'user_preferences', 'token', 'authToken',
        'sessionId', 'userData', 'loginData', 'dashboard_prefs', 'app_settings'
      ];
      
      // Obter todos os cookies existentes também
      const existingCookies = document.cookie.split(';').map(cookie => {
        const [name] = cookie.trim().split('=');
        return name;
      }).filter(name => name);
      
      // Combinar listas e remover duplicatas
      const allCookies = Array.from(new Set([...cookiesToClear, ...existingCookies]));
      
      // Limpar cada cookie com TODAS as combinações possíveis
      allCookies.forEach(cookieName => {
        if (!cookieName) return;
        
        // Diferentes domínios
        const domains = [
          '', 
          window.location.hostname, 
          `.${window.location.hostname}`,
          'localhost',
          '.localhost'
        ];
        
        // Diferentes paths
        const paths = ['/', '', '/api', '/auth', '/dashboard'];
        
        // Diferentes configurações
        const configs = [
          '',
          ';secure',
          ';httponly',
          ';secure;httponly',
          ';samesite=lax',
          ';samesite=strict',
          ';samesite=none;secure'
        ];
        
        domains.forEach(domain => {
          paths.forEach(path => {
            configs.forEach(config => {
              try {
                const domainPart = domain ? `;domain=${domain}` : '';
                const pathPart = path ? `;path=${path}` : '';
                const expiresPart = ';expires=Thu, 01 Jan 1970 00:00:00 GMT';
                
                document.cookie = `${cookieName}=${expiresPart}${pathPart}${domainPart}${config}`;
              } catch (error) {
                // Ignorar erros de cookies individuais
              }
            });
          });
        });
      });
      
      console.log('✅ Todos os cookies limpos');
    } catch (error) {
      console.error('❌ Erro na limpeza de cookies:', error);
    }
  }
  
  /**
   * Limpa caches do navegador
   */
  private static async clearBrowserCaches(attempt: number): Promise<void> {
    try {
      console.log(`💾 ULTRA LOGOUT: Limpando caches do navegador (tentativa ${attempt})`);
      
      if ('caches' in window) {
        const cacheNames = await caches.keys();
        console.log(`🔍 Encontrados ${cacheNames.length} caches para limpar`);
        
        await Promise.all(
          cacheNames.map(async cacheName => {
            try {
              await caches.delete(cacheName);
              console.log(`✅ Cache ${cacheName} removido`);
            } catch (error) {
              console.warn(`⚠️ Erro ao remover cache ${cacheName}:`, error);
            }
          })
        );
      }
      
      console.log('✅ Caches do navegador limpos');
    } catch (error) {
      console.error('❌ Erro na limpeza de caches:', error);
    }
  }
  
  /**
   * Limpa IndexedDB
   */
  private static async clearIndexedDB(attempt: number): Promise<void> {
    try {
      console.log(`🗄️ ULTRA LOGOUT: Limpando IndexedDB (tentativa ${attempt})`);
      
      if ('indexedDB' in window) {
        // Databases conhecidos
        const dbNames = [
          'app_cache', 'user_data', 'offline_data', 'auth_cache',
          'dashboard_cache', 'courses_cache', 'books_cache', 'notifications_cache'
        ];
        
        for (const dbName of dbNames) {
          try {
            const deleteRequest = indexedDB.deleteDatabase(dbName);
            await new Promise((resolve, reject) => {
              deleteRequest.onsuccess = () => {
                console.log(`✅ IndexedDB ${dbName} removido`);
                resolve(undefined);
              };
              deleteRequest.onerror = () => {
                console.warn(`⚠️ Erro ao remover IndexedDB ${dbName}`);
                resolve(undefined); // Não falhar por causa de um DB
              };
              deleteRequest.onblocked = () => {
                console.warn(`⚠️ Remoção do IndexedDB ${dbName} bloqueada`);
                resolve(undefined);
              };
            });
          } catch (error) {
            console.warn(`⚠️ Erro ao processar IndexedDB ${dbName}:`, error);
          }
        }
      }
      
      console.log('✅ IndexedDB limpo');
    } catch (error) {
      console.error('❌ Erro na limpeza do IndexedDB:', error);
    }
  }
  
  /**
   * Limpa cache do Service Worker
   */
  private static async clearServiceWorkerCache(attempt: number): Promise<void> {
    try {
      console.log(`⚙️ ULTRA LOGOUT: Limpando Service Worker cache (tentativa ${attempt})`);
      
      if ('serviceWorker' in navigator) {
        // Notificar Service Worker para limpar cache
        if (navigator.serviceWorker.controller) {
          navigator.serviceWorker.controller.postMessage({
            type: 'CLEAR_ALL_CACHE',
            payload: { 
              reason: 'ultra_logout',
              timestamp: Date.now(),
              attempt 
            }
          });
        }
        
        // Tentar desregistrar todos os Service Workers
        const registrations = await navigator.serviceWorker.getRegistrations();
        for (const registration of registrations) {
          try {
            await registration.unregister();
            console.log('✅ Service Worker desregistrado');
          } catch (error) {
            console.warn('⚠️ Erro ao desregistrar Service Worker:', error);
          }
        }
      }
      
      console.log('✅ Service Worker cache limpo');
    } catch (error) {
      console.error('❌ Erro na limpeza do Service Worker:', error);
    }
  }
  
  /**
   * Limpa memória de componentes React
   */
  private static async clearComponentMemory(attempt: number): Promise<void> {
    try {
      console.log(`🧠 ULTRA LOGOUT: Limpando memória de componentes (tentativa ${attempt})`);
      
      // Limpar variáveis globais relacionadas à autenticação
      if (typeof window !== 'undefined') {
        const globalVarsToClean = [
          'authData', 'userData', 'currentUser', 'sessionData',
          'dashboardData', 'courseData', 'bookData', 'notificationData'
        ];
        
        globalVarsToClean.forEach(varName => {
          try {
            if ((window as any)[varName]) {
              delete (window as any)[varName];
            }
          } catch (error) {
            console.warn(`⚠️ Erro ao limpar variável global ${varName}:`, error);
          }
        });
        
        // Forçar garbage collection se disponível
        if ((window as any).gc) {
          try {
            (window as any).gc();
            console.log('✅ Garbage collection forçado');
          } catch (error) {
            console.warn('⚠️ Erro no garbage collection:', error);
          }
        }
      }
      
      console.log('✅ Memória de componentes limpa');
    } catch (error) {
      console.error('❌ Erro na limpeza da memória:', error);
    }
  }
  
  /**
   * Limpa histórico e estado do navegador
   */
  private static async clearBrowserHistory(attempt: number): Promise<void> {
    try {
      console.log(`📜 ULTRA LOGOUT: Limpando estado do navegador (tentativa ${attempt})`);
      
      // Limpar state do history se possível
      if (window.history && window.history.replaceState) {
        try {
          window.history.replaceState(null, '', '/login');
          console.log('✅ History state limpo');
        } catch (error) {
          console.warn('⚠️ Erro ao limpar history state:', error);
        }
      }
      
      console.log('✅ Estado do navegador limpo');
    } catch (error) {
      console.error('❌ Erro na limpeza do estado do navegador:', error);
    }
  }
  
  /**
   * Notifica backend sobre logout
   */
  private static async notifyBackendLogout(): Promise<void> {
    try {
      console.log('📡 ULTRA LOGOUT: Notificando backend...');
      
      // Tentar múltiplas URLs de logout
      const logoutUrls = [
        '/api/auth/logout',
        '/api/logout',
        '/auth/logout'
      ];
      
      for (const url of logoutUrls) {
        try {
          const response = await fetch(url, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            credentials: 'include',
          });
          
          if (response.ok) {
            console.log(`✅ Backend notificado via ${url}`);
            break;
          }
        } catch (error) {
          console.warn(`⚠️ Erro ao notificar backend via ${url}:`, error);
        }
      }
    } catch (error) {
      console.error('❌ Erro na notificação do backend:', error);
    }
  }
  
  /**
   * Limpeza de emergência
   */
  private static async emergencyCleanup(): Promise<void> {
    console.log('🚨 ULTRA LOGOUT: Executando limpeza de emergência...');
    
    try {
      if (typeof window !== 'undefined') {
        // Limpeza brutal
        localStorage.clear();
        sessionStorage.clear();
        
        // Limpar cookies principais
        const mainCookies = ['auth_token', 'session_id', 'user_data'];
        mainCookies.forEach(cookie => {
          document.cookie = `${cookie}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/`;
        });
        
        console.log('✅ Limpeza de emergência concluída');
      }
    } catch (error) {
      console.error('❌ Erro na limpeza de emergência:', error);
    }
  }
  
  /**
   * Força redirecionamento para login
   */
  private static async forceRedirectToLogin(): Promise<void> {
    console.log('🎯 ULTRA LOGOUT: Forçando redirecionamento para login...');
    
    try {
      // Aguardar um pouco para garantir que limpeza foi processada
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Múltiplas tentativas de redirecionamento
      const redirectMethods = [
        () => window.location.href = '/login?logout=ultra_complete',
        () => window.location.replace('/login?logout=ultra_complete'),
        () => window.location.assign('/login?logout=ultra_complete'),
        () => {
          if (window.history) {
            window.history.pushState(null, '', '/login?logout=ultra_complete');
            window.location.reload();
          }
        }
      ];
      
      for (const method of redirectMethods) {
        try {
          method();
          break;
        } catch (error) {
          console.warn('⚠️ Método de redirecionamento falhou:', error);
        }
      }
      
    } catch (error) {
      console.error('❌ Erro no redirecionamento:', error);
      // Fallback final
      if (typeof window !== 'undefined') {
        window.location.href = '/login';
      }
    }
  }
  
  /**
   * Mostra loading durante logout
   */
  private static showLogoutLoading(): void {
    try {
      if (typeof document !== 'undefined') {
        // Criar overlay de loading com blur
        const overlay = document.createElement('div');
        overlay.id = 'ultra-logout-overlay';
        overlay.style.cssText = `
          position: fixed;
          top: 0;
          left: 0;
          width: 100vw;
          height: 100vh;
          background: rgba(0, 0, 0, 0.4);
          backdrop-filter: blur(10px);
          -webkit-backdrop-filter: blur(10px);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 999999;
          color: white;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
          font-size: 18px;
          animation: fadeIn 0.3s ease-in-out;
        `;
        
        // Adicionar estilos de animação
        const style = document.createElement('style');
        style.textContent = `
          @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
          }
          
          @keyframes pulse {
            0% { transform: scale(1); opacity: 1; }
            50% { transform: scale(1.1); opacity: 0.8; }
            100% { transform: scale(1); opacity: 1; }
          }
          
          @keyframes rotate {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
          
          .logout-icon-container {
            width: 80px;
            height: 80px;
            margin: 0 auto 24px;
            position: relative;
          }
          
          .logout-icon-bg {
            position: absolute;
            width: 100%;
            height: 100%;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            border-radius: 50%;
            animation: pulse 2s ease-in-out infinite;
          }
          
          .logout-icon {
            position: absolute;
            width: 100%;
            height: 100%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 36px;
          }
          
          .logout-spinner {
            position: absolute;
            width: 100%;
            height: 100%;
            border: 3px solid transparent;
            border-top-color: rgba(255, 255, 255, 0.3);
            border-radius: 50%;
            animation: rotate 1.5s linear infinite;
          }
        `;
        document.head.appendChild(style);
        
        overlay.innerHTML = `
          <div style="
            text-align: center;
            background: rgba(255, 255, 255, 0.1);
            backdrop-filter: blur(20px);
            -webkit-backdrop-filter: blur(20px);
            padding: 48px 64px;
            border-radius: 24px;
            box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
            border: 1px solid rgba(255, 255, 255, 0.2);
          ">
            <div class="logout-icon-container">
              <div class="logout-icon-bg"></div>
              <div class="logout-icon">🚪</div>
              <div class="logout-spinner"></div>
            </div>
            <div style="font-size: 24px; font-weight: 600; margin-bottom: 12px;">
              Fazendo logout e limpando dados...
            </div>
            <div style="font-size: 16px; opacity: 0.8; font-weight: 400;">
              Por favor, aguarde enquanto preparamos tudo
            </div>
            <div style="margin-top: 24px;">
              <div style="
                width: 200px;
                height: 4px;
                background: rgba(255, 255, 255, 0.2);
                border-radius: 2px;
                margin: 0 auto;
                overflow: hidden;
              ">
                <div style="
                  width: 100%;
                  height: 100%;
                  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.8), transparent);
                  animation: shimmer 1.5s ease-in-out infinite;
                "></div>
              </div>
            </div>
          </div>
          
          <style>
            @keyframes shimmer {
              0% { transform: translateX(-100%); }
              100% { transform: translateX(100%); }
            }
          </style>
        `;
        
        document.body.appendChild(overlay);
      }
    } catch (error) {
      console.warn('⚠️ Erro ao mostrar loading:', error);
    }
  }
}

/**
 * Função de conveniência para uso direto
 */
export const performUltraLogout = () => UltraLogoutService.performUltraLogout(); 