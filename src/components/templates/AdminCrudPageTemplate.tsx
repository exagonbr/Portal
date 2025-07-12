'use client'

import React, { ReactNode } from 'react'
import { RefreshCw, Plus, Search, Filter, X, AlertTriangle } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { StatCard } from '@/components/ui/StandardCard'
import { LucideIcon } from 'lucide-react'

// Interfaces principais
interface StatData {
  icon: LucideIcon
  title: string
  value: string | number
  subtitle: string
  color?: 'blue' | 'green' | 'purple' | 'amber' | 'red' | 'cyan' | 'emerald' | 'violet'
}

interface FilterField {
  key: string
  label: string
  type: 'text' | 'select' | 'date' | 'boolean'
  options?: { label: string; value: any }[]
  placeholder?: string
}

interface PaginationData {
  currentPage: number
  totalPages: number
  totalItems: number
  itemsPerPage: number
}

interface AdminCrudPageTemplateProps {
  // Header
  title: string
  subtitle?: string
  
  // Estatísticas
  stats?: StatData[]
  
  // Busca e filtros
  searchQuery: string
  onSearchChange: (query: string) => void
  onSearch: (e: React.FormEvent) => void
  searchPlaceholder?: string
  
  // Filtros avançados
  showFilterPanel?: boolean
  onToggleFilterPanel?: () => void
  filterFields?: FilterField[]
  filters?: Record<string, any>
  onFilterChange?: (key: string, value: any) => void
  onApplyFilters?: () => void
  onClearFilters?: () => void
  
  // Estados
  loading: boolean
  refreshing?: boolean
  error?: string | null
  
  // Ações principais
  onRefresh: () => void
  onCreateNew?: () => void
  createButtonLabel?: string
  
  // Conteúdo principal
  children: ReactNode
  
  // Paginação
  pagination?: PaginationData
  onPageChange?: (page: number) => void
  
  // Layout customizações
  containerClassName?: string
  headerClassName?: string
  contentClassName?: string
}

export default function AdminCrudPageTemplate({
  title,
  subtitle,
  stats = [],
  searchQuery,
  onSearchChange,
  onSearch,
  searchPlaceholder = "Buscar...",
  showFilterPanel = false,
  onToggleFilterPanel,
  filterFields = [],
  filters = {},
  onFilterChange,
  onApplyFilters,
  onClearFilters,
  loading,
  refreshing = false,
  error,
  onRefresh,
  onCreateNew,
  createButtonLabel = "Criar Novo",
  children,
  pagination,
  onPageChange,
  containerClassName = "",
  headerClassName = "",
  contentClassName = ""
}: AdminCrudPageTemplateProps) {
  
  const hasActiveFilters = Object.keys(filters).length > 0

  // Determinar o número de colunas para o grid de stats
  const getStatsGridCols = () => {
    if (stats.length === 1) return 'lg:grid-cols-1'
    if (stats.length === 2) return 'lg:grid-cols-2'
    if (stats.length === 3) return 'lg:grid-cols-3'
    return 'lg:grid-cols-4'
  }

  // Loading state
  if (loading) {
    return (
      <div className={`p-6 space-y-6 ${containerClassName}`}>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="ml-2 text-gray-600">Carregando...</span>
          </div>
        </div>
      </div>
    )
  }

  // Error state
  if (error) {
    return (
      <div className={`p-6 space-y-6 ${containerClassName}`}>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="text-center py-12">
            <AlertTriangle className="w-16 h-16 text-red-300 mx-auto mb-4" />
            <p className="text-red-500 text-lg mb-2">Erro ao carregar dados</p>
            <p className="text-gray-600 mb-4">{error}</p>
            <Button onClick={onRefresh} variant="outline">
              Tentar novamente
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className={`p-6 space-y-6 ${containerClassName}`}>
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        
        {/* Header Section */}
        <div className={`p-6 border-b border-gray-200 ${headerClassName}`}>
          
          {/* Title and Actions */}
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
              {subtitle && (
                <p className="text-gray-600 mt-1">{subtitle}</p>
              )}
            </div>
            <div className="flex gap-3">
              <Button 
                onClick={onRefresh} 
                variant="outline" 
                disabled={refreshing}
                className="flex items-center gap-2"
              >
                <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
                Atualizar
              </Button>
              {onCreateNew && (
                <Button onClick={onCreateNew} className="flex items-center gap-2">
                  <Plus className="w-4 h-4" />
                  {createButtonLabel}
                </Button>
              )}
            </div>
          </div>

          {/* Stats Cards */}
          {stats.length > 0 && (
            <div className={`grid grid-cols-2 ${getStatsGridCols()} gap-4 mb-6`}>
              {stats.map((stat, index) => (
                <StatCard
                  key={index}
                  icon={stat.icon}
                  title={stat.title}
                  value={stat.value}
                  subtitle={stat.subtitle}
                  color={stat.color}
                />
              ))}
            </div>
          )}

          {/* Search and Filters */}
          <div className="space-y-4">
            
            {/* Search Bar */}
            <form onSubmit={onSearch} className="flex gap-3">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="text"
                    placeholder={searchPlaceholder}
                    value={searchQuery}
                    onChange={(e) => onSearchChange(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
              <Button type="submit" variant="outline">
                Buscar
              </Button>
              {filterFields.length > 0 && onToggleFilterPanel && (
                <Button 
                  type="button"
                  variant="outline"
                  onClick={onToggleFilterPanel}
                  className={`flex items-center gap-2 ${hasActiveFilters ? 'bg-blue-50 text-blue-700 border-blue-200' : ''}`}
                >
                  <Filter className="w-4 h-4" />
                  Filtros
                  {hasActiveFilters && (
                    <span className="bg-blue-100 text-blue-800 text-xs px-2 py-0.5 rounded-full">
                      {Object.keys(filters).length}
                    </span>
                  )}
                </Button>
              )}
            </form>

            {/* Advanced Filters Panel */}
            {showFilterPanel && filterFields.length > 0 && (
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-medium text-gray-900">Filtros Avançados</h3>
                  <button
                    onClick={onToggleFilterPanel}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filterFields.map((field) => (
                    <div key={field.key}>
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        {field.label}
                      </label>
                      {field.type === 'select' ? (
                        <select
                          value={filters[field.key] || ''}
                          onChange={(e) => onFilterChange?.(field.key, e.target.value)}
                          className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-transparent"
                        >
                          <option value="">Todos</option>
                          {field.options?.map((option) => (
                            <option key={option.value} value={option.value}>
                              {option.label}
                            </option>
                          ))}
                        </select>
                      ) : field.type === 'boolean' ? (
                        <select
                          value={filters[field.key] || ''}
                          onChange={(e) => onFilterChange?.(field.key, e.target.value)}
                          className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-transparent"
                        >
                          <option value="">Todos</option>
                          <option value="true">Sim</option>
                          <option value="false">Não</option>
                        </select>
                      ) : (
                        <input
                          type={field.type}
                          value={filters[field.key] || ''}
                          onChange={(e) => onFilterChange?.(field.key, e.target.value)}
                          placeholder={field.placeholder}
                          className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-transparent"
                        />
                      )}
                    </div>
                  ))}
                </div>
                
                <div className="flex justify-end gap-2 mt-4">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={onClearFilters}
                    disabled={!hasActiveFilters}
                  >
                    Limpar
                  </Button>
                  <Button
                    size="sm"
                    onClick={onApplyFilters}
                  >
                    Aplicar Filtros
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Content Section */}
        <div className={contentClassName}>
          {children}
        </div>

        {/* Pagination */}
        {pagination && pagination.totalPages > 1 && onPageChange && (
          <div className="px-6 py-4 border-t border-gray-200">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-700">
                Mostrando {((pagination.currentPage - 1) * pagination.itemsPerPage) + 1} a{' '}
                {Math.min(pagination.currentPage * pagination.itemsPerPage, pagination.totalItems)} de{' '}
                {pagination.totalItems} resultados
              </div>
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onPageChange(pagination.currentPage - 1)}
                  disabled={pagination.currentPage === 1}
                >
                  Anterior
                </Button>
                <span className="text-sm text-gray-700">
                  {pagination.currentPage} de {pagination.totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onPageChange(pagination.currentPage + 1)}
                  disabled={pagination.currentPage === pagination.totalPages}
                >
                  Próxima
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
} 