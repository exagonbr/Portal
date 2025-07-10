'use client'

import React, { ReactNode } from 'react'
import { LucideIcon } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'

// Interface para colunas da tabela
interface TableColumn {
  key: string
  label: string
  sortable?: boolean
  render?: (value: any, item: any) => ReactNode
  className?: string
}

// Interface para ações
interface TableAction {
  label: string
  icon: LucideIcon
  onClick: (item: any) => void
  variant?: 'default' | 'outline' | 'ghost' | 'destructive'
  className?: string
  show?: (item: any) => boolean
}

// Interface para o componente
interface DataTableProps {
  data: any[]
  columns: TableColumn[]
  actions?: TableAction[]
  loading?: boolean
  emptyStateIcon?: LucideIcon
  emptyStateTitle?: string
  emptyStateMessage?: string
  itemIdKey?: string
  onRowClick?: (item: any) => void
  className?: string
}

export default function DataTable({
  data,
  columns,
  actions = [],
  loading = false,
  emptyStateIcon: EmptyIcon,
  emptyStateTitle = "Nenhum item encontrado",
  emptyStateMessage = "Não há dados para exibir no momento",
  itemIdKey = 'id',
  onRowClick,
  className = ""
}: DataTableProps) {

  // Loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2 text-gray-600">Carregando...</span>
      </div>
    )
  }

  // Empty state
  if (data.length === 0) {
    return (
      <div className="text-center py-12">
        {EmptyIcon && <EmptyIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />}
        <p className="text-gray-500 text-lg mb-2">{emptyStateTitle}</p>
        <p className="text-gray-400 text-sm">{emptyStateMessage}</p>
      </div>
    )
  }

  return (
    <div className={className}>
      {/* Desktop Table */}
      <div className="hidden lg:block overflow-x-auto">
        <table className="w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              {columns.map((column) => (
                <th
                  key={column.key}
                  className={`px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider ${column.className || ''}`}
                >
                  {column.label}
                </th>
              ))}
              {actions.length > 0 && (
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Ações
                </th>
              )}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {data.map((item) => (
              <tr 
                key={item[itemIdKey]} 
                className={`hover:bg-gray-50 ${onRowClick ? 'cursor-pointer' : ''}`}
                onClick={() => onRowClick?.(item)}
              >
                {columns.map((column) => (
                  <td key={column.key} className={`px-6 py-4 ${column.className || ''}`}>
                    {column.render ? column.render(item[column.key], item) : (
                      <div className="text-sm text-gray-900">
                        {item[column.key] || '-'}
                      </div>
                    )}
                  </td>
                ))}
                {actions.length > 0 && (
                  <td className="px-6 py-4 text-center">
                    <div className="flex items-center justify-center space-x-2">
                      {actions.map((action, actionIndex) => {
                        if (action.show && !action.show(item)) return null
                        
                        return (
                          <Button
                            key={actionIndex}
                            variant={action.variant || 'ghost'}
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation()
                              action.onClick(item)
                            }}
                            className={action.className}
                            title={action.label}
                          >
                            <action.icon className="w-4 h-4" />
                          </Button>
                        )
                      })}
                    </div>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile Cards */}
      <div className="lg:hidden space-y-4 p-4">
        {data.map((item) => (
          <div 
            key={item[itemIdKey]} 
            className={`bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow ${onRowClick ? 'cursor-pointer' : ''}`}
            onClick={() => onRowClick?.(item)}
          >
            <div className="p-4">
              {columns.map((column, index) => (
                <div key={column.key} className={`${index > 0 ? 'mt-3' : ''}`}>
                  <div className="flex justify-between items-start">
                    <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {column.label}
                    </span>
                    <div className="ml-2">
                      {column.render ? column.render(item[column.key], item) : (
                        <span className="text-sm text-gray-900">
                          {item[column.key] || '-'}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
              
              {actions.length > 0 && (
                <div className="mt-4 pt-4 border-t border-gray-100 flex justify-end space-x-2">
                  {actions.map((action, actionIndex) => {
                    if (action.show && !action.show(item)) return null
                    
                    return (
                      <Button
                        key={actionIndex}
                        variant={action.variant || 'outline'}
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation()
                          action.onClick(item)
                        }}
                        className={`flex items-center gap-1 ${action.className || ''}`}
                      >
                        <action.icon className="w-4 h-4" />
                        {action.label}
                      </Button>
                    )
                  })}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// Hook para criar colunas com renderizadores comuns
export const useTableColumns = () => {
  const createColumn = (key: string, label: string, options: Partial<TableColumn> = {}): TableColumn => ({
    key,
    label,
    ...options
  })

  const statusColumn = (key: string, label: string = 'Status'): TableColumn => ({
    key,
    label,
    className: 'text-center',
    render: (value, item) => (
      <Badge variant={value ? 'success' : 'danger'}>
        {value ? 'Ativo' : 'Inativo'}
      </Badge>
    )
  })

  const dateColumn = (key: string, label: string): TableColumn => ({
    key,
    label,
    render: (value) => value ? new Date(value).toLocaleDateString('pt-BR') : '-'
  })

  const countColumn = (key: string, label: string, color: string = 'blue'): TableColumn => ({
    key,
    label,
    className: 'text-center',
    render: (value) => (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-${color}-100 text-${color}-800`}>
        {value || 0}
      </span>
    )
  })

  return {
    createColumn,
    statusColumn,
    dateColumn,
    countColumn
  }
} 