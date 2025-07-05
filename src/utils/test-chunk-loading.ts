/**
 * Utilitário para testar o carregamento de chunks e a funcionalidade de retry
 */

import { importApiClient, isChunkLoadError } from './chunk-retry';

/**
 * Testa o carregamento do api-client
 */
export async function testApiClientLoading(): Promise<boolean> {
  try {
    console.log('🧪 Testando carregamento do api-client...');
    
    const apiClientModule = await importApiClient();
    
    if (apiClientModule?.apiClient) {
      console.log('✅ Api-client carregado com sucesso');
      
      // Testar método básico
      const token = (apiClientModule.apiClient as any).getAuthToken?.() || null;
      console.log('🔑 Token atual:', token ? 'Presente' : 'Ausente');
      
      return true;
    } else {
      console.log('❌ Api-client não encontrado no módulo');
      return false;
    }
  } catch (error) {
    console.log('❌ Erro ao testar carregamento do api-client:', error);
    
    if (isChunkLoadError(error)) {
      console.log('🚨 Erro identificado como ChunkLoadError');
    }
    
    return false;
  }
}

/**
 * Simula um erro de chunk loading para testar o sistema de retry
 */
export async function simulateChunkError(): Promise<void> {
  const mockError = new Error('Loading chunk 123 failed');
  mockError.name = 'ChunkLoadError';
  
  console.log('🎭 Simulando ChunkLoadError:', mockError.message);
  
  const isChunkError = isChunkLoadError(mockError);
  console.log('🔍 Erro identificado como ChunkLoadError:', isChunkError);
  
  if (isChunkError) {
    console.log('✅ Sistema de detecção de ChunkLoadError funcionando');
  } else {
    console.log('❌ Sistema de detecção de ChunkLoadError com problema');
  }
}

/**
 * Executa todos os testes
 */
export async function runChunkTests(): Promise<void> {
  console.log('🚀 Iniciando testes de carregamento de chunks...');
  
  // Teste 1: Simular erro
  await simulateChunkError();
  
  // Teste 2: Carregar api-client
  const success = await testApiClientLoading();
  
  console.log('📊 Resultado dos testes:', success ? 'SUCESSO' : 'FALHA');
}

// Executar testes automaticamente em desenvolvimento
if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
  // Aguardar um pouco após o carregamento da página
  setTimeout(() => {
    runChunkTests().catch(console.log);
  }, 2000);
} 