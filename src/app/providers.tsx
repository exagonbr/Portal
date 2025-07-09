'use client';

import React from 'react';
import { Toaster } from 'react-hot-toast';
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
    <ThemeProvider>
      <AuthProvider>
        <UpdateProvider>
          {children}
          <Toaster position="top-right" />
        </UpdateProvider>
      </AuthProvider>
    </ThemeProvider>
  );
} 