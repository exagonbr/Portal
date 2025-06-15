'use client';

import React from 'react';
import ModernDashboardLayout from '@/components/layouts/ModernDashboardLayout';

interface StandardLayoutProps {
  children: React.ReactNode;
  [key: string]: any;
}

export default function StandardLayout({ children, ...props }: StandardLayoutProps) {
  return (
    <ModernDashboardLayout {...props}>
      {children}
    </ModernDashboardLayout>
  );
}