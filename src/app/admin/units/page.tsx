'use client'

import React, { useState, useEffect } from 'react'
// import { useRouter } from 'next/navigation' // TEMPORARIAMENTE DESABILITADO
import { Plus, Search, Edit, Trash2, Eye, Building2, CheckCircle, XCircle, MapPin, RefreshCw, ChevronLeft, ChevronRight } from 'lucide-react'
import { unitService, Unit } from '@/services/unitService'

// Interface para paginação
interface PaginationData {
  currentPage: number
  totalPages: number
  totalItems: number
  itemsPerPage: number
}

// Componente de Loading simples
const SimpleLoading = () => (
  <div className="flex items-center justify-center min-h-[400px]">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
    <span className="ml-2 text-gray-600">Carregando unidades...</span>
  </div>
)

// Componente de Badge simples
const Badge = ({ children, variant = 'default' }: { children: React.ReactNode, variant?: 'default' | 'success' | 'danger' }) => {
  const variants = {
    default: 'bg-gray-100 text-gray-800',
    success: 'bg-green-100 text-green-800',
    danger: 'bg-red-100 text-red-800'
  }
  
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${variants[variant]}`}>
      {children}
    </span>
  )
}

// Componente de Button simples
const Button = ({ 
  children, 
  onClick, 
  variant = 'primary', 
  size = 'md',
  disabled = false,
  className = '',
  type = 'button'
}: {
  children: React.ReactNode
  onClick?: () => void
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
  disabled?: boolean
  className?: string
  type?: 'button' | 'submit'
}) => {
  const variants = {
    primary: 'bg-blue-600 hover:bg-blue-700 text-white',
    secondary: 'bg-gray-600 hover:bg-gray-700 text-white',
    danger: 'bg-red-600 hover:bg-red-700 text-white',
    ghost: 'bg-transparent hover:bg-gray-100 text-gray-700 border border-gray-300'
  }
  
  const sizes = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-3 text-base'
  }
  
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`
        ${variants[variant]} ${sizes[size]} 
        rounded-lg font-medium transition-colors duration-200
        disabled:opacity-50 disabled:cursor-not-allowed
        flex items-center gap-2
        ${className}
      `}
    >
      {children}
    </button>
  )
}

// Componente de Paginação
const Pagination = ({ 
  pagination, 
  onPageChange 
}: { 
  pagination: PaginationData
  onPageChange: (page: number) => void 
}) => {
  const { currentPage, totalPages, totalItems, itemsPerPage } = pagination
  
  const startItem = (currentPage - 1) * itemsPerPage + 1
  const endItem = Math.min(currentPage * itemsPerPage, totalItems)
  
  return (
    <div className="flex items-center justify-between px-6 py-3 bg-gray-50 border-t border-gray-200">
      <div className="flex items-center text-sm text-gray-700">
        <span>
          Mostrando {startItem} a {endItem} de {totalItems} resultados
        </span>
      </div>
      
      <div className="flex items-center space-x-2">
        <Button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage <= 1}
          variant="ghost"
          size="sm"
        >
          <ChevronLeft className="w-4 h-4" />
          Anterior
        </Button>
        
        <div className="flex space-x-1">
          {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
            let pageNum
            if (totalPages <= 5) {
              pageNum = i + 1
            } else {
              if (currentPage <= 3) {
                pageNum = i + 1
              } else if (currentPage >= totalPages - 2) {
                pageNum = totalPages - 4 + i
              } else {
                pageNum = currentPage - 2 + i
              }
            }
            
            return (
              <button
                key={pageNum}
                onClick={() => onPageChange(pageNum)}
                className={`px-3 py-1 text-sm rounded ${
                  pageNum === currentPage
                    ? 'bg-blue-600 text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-300'
                }`}
              >
                {pageNum}
              </button>
            )
          })}
        </div>
        
        <Button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage >= totalPages}
          variant="ghost"
          size="sm"
        >
          Próxima
          <ChevronRight className="w-4 h-4" />
        </Button>
      </div>
    </div>
  )
}

export default function ManageUnits() {
  // const router = useRouter() // TEMPORARIAMENTE DESABILITADO
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [units, setUnits] = useState<Unit[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isDeleting, setIsDeleting] = useState<number | null>(null)
  
  // Estados para paginação
  const [pagination, setPagination] = useState<PaginationData>({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: 10
  })
  
  // Estados para estatísticas
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    withCourse: 0
  })

  // Função para carregar unidades com paginação
  const loadUnits = async (page: number = 1, search: string = '', showLoadingIndicator = true) => {
    try {
      if (showLoadingIndicator) {
        setLoading(true)
      } else {
        setRefreshing(true)
      }
      setError(null)
      
      const params = {
        page,
        limit: pagination.itemsPerPage,
        ...(search && { search })
      }
      
      const response = await unitService.getAll(params)
      
      // Assumindo que a resposta da API tenha o formato padrão de paginação
      if (response && typeof response === 'object' && 'data' in response) {
        const paginatedResponse = response as any
        setUnits(paginatedResponse.data || [])
        setPagination({
          currentPage: paginatedResponse.current_page || 1,
          totalPages: paginatedResponse.last_page || 1,
          totalItems: paginatedResponse.total || 0,
          itemsPerPage: paginatedResponse.per_page || 10
        })
      } else {
        // Fallback se a resposta não for paginada
        const unitsArray = Array.isArray(response) ? response : []
        setUnits(unitsArray)
        setPagination({
          currentPage: 1,
          totalPages: 1,
          totalItems: unitsArray.length,
          itemsPerPage: unitsArray.length
        })
      }
      
      if (!showLoadingIndicator) {
        alert('Lista de unidades atualizada com sucesso!')
      }
      
    } catch (err) {
      console.error('Erro ao carregar unidades:', err)
      setError(err instanceof Error ? err.message : 'Erro ao carregar unidades. Tente novamente.')
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  // Função para carregar estatísticas
  const loadStats = async () => {
    try {
      const response = await unitService.getAll({ per_page: 1000 }) // Pegar todas para calcular stats
      const unitsData = Array.isArray(response) ? response : 
                       (response && typeof response === 'object' && 'data' in response) ? 
                       (response as any).data : []
      
      setStats({
        total: unitsData.length,
        active: unitsData.filter((u: Unit) => u.status === 'active').length,
        withCourse: unitsData.filter((u: Unit) => u.course_id).length
      })
    } catch (err) {
      console.error('Erro ao carregar estatísticas:', err)
    }
  }

  // Função de busca
  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault()
    await loadUnits(1, searchQuery.trim())
  }

  // Função para mudar página
  const handlePageChange = (page: number) => {
    loadUnits(page, searchQuery.trim())
  }

  // Função para deletar unidade
  const handleDelete = async (unit: Unit) => {
    if (!confirm(`Tem certeza que deseja excluir a unidade "${unit.name}"?`)) {
      return
    }
    
    try {
      setIsDeleting(unit.id)
      await unitService.delete(unit.id)
      
      // Recarregar dados
      await Promise.all([
        loadUnits(pagination.currentPage, searchQuery.trim()),
        loadStats()
      ])
      
      alert('Unidade excluída com sucesso!')
    } catch (err) {
      console.error('Erro ao excluir unidade:', err)
      alert(err instanceof Error ? err.message : 'Erro ao excluir unidade.')
    } finally {
      setIsDeleting(null)
    }
  }

  // Função para atualizar dados
  const handleRefresh = async () => {
    await Promise.all([
      loadUnits(pagination.currentPage, searchQuery.trim(), false),
      loadStats()
    ])
  }

  // Carregar dados no mount
  useEffect(() => {
    Promise.all([
      loadUnits(),
      loadStats()
    ])
  }, [])

  // Função para obter label do status
  const getStatusLabel = (status: string) => {
    return status === 'active' ? 'Ativo' : 'Inativo'
  }

  // Função para obter variante do badge do status
  const getStatusVariant = (status: string): 'success' | 'danger' => {
    return status === 'active' ? 'success' : 'danger'
  }

  // Função para formatar data
  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A'
    try {
      return new Date(dateString).toLocaleDateString('pt-BR')
    } catch {
      return 'Data inválida'
    }
  }

  if (loading && units.length === 0) {
    return <SimpleLoading />
  }

  if (error && units.length === 0) {
    return (
      <div className="container mx-auto px-4 py-6 max-w-7xl">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <h2 className="text-xl font-bold text-red-800 mb-2">Erro</h2>
          <p className="text-red-600 mb-4">{error}</p>
          <Button onClick={() => loadUnits()} variant="danger">
            Tentar Novamente
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-6 max-w-7xl">
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Unidades de Ensino</h1>
              <p className="text-gray-600 mt-1">Gerencie as unidades de ensino do sistema</p>
            </div>
            <div className="flex gap-3">
              <Button onClick={handleRefresh} variant="ghost" disabled={loading || refreshing}>
                <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
                Atualizar
              </Button>
              <Button onClick={() => alert('Navegação desabilitada temporariamente')}>
                <Plus className="w-4 h-4" />
                Nova Unidade
              </Button>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="flex items-center">
                <Building2 className="w-8 h-8 text-blue-600" />
                <div className="ml-3">
                  <p className="text-blue-600 text-sm font-medium">Total</p>
                  <p className="text-2xl font-bold text-blue-900">{stats.total}</p>
                </div>
              </div>
            </div>
            <div className="bg-green-50 p-4 rounded-lg">
              <div className="flex items-center">
                <CheckCircle className="w-8 h-8 text-green-600" />
                <div className="ml-3">
                  <p className="text-green-600 text-sm font-medium">Ativas</p>
                  <p className="text-2xl font-bold text-green-900">{stats.active}</p>
                </div>
              </div>
            </div>
            <div className="bg-purple-50 p-4 rounded-lg">
              <div className="flex items-center">
                <Building2 className="w-8 h-8 text-purple-600" />
                <div className="ml-3">
                  <p className="text-purple-600 text-sm font-medium">Com Curso</p>
                  <p className="text-2xl font-bold text-purple-900">{stats.withCourse}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Search */}
          <form onSubmit={handleSearch} className="flex gap-3">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Buscar unidade por nome ou descrição..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
            <Button type="submit" variant="ghost" disabled={loading}>
              Buscar
            </Button>
          </form>
        </div>

        {/* Content */}
        <div className="overflow-hidden">
          {units.length === 0 ? (
            <div className="text-center py-12">
              <Building2 className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 text-lg mb-2">Nenhuma unidade encontrada</p>
              <p className="text-gray-400 text-sm">
                {searchQuery ? "Tente ajustar sua busca." : "Clique em \"Nova Unidade\" para adicionar a primeira"}
              </p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Unidade
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Descrição
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Curso
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Ordem
                      </th>
                      <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Atualizado
                      </th>
                      <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Ações
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {units.map((unit) => (
                      <tr key={unit.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                              <Building2 className="w-5 h-5 text-blue-600" />
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">{unit.name}</div>
                              <div className="text-xs text-gray-500">ID: {unit.id}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-900 max-w-xs truncate">
                            {unit.description || 'Sem descrição'}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900">
                          {unit.course_id ? `Curso ${unit.course_id}` : 'Sem curso'}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900">
                          {unit.order || 'N/A'}
                        </td>
                        <td className="px-6 py-4 text-center">
                          <Badge variant={getStatusVariant(unit.status)}>
                            {getStatusLabel(unit.status)}
                          </Badge>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-500">
                          {formatDate(unit.updated_at)}
                        </td>
                        <td className="px-6 py-4 text-center">
                          <div className="flex items-center justify-center space-x-2">
                            <button
                              onClick={() => alert('Navegação desabilitada temporariamente')}
                              className="text-blue-600 hover:text-blue-900 p-1"
                              title="Visualizar"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => alert('Navegação desabilitada temporariamente')}
                              className="text-green-600 hover:text-green-900 p-1"
                              title="Editar"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDelete(unit)}
                              disabled={isDeleting === unit.id}
                              className="text-red-600 hover:text-red-900 p-1 disabled:opacity-50"
                              title="Excluir"
                            >
                              {isDeleting === unit.id ? (
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-600"></div>
                              ) : (
                                <Trash2 className="w-4 h-4" />
                              )}
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              
              {/* Paginação */}
              {pagination.totalPages > 1 && (
                <Pagination pagination={pagination} onPageChange={handlePageChange} />
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}

