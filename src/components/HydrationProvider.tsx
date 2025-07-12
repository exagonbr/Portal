"use client";

import { useEffect, useState } from 'react';

interface HydrationProviderProps {
  children: React.ReactNode;
}

export function HydrationProvider({ children }: HydrationProviderProps) {
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    // Setup hydration error prevention
    if (typeof window !== 'undefined') {
      // Import hydration fix dynamically to avoid SSR issues
      import('@/utils/hydration-fix').then(({ setupHydrationErrorPrevention }) => {
        setupHydrationErrorPrevention();
      });
    }
    
    // Mark as hydrated
    setIsHydrated(true);
  }, []);

  // During hydration, render a simple loading state
  if (!isHydrated) {
    return <div suppressHydrationWarning={true}>{children}</div>;
  }

  return <>{children}</>;
}
