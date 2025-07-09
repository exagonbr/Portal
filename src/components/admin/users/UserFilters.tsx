'use client'

import React from 'react'
import SimpleCard from '@/components/ui/SimpleCard'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { UserFilterDto, RoleResponseDto, InstitutionResponseDto } from '@/types/api'
import { 
  Filter, 
  Search, 
  X, 
  AlertCircle,
  Calendar,
  Shield,
  Building2,
  Activity
} from 'lucide-react'

interface UserFiltersProps {
  showFilters: boolean
  searchTerm: string
  filters: UserFilterDto
  roles: RoleResponseDto[]
  institutions: InstitutionResponseDto[]
  auxiliaryDataLoaded: boolean
  auxiliaryDataError: string | null
  hasActiveFilters: () => boolean
  onSearchTermChange: (term: string) => void
  onFilterChange: (key: string, value: any) => void
  onClearFilters: () => void
  onToggleFilters: () => void
}

export default function UserFilters({
  showFilters,
  searchTerm,
  filters,
  roles,
  institutions,
  auxiliaryDataLoaded,
  auxiliaryDataError,
  hasActiveFilters,
  onSearchTermChange,
  onFilterChange,
  onClearFilters,
  onToggleFilters
}: UserFiltersProps) {
  const updateFilter = (key: string, value: any) => {
    if (value === '' || value === undefined || value === null) {
      const newFilters = { ...filters }
      delete newFilters[key as keyof UserFilterDto]
      onFilterChange(key, undefined)
    } else {
      onFilterChange(key, value)
    }
  }

  // Quick filter buttons
  const quickFilters = [
    {
      label: 'Apenas Ativos',
      active: filters.is_active === true,
      onClick: () => updateFilter('is_active', filters.is_active === true ? undefined : true),
      icon: <Activity className="h-3 w-3" />,
      color: 'green'
    },
    {
      label: 'Apenas Inativos', 
      active: filters.is_active === false,
      onClick: () => updateFilter('is_active', filters.is_active === false ? undefined : false),
      icon: <Activity className="h-3 w-3" />,
      color: 'red'
    },
    {
      label: 'Sem Instituição',
      active: filters.institution_id === null,
      onClick: () => updateFilter('institution_id', filters.institution_id === null ? undefined : null),
      icon: <Building2 className="h-3 w-3" />,
      color: 'gray'
    }
  ]

  // Active filters summary (compact)
  if (!showFilters && hasActiveFilters()) {
    return (
      <SimpleCard className="mb-6 p-4 bg-blue-50 border-blue-200">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm font-medium text-blue-800">Filtros ativos:</span>
          
          {searchTerm && (
            <Badge variant="info" className="text-xs">
              Busca: "{searchTerm}"
            </Badge>
          )}
          
          {filters.role_id && (
            <Badge variant="info" className="text-xs">
              Função: {roles.find(r => r.id === filters.role_id)?.name}
            </Badge>
          )}
          
          {filters.institution_id && (
            <Badge variant="info" className="text-xs">
              Instituição: {institutions.find(i => i.id === filters.institution_id)?.name}
            </Badge>
          )}
          
          {filters.is_active !== undefined && (
            <Badge variant="info" className="text-xs">
              Status: {filters.is_active ? 'Ativo' : 'Inativo'}
            </Badge>
          )}

          {filters.created_after && (
            <Badge variant="info" className="text-xs">
              Criado após: {new Date(filters.created_after).toLocaleDateString('pt-BR')}
            </Badge>
          )}

          {filters.created_before && (
            <Badge variant="info" className="text-xs">
              Criado antes: {new Date(filters.created_before).toLocaleDateString('pt-BR')}
            </Badge>
          )}
          
          <Button
            variant="ghost"
            size="sm"
            onClick={onClearFilters}
            className="ml-2 text-red-600 hover:text-red-700 hover:bg-red-50"
          >
            <X className="h-3 w-3 mr-1" />
            Limpar todos
          </Button>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={onToggleFilters}
            className="ml-2 text-blue-600 hover:text-blue-700 hover:bg-blue-50"
          >
            <Filter className="h-3 w-3 mr-1" />
            Expandir filtros
          </Button>
        </div>
      </SimpleCard>
    )
  }

  // Full filters panel
  if (!showFilters) return null

  return (
    <SimpleCard className="mb-6 p-6 bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-500 rounded-lg shadow-sm">
            <Filter className="h-5 w-5 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-blue-800">Filtros Avançados</h2>
            <p className="text-blue-600 text-sm">Refine sua busca de usuários</p>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          {hasActiveFilters() && (
            <Button
              variant="secondary"
              onClick={onClearFilters}
              className="bg-red-50 text-red-600 border-red-200 hover:bg-red-100"
            >
              <X className="h-4 w-4 mr-1" />
              Limpar filtros
            </Button>
          )}
          
          <Button
            variant="ghost"
            onClick={onToggleFilters}
            className="text-slate-600 hover:text-slate-800"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Quick Filters */}
      <div className="mb-6">
        <h3 className="text-sm font-semibold text-blue-700 mb-3">Filtros Rápidos</h3>
        <div className="flex flex-wrap gap-2">
          {quickFilters.map((filter, index) => (
            <Button
              key={index}
              variant={filter.active ? "default" : "ghost"}
              size="sm"
              onClick={filter.onClick}
              className={`text-xs ${filter.active ? 
                'bg-blue-500 text-white' : 
                'text-slate-600 hover:bg-blue-50'
              }`}
            >
              {filter.icon}
              <span className="ml-1">{filter.label}</span>
            </Button>
          ))}
        </div>
      </div>
      
      {/* Main Filters Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
        {/* Search by name/email */}
        <div className="space-y-2 bg-white p-3 rounded-lg shadow-sm border border-blue-100">
          <label className="flex items-center gap-2 text-sm font-semibold text-blue-700">
            <Search className="h-4 w-4 text-blue-500" />
            Buscar
          </label>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => onSearchTermChange(e.target.value)}
            placeholder="Nome ou email..."
            className="w-full px-3 py-2 border border-blue-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
          />
        </div>

        {/* Filter by role */}
        <div className="space-y-2 bg-white p-3 rounded-lg shadow-sm border border-blue-100">
          <label className="flex items-center gap-2 text-sm font-semibold text-blue-700">
            <Shield className="h-4 w-4 text-purple-500" />
            Função
            <span className="text-xs text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">
              {roles.length}
            </span>
          </label>
          {!auxiliaryDataLoaded ? (
            <div className="flex items-center gap-2 text-blue-500 text-sm">
              <div className="animate-spin w-4 h-4 border-2 border-current border-t-transparent rounded-full"></div>
              Carregando...
            </div>
          ) : (
            <select
              value={filters.role_id || ''}
              onChange={(e) => updateFilter('role_id', e.target.value)}
              className="w-full px-3 py-2 border border-blue-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
            >
              <option value="">Todas as funções</option>
              {roles.map((role) => (
                <option key={role.id} value={role.id}>
                  {role.name}
                </option>
              ))}
            </select>
          )}
        </div>

        {/* Filter by institution */}
        <div className="space-y-2 bg-white p-3 rounded-lg shadow-sm border border-blue-100">
          <label className="flex items-center gap-2 text-sm font-semibold text-blue-700">
            <Building2 className="h-4 w-4 text-green-500" />
            Instituição
            <span className="text-xs text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">
              {institutions.length}
            </span>
          </label>
          {!auxiliaryDataLoaded ? (
            <div className="flex items-center gap-2 text-blue-500 text-sm">
              <div className="animate-spin w-4 h-4 border-2 border-current border-t-transparent rounded-full"></div>
              Carregando...
            </div>
          ) : (
            <select
              value={filters.institution_id || ''}
              onChange={(e) => updateFilter('institution_id', e.target.value)}
              className="w-full px-3 py-2 border border-blue-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
            >
              <option value="">Todas as instituições</option>
              {institutions.map((institution) => (
                <option key={institution.id} value={institution.id}>
                  {institution.name}
                </option>
              ))}
            </select>
          )}
        </div>

        {/* Filter by status */}
        <div className="space-y-2 bg-white p-3 rounded-lg shadow-sm border border-blue-100">
          <label className="flex items-center gap-2 text-sm font-semibold text-blue-700">
            <Activity className="h-4 w-4 text-orange-500" />
            Status
          </label>
          <select
            value={filters.is_active === undefined ? '' : filters.is_active ? 'true' : 'false'}
            onChange={(e) => {
              const value = e.target.value
              updateFilter('is_active', value === '' ? undefined : value === 'true')
            }}
            className="w-full px-3 py-2 border border-blue-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
          >
            <option value="">Qualquer status</option>
            <option value="true">✅ Ativo</option>
            <option value="false">❌ Inativo</option>
          </select>
        </div>

        {/* Date filters */}
        <div className="space-y-2 bg-white p-3 rounded-lg shadow-sm border border-blue-100">
          <label className="flex items-center gap-2 text-sm font-semibold text-blue-700">
            <Calendar className="h-4 w-4 text-purple-500" />
            Criado após
          </label>
          <input
            type="date"
            value={filters.created_after || ''}
            onChange={(e) => updateFilter('created_after', e.target.value)}
            className="w-full px-3 py-2 border border-blue-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
          />
        </div>

        <div className="space-y-2 bg-white p-3 rounded-lg shadow-sm border border-blue-100">
          <label className="flex items-center gap-2 text-sm font-semibold text-blue-700">
            <Calendar className="h-4 w-4 text-purple-500" />
            Criado antes
          </label>
          <input
            type="date"
            value={filters.created_before || ''}
            onChange={(e) => updateFilter('created_before', e.target.value)}
            className="w-full px-3 py-2 border border-blue-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
          />
        </div>
      </div>

      {/* Error display */}
      {auxiliaryDataError && (
        <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-center gap-2 text-red-600">
            <AlertCircle className="h-5 w-5" />
            <p className="text-sm">{auxiliaryDataError}</p>
          </div>
        </div>
      )}

      {/* Filter summary */}
      <div className="mt-4 pt-4 border-t border-blue-200">
        <div className="text-sm text-slate-600">
          {hasActiveFilters() ? (
            <span className="text-green-600 font-medium">
              ✓ {Object.keys(filters).length + (searchTerm ? 1 : 0)} filtros ativos
            </span>
          ) : (
            <span className="text-slate-500">
              Nenhum filtro aplicado
            </span>
          )}
        </div>
      </div>
    </SimpleCard>
  )
}
