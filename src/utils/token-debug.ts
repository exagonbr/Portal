// Utilitário para diagnosticar problemas com tokens JWT
export const debugToken = (token: string | null) => {
  console.group('🔍 Token Debug');
  
  if (!token) {
    console.warn('❌ Token não fornecido ou é nulo');
    console.groupEnd();
    return;
  }

  if (typeof token !== 'string') {
    console.warn('❌ Token não é uma string:', typeof token);
    console.groupEnd();
    return;
  }

  console.log('📋 Token Info:', {
    length: token.length,
    type: typeof token,
    preview: token.substring(0, 100) + '...'
  });

  // Verificar formato JWT
  const parts = token.split('.');
  console.log('🔧 Token Parts:', {
    total: parts.length,
    expected: 3,
    isValidFormat: parts.length === 3
  });

  if (parts.length !== 3) {
    console.warn('❌ Token não tem formato JWT válido');
    console.log('📝 Partes encontradas:', parts.map((part, index) => ({
      index,
      length: part.length,
      preview: part.substring(0, 50) + '...'
    })));
    console.groupEnd();
    return;
  }

  // Tentar decodificar cada parte
  try {
    const header = JSON.parse(atob(parts[0]));
    console.log('✅ Header decodificado:', header);
  } catch (error) {
    console.error('❌ Erro ao decodificar header:', error);
  }

  try {
    const payload = JSON.parse(atob(parts[1]));
    console.log('✅ Payload decodificado:', payload);
    
    // Verificar expiração
    if (payload.exp) {
      const expirationDate = new Date(payload.exp * 1000);
      const now = new Date();
      const isExpired = expirationDate < now;
      
      console.log('⏰ Expiração:', {
        exp: payload.exp,
        expirationDate: expirationDate.toISOString(),
        now: now.toISOString(),
        isExpired,
        timeLeft: isExpired ? 'Expirado' : `${Math.round((expirationDate.getTime() - now.getTime()) / 1000 / 60)} minutos`
      });
    }
  } catch (error) {
    console.error('❌ Erro ao decodificar payload:', error);
  }

  console.groupEnd();
};

// Função para limpar localStorage e mostrar tokens problemáticos
export const cleanupTokens = () => {
  if (typeof window === 'undefined') return;
  
  console.group('🧹 Limpeza de Tokens');
  
  try {
    const token = localStorage.getItem('accessToken');
    if (token) {
      console.log('🔍 Token encontrado no localStorage');
      debugToken(token);
      
      // Verificar se é válido
      const parts = token.split('.');
      if (parts.length !== 3) {
        console.warn('❌ Token inválido encontrado, removendo...');
        localStorage.removeItem('accessToken');
        console.log('✅ Token inválido removido');
      } else {
        console.log('✅ Token tem formato válido');
      }
    } else {
      console.log('ℹ️ Nenhum token encontrado no localStorage');
    }
  } catch (error) {
    console.error('❌ Erro durante limpeza:', error);
  }
  
  console.groupEnd();
};

// Função para verificar múltiplas fontes de token
export const checkAllTokenSources = () => {
  if (typeof window === 'undefined') return;
  
  console.group('🔍 Verificação de Todas as Fontes de Token');
  
  const sources = [
    'accessToken',
    'authToken',
    'token',
    'jwt',
    'bearerToken'
  ];
  
  sources.forEach(key => {
    const value = localStorage.getItem(key);
    if (value) {
      console.log(`📋 ${key}:`, {
        exists: true,
        length: value.length,
        preview: value.substring(0, 50) + '...'
      });
    } else {
      console.log(`📋 ${key}: não encontrado`);
    }
  });
  
  console.groupEnd();
}; 