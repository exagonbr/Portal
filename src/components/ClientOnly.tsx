'use client';

import React, { ReactNode } from 'react';
import { useIsClient } from '@/utils/ssr';

interface ClientOnlyProps {
  children: ReactNode;
  fallback?: ReactNode;
}

/**
 * Component that only renders its children on the client side
 * Prevents hydration mismatches by showing fallback during SSR
 */
export default function ClientOnly({ children, fallback = null }: ClientOnlyProps) {
  const isClient = useIsClient();

  if (!isClient) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}
