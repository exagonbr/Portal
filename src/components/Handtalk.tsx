'use client'

import { useEffect, useState } from 'react';
import { HT } from '@/lib/handtalk';

interface HandtalkProps {
  token: string;
}

export function Handtalk({ token }: HandtalkProps): null {
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    if (!initialized && typeof window !== 'undefined') {
      try {
        // Inicializar o Handtalk com o token fornecido
        const htInstance = HT.getInstance({ token });
        
        // Verificar se o script foi carregado corretamente
        const checkScript = setInterval(() => {
          if (window.HT) {
            clearInterval(checkScript);
            console.log('✅ Handtalk: Script carregado com sucesso');
          }
        }, 1000);
        
        // Limpar o intervalo após 10 segundos para evitar loops infinitos
        setTimeout(() => clearInterval(checkScript), 10000);
        
        setInitialized(true);
      } catch (error) {
        console.error('❌ Erro ao inicializar Handtalk:', error);
      }
    }
  }, [token, initialized]);

  // Este componente não renderiza nada
  return null;
}

export default Handtalk; 