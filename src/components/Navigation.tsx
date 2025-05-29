'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '../contexts/AuthContext';
import { useState } from 'react';
import { UserRole } from '../types/auth';

// Função utilitária para mapear roles para labels em português
const getRoleLabel = (role: UserRole): string => {
  const roleLabels: Record<UserRole, string> = {
    'student': 'Aluno',
    'teacher': 'Professor',
    'manager': 'Gestor',
    'institution_manager': 'Gestor Institucional',
    'admin': 'Administrador',
    'system_admin': 'Administrador do Sistema',
    'academic_coordinator': 'Coordenador Acadêmico',
    'guardian': 'Responsável'
  };
  
  return roleLabels[role] || role;
};

export const Navigation = () => {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);

  const isActive = (path: string) => pathname === path;

  const commonNavItems = [
    { href: '/', label: '' },
  ];

  const studentNavItems = [
    ...commonNavItems,
    { href: '/assignments', label: 'Atividades' },
    { href: '/dashboard/student', label: 'Dashboard' },
    { href: '/courses', label: 'Cursos' },
    { href: '/live', label: 'Ao Vivo' },
  ];

  const teacherNavItems = [
    ...commonNavItems,
    { href: '/dashboard/teacher', label: 'Dashboard' },
    { href: '/assignments', label: 'Gerenciar Atividades' },
    { href: '/courses', label: 'Cursos' },
    { href: '/live', label: 'Ao Vivo' },
  ];

  const getNavItems = () => {
    if (!user) return commonNavItems;
    return user.role === 'student' ? studentNavItems : teacherNavItems;
  };

  const handleLogout = () => {
    logout();
    setIsMenuOpen(false);
    setIsProfileMenuOpen(false);
  };

  const closeAllMenus = () => {
    setIsMenuOpen(false);
    setIsProfileMenuOpen(false);
  };

  return (
    <>
      {/* Mobile menu button */}
      <button
        onClick={() => setIsMenuOpen(!isMenuOpen)}
        className="md:hidden p-2 text-text-secondary hover:text-text-primary focus:outline-none focus:ring-2 focus:ring-primary rounded-md"
        aria-label="Toggle menu"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          {isMenuOpen ? (
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          ) : (
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          )}
        </svg>
      </button>

      {/* Desktop Navigation */}
      <nav 
        className={`${
          isMenuOpen ? 'translate-x-0 opacity-100' : '-translate-x-full opacity-0 md:translate-x-0 md:opacity-100'
        } transform transition-all duration-200 ease-in-out md:flex md:items-center md:space-x-6 fixed md:relative top-16 md:top-0 left-0 right-0 h-screen md:h-auto bg-background-primary md:bg-transparent p-6 md:p-0 shadow-lg md:shadow-none z-50`}
      >
        <div className="flex flex-col md:flex-row md:items-center space-y-6 md:space-y-0 md:space-x-8">
          {getNavItems().map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`text-sm font-medium transition-colors hover:text-primary ${
                isActive(item.href)
                  ? 'text-primary'
                  : 'text-text-secondary'
              }`}
              onClick={closeAllMenus}
            >
              {item.label}
            </Link>
          ))}
        </div>

        <div className="mt-6 md:mt-0 border-t md:border-none pt-6 md:pt-0">
          {user ? (
            <div className="flex flex-col md:flex-row items-center space-y-4 md:space-y-0 md:space-x-6">
              <div className="relative">
                <button
                  onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                  className="flex items-center space-x-3 focus:outline-none"
                >
                  <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                    <span className="text-blue-600 font-medium">
                      {user.name?.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div className="flex flex-col items-start">
                    <span className="text-sm font-medium text-text-primary">
                      {user.name}
                    </span>
                    <span className="text-xs text-gray-500">
                      {user?.role && getRoleLabel(user.role)}
                    </span>
                  </div>
                  <svg 
                    className={`w-4 h-4 text-gray-600 transition-transform duration-200 ${isProfileMenuOpen ? 'rotate-180' : ''}`} 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {/* Profile Dropdown Menu */}
                {isProfileMenuOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg py-1 z-50">
                    <Link
                      href="/profile"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
                      onClick={closeAllMenus}
                    >
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                      Perfil
                    </Link>
                    <Link
                      href="/change-password"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
                      onClick={closeAllMenus}
                    >
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                      </svg>
                      Alterar Senha
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center"
                    >
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                      </svg>
                      Sair
                    </button>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <Link
              href="/login"
              className="inline-flex items-center justify-center px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors duration-200"
              onClick={closeAllMenus}
            >
              Acessar Plataforma
            </Link>
          )}
        </div>
      </nav>
    </>
  );
};

export default Navigation;
