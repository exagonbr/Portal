'use client'

import React from 'react'
import { Search, Filter, X } from 'lucide-react'

interface RoleFiltersProps {
  filters: {
    search: string
    status: string
    hasUsers: string
    permissionType: string
  }
  onFiltersChange: (filters: any) => void
  onClearFilters: () => void
  isVisible: boolean
  onToggleVisibility: () => void
}

export const RoleFilters: React.FC<RoleFiltersProps> = ({
  filters,
  onFiltersChange,
  onClearFilters,
  isVisible,
  onToggleVisibility
}) => {
  const hasActiveFilters = Object.values(filters).some(value => value !== '')

  return (
    <div className="mb-6">
      <div className="flex items-center justify-between mb-3">
        <button
          onClick={onToggleVisibility}
          className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
            isVisible || hasActiveFilters
              ? 'bg-blue-100 text-blue-700 border border-blue-200'
              : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
          }`}
        >
          <Filter className="h-4 w-4" />
          <span>Filtros</span>
          {hasActiveFilters && (
            <span className="bg-blue-600 text-white text-xs px-2 py-0.5 rounded-full">
              {Object.values(filters).filter(v => v !== '').length}
            </span>
          )}
        </button>

        {hasActiveFilters && (
          <button
            onClick={onClearFilters}
            className="flex items-center space-x-1 text-sm text-slate-500 hover:text-slate-700"
          >
            <X className="h-4 w-4" />
            <span>Limpar filtros</span>
          </button>
        )}
      </div>

      {isVisible && (
        <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Busca */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Buscar
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={filters.search}
                  onChange={(e) => onFiltersChange({ ...filters, search: e.target.value })}
                  placeholder="Nome ou descrição..."
                  className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
              </div>
            </div>

            {/* Status */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Status
              </label>
              <select
                value={filters.status}
                onChange={(e) => onFiltersChange({ ...filters, status: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Todos os status</option>
                <option value="active">Ativo</option>
                <option value="inactive">Inativo</option>
              </select>
            </div>

            {/* Usuários */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Usuários
              </label>
              <select
                value={filters.hasUsers}
                onChange={(e) => onFiltersChange({ ...filters, hasUsers: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Todos</option>
                <option value="with_users">Com usuários</option>
                <option value="without_users">Sem usuários</option>
              </select>
            </div>

            {/* Tipo de Permissão */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Tipo de Permissão
              </label>
              <select
                value={filters.permissionType}
                onChange={(e) => onFiltersChange({ ...filters, permissionType: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Todos os tipos</option>
                <option value="system">Sistema</option>
                <option value="institution">Instituição</option>
                <option value="academic">Acadêmico</option>
                <option value="teaching">Ensino</option>
                <option value="content">Conteúdo</option>
                <option value="reports">Relatórios</option>
              </select>
            </div>
          </div>

          {/* Resumo dos filtros ativos */}
          {hasActiveFilters && (
            <div className="mt-4 pt-4 border-t border-slate-200">
              <div className="flex flex-wrap gap-2">
                <span className="text-sm text-slate-600 mr-2">Filtros ativos:</span>
                {filters.search && (
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800">
                    Busca: "{filters.search}"
                    <button
                      onClick={() => onFiltersChange({ ...filters, search: '' })}
                      className="ml-1 hover:text-blue-600"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                )}
                {filters.status && (
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-green-100 text-green-800">
                    Status: {filters.status === 'active' ? 'Ativo' : 'Inativo'}
                    <button
                      onClick={() => onFiltersChange({ ...filters, status: '' })}
                      className="ml-1 hover:text-green-600"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                )}
                {filters.hasUsers && (
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-purple-100 text-purple-800">
                    Usuários: {filters.hasUsers === 'with_users' ? 'Com usuários' : 'Sem usuários'}
                    <button
                      onClick={() => onFiltersChange({ ...filters, hasUsers: '' })}
                      className="ml-1 hover:text-purple-600"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                )}
                {filters.permissionType && (
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-orange-100 text-orange-800">
                    Tipo: {filters.permissionType}
                    <button
                      onClick={() => onFiltersChange({ ...filters, permissionType: '' })}
                      className="ml-1 hover:text-orange-600"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}