import React from 'react'

interface CheckboxProps extends React.InputHTMLAttributes<HTMLInputElement> {
  className?: string
  label?: string
}

export function Checkbox({ className = '', label, ...props }: CheckboxProps) {
  const checkboxElement = (
    <input
      type="checkbox"
      className={`h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded ${className}`}
      {...props}
    />
  )

  if (label) {
    return (
      <div className="flex items-center">
        {checkboxElement}
        <label className="ml-2 block text-sm text-gray-900">
          {label}
        </label>
      </div>
    )
  }

  return checkboxElement
}

export default Checkbox 