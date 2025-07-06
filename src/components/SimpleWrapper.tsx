'use client';

import React from 'react';

export function SimpleWrapper({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col min-h-full">
      {children}
    </div>
  );
} 