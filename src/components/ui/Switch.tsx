'use client'

import { forwardRef, InputHTMLAttributes } from 'react'
import { useTheme } from '@/contexts/ThemeContext'

export interface SwitchProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type' | 'onChange' | 'size'> {
  label?: string
  checked?: boolean
  onChange?: (checked: boolean) => void
  size?: 'sm' | 'md' | 'lg'
}

export const Switch = forwardRef<HTMLInputElement, SwitchProps>(
  ({ label, checked = false, onChange, size = 'md', disabled, className = '', ...props }, ref) => {
    const { theme } = useTheme()

    const sizes = {
      sm: {
        switch: 'w-8 h-4',
        slider: 'w-3 h-3',
        translate: 'translate-x-4',
        label: 'text-sm'
      },
      md: {
        switch: 'w-11 h-6',
        slider: 'w-5 h-5',
        translate: 'translate-x-5',
        label: 'text-base'
      },
      lg: {
        switch: 'w-14 h-7',
        slider: 'w-6 h-6',
        translate: 'translate-x-7',
        label: 'text-lg'
      }
    }

    const currentSize = sizes[size]

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      onChange?.(e.target.checked)
    }

    return (
      <label className={`flex items-center gap-3 cursor-pointer ${disabled ? 'opacity-50 cursor-not-allowed' : ''} ${className}`}>
        <div className="relative">
          <input
            ref={ref}
            type="checkbox"
            checked={checked}
            onChange={handleChange}
            disabled={disabled}
            className="sr-only"
            {...props}
          />
          <div
            className={`${currentSize.switch} rounded-full transition-colors duration-200 ease-in-out`}
            style={{
              backgroundColor: checked ? theme.colors.primary.DEFAULT : theme.colors.background.secondary
            }}
          >
            <div
              className={`${currentSize.slider} rounded-full shadow-lg transform transition-transform duration-200 ease-in-out ${
                checked ? currentSize.translate : 'translate-x-0.5'
              }`}
              style={{
                backgroundColor: theme.colors.background.primary
              }}
            />
          </div>
        </div>
        {label && (
          <span 
            className={currentSize.label}
            style={{ color: theme.colors.text.primary }}
          >
            {label}
          </span>
        )}
      </label>
    )
  }
)

Switch.displayName = 'Switch' 