// Forçar renderização dinâmica para evitar cache
export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const fetchCache = 'force-no-store';

import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import SimpleProviders from '@/providers/SimpleProviders';
import { isDevelopment } from '@/utils/env';
import { LoopPreventionInit } from '@/components/LoopPreventionInit';

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  preload: true,
  adjustFontFallback: true,
});

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
  other: {
    'Cache-Control': 'no-cache, no-store, must-revalidate',
    'Pragma': 'no-cache',
    'Expires': '0',
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
        {/* Headers de no-cache agressivos */}
        <meta httpEquiv="Cache-Control" content="no-cache, no-store, must-revalidate, max-age=0, s-maxage=0" />
        <meta httpEquiv="Pragma" content="no-cache" />
        <meta httpEquiv="Expires" content="0" />
        <meta httpEquiv="Surrogate-Control" content="no-store" />
        <meta name="robots" content="noarchive" />
        
        {/* PWA e Mobile */}
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="Portal Edu" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="theme-color" content="#0f3460" media="(prefers-color-scheme: light)" />
        <meta name="theme-color" content="#1e293b" media="(prefers-color-scheme: dark)" />
        <meta name="referrer" content="no-referrer-when-downgrade" />
        
        {/* Links */}
        <link rel="apple-touch-icon" href="/icons/icon-192x192.png" />
        <link rel="manifest" href="/manifest.json" />
        
        {/* Preconnect para melhorar performance */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="dns-prefetch" href="https://fonts.googleapis.com" />
        
        {/* Material Icons com display swap para melhor performance */}
        <link
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200&display=swap"
          rel="stylesheet"
        />
        
        {/* Script inline para desabilitar cache do navegador */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              // Desabilitar cache do navegador
              if ('caches' in window) {
                caches.keys().then(function(names) {
                  for (let name of names) caches.delete(name);
                });
              }
              
              // Forçar reload se a página foi carregada do cache
              window.addEventListener('pageshow', function(event) {
                if (event.persisted) {
                  window.location.reload();
                }
              });
              
              // Adicionar timestamp para evitar cache
              window.__NO_CACHE__ = Date.now();
            `,
          }}
        />
        
        {/* Service Worker para controle de cache */}
        <script src="/register-sw.js" defer />
      </head>
      <body className={`${inter.className} m-0 p-0 h-full w-full`} suppressHydrationWarning>
        <SimpleProviders>
          <LoopPreventionInit />
          <div className="flex flex-col min-h-screen w-full">
            {children}
          </div>
        </SimpleProviders>
      </body>
    </html>
  );
}
