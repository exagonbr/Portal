'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '../contexts/AuthContext';
import { useState } from 'react';
import { UserRole } from '../types/auth';
<<<<<<< HEAD
import { ROLE_LABELS } from '../types/roles';
=======

// Interface para itens de navegação
interface NavItem {
  href: string;
  label: string;
  icon?: string;
}

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
>>>>>>> master

export const Navigation = () => {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);

  const isActive = (path: string) => pathname === path;

  const commonNavItems: NavItem[] = [
    { href: '/', label: '' },
  ];

<<<<<<< HEAD
=======
  const studentNavItems: NavItem[] = [
    ...commonNavItems,
    { href: '/assignments', label: 'Atividades', icon: 'M9 5H7a2 2 0 00-2 2v6a2 2 0 002 2h6a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2' },
    { href: '/dashboard/student', label: 'Dashboard', icon: 'M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z' },
    { href: '/courses', label: 'Cursos', icon: 'M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253' },
    { href: '/live', label: 'Ao Vivo', icon: 'M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z' },
  ];

  const teacherNavItems: NavItem[] = [
    ...commonNavItems,
    { href: '/dashboard/teacher', label: 'Dashboard', icon: 'M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z' },
    { href: '/assignments', label: 'Gerenciar Atividades', icon: 'M9 5H7a2 2 0 00-2 2v6a2 2 0 002 2h6a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2' },
    { href: '/courses', label: 'Cursos', icon: 'M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253' },
    { href: '/live', label: 'Ao Vivo', icon: 'M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z' },
  ];

  const getNavItems = () => {
    if (!user) return commonNavItems;
    return user.role === 'student' ? studentNavItems : teacherNavItems;
  };

>>>>>>> master
  const handleLogout = () => {
    logout();
    setIsMenuOpen(false);
    setIsProfileMenuOpen(false);
  };

  const closeAllMenus = () => {
    setIsMenuOpen(false);
    setIsProfileMenuOpen(false);
  };
<<<<<<< HEAD
=======

  return (
    <>
      {/* Mobile menu button */}
      <button
        onClick={() => setIsMenuOpen(!isMenuOpen)}
        className="md:hidden p-3 text-text-secondary hover:text-primary focus:outline-none focus:ring-2 focus:ring-primary/20 rounded-xl bg-background-card border border-border-light shadow-sm hover:shadow-md transition-all duration-200"
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

      {/* Navigation Container */}
      <nav
        className={`${
          isMenuOpen ? 'translate-x-0 opacity-100' : '-translate-x-full opacity-0 md:translate-x-0 md:opacity-100'
        } transform transition-all duration-300 ease-in-out md:flex md:items-center md:space-x-8 fixed md:static top-16 md:top-0 left-0 right-0 h-screen md:h-auto bg-background-card/95 md:bg-transparent backdrop-blur-xl md:backdrop-blur-none p-6 md:p-0 shadow-2xl md:shadow-none z-40 border-r border-border-light md:border-none`}
      >
        {/* Navigation Links */}
        <div className="flex flex-col md:flex-row md:items-center space-y-2 md:space-y-0 md:space-x-6">
          {getNavItems().map((item) => (
            item.label && (
              <Link
                key={item.href}
                href={item.href}
                className={`nav-link group flex items-center gap-3 px-4 py-3 md:px-3 md:py-2 rounded-xl transition-all duration-200 ${
                  isActive(item.href)
                    ? 'bg-primary text-white shadow-lg nav-link-active'
                    : 'hover:bg-background-hover'
                }`}
                onClick={closeAllMenus}
              >
                {/* Icon */}
                {item.icon && (
                  <svg className="w-5 h-5 md:w-4 md:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={item.icon} />
                  </svg>
                )}
                <span className="font-medium">{item.label}</span>
              </Link>
            )
          ))}
        </div>

        {/* User Profile Section */}
        <div className="mt-8 md:mt-0 md:ml-auto pt-6 md:pt-0 border-t border-border-light md:border-none">
          {user ? (
            <div className="flex flex-col md:flex-row items-start md:items-center space-y-4 md:space-y-0 md:space-x-4">
              {/* Notifications Button */}
              <button className="button-icon relative">
                <svg className="w-5 h-5 text-text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
                <span className="absolute -top-1 -right-1 w-2 h-2 bg-error rounded-full"></span>
              </button>

              {/* Profile Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                  className="flex items-center gap-3 p-2 rounded-xl hover:bg-background-hover transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary/20 group"
                >
                  {/* Avatar */}
                  <div className="w-10 h-10 bg-gradient-to-r from-primary to-secondary rounded-xl flex items-center justify-center ring-2 ring-border-light group-hover:ring-primary/30 transition-all duration-200">
                    <span className="text-white font-semibold text-sm">
                      {user.name?.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  
                  {/* User Info */}
                  <div className="flex flex-col items-start md:hidden lg:flex">
                    <span className="text-sm font-semibold text-text-primary">
                      {user.name}
                    </span>
                    <span className="text-xs text-text-tertiary">
                      {user?.role && getRoleLabel(user.role)}
                    </span>
                  </div>
                  
                  {/* Dropdown Arrow */}
                  <svg
                    className={`w-4 h-4 text-text-tertiary transition-transform duration-200 ${isProfileMenuOpen ? 'rotate-180' : ''}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {/* Profile Dropdown Menu */}
                {isProfileMenuOpen && (
                  <div className="absolute right-0 mt-2 w-64 bg-background-card rounded-2xl shadow-2xl border border-border-light z-50 backdrop-blur-xl animate-slide-down overflow-hidden">
                    {/* User Info Header */}
                    <div className="p-4 border-b border-border-light bg-gradient-to-r from-primary/5 to-secondary/5">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-gradient-to-r from-primary to-secondary rounded-xl flex items-center justify-center">
                          <span className="text-white font-bold">
                            {user.name?.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <p className="font-semibold text-text-primary">{user.name}</p>
                          <p className="text-sm text-text-tertiary">{user?.role && getRoleLabel(user.role)}</p>
                        </div>
                      </div>
                    </div>

                    {/* Menu Items */}
                    <div className="py-2">
                      <Link
                        href="/profile"
                        className="flex items-center gap-3 px-4 py-3 text-sm text-text-primary hover:bg-background-hover transition-colors duration-200 group"
                        onClick={closeAllMenus}
                      >
                        <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center group-hover:bg-primary/20 transition-colors duration-200">
                          <svg className="w-4 h-4 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                          </svg>
                        </div>
                        <span>Meu Perfil</span>
                      </Link>
                      
                      <Link
                        href="/change-password"
                        className="flex items-center gap-3 px-4 py-3 text-sm text-text-primary hover:bg-background-hover transition-colors duration-200 group"
                        onClick={closeAllMenus}
                      >
                        <div className="w-8 h-8 bg-secondary/10 rounded-lg flex items-center justify-center group-hover:bg-secondary/20 transition-colors duration-200">
                          <svg className="w-4 h-4 text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1721 9z" />
                          </svg>
                        </div>
                        <span>Alterar Senha</span>
                      </Link>

                      <div className="my-2 border-t border-border-light"></div>

                      <button
                        onClick={handleLogout}
                        className="flex items-center gap-3 px-4 py-3 text-sm text-error hover:bg-error/5 transition-colors duration-200 w-full group"
                      >
                        <div className="w-8 h-8 bg-error/10 rounded-lg flex items-center justify-center group-hover:bg-error/20 transition-colors duration-200">
                          <svg className="w-4 h-4 text-error" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                          </svg>
                        </div>
                        <span>Sair da Conta</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <Link
              href="/login"
              className="button-primary inline-flex items-center justify-center gap-2 group"
              onClick={closeAllMenus}
            >
              <svg className="w-4 h-4 group-hover:scale-110 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
              </svg>
              Acessar Plataforma
            </Link>
          )}
        </div>
      </nav>

      {/* Mobile Menu Backdrop */}
      {isMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-30 md:hidden"
          onClick={closeAllMenus}
        />
      )}
    </>
  );
>>>>>>> master
};

export default Navigation;
