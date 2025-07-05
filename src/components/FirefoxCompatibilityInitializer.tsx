'use client';

import { useEffect } from 'react';
import { initFirefoxCompatibility, isFirefox } from '@/utils/firefox-compatibility';

/**
 * Componente que inicializa a compatibilidade com Firefox
 * Deve ser carregado uma vez no layout principal
 */
export function FirefoxCompatibilityInitializer() {
  useEffect(() => {
    // Inicializar compatibilidade com Firefox
    initFirefoxCompatibility();

    // Log para debugging
    if (isFirefox()) {
      console.log('🦊 Firefox detectado - Compatibilidade ativada');
      console.log('🔧 Configurações aplicadas:');
      console.log('  - AbortController removido de requisições');
      console.log('  - Timeout aumentado para 45 segundos');
      console.log('  - Retry automático com 5 tentativas');
      console.log('  - Headers otimizados para cache');
      console.log('  - Interceptação de erros NS_BINDING_ABORTED');
    }
  }, []);

  // Este componente não renderiza nada
  return null;
}

export default FirefoxCompatibilityInitializer; 