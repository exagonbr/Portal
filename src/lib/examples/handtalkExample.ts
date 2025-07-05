import { HT } from '../handtalk';

/**
 * Exemplo de como inicializar o Handtalk em qualquer componente
 */

// Constante com o token de acesso
const HANDTALK_TOKEN = 'SEU_TOKEN_AQUI';

/**
 * Função para inicializar o Handtalk
 * Pode ser chamada em qualquer componente ou página
 */
export function initializeHandtalk(): void {
  // Usa o padrão Singleton para garantir que apenas uma instância do Handtalk seja criada
  HT.getInstance({ token: HANDTALK_TOKEN });
}

/**
 * Para inicializar em componentes/páginas Next.js, você pode usar isso em _app.tsx ou layout.tsx:
 * 
 * // Em _app.tsx ou no componente raiz
 * import { useEffect } from 'react';
 * import { initializeHandtalk } from '@/lib/examples/handtalkExample';
 * 
 * function MyApp({ Component, pageProps }) {
 *   useEffect(() => {
 *     // Inicializa o Handtalk apenas no lado do cliente
 *     initializeHandtalk();
 *   }, []);
 * 
 *   return <Component {...pageProps} />;
 * }
 */ 