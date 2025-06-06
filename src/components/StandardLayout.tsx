'use client';

import ModernDashboardLayout from '@/components/layouts/ModernDashboardLayout';

export default function StandardLayout({ children, ...props }) {
  return (
    <ModernDashboardLayout {...props}>
      {children}
    </ModernDashboardLayout>
  );
} 