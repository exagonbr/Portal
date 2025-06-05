'use client';

import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import {
  LayoutGrid,
  BookOpen,
  Calendar,
  MessageSquare,
  Bell,
  Settings,
  ChevronRight,
  Menu,
  X
} from 'lucide-react';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const { user } = useAuth();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const menuItems = [
    { icon: LayoutGrid, label: 'Dashboard', href: '/portal/dashboard' },
    { icon: BookOpen, label: 'Cursos', href: '/portal/courses' },
    { icon: Calendar, label: 'Agenda', href: '/portal/calendar' },
    { icon: MessageSquare, label: 'Mensagens', href: '/portal/messages' },
    { icon: Bell, label: 'Notificações', href: '/portal/notifications' },
    { icon: Settings, label: 'Configurações', href: '/portal/settings' },
  ];

  return (
    <div className="min-h-screen bg-background-secondary">
      {/* Sidebar */}
      <aside
        className={`
          fixed inset-y-0 left-0 z-40 w-64 bg-background-primary shadow-xl transform transition-transform duration-300 lg:translate-x-0
          ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
      >
        <div className="h-full flex flex-col">
          {/* Logo */}
          <div className="p-4 border-b border-border">
            <div className="flex items-center gap-2">
              <img src="/logo.svg" alt="Logo" className="w-8 h-8" />
              <span className="text-lg font-semibold text-text-primary">Dashboard</span>
            </div>
          </div>

          {/* Menu */}
          <nav className="flex-1 p-4 space-y-1">
            {menuItems.map((item) => (
              <a
                key={item.href}
                href={item.href}
                className="flex items-center gap-3 px-3 py-2 rounded-lg text-text-secondary hover:text-text-primary hover:bg-background-secondary transition-colors"
              >
                <item.icon className="w-5 h-5" />
                <span>{item.label}</span>
              </a>
            ))}
          </nav>

          {/* Perfil */}
          <div className="p-4 border-t border-border">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center text-white">
                {user?.name?.charAt(0).toUpperCase() || 'U'}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-text-primary truncate">{user?.name}</p>
                <p className="text-xs text-text-secondary truncate">{user?.email}</p>
              </div>
              <ChevronRight className="w-5 h-5 text-text-secondary" />
            </div>
          </div>
        </div>
      </aside>

      {/* Overlay */}
      <div
        className={`
          fixed inset-0 z-30 bg-black bg-opacity-50 lg:hidden transition-opacity duration-300
          ${isSidebarOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}
        `}
        onClick={() => setIsSidebarOpen(false)}
      />

      {/* Main Content */}
      <div className="lg:pl-64">
        {/* Header */}
        <header className="bg-background-primary shadow-sm border-b border-border sticky top-0 z-20">
          <div className="px-3 sm:px-6 lg:px-8 py-2 sm:py-4">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                className="p-2 -m-2 text-text-secondary hover:text-text-primary lg:hidden"
              >
                {isSidebarOpen ? (
                  <X className="w-6 h-6" />
                ) : (
                  <Menu className="w-6 h-6" />
                )}
              </button>
              <h1 className="text-lg sm:text-xl font-semibold text-text-primary">Dashboard</h1>
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="container mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
          {children}
        </main>
      </div>
    </div>
  );
} 