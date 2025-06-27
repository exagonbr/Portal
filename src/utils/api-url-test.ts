/**
 * Utilitário para testar se as URLs da API estão sendo construídas corretamente
 */

import { apiClient } from '@/lib/api-client';

// Interceptar as chamadas para verificar as URLs
const originalMakeRequest = (apiClient as any).makeRequest;

if (typeof window !== 'undefined') {
  console.log('🔍 Interceptando chamadas da API para verificar URLs...');
  
  // Mock da função makeRequest para capturar as URLs
  (apiClient as any).makeRequest = function(endpoint: string, options: any) {
    const fullUrl = this.buildURL(endpoint);
    
    // Verificar se há duplicação de /api
    if (fullUrl.includes('/api/api/')) {
      console.error('❌ URL DUPLICADA DETECTADA:', fullUrl);
      console.error('Endpoint original:', endpoint);
    } else {
      console.log('✅ URL correta:', fullUrl);
    }
    
    // Chamar a função original
    return originalMakeRequest.call(this, endpoint, options);
  };
}

/**
 * Testa as URLs que estavam causando problema
 */
export function testApiUrls() {
  console.group('🧪 TESTE DE URLs DA API');
  
  const endpoints = [
    'users/stats',
    'dashboard/analytics', 
    'dashboard/engagement',
    'dashboard/system'
  ];
  
  endpoints.forEach(endpoint => {
    try {
      // Simular chamada para capturar a URL
      console.log(`Testando endpoint: ${endpoint}`);
      
      // Usar o método buildURL diretamente se disponível
      const fullUrl = (apiClient as any).buildURL?.(endpoint) || `Não foi possível construir URL para ${endpoint}`;
      console.log(`URL construída: ${fullUrl}`);
      
      if (fullUrl.includes('/api/api/')) {
        console.error(`❌ PROBLEMA: URL duplicada para ${endpoint}`);
      } else {
        console.log(`✅ OK: URL correta para ${endpoint}`);
      }
    } catch (error) {
      console.error(`❌ Erro ao testar ${endpoint}:`, error);
    }
  });
  
  console.groupEnd();
}

// Executar teste automaticamente se estivermos no browser
if (typeof window !== 'undefined') {
  // Aguardar um pouco para garantir que tudo foi inicializado
  setTimeout(() => {
    testApiUrls();
  }, 1000);
} 