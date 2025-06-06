'use client';

import React from 'react';

interface ContentSectionProps {
  title?: string;
  description?: string;
  children: React.ReactNode;
  actions?: React.ReactNode;
  className?: string;
}

export default function ContentSection({
  title,
  description,
  children,
  actions,
  className = ''
}: ContentSectionProps) {
  return (
    <section className={`bg-white rounded-lg shadow-sm border border-gray-200 ${className}`}>
      {/* Section Header */}
      {(title || description || actions) && (
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              {title && (
                <h2 className="text-lg font-medium text-gray-900">
                  {title}
                </h2>
              )}
              {description && (
                <p className="mt-1 text-sm text-gray-600">
                  {description}
                </p>
              )}
            </div>
            {actions && (
              <div className="flex items-center space-x-2">
                {actions}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Section Content */}
      <div className="p-6">
        {children}
      </div>
    </section>
  );
} 