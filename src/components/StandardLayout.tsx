'use client';

import { ReactNode, useState } from 'react';
import StandardSidebar from '@/components/StandardSidebar';
import StandardHeader from '@/components/StandardHeader';

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
    <div className="flex h-screen bg-slate-50">
      {/* Mobile Sidebar Backdrop */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-40 bg-slate-900 bg-opacity-50 md:hidden backdrop-blur-sm"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Desktop Sidebar */}
      <div className="hidden md:flex md:shrink-0">
        <StandardSidebar />
      </div>

      {/* Mobile Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-50 w-64 transform transition-transform duration-300 ease-in-out md:hidden ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        <StandardSidebar />
      </div>

      {/* Main Content */}
      <div className="flex flex-col flex-1 min-w-0">
        {/* Mobile Menu Button */}
        <div className="md:hidden bg-white border-b border-slate-200 px-4 py-3 shadow-sm">
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-2.5 rounded-xl text-slate-600 hover:bg-slate-100 hover:text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>

        {/* Header */}
        <StandardHeader 
          title={title}
          subtitle={subtitle}
          showBreadcrumb={showBreadcrumb}
          breadcrumbItems={breadcrumbItems}
        />

        {/* Main Content Area */}
        <main className="flex-1 overflow-auto bg-slate-50">
          <div className="flex h-full">
            {/* Primary Content */}
            <div className={`flex-1 ${rightContent ? 'pr-0' : ''}`}>
              <div className="p-6 lg:p-8">
                {children}
              </div>
            </div>

            {/* Right Sidebar Content (Optional) */}
            {rightContent && (
              <div className="w-80 bg-white border-l border-slate-200 overflow-y-auto shadow-sm">
                <div className="p-6 lg:p-8">
                  {rightContent}
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default StandardLayout; 