'use client'

import { forwardRef, useState, useEffect, useRef } from 'react'
import { useTheme } from '@/contexts/ThemeContext'

interface TextareaProps extends Omit<React.TextareaHTMLAttributes<HTMLTextAreaElement>, 'size'> {
  label?: string
  error?: string
  helperText?: string
  variant?: 'default' | 'filled' | 'outlined'
  size?: 'sm' | 'md' | 'lg'
  autoResize?: boolean
  showCharCount?: boolean
  maxLength?: number
  minRows?: number
  maxRows?: number
}

const sizeClasses = {
  sm: 'px-3 py-2 text-sm',
  md: 'px-4 py-3 text-base',
  lg: 'px-5 py-4 text-lg'
}

const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(({
  label,
  error,
  helperText,
  variant = 'default',
  size = 'md',
  autoResize = false,
  showCharCount = false,
  maxLength,
  minRows = 3,
  maxRows = 10,
  className = '',
  disabled,
  value,
  onChange,
  ...props
}, ref) => {
  const { theme } = useTheme()
  const [isFocused, setIsFocused] = useState(false)
  const [charCount, setCharCount] = useState(0)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const internalRef = ref || textareaRef

  // Auto resize functionality
  const adjustHeight = () => {
    const textarea = (internalRef as React.RefObject<HTMLTextAreaElement>)?.current
    if (textarea && autoResize) {
      textarea.style.height = 'auto'
      const scrollHeight = textarea.scrollHeight
      const lineHeight = parseInt(getComputedStyle(textarea).lineHeight)
      const minHeight = lineHeight * minRows
      const maxHeight = lineHeight * maxRows
      
      const newHeight = Math.min(Math.max(scrollHeight, minHeight), maxHeight)
      textarea.style.height = `${newHeight}px`
    }
  }

  useEffect(() => {
    if (autoResize) {
      adjustHeight()
    }
  }, [value, autoResize])

  useEffect(() => {
    if (showCharCount && typeof value === 'string') {
      setCharCount(value.length)
    }
  }, [value, showCharCount])

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

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    if (showCharCount) {
      setCharCount(e.target.value.length)
    }
    if (autoResize) {
      adjustHeight()
    }
    onChange?.(e)
  }

  const textareaId = props.id || `textarea-${Math.random().toString(36).substr(2, 9)}`
  const isOverLimit = maxLength && charCount > maxLength

  return (
    <div className="w-full">
      {label && (
        <label 
          htmlFor={textareaId}
          className="block text-sm font-medium mb-2"
          style={{ color: theme.colors.text.primary }}
        >
          {label}
        </label>
      )}
      
      <div className="relative">
        <textarea
          ref={internalRef}
          id={textareaId}
          className={`
            w-full transition-all duration-200 outline-none resize-none
            ${sizeClasses[size]}
            ${disabled ? 'opacity-50 cursor-not-allowed' : 'hover:shadow-md focus:shadow-lg'}
            ${className}
          `}
          style={{
            ...getVariantStyles(),
            minHeight: autoResize ? 'auto' : `${minRows * 1.5}rem`
          }}
          rows={autoResize ? undefined : minRows}
          maxLength={maxLength}
          value={value}
          onChange={handleChange}
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
      </div>
      
      <div className="flex justify-between items-start mt-2">
        <div className="flex-1">
          {error ? (
            <p style={{ color: theme.colors.status.error }} className="flex items-center gap-1 text-sm">
              <span className="material-symbols-outlined text-sm">error</span>
              {error}
            </p>
          ) : helperText ? (
            <p style={{ color: theme.colors.text.secondary }} className="text-sm">{helperText}</p>
          ) : null}
        </div>
        
        {showCharCount && (
          <div className="text-sm ml-2 flex-shrink-0">
            <span 
              style={{ 
                color: isOverLimit 
                  ? theme.colors.status.error 
                  : theme.colors.text.secondary 
              }}
            >
              {charCount}
              {maxLength && `/${maxLength}`}
            </span>
          </div>
        )}
      </div>
    </div>
  )
})

Textarea.displayName = 'Textarea'

export default Textarea