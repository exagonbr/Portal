'use client';

import React from 'react';
import { Toaster } from 'react-hot-toast';

// Importar a configuração do Axios
import '@/lib/axiosConfig';

interface ProvidersProps {
  children: React.ReactNode;
}

export default function Providers({ children }: ProvidersProps) {
  return (
    <>
      {children}
      <Toaster position="top-right" />
    </>
  );
} 