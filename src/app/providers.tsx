'use client';

import React from 'react';
import { Toaster } from 'react-hot-toast';
import { SessionProvider } from 'next-auth/react';
import { AuthProvider } from '@/contexts/AuthContext';
import { ThemeProvider } from '@/contexts/ThemeContext';
import { UpdateProvider } from '@/components/PWAUpdateManager';

// Importar a configuração do Axios
import '@/lib/axiosConfig';

interface ProvidersProps {
  children: React.ReactNode;
}

export default function Providers({ children }: ProvidersProps) {
  return (
    <SessionProvider>
      <ThemeProvider>
        <AuthProvider>
          <UpdateProvider>
            {children}
            <Toaster position="top-right" />
          </UpdateProvider>
        </AuthProvider>
      </ThemeProvider>
    </SessionProvider>
  );
} 