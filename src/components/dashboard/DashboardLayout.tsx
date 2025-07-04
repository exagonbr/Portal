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
      {/* Placeholder para uma barra lateral */}
      <div className="w-64 bg-white dark:bg-gray-800 shadow-md hidden md:block">
        <div className="p-5 text-lg font-bold border-b dark:border-gray-700">Portal</div>
        <nav className="p-2">
          {/* Itens de navegação iriam aqui */}
          <a href="/admin/analytics" className="block p-2 rounded-md bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300">Analytics</a>
          <a href="#" className="block p-2 rounded-md hover:bg-gray-200 dark:hover:bg-gray-700">Usuários</a>
          <a href="#" className="block p-2 rounded-md hover:bg-gray-200 dark:hover:bg-gray-700">Configurações</a>
        </nav>
      </div>
      <main className="flex-1 overflow-y-auto">
        {children}
      </main>
    </div>
  );
};

export default DashboardLayout;