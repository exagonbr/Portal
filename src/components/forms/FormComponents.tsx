'use client'

import { useState } from 'react'
import { LoadingSpinner } from '../../app/loading'

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string
  error?: string
  helper?: string
}

interface TextAreaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: string
  error?: string
  helper?: string
}

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label: string
  options: { value: string; label: string }[]
  error?: string
  helper?: string
}

export function Input({ label, error, helper, className = '', ...props }: InputProps) {
  return (
    <div>
      <label htmlFor={props.id} className="block text-sm font-medium text-text-secondary mb-2">
        {label}
      </label>
      <div className="relative">
        <input
          {...props}
          className={`
            input-field w-full transition-all duration-200
            ${error 
              ? 'border-error focus:border-error focus:ring-error/20' 
              : 'border-border focus:border-primary focus:ring-primary/20'
            }
            ${className}
          `}
        />
        {error && (
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
            <svg className="h-5 w-5 text-error" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
        )}
      </div>
      {(error || helper) && (
        <p className={`mt-2 text-sm ${error ? 'text-error' : 'text-text-secondary'}`}>
          {error || helper}
        </p>
      )}
    </div>
  )
}

export function TextArea({ label, error, helper, className = '', ...props }: TextAreaProps) {
  return (
    <div>
      <label htmlFor={props.id} className="block text-sm font-medium text-text-secondary mb-2">
        {label}
      </label>
      <div className="relative">
        <textarea
          {...props}
          className={`
            input-field w-full transition-all duration-200 min-h-[100px]
            ${error 
              ? 'border-error focus:border-error focus:ring-error/20' 
              : 'border-border focus:border-primary focus:ring-primary/20'
            }
            ${className}
          `}
        />
      </div>
      {(error || helper) && (
        <p className={`mt-2 text-sm ${error ? 'text-error' : 'text-text-secondary'}`}>
          {error || helper}
        </p>
      )}
    </div>
  )
}

export function Select({ label, options, error, helper, className = '', ...props }: SelectProps) {
  return (
    <div>
      <label htmlFor={props.id} className="block text-sm font-medium text-text-secondary mb-2">
        {label}
      </label>
      <div className="relative">
        <select
          {...props}
          className={`
            input-field w-full transition-all duration-200 appearance-none
            ${error 
              ? 'border-error focus:border-error focus:ring-error/20' 
              : 'border-border focus:border-primary focus:ring-primary/20'
            }
            ${className}
          `}
        >
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
          <svg className="h-5 w-5 text-text-secondary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>
      {(error || helper) && (
        <p className={`mt-2 text-sm ${error ? 'text-error' : 'text-text-secondary'}`}>
          {error || helper}
        </p>
      )}
    </div>
  )
}

export function SubmitButton({ 
  children, 
  loading = false,
  variant = 'primary',
  className = '',
  ...props 
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { 
  loading?: boolean;
  variant?: 'primary' | 'secondary';
}) {
  const baseClasses = "w-full flex justify-center items-center py-3 px-4 text-sm font-medium rounded-xl shadow-sm transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-offset-2";
  const variantClasses = {
    primary: "text-white bg-primary hover:bg-primary-dark focus:ring-primary",
    secondary: "text-text-primary bg-white border border-border hover:bg-background-start focus:ring-primary"
  };

  return (
    <button
      type="submit"
      disabled={loading || props.disabled}
      className={`${baseClasses} ${variantClasses[variant]} ${className}`}
      {...props}
    >
      {loading ? (
        <LoadingSpinner size="small" />
      ) : (
        children
      )}
    </button>
  )
}

export function FormGroup({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`space-y-6 ${className}`}>
      {children}
    </div>
  )
}

export function Checkbox({ 
  label, 
  error,
  className = '',
  ...props 
}: InputProps) {
  return (
    <div className="relative flex items-start">
      <div className="flex items-center h-5">
        <input
          type="checkbox"
          {...props}
          className={`
            h-4 w-4 rounded border-2 transition-colors duration-200
            text-primary focus:ring-primary/20
            ${error ? 'border-error' : 'border-border'}
            ${className}
          `}
        />
      </div>
      <div className="ml-3">
        <label htmlFor={props.id} className="text-sm font-medium text-text-primary">
          {label}
        </label>
        {error && (
          <p className="text-sm text-error mt-1">{error}</p>
        )}
      </div>
    </div>
  )
}

export function RadioGroup({
  label,
  options,
  error,
  value,
  onChange,
  className = ''
}: {
  label: string
  options: { value: string; label: string }[]
  error?: string
  value: string
  onChange: (value: string) => void
  className?: string
}) {
  return (
    <div className={className}>
      <label className="text-sm font-medium text-text-secondary">{label}</label>
      <div className="mt-4 space-y-4">
        {options.map((option) => (
          <div key={option.value} className="flex items-center">
            <input
              type="radio"
              id={option.value}
              name={label}
              value={option.value}
              checked={value === option.value}
              onChange={(e) => onChange(e.target.value)}
              className="h-4 w-4 border-2 border-border text-primary focus:ring-primary/20"
            />
            <label htmlFor={option.value} className="ml-3 text-sm font-medium text-text-primary">
              {option.label}
            </label>
          </div>
        ))}
      </div>
      {error && (
        <p className="mt-2 text-sm text-error">{error}</p>
      )}
    </div>
  )
}

export function FileUpload({
  label,
  error,
  helper,
  accept,
  onChange,
  className = ''
}: {
  label: string
  error?: string
  helper?: string
  accept?: string
  onChange: (file: File | null) => void
  className?: string
}) {
  const [fileName, setFileName] = useState<string>('')
  const [isDragging, setIsDragging] = useState(false)

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] || null
    if (file) {
      setFileName(file.name)
      onChange(file)
    }
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    const file = e.dataTransfer.files[0]
    if (file) {
      setFileName(file.name)
      onChange(file)
    }
  }

  return (
    <div className={className}>
      <label className="block text-sm font-medium text-text-secondary mb-2">{label}</label>
      <div
        className={`
          mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-dashed rounded-xl
          transition-colors duration-200
          ${isDragging 
            ? 'border-primary bg-primary/5' 
            : error 
              ? 'border-error/50 bg-error/5' 
              : 'border-border hover:border-primary/50 hover:bg-background-start'
          }
        `}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <div className="space-y-1 text-center">
          <svg
            className={`mx-auto h-12 w-12 ${error ? 'text-error' : 'text-text-secondary'}`}
            stroke="currentColor"
            fill="none"
            viewBox="0 0 48 48"
          >
            <path
              d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          <div className="flex text-sm text-text-secondary">
            <label
              htmlFor="file-upload"
              className="relative cursor-pointer font-medium text-primary hover:text-primary-dark focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-primary"
            >
              <span>Carregar arquivo</span>
              <input
                id="file-upload"
                name="file-upload"
                type="file"
                accept={accept}
                onChange={handleChange}
                className="sr-only"
              />
            </label>
            <p className="pl-1">ou arraste e solte</p>
          </div>
          {fileName && (
            <p className="text-sm text-text-secondary">{fileName}</p>
          )}
        </div>
      </div>
      {(error || helper) && (
        <p className={`mt-2 text-sm ${error ? 'text-error' : 'text-text-secondary'}`}>
          {error || helper}
        </p>
      )}
    </div>
  )
}
