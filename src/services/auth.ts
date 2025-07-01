// Função para obter o token de autenticação de múltiplas fontes
export const getAuthToken = (): string | null => {
  if (typeof window === 'undefined') return null;
  
  // 1. Tentar obter token de localStorage primeiro
  let token = localStorage.getItem('accessToken') || 
              localStorage.getItem('auth_token') || 
              localStorage.getItem('token') ||
              localStorage.getItem('authToken') ||
              sessionStorage.getItem('token') ||
              sessionStorage.getItem('auth_token');
  
  // 2. Se não encontrar no storage, tentar obter dos cookies
  if (!token) {
    const cookies = document.cookie.split(';');
    for (const cookie of cookies) {
      const [name, value] = cookie.trim().split('=');
      if (name === 'auth_token' || name === 'token' || name === 'authToken') {
        token = decodeURIComponent(value);
        break;
      }
    }
  }
  
  // 3. Como último recurso, tentar obter da sessão de usuário (se houver)
  if (!token) {
    try {
      const userCookie = document.cookie
        .split(';')
        .find(cookie => cookie.trim().startsWith('user_session='));
      
      if (userCookie) {
        const userSessionValue = userCookie.split('=')[1];
        const userData = JSON.parse(decodeURIComponent(userSessionValue));
        if (userData && userData.token) {
          token = userData.token;
        }
      }
    } catch (error) {
      console.warn('⚠️ Erro ao extrair token da sessão do usuário:', error);
    }
  }
  
  return token;
};

// Re-export outras funções do authService para centralizar autenticação
export { authService, login, logout, isAuthenticated } from './authService';
