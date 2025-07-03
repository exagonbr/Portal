'use client'

import { useState, useMemo } from 'react'
import { useTheme } from '@/contexts/ThemeContext'
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

export default function Table<T = any>({
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
  const { theme } = useTheme()
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

  const tableStyles = {
    backgroundColor: theme.colors.background.card,
    border: bordered ? `1px solid ${theme.colors.border.DEFAULT}` : 'none',
    borderRadius: '0.75rem',
    overflow: 'hidden',
    boxShadow: theme.shadows.md
  }

  const headerStyles = {
    backgroundColor: theme.colors.background.secondary,
    borderBottom: `1px solid ${theme.colors.border.light}`,
    color: theme.colors.text.primary
  }

  return (
    <div className={`w-full ${className}`}>
      <div className="overflow-hidden rounded-lg" style={tableStyles}>
        <div className="overflow-x-auto">
          <table className="w-full">
            {/* Header */}
            <thead style={headerStyles}>
              <tr>
                {columns.map((column) => (
                  <th
                    key={column.key}
                    className={`
                      ${sizeClasses[size]} font-semibold
                      ${column.align === 'center' ? 'text-center' : column.align === 'right' ? 'text-right' : 'text-left'}
                      ${column.sortable ? 'cursor-pointer hover:bg-opacity-80 select-none' : ''}
                    `}
                    style={{
                      width: column.width,
                      position: column.fixed ? 'sticky' : 'static',
                      left: column.fixed === 'left' ? 0 : 'auto',
                      right: column.fixed === 'right' ? 0 : 'auto',
                      zIndex: column.fixed ? 10 : 'auto'
                    }}
                    onClick={() => column.sortable && handleSort(column.key)}
                    onMouseEnter={(e) => {
                      if (column.sortable) {
                        e.currentTarget.style.backgroundColor = theme.colors.background.hover
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (column.sortable) {
                        e.currentTarget.style.backgroundColor = theme.colors.background.secondary
                      }
                    }}
                  >
                    <div className="flex items-center gap-2">
                      <span>{column.title}</span>
                      {column.sortable && (
                        <div className="flex flex-col">
                          <span 
                            className={`material-symbols-outlined text-xs leading-none ${
                              sortConfig?.key === column.key && sortConfig.direction === 'asc'
                                ? 'opacity-100'
                                : 'opacity-30'
                            }`}
                            style={{ 
                              color: sortConfig?.key === column.key && sortConfig.direction === 'asc'
                                ? theme.colors.primary.DEFAULT
                                : theme.colors.text.secondary
                            }}
                          >
                            keyboard_arrow_up
                          </span>
                          <span 
                            className={`material-symbols-outlined text-xs leading-none ${
                              sortConfig?.key === column.key && sortConfig.direction === 'desc'
                                ? 'opacity-100'
                                : 'opacity-30'
                            }`}
                            style={{ 
                              color: sortConfig?.key === column.key && sortConfig.direction === 'desc'
                                ? theme.colors.primary.DEFAULT
                                : theme.colors.text.secondary
                            }}
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
                    className="text-center py-12"
                    style={{ color: theme.colors.text.secondary }}
                  >
                    <div className="flex items-center justify-center gap-3">
                      <div 
                        className="animate-spin w-6 h-6 border-2 border-current border-t-transparent rounded-full"
                        style={{ borderColor: theme.colors.primary.DEFAULT }}
                      />
                      <span>Carregando...</span>
                    </div>
                  </td>
                </tr>
              ) : paginatedData.length === 0 ? (
                <tr>
                  <td 
                    colSpan={columns.length} 
                    className="text-center py-12"
                    style={{ color: theme.colors.text.secondary }}
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
                  const isEven = index % 2 === 0

                  return (
                    <motion.tr
                      key={getRowKey(record, index)}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.2, delay: index * 0.05 }}
                      className={`
                        transition-colors duration-150
                        ${rowProps.className || ''}
                        ${hoverable ? 'hover:bg-opacity-80' : ''}
                        ${rowProps.onClick ? 'cursor-pointer' : ''}
                      `}
                      style={{
                        backgroundColor: striped && isEven 
                          ? theme.colors.background.tertiary 
                          : theme.colors.background.card,
                        borderBottom: `1px solid ${theme.colors.border.light}`
                      }}
                      onClick={rowProps.onClick}
                      onDoubleClick={rowProps.onDoubleClick}
                      onMouseEnter={(e) => {
                        if (hoverable) {
                          e.currentTarget.style.backgroundColor = theme.colors.background.hover
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (hoverable) {
                          e.currentTarget.style.backgroundColor = striped && isEven 
                            ? theme.colors.background.tertiary 
                            : theme.colors.background.card
                        }
                      }}
                    >
                      {columns.map((column) => (
                        <td
                          key={column.key}
                          className={`
                            ${sizeClasses[size]}
                            ${column.align === 'center' ? 'text-center' : column.align === 'right' ? 'text-right' : 'text-left'}
                          `}
                          style={{
                            width: column.width,
                            position: column.fixed ? 'sticky' : 'static',
                            left: column.fixed === 'left' ? 0 : 'auto',
                            right: column.fixed === 'right' ? 0 : 'auto',
                            zIndex: column.fixed ? 5 : 'auto',
                            color: theme.colors.text.primary
                          }}
                        >
                          {renderCell(column, record, index)}
                        </td>
                      ))}
                    </motion.tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {pagination && pagination.total > pagination.pageSize && (
          <div 
            className="flex items-center justify-between px-6 py-4 border-t"
            style={{ 
              borderColor: theme.colors.border.light,
              backgroundColor: theme.colors.background.secondary 
            }}
          >
            <div style={{ color: theme.colors.text.secondary }} className="text-sm">
              Mostrando {((pagination.current - 1) * pagination.pageSize) + 1} a{' '}
              {Math.min(pagination.current * pagination.pageSize, pagination.total)} de{' '}
              {pagination.total} registros
            </div>
            
            <div className="flex items-center gap-2">
              <button
                onClick={() => pagination.onChange(pagination.current - 1, pagination.pageSize)}
                disabled={pagination.current === 1}
                className="p-2 rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                style={{
                  backgroundColor: theme.colors.background.primary,
                  border: `1px solid ${theme.colors.border.DEFAULT}`,
                  color: theme.colors.text.primary
                }}
              >
                <span className="material-symbols-outlined text-sm">chevron_left</span>
              </button>
              
              <span 
                className="px-4 py-2 text-sm"
                style={{ color: theme.colors.text.primary }}
              >
                Página {pagination.current} de {Math.ceil(pagination.total / pagination.pageSize)}
              </span>
              
              <button
                onClick={() => pagination.onChange(pagination.current + 1, pagination.pageSize)}
                disabled={pagination.current >= Math.ceil(pagination.total / pagination.pageSize)}
                className="p-2 rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                style={{
                  backgroundColor: theme.colors.background.primary,
                  border: `1px solid ${theme.colors.border.DEFAULT}`,
                  color: theme.colors.text.primary
                }}
              >
                <span className="material-symbols-outlined text-sm">chevron_right</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
} 