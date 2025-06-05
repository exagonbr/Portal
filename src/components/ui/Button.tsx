'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { useTheme } from '@/contexts/ThemeContext';

interface ButtonProps {
  children?: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'accent' | 'success' | 'warning' | 'error' | 'ghost' | 'outline';
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  loading?: boolean;
  fullWidth?: boolean;
  rounded?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full';
  gradient?: boolean;
  glow?: boolean;
  className?: string;
  disabled?: boolean;
  onClick?: () => void;
  type?: 'button' | 'submit' | 'reset';
}

const sizeClasses = {
  xs: 'px-2 py-1 text-xs',
  sm: 'px-3 py-1.5 text-sm',
  md: 'px-4 py-2 text-base',
  lg: 'px-6 py-3 text-lg',
  xl: 'px-8 py-4 text-xl',
};

const roundedClasses = {
  sm: 'rounded',
  md: 'rounded-md',
  lg: 'rounded-lg',
  xl: 'rounded-xl',
  '2xl': 'rounded-2xl',
  full: 'rounded-full',
};

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  icon,
  iconPosition = 'left',
  loading = false,
  fullWidth = false,
  rounded = 'lg',
  gradient = false,
  glow = false,
  className = '',
  disabled,
  ...props
}) => {
  const { theme } = useTheme();

  const getVariantStyles = () => {
    const baseStyles = {
      transition: 'all 0.3s ease',
      fontWeight: '500',
    };

    switch (variant) {
      case 'primary':
        return {
          ...baseStyles,
          backgroundColor: gradient 
            ? 'transparent' 
            : theme.colors.primary.DEFAULT,
          backgroundImage: gradient 
            ? `linear-gradient(135deg, ${theme.colors.primary.DEFAULT} 0%, ${theme.colors.primary.light} 100%)`
            : 'none',
          color: theme.colors.primary.contrast,
          border: 'none',
          boxShadow: glow ? `0 0 20px ${theme.colors.primary.DEFAULT}40` : theme.shadows.md,
        };
      case 'secondary':
        return {
          ...baseStyles,
          backgroundColor: gradient 
            ? 'transparent' 
            : theme.colors.secondary.DEFAULT,
          backgroundImage: gradient 
            ? `linear-gradient(135deg, ${theme.colors.secondary.DEFAULT} 0%, ${theme.colors.secondary.light} 100%)`
            : 'none',
          color: theme.colors.secondary.contrast,
          border: 'none',
          boxShadow: glow ? `0 0 20px ${theme.colors.secondary.DEFAULT}40` : theme.shadows.md,
        };
      case 'accent':
        return {
          ...baseStyles,
          backgroundColor: gradient 
            ? 'transparent' 
            : theme.colors.accent.DEFAULT,
          backgroundImage: gradient 
            ? `linear-gradient(135deg, ${theme.colors.accent.DEFAULT} 0%, ${theme.colors.accent.light} 100%)`
            : 'none',
          color: theme.colors.accent.contrast,
          border: 'none',
          boxShadow: glow ? `0 0 20px ${theme.colors.accent.DEFAULT}40` : theme.shadows.md,
        };
      case 'success':
        return {
          ...baseStyles,
          backgroundColor: theme.colors.status.success,
          color: '#ffffff',
          border: 'none',
          boxShadow: glow ? `0 0 20px ${theme.colors.status.success}40` : theme.shadows.md,
        };
      case 'warning':
        return {
          ...baseStyles,
          backgroundColor: theme.colors.status.warning,
          color: '#000000',
          border: 'none',
          boxShadow: glow ? `0 0 20px ${theme.colors.status.warning}40` : theme.shadows.md,
        };
      case 'error':
        return {
          ...baseStyles,
          backgroundColor: theme.colors.status.error,
          color: '#ffffff',
          border: 'none',
          boxShadow: glow ? `0 0 20px ${theme.colors.status.error}40` : theme.shadows.md,
        };
      case 'ghost':
        return {
          ...baseStyles,
          backgroundColor: 'transparent',
          color: theme.colors.text.primary,
          border: 'none',
          boxShadow: 'none',
        };
      case 'outline':
        return {
          ...baseStyles,
          backgroundColor: 'transparent',
          color: theme.colors.primary.DEFAULT,
          border: `2px solid ${theme.colors.primary.DEFAULT}`,
          boxShadow: 'none',
        };
      default:
        return baseStyles;
    }
  };

  const variantStyles = getVariantStyles();

  const hoverStyles = {
    primary: {
      backgroundColor: !gradient ? theme.colors.primary.dark : undefined,
      transform: 'translateY(-2px)',
      boxShadow: theme.shadows.lg,
    },
    secondary: {
      backgroundColor: !gradient ? theme.colors.secondary.dark : undefined,
      transform: 'translateY(-2px)',
      boxShadow: theme.shadows.lg,
    },
    accent: {
      backgroundColor: !gradient ? theme.colors.accent.dark : undefined,
      transform: 'translateY(-2px)',
      boxShadow: theme.shadows.lg,
    },
    success: {
      filter: 'brightness(0.9)',
      transform: 'translateY(-2px)',
      boxShadow: theme.shadows.lg,
    },
    warning: {
      filter: 'brightness(0.9)',
      transform: 'translateY(-2px)',
      boxShadow: theme.shadows.lg,
    },
    error: {
      filter: 'brightness(0.9)',
      transform: 'translateY(-2px)',
      boxShadow: theme.shadows.lg,
    },
    ghost: {
      backgroundColor: `${theme.colors.primary.DEFAULT}10`,
    },
    outline: {
      backgroundColor: `${theme.colors.primary.DEFAULT}10`,
      borderColor: theme.colors.primary.dark,
    },
  };

  const buttonStyle: React.CSSProperties = {
    ...variantStyles,
    ['--tw-ring-color' as any]: theme.colors.primary.light,
  };

  return (
    <motion.button
      className={`
        ${sizeClasses[size]} 
        ${roundedClasses[rounded]} 
        ${fullWidth ? 'w-full' : ''} 
        inline-flex items-center justify-center gap-2 
        font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 
        disabled:opacity-50 disabled:cursor-not-allowed
        ${className}
      `}
      style={buttonStyle}
      whileHover={!disabled && !loading ? hoverStyles[variant] : {}}
      whileTap={!disabled && !loading ? { scale: 0.95 } : {}}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <motion.span
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="material-symbols-outlined"
        >
          progress_activity
        </motion.span>
      ) : (
        <>
          {icon && iconPosition === 'left' && icon}
          {children}
          {icon && iconPosition === 'right' && icon}
        </>
      )}
    </motion.button>
  );
};

// Componente de grupo de botões
interface ButtonGroupProps {
  children: React.ReactNode;
  className?: string;
  spacing?: 'xs' | 'sm' | 'md' | 'lg';
  direction?: 'horizontal' | 'vertical';
}

const spacingClasses = {
  xs: 'gap-1',
  sm: 'gap-2',
  md: 'gap-3',
  lg: 'gap-4',
};

export const ButtonGroup: React.FC<ButtonGroupProps> = ({
  children,
  className = '',
  spacing = 'md',
  direction = 'horizontal',
}) => {
  return (
    <div 
      className={`
        flex 
        ${direction === 'horizontal' ? 'flex-row' : 'flex-col'} 
        ${spacingClasses[spacing]} 
        ${className}
      `}
    >
      {children}
    </div>
  );
};

// Componente de botão flutuante (FAB)
interface FABProps extends Omit<ButtonProps, 'fullWidth' | 'rounded'> {
  position?: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left';
}

const positionClasses = {
  'bottom-right': 'bottom-4 right-4',
  'bottom-left': 'bottom-4 left-4',
  'top-right': 'top-4 right-4',
  'top-left': 'top-4 left-4',
};

export const FAB: React.FC<FABProps> = ({
  position = 'bottom-right',
  size = 'lg',
  ...props
}) => {
  return (
    <div className={`fixed ${positionClasses[position]} z-50`}>
      <Button
        {...props}
        rounded="full"
        glow
        className="shadow-xl"
      />
    </div>
  );
}; 