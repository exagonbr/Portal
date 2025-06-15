import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { PWARegistration } from '@/components/PWARegistration';
import { PushNotificationInitializer } from '@/components/PushNotificationInitializer';
import { AppProviders } from '@/providers/AppProviders';
import ErrorSuppressor from '@/components/ErrorSuppressor';
import GlobalSetup from '@/components/GlobalSetup';
import Handtalk from '@/components/Handtalk';

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
  maximumScale: 5,
  userScalable: true,
  viewportFit: 'cover',
};



export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR" className="h-full antialiased">
      <head>
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="Portal Edu" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="theme-color" content="#0f3460" media="(prefers-color-scheme: light)" />
        <meta name="theme-color" content="#1e293b" media="(prefers-color-scheme: dark)" />
        <meta httpEquiv="Content-Security-Policy" content="upgrade-insecure-requests" />
        <meta name="referrer" content="no-referrer-when-downgrade" />
        <link rel="apple-touch-icon" href="/icons/icon-192x192.png" />
        <link rel="manifest" href="/manifest.json" />
        <link
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200"
          rel="stylesheet"
        />
      </head>
      <body className={`${inter.className} m-0 p-0 h-full w-full`}>
        <ErrorSuppressor />
        <GlobalSetup />
        <AppProviders>
        <Handtalk token="fe964e92fd91396436b25c2ee95b3976" />

          <div className="flex flex-col min-h-full">
            {children}
          </div>
          <PWARegistration />
          <PushNotificationInitializer />
        </AppProviders>
      </body>
    </html>
  );
}
