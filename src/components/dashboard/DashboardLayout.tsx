// src/components/dashboard/DashboardLayout.tsx
import React from 'react';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
  // Este é um layout de placeholder. Em uma aplicação real, ele conteria
  // barras laterais, cabeçalhos, navegação, etc.
  return (
    <div className="flex h-screen bg-gray-100 dark:bg-gray-900">
      <main className="flex-1 overflow-y-auto">
        {children}
      </main>
    </div>
  );
};

export default DashboardLayout;