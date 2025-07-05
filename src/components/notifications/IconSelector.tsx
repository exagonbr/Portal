'use client'

import { useState } from 'react'

interface IconOption {
  id: string
  icon: string
  label: string
  color: string
  bgColor: string
}

interface IconSelectorProps {
  selected: string
  onSelect: (id: string) => void
}

const iconOptions: IconOption[] = [
  {
    id: 'announcement',
    icon: 'campaign',
    label: 'Comunicado',
    color: 'text-blue-600',
    bgColor: 'bg-blue-100 hover:bg-blue-200'
  },
  {
    id: 'event',
    icon: 'event',
    label: 'Evento',
    color: 'text-purple-600',
    bgColor: 'bg-purple-100 hover:bg-purple-200'
  },
  {
    id: 'assignment',
    icon: 'assignment',
    label: 'Atividade',
    color: 'text-green-600',
    bgColor: 'bg-green-100 hover:bg-green-200'
  },
  {
    id: 'grade',
    icon: 'grade',
    label: 'Avaliação',
    color: 'text-yellow-600',
    bgColor: 'bg-yellow-100 hover:bg-yellow-200'
  },
  {
    id: 'schedule',
    icon: 'schedule',
    label: 'Horário',
    color: 'text-orange-600',
    bgColor: 'bg-orange-100 hover:bg-orange-200'
  },
  {
    id: 'info',
    icon: 'info',
    label: 'Informação',
    color: 'text-cyan-600',
    bgColor: 'bg-cyan-100 hover:bg-cyan-200'
  },
  {
    id: 'warning',
    icon: 'warning',
    label: 'Aviso',
    color: 'text-red-600',
    bgColor: 'bg-red-100 hover:bg-red-200'
  },
  {
    id: 'celebration',
    icon: 'celebration',
    label: 'Celebração',
    color: 'text-pink-600',
    bgColor: 'bg-pink-100 hover:bg-pink-200'
  }
]

export default function IconSelector({ selected, onSelect }: IconSelectorProps) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
      {iconOptions.map((option) => (
        <button
          key={option.id}
          onClick={() => onSelect(option.id)}
          className={`
            relative p-6 rounded-xl border-2 transition-all duration-200
            ${selected === option.id 
              ? 'border-blue-500 shadow-lg scale-105' 
              : 'border-gray-200 hover:border-gray-300'
            }
          `}
        >
          <div className={`
            w-16 h-16 mx-auto mb-3 rounded-full flex items-center justify-center
            ${option.bgColor} ${selected === option.id ? 'ring-4 ring-blue-200' : ''}
          `}>
            <span className={`material-symbols-outlined text-3xl ${option.color}`}>
              {option.icon}
            </span>
          </div>
          <p className={`
            text-sm font-medium
            ${selected === option.id ? 'text-blue-600' : 'text-gray-700'}
          `}>
            {option.label}
          </p>
          {selected === option.id && (
            <div className="absolute top-2 right-2">
              <span className="material-symbols-outlined text-blue-500 text-sm">
                check_circle
              </span>
            </div>
          )}
        </button>
      ))}
    </div>
  )
}

export { iconOptions }
export type { IconOption }
