'use client'

import { useState, useRef, useEffect } from 'react'
import { useTheme } from '@/contexts/ThemeContext'
import { motion, AnimatePresence } from 'framer-motion'

interface Option {
  value: string
  label: string
  disabled?: boolean
}

interface SelectProps {
  label?: string
  placeholder?: string
  options?: Option[]
  value?: string | string[]
  onChange: (value: string | string[]) => void
  error?: string
  helperText?: string
  multiple?: boolean
  searchable?: boolean
  disabled?: boolean
  size?: 'sm' | 'md' | 'lg'
  variant?: 'default' | 'filled' | 'outlined'
  className?: string
}

const sizeClasses = {
  sm: 'px-3 py-2 text-sm',
  md: 'px-4 py-3 text-base',
  lg: 'px-5 py-4 text-lg'
}

export function Select({
  label,
  placeholder = 'Selecione uma opção',
  options,
  value,
  onChange,
  error,
  helperText,
  multiple = false,
  searchable = false,
  disabled = false,
  size = 'md',
  variant = 'default',
  className = ''
}: SelectProps) {
  const { theme } = useTheme()
  const [isOpen, setIsOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [isFocused, setIsFocused] = useState(false)
  const selectRef = useRef<HTMLDivElement>(null)

  const filteredOptions = searchable && options
    ? options.filter(option =>
        option.label.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : options || []

  const selectedOptions = multiple
    ? (options || []).filter(option => Array.isArray(value) && value.includes(option.value))
    : (options || []).find(option => option.value === value)

  const getVariantStyles = () => {
    const baseStyles = {
      backgroundColor: variant === 'filled' ? theme.colors.background.tertiary : theme.colors.background.primary,
      borderColor: error 
        ? theme.colors.status.error 
        : isFocused || isOpen
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

  const handleOptionClick = (optionValue: string) => {
    if (multiple) {
      const currentValues = Array.isArray(value) ? value : []
      const newValues = currentValues.includes(optionValue)
        ? currentValues.filter(v => v !== optionValue)
        : [...currentValues, optionValue]
      onChange(newValues)
    } else {
      onChange(optionValue)
      setIsOpen(false)
    }
  }

  const handleRemoveOption = (optionValue: string, e: React.MouseEvent) => {
    e.stopPropagation()
    if (multiple && Array.isArray(value)) {
      onChange(value.filter(v => v !== optionValue))
    }
  }

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (selectRef.current && !selectRef.current.contains(event.target as Node)) {
        setIsOpen(false)
        setIsFocused(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const selectId = `select-${Math.random().toString(36).substr(2, 9)}`

  return (
    <div className={`w-full ${className}`} ref={selectRef}>
      {label && (
        <label 
          htmlFor={selectId}
          className="block text-sm font-medium mb-2"
          style={{ color: theme.colors.text.primary }}
        >
          {label}
        </label>
      )}
      
      <div className="relative">
        <div
          id={selectId}
          className={`
            w-full cursor-pointer transition-all duration-200 outline-none
            ${sizeClasses[size]}
            ${disabled ? 'opacity-50 cursor-not-allowed' : 'hover:shadow-md'}
            ${isOpen ? 'shadow-lg' : ''}
          `}
          style={getVariantStyles()}
          onClick={() => !disabled && setIsOpen(!isOpen)}
          onFocus={() => setIsFocused(true)}
          tabIndex={0}
        >
          <div className="flex items-center justify-between">
            <div className="flex-1 flex flex-wrap gap-1">
                             {multiple && Array.isArray(value) && value.length > 0 ? (
                 (selectedOptions as Option[]).map((option) => (
                  <span
                    key={option.value}
                    className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium"
                    style={{
                      backgroundColor: theme.colors.primary.light + '20',
                      color: theme.colors.primary.DEFAULT
                    }}
                  >
                    {option.label}
                    <button
                      onClick={(e) => handleRemoveOption(option.value, e)}
                      className="hover:scale-110 transition-transform"
                    >
                      <span className="material-symbols-outlined text-sm">close</span>
                    </button>
                  </span>
                ))
              ) : !multiple && selectedOptions ? (
                <span>{(selectedOptions as Option).label}</span>
              ) : (
                <span style={{ color: theme.colors.text.secondary }}>{placeholder}</span>
              )}
            </div>
            
            <span 
              className={`material-symbols-outlined transition-transform duration-200 ${
                isOpen ? 'rotate-180' : ''
              }`}
              style={{ color: theme.colors.text.secondary }}
            >
              expand_more
            </span>
          </div>
        </div>

        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, y: -10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              transition={{ duration: 0.15 }}
              className="absolute z-50 w-full mt-1 rounded-lg shadow-xl overflow-hidden"
              style={{
                backgroundColor: theme.colors.background.card,
                border: `1px solid ${theme.colors.border.light}`,
                boxShadow: theme.shadows.lg
              }}
            >
              {searchable && (
                <div className="p-2 border-b" style={{ borderColor: theme.colors.border.light }}>
                  <input
                    type="text"
                    placeholder="Buscar..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full px-3 py-2 rounded-md outline-none text-sm"
                    style={{
                      backgroundColor: theme.colors.background.tertiary,
                      color: theme.colors.text.primary,
                      border: `1px solid ${theme.colors.border.DEFAULT}`
                    }}
                  />
                </div>
              )}
              
              <div className="max-h-60 overflow-y-auto">
                {!filteredOptions || filteredOptions.length === 0 ? (
                  <div 
                    className="px-4 py-3 text-sm text-center"
                    style={{ color: theme.colors.text.secondary }}
                  >
                    Nenhuma opção encontrada
                  </div>
                ) : (
                  filteredOptions.map((option) => {
                    const isSelected = multiple
                      ? Array.isArray(value) && value.includes(option.value)
                      : value === option.value

                    return (
                      <div
                        key={option.value}
                        className={`
                          px-4 py-3 cursor-pointer transition-colors duration-150 text-sm
                          ${option.disabled ? 'opacity-50 cursor-not-allowed' : 'hover:bg-opacity-80'}
                          ${isSelected ? 'font-medium' : ''}
                        `}
                        style={{
                          backgroundColor: isSelected 
                            ? theme.colors.primary.light + '20' 
                            : 'transparent',
                          color: isSelected 
                            ? theme.colors.primary.DEFAULT 
                            : theme.colors.text.primary
                        }}
                        onClick={() => !option.disabled && handleOptionClick(option.value)}
                        onMouseEnter={(e) => {
                          if (!option.disabled && !isSelected) {
                            e.currentTarget.style.backgroundColor = theme.colors.background.hover
                          }
                        }}
                        onMouseLeave={(e) => {
                          if (!isSelected) {
                            e.currentTarget.style.backgroundColor = 'transparent'
                          }
                        }}
                      >
                        <div className="flex items-center justify-between">
                          <span>{option.label}</span>
                          {isSelected && (
                            <span 
                              className="material-symbols-outlined text-sm"
                              style={{ color: theme.colors.primary.DEFAULT }}
                            >
                              check
                            </span>
                          )}
                        </div>
                      </div>
                    )
                  })
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
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
} 