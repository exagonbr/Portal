'use client';

import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Menu, X } from 'lucide-react';

interface PortalLayoutProps {
  children: React.ReactNode;
}

export default function PortalLayout({ children }: PortalLayoutProps) {
  const { user } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background-secondary">
      {/* Header */}
      <header className="bg-background-primary shadow-sm border-b border-border">
        <div className="px-3 sm:px-6 lg:px-8 py-2 sm:py-4">
          <div className="flex items-center justify-between">
            {/* Logo e Menu Mobile */}
            <div className="flex items-center gap-3">
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="p-2 -m-2 text-text-secondary hover:text-text-primary md:hidden"
              >
                {isMobileMenuOpen ? (
                  <X className="w-6 h-6" />
                ) : (
                  <Menu className="w-6 h-6" />
                )}
              </button>
              <div className="flex items-center gap-2">
                <img src="/logo.svg" alt="Logo" className="w-8 h-8" />
                <span className="text-lg font-semibold text-text-primary">Portal Educacional</span>
              </div>
            </div>

            {/* Navegação Desktop */}
            <nav className="hidden md:flex items-center gap-6">
              <a href="/portal/dashboard" className="text-text-secondary hover:text-text-primary transition-colors">
                Dashboard
              </a>
              <a href="/portal/courses" className="text-text-secondary hover:text-text-primary transition-colors">
                Cursos
              </a>
              <a href="/portal/assignments" className="text-text-secondary hover:text-text-primary transition-colors">
                Atividades
              </a>
              <a href="/portal/forum" className="text-text-secondary hover:text-text-primary transition-colors">
                Fórum
              </a>
            </nav>

            {/* Perfil */}
            <div className="flex items-center gap-3">
              <button className="p-2 text-text-secondary hover:text-text-primary">
                <span className="material-symbols-outlined">notifications</span>
              </button>
              <div className="flex items-center gap-2">
                <span className="text-sm text-text-secondary hidden sm:block">{user?.name}</span>
                <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-white">
                  {user?.name?.charAt(0).toUpperCase() || 'U'}
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Menu Mobile */}
      <div
        className={`
          fixed inset-0 z-40 bg-black bg-opacity-50 md:hidden transition-opacity duration-300
          ${isMobileMenuOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}
        `}
        onClick={() => setIsMobileMenuOpen(false)}
      >
        <div
          className={`
            fixed inset-y-0 left-0 w-64 bg-background-primary shadow-xl transform transition-transform duration-300
            ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
          `}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="p-4">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <img src="/logo.svg" alt="Logo" className="w-8 h-8" />
                <span className="text-lg font-semibold text-text-primary">Portal</span>
              </div>
              <button
                onClick={() => setIsMobileMenuOpen(false)}
                className="p-2 -m-2 text-text-secondary hover:text-text-primary"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            <nav className="space-y-1">
              <a
                href="/portal/dashboard"
                className="block px-3 py-2 rounded-lg text-text-secondary hover:text-text-primary hover:bg-background-secondary transition-colors"
              >
                Dashboard
              </a>
              <a
                href="/portal/courses"
                className="block px-3 py-2 rounded-lg text-text-secondary hover:text-text-primary hover:bg-background-secondary transition-colors"
              >
                Cursos
              </a>
              <a
                href="/portal/assignments"
                className="block px-3 py-2 rounded-lg text-text-secondary hover:text-text-primary hover:bg-background-secondary transition-colors"
              >
                Atividades
              </a>
              <a
                href="/portal/forum"
                className="block px-3 py-2 rounded-lg text-text-secondary hover:text-text-primary hover:bg-background-secondary transition-colors"
              >
                Fórum
              </a>
            </nav>
          </div>
        </div>
      </div>

      {/* Conteúdo Principal */}
      <main className="container mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
        {children}
      </main>
    </div>
  );
} 