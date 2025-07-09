import './globals.css'
import { Inter } from 'next/font/google'
import GlobalStyles from '@/components/GlobalStyles'
import Script from 'next/script'

const inter = Inter({ 
  subsets: ['latin'],
  display: 'swap',
})

export const metadata = {
  title: 'Portal',
  description: 'Portal de serviços',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt-BR">
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#ffffff" />
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1" />
        <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200" rel="stylesheet" />
        {/* Preload do framer-motion para evitar erros de carregamento */}
        <link 
          rel="preload" 
          href="/_next/static/chunks/_app-pages-browser_node_modules_framer-motion_dist_es_index_mjs.js" 
          as="script" 
        />
        <GlobalStyles />
      </head>
      <body className={inter.className}>
        {children}
        {/* Script para pré-carregar o framer-motion */}
        <Script
          id="preload-framer-motion"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              try {
                // Pré-carregar framer-motion para evitar erros de chunk
                const preloadFramerMotion = () => {
                  // Carregar o chunk específico do framer-motion
                  const link = document.createElement('link');
                  link.rel = 'prefetch';
                  link.href = '/_next/static/chunks/_app-pages-browser_node_modules_framer-motion_dist_es_index_mjs.js';
                  link.as = 'script';
                  document.head.appendChild(link);
                  
                  // Tentar importar framer-motion
                  import('framer-motion').catch(e => console.warn('Pré-carregamento do framer-motion falhou:', e));
                };
                
                // Executar após carregamento da página
                if (document.readyState === 'complete') {
                  preloadFramerMotion();
                } else {
                  window.addEventListener('load', preloadFramerMotion);
                }
              } catch (error) {
                console.warn('Erro no script de pré-carregamento:', error);
              }
            `
          }}
        />
      </body>
    </html>
  )
}
