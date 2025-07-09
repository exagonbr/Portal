'use client'

import { useState, useMemo } from 'react'
import { motion } from 'framer-motion'

interface Column<T = any> {
  key: string
  title: string
  dataIndex?: string
  render?: (value: any, record: T, index: number) => React.ReactNode
  sortable?: boolean
  width?: string | number
  align?: 'left' | 'center' | 'right'
  fixed?: 'left' | 'right'
}

interface TableProps<T = any> {
  columns: Column<T>[]
  data: T[]
  loading?: boolean
  pagination?: {
    current: number
    pageSize: number
    total: number
    onChange: (page: number, pageSize: number) => void
  }
  rowKey?: string | ((record: T) => string)
  onRow?: (record: T, index: number) => {
    onClick?: () => void
    onDoubleClick?: () => void
    className?: string
  }
  size?: 'sm' | 'md' | 'lg'
  bordered?: boolean
  striped?: boolean
  hoverable?: boolean
  className?: string
  emptyText?: string
}

const sizeClasses = {
  sm: 'px-3 py-2 text-sm',
  md: 'px-4 py-3 text-base',
  lg: 'px-6 py-4 text-lg'
}

export default function SimpleTable<T = any>({
  columns,
  data,
  loading = false,
  pagination,
  rowKey = 'id',
  onRow,
  size = 'md',
  bordered = false,
  striped = false,
  hoverable = true,
  className = '',
  emptyText = 'Nenhum dado disponível'
}: TableProps<T>) {
  const [sortConfig, setSortConfig] = useState<{
    key: string
    direction: 'asc' | 'desc'
  } | null>(null)

  // Sorting logic
  const sortedData = useMemo(() => {
    if (!sortConfig) return data

    return [...data].sort((a, b) => {
      const aValue = getNestedValue(a, sortConfig.key)
      const bValue = getNestedValue(b, sortConfig.key)

      if (aValue < bValue) {
        return sortConfig.direction === 'asc' ? -1 : 1
      }
      if (aValue > bValue) {
        return sortConfig.direction === 'asc' ? 1 : -1
      }
      return 0
    })
  }, [data, sortConfig])

  // Pagination logic
  const paginatedData = useMemo(() => {
    if (!pagination) return sortedData

    const start = (pagination.current - 1) * pagination.pageSize
    const end = start + pagination.pageSize
    return sortedData.slice(start, end)
  }, [sortedData, pagination])

  const handleSort = (key: string) => {
    setSortConfig(current => {
      if (current?.key === key) {
        if (current.direction === 'asc') {
          return { key, direction: 'desc' }
        } else {
          return null // Remove sorting
        }
      }
      return { key, direction: 'asc' }
    })
  }

  const getNestedValue = (obj: any, path: string) => {
    return path.split('.').reduce((value, key) => value?.[key], obj)
  }

  const getRowKey = (record: T, index: number): string => {
    if (typeof rowKey === 'function') {
      return rowKey(record)
    }
    return getNestedValue(record, rowKey) || index.toString()
  }

  const renderCell = (column: Column<T>, record: T, index: number) => {
    if (column.render) {
      return column.render(getNestedValue(record, column.dataIndex || column.key), record, index)
    }
    return getNestedValue(record, column.dataIndex || column.key)
  }

  return (
    <div className={`w-full ${className}`}>
      <div className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-md">
        <div className="overflow-x-auto">
          <table className="w-full">
            {/* Header */}
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                {columns.map((column) => (
                  <th
                    key={column.key}
                    className={`
                      ${sizeClasses[size]} font-semibold text-gray-700
                      ${column.align === 'center' ? 'text-center' : column.align === 'right' ? 'text-right' : 'text-left'}
                      ${column.sortable ? 'cursor-pointer hover:bg-gray-100 select-none' : ''}
                    `}
                    style={{
                      width: column.width,
                      position: column.fixed ? 'sticky' : 'static',
                      left: column.fixed === 'left' ? 0 : 'auto',
                      right: column.fixed === 'right' ? 0 : 'auto',
                      zIndex: column.fixed ? 10 : 'auto'
                    }}
                    onClick={() => column.sortable && handleSort(column.key)}
                  >
                    <div className="flex items-center gap-2">
                      <span>{column.title}</span>
                      {column.sortable && (
                        <div className="flex flex-col">
                          <span 
                            className={`material-symbols-outlined text-xs leading-none ${
                              sortConfig?.key === column.key && sortConfig.direction === 'asc'
                                ? 'text-blue-600 opacity-100'
                                : 'text-gray-400 opacity-30'
                            }`}
                          >
                            keyboard_arrow_up
                          </span>
                          <span 
                            className={`material-symbols-outlined text-xs leading-none ${
                              sortConfig?.key === column.key && sortConfig.direction === 'desc'
                                ? 'text-blue-600 opacity-100'
                                : 'text-gray-400 opacity-30'
                            }`}
                          >
                            keyboard_arrow_down
                          </span>
                        </div>
                      )}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>

            {/* Body */}
            <tbody>
              {loading ? (
                <tr>
                  <td 
                    colSpan={columns.length} 
                    className="text-center py-12 text-gray-500"
                  >
                    <div className="flex items-center justify-center gap-3">
                      <div className="animate-spin w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full" />
                      <span>Carregando...</span>
                    </div>
                  </td>
                </tr>
              ) : paginatedData.length === 0 ? (
                <tr>
                  <td 
                    colSpan={columns.length} 
                    className="text-center py-12 text-gray-500"
                  >
                    <div className="flex flex-col items-center gap-3">
                      <span className="material-symbols-outlined text-4xl opacity-50">
                        inbox
                      </span>
                      <span>{emptyText}</span>
                    </div>
                  </td>
                </tr>
              ) : (
                paginatedData.map((record, index) => {
                  const rowProps = onRow?.(record, index) || {}
                  const rowKey = getRowKey(record, index)
                  
                  return (
                    <tr
                      key={rowKey}
                      onClick={rowProps.onClick}
                      onDoubleClick={rowProps.onDoubleClick}
                      className={`
                        ${striped && index % 2 === 1 ? 'bg-gray-50' : ''}
                        ${hoverable ? 'hover:bg-blue-50' : ''}
                        ${rowProps.className || ''}
                        border-b border-gray-100 last:border-b-0
                      `}
                    >
                      {columns.map((column) => (
                        <td
                          key={`${rowKey}-${column.key}`}
                          className={`
                            ${sizeClasses[size]}
                            ${column.align === 'center' ? 'text-center' : column.align === 'right' ? 'text-right' : 'text-left'}
                          `}
                          style={{
                            position: column.fixed ? 'sticky' : 'static',
                            left: column.fixed === 'left' ? 0 : 'auto',
                            right: column.fixed === 'right' ? 0 : 'auto',
                            zIndex: column.fixed ? 5 : 'auto',
                            backgroundColor: column.fixed ? 'white' : 'transparent'
                          }}
                        >
                          {renderCell(column, record, index)}
                        </td>
                      ))}
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
        
        {/* Pagination */}
        {pagination && pagination.total > 0 && (
          <div className="flex items-center justify-between border-t border-gray-200 px-4 py-3 sm:px-6">
            <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-gray-700">
                  Mostrando <span className="font-medium">{(pagination.current - 1) * pagination.pageSize + 1}</span> a{' '}
                  <span className="font-medium">
                    {Math.min(pagination.current * pagination.pageSize, pagination.total)}
                  </span>{' '}
                  de <span className="font-medium">{pagination.total}</span> resultados
                </p>
              </div>
              <div>
                <nav className="isolate inline-flex -space-x-px rounded-md shadow-sm" aria-label="Pagination">
                  <button
                    onClick={() => pagination.onChange(Math.max(1, pagination.current - 1), pagination.pageSize)}
                    disabled={pagination.current === 1}
                    className={`relative inline-flex items-center rounded-l-md px-2 py-2 text-gray-400 ${
                      pagination.current === 1 
                        ? 'bg-gray-100 cursor-not-allowed' 
                        : 'bg-white hover:bg-gray-50'
                    }`}
                  >
                    <span className="sr-only">Anterior</span>
                    <span className="material-symbols-outlined text-sm">chevron_left</span>
                  </button>
                  
                  {/* Page numbers */}
                  {Array.from({ length: Math.min(5, Math.ceil(pagination.total / pagination.pageSize)) }).map((_, i) => {
                    let pageNumber: number
                    const totalPages = Math.ceil(pagination.total / pagination.pageSize)
                    
                    if (totalPages <= 5) {
                      pageNumber = i + 1
                    } else if (pagination.current <= 3) {
                      pageNumber = i + 1
                      if (i === 4) pageNumber = totalPages
                    } else if (pagination.current >= totalPages - 2) {
                      pageNumber = totalPages - 4 + i
                      if (i === 0) pageNumber = 1
                    } else {
                      pageNumber = pagination.current - 2 + i
                      if (i === 0) pageNumber = 1
                      if (i === 4) pageNumber = totalPages
                    }
                    
                    const isCurrentPage = pageNumber === pagination.current
                    const isEllipsis = (i === 1 && pageNumber > 2) || (i === 3 && pageNumber < totalPages - 1)
                    
                    if (isEllipsis) {
                      return (
                        <span
                          key={`ellipsis-${i}`}
                          className="relative inline-flex items-center px-4 py-2 text-sm font-semibold text-gray-700 bg-white"
                        >
                          ...
                        </span>
                      )
                    }
                    
                    return (
                      <button
                        key={pageNumber}
                        onClick={() => pagination.onChange(pageNumber, pagination.pageSize)}
                        className={`relative inline-flex items-center px-4 py-2 text-sm font-semibold ${
                          isCurrentPage
                            ? 'z-10 bg-blue-600 text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600'
                            : 'text-gray-900 bg-white hover:bg-gray-50'
                        }`}
                      >
                        {pageNumber}
                      </button>
                    )
                  })}
                  
                  <button
                    onClick={() => 
                      pagination.onChange(
                        Math.min(Math.ceil(pagination.total / pagination.pageSize), pagination.current + 1), 
                        pagination.pageSize
                      )
                    }
                    disabled={pagination.current === Math.ceil(pagination.total / pagination.pageSize)}
                    className={`relative inline-flex items-center rounded-r-md px-2 py-2 text-gray-400 ${
                      pagination.current === Math.ceil(pagination.total / pagination.pageSize)
                        ? 'bg-gray-100 cursor-not-allowed'
                        : 'bg-white hover:bg-gray-50'
                    }`}
                  >
                    <span className="sr-only">Próxima</span>
                    <span className="material-symbols-outlined text-sm">chevron_right</span>
                  </button>
                </nav>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
} 