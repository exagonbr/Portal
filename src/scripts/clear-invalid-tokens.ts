// Script para limpar tokens inválidos do localStorage
// Execute este script no console do navegador se estiver enfrentando problemas com tokens

export const clearInvalidTokensScript = () => {
  if (typeof window === 'undefined') {
    console.error('Este script deve ser executado no navegador');
    return;
  }

  console.group('🧹 Limpeza Manual de Tokens Inválidos');
  
  try {
    // Verificar token principal
    const accessToken = localStorage.getItem('accessToken');
    if (accessToken) {
      console.log('🔍 Token accessToken encontrado:', {
        length: accessToken.length,
        preview: accessToken.substring(0, 50) + '...'
      });
      
      const parts = accessToken.split('.');
      if (parts.length !== 3) {
        console.warn('❌ Token accessToken inválido (não tem 3 partes), removendo...');
        localStorage.removeItem('accessToken');
        console.log('✅ Token accessToken removido');
      } else {
        console.log('✅ Token accessToken tem formato válido');
      }
    }

    // Verificar outros tokens possíveis
    const otherTokenKeys = ['authToken', 'token', 'jwt', 'bearerToken'];
    otherTokenKeys.forEach(key => {
      const token = localStorage.getItem(key);
      if (token) {
        console.log(`🔍 Token ${key} encontrado, removendo...`);
        localStorage.removeItem(key);
        console.log(`✅ Token ${key} removido`);
      }
    });

    // Limpar dados relacionados à autenticação
    const authKeys = ['user', 'userData', 'authState', 'isAuthenticated'];
    authKeys.forEach(key => {
      if (localStorage.getItem(key)) {
        console.log(`🔍 Removendo ${key}...`);
        localStorage.removeItem(key);
      }
    });

    console.log('✅ Limpeza concluída. Recarregue a página.');
    
  } catch (error) {
    console.error('❌ Erro durante limpeza:', error);
  }
  
  console.groupEnd();
};

// Função para executar no console do navegador
export const runTokenCleanup = () => {
  clearInvalidTokensScript();
  
  // Recarregar a página após limpeza
  setTimeout(() => {
    window.location.reload();
  }, 1000);
};

// Tornar disponível globalmente para debug
if (typeof window !== 'undefined') {
  (window as any).clearInvalidTokens = clearInvalidTokensScript;
  (window as any).runTokenCleanup = runTokenCleanup;
} 