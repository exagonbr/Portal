'use client';

import React from 'react';
import { useSession, signOut } from 'next-auth/react';
import { Button } from '@/components/ui/Button';

interface HeaderProps {
  title?: string;
  showUserMenu?: boolean;
}

const Header: React.FC<HeaderProps> = ({ 
  title = 'Portal Educacional', 
  showUserMenu = true 
}) => {
  const { data: session } = useSession();

  const handleLogout = async () => {
    await signOut({ callbackUrl: '/auth/login' });
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
          {showUserMenu && session && (
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-700">
                Olá, {session.user?.name || session.user?.email}
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