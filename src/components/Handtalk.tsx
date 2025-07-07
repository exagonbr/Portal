'use client'

import { useEffect } from 'react';
import Script from 'next/script';

interface HandtalkProps {
  token: string;
}

export default function Handtalk({ token }: HandtalkProps) {
  useEffect(() => {
    // Inicializar o Handtalk quando o script estiver carregado
    const initHandtalk = () => {
      if (typeof window !== 'undefined' && window.HT) {
        window.ht = new window.HT({
          token: token,
          align: 'right',
          mobileBehavior: 'draggable',
          ytEmbedReplace: true,
        });
      }
    };

    // Verificar se o script já foi carregado
    if (typeof window !== 'undefined' && window.HT) {
      initHandtalk();
    } else {
      // Adicionar um listener para quando o script for carregado
      window.addEventListener('handtalk-ready', initHandtalk);
      
      // Limpar o listener quando o componente for desmontado
      return () => {
        window.removeEventListener('handtalk-ready', initHandtalk);
      };
    }
  }, [token]);

  return (
    <>
      <Script
        id="handtalk-script"
        src="https://plugin.handtalk.me/web/latest/handtalk.min.js"
        strategy="afterInteractive"
        onLoad={() => {
          // Disparar evento quando o script estiver carregado
          if (typeof window !== 'undefined') {
            const event = new Event('handtalk-ready');
            window.dispatchEvent(event);
          }
        }}
      />
    </>
  );
} 