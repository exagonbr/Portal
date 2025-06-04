'use client';

import { ReactNode } from 'react';

interface StatCardProps {
  title: string;
  value: string | number;
  icon?: ReactNode;
  change?: {
    value: string | number;
    trend: 'up' | 'down' | 'neutral';
    period?: string;
  };
  color?: 'blue' | 'green' | 'yellow' | 'red' | 'purple' | 'indigo';
  href?: string;
}

const StatCard = ({ 
  title, 
  value, 
  icon, 
  change, 
  color = 'blue',
  href 
}: StatCardProps) => {
  const colorClasses = {
    blue: {
      bg: 'bg-blue-50',
      text: 'text-blue-700',
      icon: 'text-blue-600',
      border: 'border-blue-100',
      gradient: 'from-blue-500 to-blue-600'
    },
    green: {
      bg: 'bg-emerald-50',
      text: 'text-emerald-700',
      icon: 'text-emerald-600',
      border: 'border-emerald-100',
      gradient: 'from-emerald-500 to-emerald-600'
    },
    yellow: {
      bg: 'bg-amber-50',
      text: 'text-amber-700',
      icon: 'text-amber-600',
      border: 'border-amber-100',
      gradient: 'from-amber-500 to-amber-600'
    },
    red: {
      bg: 'bg-red-50',
      text: 'text-red-700',
      icon: 'text-red-600',
      border: 'border-red-100',
      gradient: 'from-red-500 to-red-600'
    },
    purple: {
      bg: 'bg-violet-50',
      text: 'text-violet-700',
      icon: 'text-violet-600',
      border: 'border-violet-100',
      gradient: 'from-violet-500 to-violet-600'
    },
    indigo: {
      bg: 'bg-indigo-50',
      text: 'text-indigo-700',
      icon: 'text-indigo-600',
      border: 'border-indigo-100',
      gradient: 'from-indigo-500 to-indigo-600'
    }
  };

  const getTrendIcon = (trend: 'up' | 'down' | 'neutral') => {
    switch (trend) {
      case 'up':
        return (
          <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 17l5-5 5 5M7 7l5 5 5-5" />
          </svg>
        );
      case 'down':
        return (
          <svg className="w-4 h-4 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 7l-5 5-5-5M17 17l-5-5-5 5" />
          </svg>
        );
      case 'neutral':
        return (
          <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
          </svg>
        );
    }
  };

  const cardContent = (
    <div className={`bg-white rounded-2xl border ${colorClasses[color].border} p-6 hover:shadow-xl hover:scale-[1.02] transition-all duration-300 relative overflow-hidden group`}>
      {/* Background Gradient Effect */}
      <div className={`absolute top-0 right-0 w-20 h-20 bg-gradient-to-br ${colorClasses[color].gradient} opacity-5 rounded-full -translate-y-10 translate-x-10 group-hover:scale-150 transition-transform duration-300`}></div>
      
      <div className="flex items-start justify-between relative">
        <div className="flex-1">
          <p className="text-sm font-semibold text-slate-600 mb-2 uppercase tracking-wider">{title}</p>
          <p className="text-3xl font-bold text-slate-800 mb-1">{value}</p>
          
          {change && (
            <div className="flex items-center">
              {getTrendIcon(change.trend)}
              <span className={`text-sm font-semibold ml-1.5 ${
                change.trend === 'up' ? 'text-emerald-600' : 
                change.trend === 'down' ? 'text-red-600' : 
                'text-slate-500'
              }`}>
                {change.value}%
              </span>
              {change.period && (
                <span className="text-sm text-slate-500 ml-1">{change.period}</span>
              )}
            </div>
          )}
        </div>
        
        {icon && (
          <div className={`${colorClasses[color].bg} ${colorClasses[color].icon} p-4 rounded-2xl shadow-sm group-hover:shadow-md transition-shadow duration-300`}>
            {icon}
          </div>
        )}
      </div>
    </div>
  );

  if (href) {
    return (
      <a href={href} className="block">
        {cardContent}
      </a>
    );
  }

  return cardContent;
};

export default StatCard; 