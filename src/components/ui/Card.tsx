'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { useTheme } from '@/contexts/ThemeContext';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
  gradient?: boolean;
  glass?: boolean;
  onClick?: () => void;
  padding?: 'sm' | 'md' | 'lg' | 'xl';
  shadow?: 'sm' | 'md' | 'lg' | 'xl' | 'none';
  rounded?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full';
  border?: boolean;
  animation?: {
    initial?: any;
    animate?: any;
    exit?: any;
    whileHover?: any;
    whileTap?: any;
  };
}

const paddingSizes = {
  sm: 'p-3',
  md: 'p-4',
  lg: 'p-6',
  xl: 'p-8',
};

const roundedSizes = {
  sm: 'rounded',
  md: 'rounded-md',
  lg: 'rounded-lg',
  xl: 'rounded-xl',
  '2xl': 'rounded-2xl',
  full: 'rounded-full',
};

const Card: React.FC<CardProps> = ({
  children,
  className = '',
  hover = true,
  gradient = false,
  glass = false,
  onClick,
  padding = 'md',
  shadow = 'md',
  rounded = 'lg',
  border = true,
  animation = {},
}) => {
  const { theme } = useTheme();

  const defaultAnimation = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 },
    whileHover: hover ? { scale: 1.02, y: -2 } : {},
    whileTap: onClick ? { scale: 0.98 } : {},
    ...animation,
  };

  const cardStyle: React.CSSProperties = {
    backgroundColor: glass 
      ? theme.type === 'modern' 
        ? 'rgba(26, 26, 26, 0.8)' 
        : 'rgba(255, 255, 255, 0.8)'
      : theme.colors.background.card,
    borderColor: border ? theme.colors.border.DEFAULT : 'transparent',
    borderWidth: border ? '1px' : '0',
    boxShadow: shadow !== 'none' ? theme.shadows[shadow] : 'none',
    backgroundImage: gradient 
      ? `linear-gradient(135deg, ${theme.colors.gradient.from}10 0%, ${theme.colors.gradient.via}10 50%, ${theme.colors.gradient.to}10 100%)`
      : 'none',
    backdropFilter: glass ? 'blur(10px)' : 'none',
    WebkitBackdropFilter: glass ? 'blur(10px)' : 'none',
  };

  return (
    <motion.div
      className={`${paddingSizes[padding]} ${roundedSizes[rounded]} transition-all duration-300 ${
        onClick ? 'cursor-pointer' : ''
      } ${className}`}
      style={cardStyle}
      onClick={onClick}
      {...defaultAnimation}
    >
      {children}
    </motion.div>
  );
};

interface CardHeaderProps {
  children: React.ReactNode;
  className?: string;
  icon?: React.ReactNode;
  action?: React.ReactNode;
}

const CardHeader: React.FC<CardHeaderProps> = ({
  children,
  className = '',
  icon,
  action,
}) => {
  const { theme } = useTheme();

  return (
    <div 
      className={`flex items-center justify-between pb-4 mb-4 border-b ${className}`}
      style={{ borderColor: theme.colors.border.light }}
    >
      <div className="flex items-center gap-3">
        {icon && (
          <div 
            className="p-2 rounded-lg"
            style={{ 
              backgroundColor: `${theme.colors.primary.DEFAULT}15`,
              color: theme.colors.primary.DEFAULT 
            }}
          >
            {icon}
          </div>
        )}
        <h3 
          className="text-lg font-semibold"
          style={{ color: theme.colors.text.primary }}
        >
          {children}
        </h3>
      </div>
      {action && <div>{action}</div>}
    </div>
  );
};

interface CardBodyProps {
  children: React.ReactNode;
  className?: string;
}

const CardBody: React.FC<CardBodyProps> = ({ children, className = '' }) => {
  return <div className={className}>{children}</div>;
};

interface CardFooterProps {
  children: React.ReactNode;
  className?: string;
  align?: 'left' | 'center' | 'right' | 'between';
}

const alignClasses = {
  left: 'justify-start',
  center: 'justify-center',
  right: 'justify-end',
  between: 'justify-between',
};

const CardFooter: React.FC<CardFooterProps> = ({
  children,
  className = '',
  align = 'right',
}) => {
  const { theme } = useTheme();

  return (
    <div 
      className={`flex items-center ${alignClasses[align]} pt-4 mt-4 border-t ${className}`}
      style={{ borderColor: theme.colors.border.light }}
    >
      {children}
    </div>
  );
};

// Componente de Card Estatístico
interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  color?: 'primary' | 'secondary' | 'accent' | 'success' | 'warning' | 'error';
  onClick?: () => void;
}

const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  icon,
  trend,
  color = 'primary',
  onClick,
}) => {
  const { theme } = useTheme();

  const colors = {
    primary: theme.colors.primary.DEFAULT,
    secondary: theme.colors.secondary.DEFAULT,
    accent: theme.colors.accent.DEFAULT,
    success: theme.colors.status.success,
    warning: theme.colors.status.warning,
    error: theme.colors.status.error,
  };

  return (
    <Card
      hover
      onClick={onClick}
      animation={{
        whileHover: { scale: 1.05, rotate: 1 },
      }}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p 
            className="text-sm font-medium"
            style={{ color: theme.colors.text.secondary }}
          >
            {title}
          </p>
          <p 
            className="text-2xl font-bold mt-2"
            style={{ color: theme.colors.text.primary }}
          >
            {value}
          </p>
          {trend && (
            <div className="flex items-center gap-1 mt-2">
              <span 
                className="material-symbols-outlined text-sm"
                style={{ 
                  color: trend.isPositive 
                    ? theme.colors.status.success 
                    : theme.colors.status.error 
                }}
              >
                {trend.isPositive ? 'trending_up' : 'trending_down'}
              </span>
              <span 
                className="text-sm font-medium"
                style={{ 
                  color: trend.isPositive 
                    ? theme.colors.status.success 
                    : theme.colors.status.error 
                }}
              >
                {trend.value}%
              </span>
            </div>
          )}
        </div>
        <div 
          className="p-3 rounded-lg"
          style={{ 
            backgroundColor: `${colors[color]}20`,
            color: colors[color]
          }}
        >
          {icon}
        </div>
      </div>
    </Card>
  );
};

export default Card;
export { CardHeader, CardBody, CardFooter, StatCard }; 