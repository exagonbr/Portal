'use client'

import { forwardRef, useState } from 'react'
import { useTheme } from '@/contexts/ThemeContext'

interface InputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'> {
  label?: string
  error?: string
  helperText?: string
  leftIcon?: string
  rightIcon?: string
  variant?: 'default' | 'filled' | 'outlined'
  size?: 'sm' | 'md' | 'lg'
  isLoading?: boolean
  onRightIconClick?: () => void
}

const sizeClasses = {
  sm: 'px-3 py-2 text-sm',
  md: 'px-4 py-3 text-base',
  lg: 'px-5 py-4 text-lg'
}

const Input = forwardRef<HTMLInputElement, InputProps>(({
  label,
  error,
  helperText,
  leftIcon,
  rightIcon,
  variant = 'default',
  size = 'md',
  isLoading = false,
  onRightIconClick,
  className = '',
  disabled,
  ...props
}, ref) => {
  const { theme } = useTheme()
  const [isFocused, setIsFocused] = useState(false)

  const getVariantStyles = () => {
    const baseStyles = {
      backgroundColor: variant === 'filled' ? theme.colors.background.tertiary : theme.colors.background.primary,
      borderColor: error 
        ? theme.colors.status.error 
        : isFocused 
          ? theme.colors.border.focus 
          : theme.colors.border.DEFAULT,
      color: theme.colors.text.primary
    }

    switch (variant) {
      case 'filled':
        return {
          ...baseStyles,
          border: `2px solid ${baseStyles.borderColor}`,
          borderRadius: '0.75rem'
        }
      case 'outlined':
        return {
          ...baseStyles,
          backgroundColor: 'transparent',
          border: `2px solid ${baseStyles.borderColor}`,
          borderRadius: '0.75rem'
        }
      default:
        return {
          ...baseStyles,
          border: `1px solid ${baseStyles.borderColor}`,
          borderRadius: '0.5rem'
        }
    }
  }

  const inputId = props.id || `input-${Math.random().toString(36).substr(2, 9)}`

  return (
    <div className="w-full">
      {label && (
        <label 
          htmlFor={inputId}
          className="block text-sm font-medium mb-2"
          style={{ color: theme.colors.text.primary }}
        >
          {label}
        </label>
      )}
      
      <div className="relative">
        {leftIcon && (
          <div 
            className="absolute left-3 top-1/2 transform -translate-y-1/2 pointer-events-none"
            style={{ color: theme.colors.text.secondary }}
          >
            <span className="material-symbols-outlined text-xl">{leftIcon}</span>
          </div>
        )}
        
        <input
          ref={ref}
          id={inputId}
          className={`
            w-full transition-all duration-200 outline-none
            ${sizeClasses[size]}
            ${leftIcon ? 'pl-12' : ''}
            ${rightIcon || isLoading ? 'pr-12' : ''}
            ${disabled ? 'opacity-50 cursor-not-allowed' : 'hover:shadow-md focus:shadow-lg'}
            ${className}
          `}
          style={getVariantStyles()}
          onFocus={(e) => {
            setIsFocused(true)
            props.onFocus?.(e)
          }}
          onBlur={(e) => {
            setIsFocused(false)
            props.onBlur?.(e)
          }}
          disabled={disabled}
          {...props}
        />
        
        {(rightIcon || isLoading) && (
          <div 
            className={`absolute right-3 top-1/2 transform -translate-y-1/2 ${
              onRightIconClick && !isLoading ? 'cursor-pointer hover:scale-110' : 'pointer-events-none'
            }`}
            style={{ color: theme.colors.text.secondary }}
            onClick={onRightIconClick && !isLoading ? onRightIconClick : undefined}
          >
            {isLoading ? (
              <div 
                className="animate-spin w-5 h-5 border-2 border-current border-t-transparent rounded-full"
                style={{ borderColor: theme.colors.primary.DEFAULT }}
              />
            ) : (
              <span className="material-symbols-outlined text-xl transition-transform duration-200">
                {rightIcon}
              </span>
            )}
          </div>
        )}
      </div>
      
      {(error || helperText) && (
        <div className="mt-2 text-sm">
          {error ? (
            <p style={{ color: theme.colors.status.error }} className="flex items-center gap-1">
              <span className="material-symbols-outlined text-sm">error</span>
              {error}
            </p>
          ) : (
            <p style={{ color: theme.colors.text.secondary }}>{helperText}</p>
          )}
        </div>
      )}
    </div>
  )
})

Input.displayName = 'Input'

export default Input 