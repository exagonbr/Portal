import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { PWARegistration } from '@/components/PWARegistration';
import { AppProviders } from '@/providers/AppProviders';
import { Header } from '@/components/Header';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Portal Educacional',
  description: 'Plataforma educacional brasileira com suporte BNCC',
  manifest: '/manifest.json',
  themeColor: '#007bff',
  viewport: {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 1,
    userScalable: false,
  },
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

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR">
      <head>
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="Portal Edu" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="theme-color" content="#007bff" />
        <link rel="apple-touch-icon" href="/icons/icon-192x192.png" />
        <link rel="manifest" href="/manifest.json" />
      </head>
      <body className={inter.className}>
        <AppProviders>
          <div className="min-h-screen bg-gradient-to-b from-background-start to-background-end">
            {children}
            <PWARegistration />
          </div>
        </AppProviders>
      </body>
    </html>
  );
}
