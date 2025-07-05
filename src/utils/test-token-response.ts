/**
 * Utilitário para testar a resposta da API de login e validar o token
 */

import { jwtDecode } from 'jwt-decode';

interface LoginResponse {
  success: boolean;
  message?: string;
  data?: {
    accessToken?: string;
    token?: string;
    refreshToken?: string;
    user?: any;
    expiresIn?: number;
  };
}

export async function testTokenResponse() {
  console.group('🧪 [TOKEN-TEST] Testando resposta da API de login');

  try {
    // 1. Fazer requisição para a API
    console.log('📡 Fazendo requisição para API de login...');
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'admin@sistema.com',
        password: 'admin123'
      })
    });

    console.log('📊 Status da resposta:', response.status);
    console.log('📊 Headers:', Object.fromEntries(response.headers.entries()));

    // 2. Parsear resposta
    const data: LoginResponse = await response.json();
    console.log('📦 Dados brutos da resposta:', data);

    if (!response.ok) {
      console.error('❌ Resposta não OK:', data);
      return;
    }

    if (!data.success) {
      console.error('❌ Login não foi bem-sucedido:', data.message);
      return;
    }

    // 3. Verificar estrutura da resposta
    console.log('🔍 Verificando estrutura da resposta...');
    console.log('- success:', data.success);
    console.log('- data existe:', !!data.data);
    console.log('- accessToken existe:', !!data.data?.accessToken);
    console.log('- token existe:', !!data.data?.token);
    console.log('- user existe:', !!data.data?.user);

    // 4. Extrair token (pode estar em accessToken ou token)
    const token = data.data?.accessToken || data.data?.token;
    
    if (!token) {
      console.error('❌ Nenhum token encontrado na resposta');
      console.log('📦 Estrutura data:', data.data);
      return;
    }

    console.log('✅ Token encontrado:', {
      length: token.length,
      preview: token.substring(0, 50) + '...',
      source: data.data?.accessToken ? 'accessToken' : 'token'
    });

    // 5. Verificar formato JWT
    console.log('🔍 Verificando formato JWT...');
    const parts = token.split('.');
    console.log('- Partes do token:', parts.length);
    
    if (parts.length !== 3) {
      console.error('❌ Token não tem formato JWT válido (deve ter 3 partes)');
      console.log('- Parte 1 (header):', parts[0]?.substring(0, 20) + '...');
      console.log('- Parte 2 (payload):', parts[1]?.substring(0, 20) + '...');
      console.log('- Parte 3 (signature):', parts[2]?.substring(0, 20) + '...');
      return;
    }

    // 6. Tentar decodificar o token
    console.log('🔓 Tentando decodificar token...');
    try {
      const decoded = jwtDecode(token);
      console.log('✅ Token decodificado com sucesso:', decoded);

      // Verificar campos obrigatórios
      const requiredFields = ['id', 'email', 'role'];
      const missingFields = requiredFields.filter(field => !(decoded as any)[field]);
      
      if (missingFields.length > 0) {
        console.warn('⚠️ Campos obrigatórios ausentes:', missingFields);
      } else {
        console.log('✅ Todos os campos obrigatórios presentes');
      }

      // Verificar expiração
      const exp = (decoded as any).exp;
      if (exp) {
        const expirationDate = new Date(exp * 1000);
        const isExpired = Date.now() >= exp * 1000;
        console.log('⏰ Expiração:', {
          timestamp: exp,
          date: expirationDate.toISOString(),
          isExpired,
          timeUntilExpiry: isExpired ? 'Expirado' : Math.floor((exp * 1000 - Date.now()) / 1000 / 60) + ' minutos'
        });
      } else {
        console.warn('⚠️ Token não tem campo de expiração');
      }

    } catch (decodeError) {
      console.error('❌ Erro ao decodificar token:', decodeError);
      
      // Tentar decodificar manualmente
      try {
        console.log('🔧 Tentando decodificação manual...');
        const payload = JSON.parse(atob(parts[1]));
        console.log('✅ Decodificação manual bem-sucedida:', payload);
      } catch (manualError) {
        console.error('❌ Decodificação manual também falhou:', manualError);
      }
    }

    // 7. Simular o que o AuthContext faz
    console.log('🎭 Simulando validação do AuthContext...');
    
    // Verificar se o token seria aceito pelo AuthContext
    const wouldBeAccepted = token && 
                           typeof token === 'string' && 
                           token.split('.').length === 3;
    
    console.log('🎯 Token seria aceito pelo AuthContext:', wouldBeAccepted);

    if (wouldBeAccepted) {
      console.log('✅ Token deveria funcionar no AuthContext');
      
      // Testar armazenamento
      try {
        localStorage.setItem('test_token', token);
        const retrieved = localStorage.getItem('test_token');
        const storageWorks = retrieved === token;
        console.log('💾 Teste de armazenamento:', storageWorks ? '✅' : '❌');
        localStorage.removeItem('test_token');
      } catch (storageError) {
        console.error('❌ Erro no teste de armazenamento:', storageError);
      }
    } else {
      console.error('❌ Token NÃO seria aceito pelo AuthContext');
    }

  } catch (error) {
    console.error('❌ Erro geral no teste:', error);
  } finally {
    console.groupEnd();
  }
}

// Tornar disponível globalmente
if (typeof window !== 'undefined') {
  (window as any).testTokenResponse = testTokenResponse;
  console.log('🔧 Função testTokenResponse() disponível globalmente');
}

export default testTokenResponse; 