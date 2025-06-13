'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useTheme } from '@/contexts/ThemeContext'
import Table from '@/components/ui/Table'
import { Button, buttonVariants } from '@/components/ui/Button'
import type { VariantProps } from 'class-variance-authority'
import Input from '@/components/ui/Input'
import Modal from '@/components/ui/Modal'
import { usePermissions } from '@/hooks/usePermissions'

export interface CRUDColumn<T> {
  key: keyof T | string
  label: string
  sortable?: boolean
  render?: (value: any, record: T, index: number) => React.ReactNode
  width?: string
}

export interface CRUDAction<T> {
  label: string
  icon: React.ReactNode
  onClick: (item: T) => void
  variant?: VariantProps<typeof buttonVariants>['variant']
  permission?: string
  className?: string | ((item: T) => string)
}

interface GenericCRUDProps<T> {
  title: string
  entityName: string
  entityNamePlural?: string
  columns: CRUDColumn<T>[]
  data: T[]
  loading?: boolean
  totalItems?: number
  currentPage?: number
  itemsPerPage?: number
  onPageChange?: (page: number) => void
  onSort?: (column: string, direction: 'asc' | 'desc') => void
  onSearch?: (query: string) => void
  onCreate?: () => void
  onEdit?: (item: T) => void
  onDelete?: (item: T) => void
  onView?: (item: T) => void
  customActions?: CRUDAction<T>[]
  searchPlaceholder?: string
  createPermission?: string
  editPermission?: string
  deletePermission?: string
  viewPermission?: string
  emptyMessage?: string
  showSearch?: boolean
  showPagination?: boolean
  showActions?: boolean
}

export default function GenericCRUD<T extends { id: string | number }>({
  title,
  entityName,
  entityNamePlural,
  columns,
  data,
  loading = false,
  totalItems,
  currentPage = 1,
  itemsPerPage = 10,
  onPageChange,
  onSort,
  onSearch,
  onCreate,
  onEdit,
  onDelete,
  onView,
  customActions = [],
  searchPlaceholder,
  createPermission,
  editPermission,
  deletePermission,
  viewPermission,
  emptyMessage,
  showSearch = true,
  showPagination = true,
  showActions = true
}: GenericCRUDProps<T>) {
  const { theme } = useTheme()
  const { hasPermission } = usePermissions()
  const [searchQuery, setSearchQuery] = useState('')
  const [deleteModal, setDeleteModal] = useState<{ open: boolean; item: T | null }>({
    open: false,
    item: null
  })

  const plural = entityNamePlural || `${entityName}s`

  const handleSearch = useCallback((value: string) => {
    setSearchQuery(value)
    onSearch?.(value)
  }, [onSearch])

  const handleDelete = (item: T) => {
    setDeleteModal({ open: true, item })
  }

  const confirmDelete = () => {
    if (deleteModal.item && onDelete) {
      onDelete(deleteModal.item)
      setDeleteModal({ open: false, item: null })
    }
  }

  const canCreate = !createPermission || true // hasPermission(createPermission as any)
  const canEdit = (item: T) => !editPermission || true // hasPermission(editPermission as any)
  const canDelete = (item: T) => !deletePermission || true // hasPermission(deletePermission as any)
  const canView = (item: T) => !viewPermission || true // hasPermission(viewPermission as any)

  const tableColumns = [
    ...columns.map(col => ({
      key: col.key as string,
      title: col.label,
      sortable: col.sortable,
      render: col.render ? (value: any, record: T, index: number) => col.render!(value, record, index) : undefined,
      width: col.width
    })),
    ...(showActions ? [{
      key: 'actions',
      title: 'Ações',
      width: '150px',
      render: (value: any, item: T, index: number) => (
        <div className="flex items-center gap-1">
          {customActions.map((action, index) => (
            (!action.permission || true) && ( // hasPermission(action.permission as any)
              <Button
                key={index}
                size="sm"
                variant={action.variant || "ghost"}
                onClick={() => action.onClick(item)}
                title={action.label}
                className={typeof action.className === 'function' ? action.className(item) : action.className}
              >
                {action.icon}
              </Button>
            )
          ))}
        </div>
      )
    }] : [])
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 
          className="text-2xl font-bold"
          style={{ color: theme.colors.text.primary }}
        >
          {title}
        </h1>
        
        <div className="flex items-center gap-3">
          {showSearch && onSearch && (
            <Input
              type="search"
              placeholder={searchPlaceholder || `Buscar ${plural}...`}
              value={searchQuery}
              onChange={(e: { target: { value: string } }) => handleSearch(e.target.value)}
              leftIcon="search"
              className="w-64"
            />
          )}
          
          {onCreate && canCreate && (
            <Button
              variant="default"
              onClick={onCreate}
            >
              Novo {entityName}
            </Button>
          )}
        </div>
      </div>

      {/* Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <Table
          columns={tableColumns}
          data={data}
          loading={loading}
          emptyText={emptyMessage || `Nenhum ${entityName.toLowerCase()} encontrado`}
          pagination={showPagination && totalItems ? {
            current: currentPage,
            pageSize: itemsPerPage,
            total: totalItems,
            onChange: (page: number) => onPageChange?.(page)
          } : undefined}
        />
      </motion.div>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={deleteModal.open}
        onClose={() => setDeleteModal({ open: false, item: null })}
        title={`Excluir ${entityName}`}
        size="sm"
      >
        <div className="space-y-4">
          <p style={{ color: theme.colors.text.secondary }}>
            Tem certeza que deseja excluir este {entityName.toLowerCase()}? Esta ação não pode ser desfeita.
          </p>
          
          <div className="flex justify-end gap-3">
            <Button
              variant="secondary"
              onClick={() => setDeleteModal({ open: false, item: null })}
            >
              Cancelar
            </Button>
            <Button
              variant="destructive"
              onClick={confirmDelete}
            >
              Excluir
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  )
} 