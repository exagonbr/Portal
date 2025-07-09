'use client';

import { useEffect } from 'react';

interface HandtalkInitializerProps {
  token: string;
}

export default function HandtalkInitializer({ token }: HandtalkInitializerProps) {
  useEffect(() => {
    // Garantir que o script do Handtalk foi carregado
    if (typeof window !== 'undefined' && window.HT) {
      window.ht = new window.HT({
        token: token,
        align: 'right', // posição do botão
        mobileBehavior: 'draggable', // comportamento em dispositivos móveis
        ytEmbedReplace: true, // substituir players do YouTube
      });
    }
  }, [token]);

  // Este componente não renderiza nada
  return null;
} 