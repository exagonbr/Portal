import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import SimpleProviders from '@/providers/SimpleProviders';
import { isDevelopment } from '@/utils/env';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Portal Educacional',
  description: 'Plataforma educacional brasileira com suporte BNCC',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Portal Edu',
  },
  formatDetection: {
    telephone: false,
  },
  icons: {
    icon: [
      { url: '/icons/icon-192x192.png', sizes: '192x192', type: 'image/png' },
      { url: '/icons/icon-512x512.png', sizes: '512x512', type: 'image/png' },
    ],
    apple: [
      { url: '/icons/icon-192x192.png' },
    ],
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  minimumScale: 1,
  maximumScale: 1, // Prevenir zoom para melhorar UX mobile
  userScalable: false, // Desabilitar zoom do usuário para evitar problemas de layout
  viewportFit: 'cover',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR" className="h-full antialiased" suppressHydrationWarning>
      <head>
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="Portal Edu" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="theme-color" content="#0f3460" media="(prefers-color-scheme: light)" />
        <meta name="theme-color" content="#1e293b" media="(prefers-color-scheme: dark)" />
        <meta name="referrer" content="no-referrer-when-downgrade" />
        <link rel="apple-touch-icon" href="/icons/icon-192x192.png" />
        <link rel="manifest" href="/manifest.json" />
        <link
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200&display=swap"
          rel="stylesheet"
        />
        {/* Remover preload de fontes específicas para evitar avisos */}
        
        {/* Service Worker personalizado para limpeza de cache */}
        <script src="/register-sw.js" defer />
        
        {/* Script para prevenir problemas de hidratação causados por extensões */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              // Prevenir problemas de hidratação causados por extensões do navegador
              if (typeof window !== 'undefined') {
                // Remover atributos injetados por extensões antes da hidratação
                const observer = new MutationObserver(() => {
                  const html = document.documentElement;
                  if (html.hasAttribute('bbai-tooltip-injected')) {
                    html.removeAttribute('bbai-tooltip-injected');
                  }
                  // Remover outros atributos comuns de extensões
                  ['data-extension', 'data-grammarly', 'data-lastpass'].forEach(attr => {
                    if (html.hasAttribute(attr)) {
                      html.removeAttribute(attr);
                    }
                  });
                });
                
                observer.observe(document.documentElement, {
                  attributes: true,
                  attributeFilter: ['bbai-tooltip-injected', 'data-extension', 'data-grammarly', 'data-lastpass']
                });
                
                // Parar observação após 5 segundos
                setTimeout(() => observer.disconnect(), 5000);
              }
            `,
          }}
        />
      </head>
      <body className={`${inter.className} m-0 p-0 h-full w-full`} suppressHydrationWarning>
        <SimpleProviders>
          <div className="flex flex-col min-h-screen w-full">
            {children}
          </div>
        </SimpleProviders>
      </body>
    </html>
  );
}
