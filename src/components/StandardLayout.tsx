'use client';

import { ReactNode, useState } from 'react';
import StandardSidebar from '@/components/StandardSidebar';
import StandardHeader from '@/components/StandardHeader';
import Link from 'next/link';

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

  return (
    <div className="flex min-h-screen bg-slate-50">
      {/* Mobile Sidebar Backdrop */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-40 bg-slate-900 bg-opacity-50 md:hidden backdrop-blur-sm"
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
        <header className="bg-white shadow-sm border-b border-slate-200 sticky top-0 z-10">
          <div className="px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center justify-between">
              {/* Mobile menu button */}
              <button
                type="button"
                className="md:hidden inline-flex items-center justify-center p-2 rounded-md text-slate-500 hover:text-slate-600 hover:bg-slate-100"
                onClick={() => setSidebarOpen(true)}
              >
                <span className="sr-only">Abrir menu</span>
                <span className="material-symbols-outlined">menu</span>
              </button>

              <div className="flex-1 min-w-0">
                {title && (
                  <h1 className="text-2xl font-semibold text-slate-900 truncate">
                    {title}
                  </h1>
                )}
                {subtitle && (
                  <p className="mt-1 text-sm text-slate-500 truncate">
                    {subtitle}
                  </p>
                )}
                {showBreadcrumb && breadcrumbItems.length > 0 && (
                  <nav className="mt-1">
                    <ol className="flex items-center space-x-1 text-sm text-slate-500">
                      {breadcrumbItems.map((item, index) => (
                        <li key={index} className="flex items-center">
                          {index > 0 && <span className="mx-1">/</span>}
                          {item.href ? (
                            <Link href={item.href} className="hover:text-slate-700">
                              {item.label}
                            </Link>
                          ) : (
                            <span>{item.label}</span>
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
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-slate-50">
          <div className="py-6">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              {children}
            </div>
          </div>
        </main>
      </div>

      {/* Right Sidebar (if provided) */}
      {rightContent && (
        <div className="hidden lg:block w-64 border-l border-slate-200 bg-white overflow-y-auto">
          <div className="p-4">
            {rightContent}
          </div>
        </div>
      )}
    </div>
  );
};

export default StandardLayout; 