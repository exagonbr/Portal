'use client'

import { useState } from 'react'
import { LoadingSpinner } from '@/app/loading'

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
      <label htmlFor={props.id} className="block text-sm font-medium text-gray-700">
        {label}
      </label>
      <div className="mt-1 relative">
        <input
          {...props}
          className={`
            block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none sm:text-sm
            ${error 
              ? 'border-red-300 text-red-900 placeholder-red-300 focus:ring-red-500 focus:border-red-500' 
              : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
            }
            ${className}
          `}
        />
        {error && (
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
            <svg className="h-5 w-5 text-red-500" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
          </div>
        )}
      </div>
      {(error || helper) && (
        <p className={`mt-2 text-sm ${error ? 'text-red-600' : 'text-gray-500'}`}>
          {error || helper}
        </p>
      )}
    </div>
  )
}

export function TextArea({ label, error, helper, className = '', ...props }: TextAreaProps) {
  return (
    <div>
      <label htmlFor={props.id} className="block text-sm font-medium text-gray-700">
        {label}
      </label>
      <div className="mt-1">
        <textarea
          {...props}
          className={`
            block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none sm:text-sm
            ${error 
              ? 'border-red-300 text-red-900 placeholder-red-300 focus:ring-red-500 focus:border-red-500' 
              : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
            }
            ${className}
          `}
        />
      </div>
      {(error || helper) && (
        <p className={`mt-2 text-sm ${error ? 'text-red-600' : 'text-gray-500'}`}>
          {error || helper}
        </p>
      )}
    </div>
  )
}

export function Select({ label, options, error, helper, className = '', ...props }: SelectProps) {
  return (
    <div>
      <label htmlFor={props.id} className="block text-sm font-medium text-gray-700">
        {label}
      </label>
      <div className="mt-1">
        <select
          {...props}
          className={`
            block w-full pl-3 pr-10 py-2 border rounded-md shadow-sm focus:outline-none sm:text-sm
            ${error 
              ? 'border-red-300 text-red-900 focus:ring-red-500 focus:border-red-500' 
              : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
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
      </div>
      {(error || helper) && (
        <p className={`mt-2 text-sm ${error ? 'text-red-600' : 'text-gray-500'}`}>
          {error || helper}
        </p>
      )}
    </div>
  )
}

export function SubmitButton({ 
  children, 
  loading = false,
  className = '',
  ...props 
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { loading?: boolean }) {
  return (
    <button
      type="submit"
      disabled={loading || props.disabled}
      className={`
        w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white
        bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500
        disabled:opacity-50 disabled:cursor-not-allowed
        ${className}
      `}
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
            h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500
            ${error ? 'border-red-300' : ''}
            ${className}
          `}
        />
      </div>
      <div className="ml-3 text-sm">
        <label htmlFor={props.id} className="font-medium text-gray-700">
          {label}
        </label>
        {error && (
          <p className="text-red-600">{error}</p>
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
      <label className="text-sm font-medium text-gray-700">{label}</label>
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
              className="h-4 w-4 border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <label htmlFor={option.value} className="ml-3 text-sm font-medium text-gray-700">
              {option.label}
            </label>
          </div>
        ))}
      </div>
      {error && (
        <p className="mt-2 text-sm text-red-600">{error}</p>
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

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] || null
    if (file) {
      setFileName(file.name)
      onChange(file)
    }
  }

  return (
    <div className={className}>
      <label className="block text-sm font-medium text-gray-700">{label}</label>
      <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
        <div className="space-y-1 text-center">
          <svg
            className="mx-auto h-12 w-12 text-gray-400"
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
          <div className="flex text-sm text-gray-600">
            <label
              htmlFor="file-upload"
              className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500"
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
            <p className="text-sm text-gray-500">{fileName}</p>
          )}
        </div>
      </div>
      {(error || helper) && (
        <p className={`mt-2 text-sm ${error ? 'text-red-600' : 'text-gray-500'}`}>
          {error || helper}
        </p>
      )}
    </div>
  )
}
