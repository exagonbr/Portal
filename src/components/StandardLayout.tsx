'use client';

import { ReactNode, useState } from 'react';
import StandardSidebar from '@/components/StandardSidebar';
import StandardHeader from '@/components/StandardHeader';
import Link from 'next/link';
import { useTheme } from '@/contexts/ThemeContext';
import { motion } from 'framer-motion';

interface StandardLayoutProps {
  children: ReactNode;
  title?: string;
  subtitle?: string;
  showBreadcrumb?: boolean;
  breadcrumbItems?: { label: string; href?: string }[];
  rightContent?: ReactNode;
}

const StandardLayout = ({
  children,
  title,
  subtitle,
  showBreadcrumb = false,
  breadcrumbItems = [],
  rightContent
}: StandardLayoutProps) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { theme } = useTheme();

  return (
    <div className="flex min-h-screen" style={{ backgroundColor: theme.colors.background.primary }}>
      {/* Mobile Sidebar Backdrop */}
      {sidebarOpen && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-40 bg-opacity-50 md:hidden backdrop-blur-sm"
          style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Desktop Sidebar */}
      <div className="hidden md:block">
        <StandardSidebar />
      </div>

      {/* Mobile Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-50 w-64 transform transition-transform duration-300 ease-in-out md:hidden ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        <StandardSidebar />
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <header 
          className="shadow-sm border-b sticky top-0 z-10"
          style={{ 
            backgroundColor: theme.colors.background.card,
            borderColor: theme.colors.border.DEFAULT
          }}
        >
          <div className="px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center justify-between">
              {/* Mobile menu button */}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                type="button"
                className="md:hidden inline-flex items-center justify-center p-2 rounded-md transition-colors"
                style={{ color: theme.colors.text.secondary }}
                onClick={() => setSidebarOpen(true)}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = `${theme.colors.primary.light}20`;
                  e.currentTarget.style.color = theme.colors.primary.DEFAULT;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'transparent';
                  e.currentTarget.style.color = theme.colors.text.secondary;
                }}
              >
                <span className="sr-only">Abrir menu</span>
                <span className="material-symbols-outlined">menu</span>
              </motion.button>

              <div className="flex-1 min-w-0">
                {title && (
                  <h1 className="text-2xl font-semibold truncate" style={{ color: theme.colors.text.primary }}>
                    {title}
                  </h1>
                )}
                {subtitle && (
                  <p className="mt-1 text-sm truncate" style={{ color: theme.colors.text.secondary }}>
                    {subtitle}
                  </p>
                )}
                {showBreadcrumb && breadcrumbItems.length > 0 && (
                  <nav className="mt-1">
                    <ol className="flex items-center space-x-1 text-sm">
                      {breadcrumbItems.map((item, index) => (
                        <li key={index} className="flex items-center">
                          {index > 0 && <span className="mx-1" style={{ color: theme.colors.text.tertiary }}>/</span>}
                          {item.href ? (
                            <Link 
                              href={item.href} 
                              className="transition-colors"
                              style={{ color: theme.colors.primary.DEFAULT }}
                              onMouseEnter={(e) => e.currentTarget.style.color = theme.colors.primary.dark}
                              onMouseLeave={(e) => e.currentTarget.style.color = theme.colors.primary.DEFAULT}
                            >
                              {item.label}
                            </Link>
                          ) : (
                            <span style={{ color: theme.colors.text.secondary }}>{item.label}</span>
                          )}
                        </li>
                      ))}
                    </ol>
                  </nav>
                )}
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main 
          className="flex-1 overflow-x-hidden overflow-y-auto"
          style={{ backgroundColor: theme.colors.background.primary }}
        >
          <div className="py-6">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              {children}
            </div>
          </div>
        </main>
      </div>

      {/* Right Sidebar (if provided) */}
      {rightContent && (
        <motion.div 
          initial={{ x: 100, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          className="hidden lg:block w-64 border-l overflow-y-auto"
          style={{ 
            borderColor: theme.colors.border.DEFAULT,
            backgroundColor: theme.colors.background.card
          }}
        >
          <div className="p-4">
            {rightContent}
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default StandardLayout; 