'use client';

import React from 'react';

interface SimpleCardProps {
  children: React.ReactNode;
  className?: string;
}

const SimpleCard: React.FC<SimpleCardProps> = ({
  children,
  className = '',
}) => {
  return (
    <div
      className={`bg-white rounded-lg shadow-md border border-gray-200 ${className}`}
    >
      {children}
    </div>
  );
};

export default SimpleCard; 