'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '../contexts/AuthContext';
import { useState } from 'react';

export const Navigation = () => {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const isActive = (path: string) => pathname === path;

  const commonNavItems = [
    { href: '/courses', label: 'Cursos' },
    { href: '/live', label: 'Ao Vivo' },
  ];

  const studentNavItems = [
    ...commonNavItems,
    { href: '/assignments', label: 'Atividades' },
    { href: '/dashboard/student', label: 'Dashboard' },
  ];

  const teacherNavItems = [
    ...commonNavItems,
    { href: '/dashboard/teacher', label: 'Dashboard' },
    { href: '/assignments', label: 'Gerenciar Atividades' },
  ];

  const getNavItems = () => {
    if (!user) return commonNavItems;
    return user.role === 'student' ? studentNavItems : teacherNavItems;
  };

  return (
    <>
      {/* Mobile menu button */}
      <button
        onClick={() => setIsMenuOpen(!isMenuOpen)}
        className="md:hidden p-2 text-gray-600 hover:text-gray-900"
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
      <nav className={`${isMenuOpen ? 'block' : 'hidden'} md:flex md:items-center md:space-x-6 absolute md:relative top-16 md:top-0 left-0 right-0 bg-white md:bg-transparent p-4 md:p-0 shadow-lg md:shadow-none`}>
        <div className="flex flex-col md:flex-row md:items-center space-y-4 md:space-y-0 md:space-x-6">
          {getNavItems().map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`text-sm font-medium transition-colors hover:text-primary ${
                isActive(item.href)
                  ? 'text-primary'
                  : 'text-text-secondary'
              }`}
              onClick={() => setIsMenuOpen(false)}
            >
              {item.label}
            </Link>
          ))}
        </div>

        <div className="mt-4 md:mt-0">
          {user ? (
            <div className="flex flex-col md:flex-row items-center space-y-4 md:space-y-0 md:space-x-4">
              <span className="text-sm text-gray-600">
                {user.role === 'student' ? 'Estudante' : 'Professor'}: {user.name}
              </span>
              <button
                onClick={() => {
                  logout();
                  setIsMenuOpen(false);
                }}
                className="button-secondary text-sm"
              >
                Sair
              </button>
            </div>
          ) : (
            <Link
              href="/login"
              className="button-primary text-sm block text-center"
              onClick={() => setIsMenuOpen(false)}
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
