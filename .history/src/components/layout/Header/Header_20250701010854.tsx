'use client';

import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/Button';

interface HeaderProps {
  title?: string;
  showUserMenu?: boolean;
}

const Header: React.FC<HeaderProps> = ({
  title = 'Portal Educacional',
  showUserMenu = true
}) => {
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    await logout();
  };

  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo e Título */}
          <div className="flex items-center">
            <h1 className="text-xl font-semibold text-gray-900">
              {title}
            </h1>
          </div>

          {/* Menu do Usuário */}
          {showUserMenu && user && (
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-700">
                Olá, {user.name || user.email}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={handleLogout}
              >
                Sair
              </Button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export { Header };
export type { HeaderProps };