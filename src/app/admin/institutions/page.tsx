'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { 
  Building2, 
  Plus,
  Edit,
  Eye,
  Trash2,
  Search,
  Filter,
  Download,
  Upload,
  RefreshCw,
  AlertCircle,
  CheckCircle,
  X
} from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { institutionService, InstitutionFilters } from '@/services/institutionService'
import { InstitutionResponseDto } from '@/types/api'
import { InstitutionDto } from '@/types/institution'
import InstitutionModal from '@/components/modals/InstitutionModal'

// Componente de notificação
const Notification = ({ message, type, onClose }: { message: string; type: 'success' | 'error' | 'info'; onClose: () => void }) => {
  const bgColor = type === 'success' ? 'bg-green-500' : type === 'error' ? 'bg-red-500' : 'bg-blue-500'
  const Icon = type === 'success' ? CheckCircle : type === 'error' ? AlertCircle : AlertCircle

  return (
    <div className={`${bgColor} text-white p-4 rounded-lg shadow-lg flex items-center justify-between mb-4`}>
      <div className="flex items-center gap-2">
        <Icon className="h-5 w-5" />
        <span>{message}</span>
      </div>
      <button onClick={onClose} className="hover:opacity-80">
        <X className="h-4 w-4" />
      </button>
    </div>
  )
}

export default function InstitutionsPage() {
  const { user } = useAuth()
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [institutions, setInstitutions] = useState<InstitutionResponseDto[]>([])
  const [showModal, setShowModal] = useState(false)
  const [selectedInstitution, setSelectedInstitution] = useState<InstitutionDto | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalItems, setTotalItems] = useState(0)
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null)
  const [filters, setFilters] = useState<InstitutionFilters>({})
  const [showFilters, setShowFilters] = useState(false)
  const [sortBy, setSortBy] = useState('name')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc')
  const itemsPerPage = 10

  // Função para converter InstitutionResponseDto para InstitutionDto
  const convertToInstitutionDto = (institution: InstitutionResponseDto): InstitutionDto => {
    return {
      id: institution.id,
      name: institution.name,
      code: institution.code,
      type: 'PUBLIC', // Valor padrão, já que InstitutionResponseDto não tem type
      description: institution.description,
      email: institution.email,
      phone: institution.phone,
      website: undefined,
      address: institution.address,
      city: undefined,
      state: undefined,
      zip_code: undefined,
      logo_url: undefined,
      is_active: institution.active || false,
      created_at: new Date(institution.created_at),
      updated_at: new Date(institution.updated_at),
      schools_count: undefined,
      users_count: institution.users_count,
      active_courses: institution.courses_count
    }
  }

  // Função para mostrar notificações
  const showNotification = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
    setNotification({ message, type })
    setTimeout(() => setNotification(null), 5000)
  }

  // Carregar instituições
  const loadInstitutions = useCallback(async (showLoadingIndicator = true) => {
    try {
      if (showLoadingIndicator) setLoading(true)
      
      const response = await institutionService.getInstitutions({
        page: currentPage,
        limit: itemsPerPage,
        sortBy,
        sortOrder,
        filters: {
          ...filters,
          search: searchTerm || undefined
        }
      })
      
      setInstitutions(response.items || [])
      setTotalPages(response.totalPages || 1)
      setTotalItems(response.total || 0)
    } catch (error: any) {
      console.error('Erro ao carregar instituições:', error)
      showNotification(error.message || 'Erro ao carregar instituições', 'error')
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [currentPage, searchTerm, filters, sortBy, sortOrder])

  useEffect(() => {
    loadInstitutions()
  }, [loadInstitutions])

  // Função de busca
  const handleSearch = () => {
    setCurrentPage(1)
    loadInstitutions()
  }

  // Função para atualizar lista
  const handleRefresh = () => {
    setRefreshing(true)
    loadInstitutions(false)
  }

  // Criar nova instituição
  const handleCreateInstitution = () => {
    setSelectedInstitution(null)
    setShowModal(true)
  }

  // Editar instituição
  const handleEditInstitution = (institution: InstitutionResponseDto) => {
    setSelectedInstitution(convertToInstitutionDto(institution))
    setShowModal(true)
  }

  // Visualizar detalhes da instituição
  const handleViewInstitution = (institution: InstitutionResponseDto) => {
    window.location.href = `/admin/institutions/${institution.id}`
  }

  // Excluir instituição
  const handleDeleteInstitution = async (id: string) => {
    if (!window.confirm('Tem certeza que deseja excluir esta instituição? Esta ação não pode ser desfeita.')) {
      return
    }

    try {
      // Verificar se pode deletar
      const canDelete = await institutionService.canDeleteInstitution(id)
      if (!canDelete.canDelete) {
        showNotification(canDelete.reason || 'Não é possível excluir esta instituição', 'error')
        return
      }

      await institutionService.deleteInstitution(id)
      showNotification('Instituição excluída com sucesso!', 'success')
      loadInstitutions()
    } catch (error: any) {
      console.error('Erro ao excluir instituição:', error)
      showNotification(error.message || 'Erro ao excluir instituição', 'error')
    }
  }

  // Alternar status da instituição
  const handleToggleStatus = async (institution: InstitutionResponseDto) => {
    try {
      const newStatus = !institution.active
      await institutionService.toggleInstitutionStatus(institution.id, newStatus)
      showNotification(`Instituição ${newStatus ? 'ativada' : 'desativada'} com sucesso!`, 'success')
      loadInstitutions()
    } catch (error: any) {
      console.error('Erro ao alterar status:', error)
      showNotification(error.message || 'Erro ao alterar status da instituição', 'error')
    }
  }

  // Exportar instituições
  const handleExport = async () => {
    try {
      const blob = await institutionService.exportInstitutions(filters)
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `instituicoes_${new Date().toISOString().split('T')[0]}.csv`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
      showNotification('Instituições exportadas com sucesso!', 'success')
    } catch (error: any) {
      console.error('Erro ao exportar:', error)
      showNotification(error.message || 'Erro ao exportar instituições', 'error')
    }
  }

  // Importar instituições
  const handleImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    try {
      const result = await institutionService.importInstitutions(file)
      if (result.errors.length > 0) {
        showNotification(`Importação concluída com ${result.errors.length} erros. ${result.success} instituições importadas.`, 'info')
      } else {
        showNotification(`${result.success} instituições importadas com sucesso!`, 'success')
      }
      loadInstitutions()
    } catch (error: any) {
      console.error('Erro ao importar:', error)
      showNotification(error.message || 'Erro ao importar instituições', 'error')
    }
  }

  // Aplicar filtros
  const handleApplyFilters = () => {
    setCurrentPage(1)
    setShowFilters(false)
    loadInstitutions()
  }

  // Limpar filtros
  const handleClearFilters = () => {
    setFilters({})
    setSearchTerm('')
    setCurrentPage(1)
    setSortBy('name')
    setSortOrder('asc')
    setShowFilters(false)
    loadInstitutions()
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Notificação */}
      {notification && (
        <Notification
          message={notification.message}
          type={notification.type}
          onClose={() => setNotification(null)}
        />
      )}

      {/* Cabeçalho */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-800 mb-2">
              Gerenciar Instituições
            </h1>
            <p className="text-slate-600">
              Cadastre e gerencie as instituições no sistema.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-slate-500">
              Total: {totalItems} instituições
            </span>
            <button
              onClick={handleRefresh}
              className={`p-2 rounded-lg border border-slate-200 hover:bg-slate-50 ${refreshing ? 'animate-spin' : ''}`}
              title="Atualizar lista"
            >
              <RefreshCw className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Barra de ações */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div className="flex w-full md:w-auto">
          <div className="relative flex-grow">
            <input
              type="text"
              placeholder="Buscar instituições..."
              className="pl-10 pr-4 py-2 border border-slate-200 rounded-l-lg w-full md:w-80 focus:outline-none focus:ring-2 focus:ring-primary-dark"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
            />
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          </div>
          <button 
            onClick={handleSearch}
            className="bg-primary-dark text-white px-4 py-2 rounded-r-lg hover:bg-primary-darker transition-colors"
          >
            Buscar
          </button>
        </div>
        
        <div className="flex gap-2 w-full md:w-auto">
          <button 
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-1 px-3 py-2 border border-slate-200 rounded-lg text-sm hover:bg-slate-50 transition-colors"
          >
            <Filter className="h-4 w-4" />
            Filtros
          </button>
          
          <label className="flex items-center gap-1 px-3 py-2 border border-slate-200 rounded-lg text-sm hover:bg-slate-50 transition-colors cursor-pointer">
            <Upload className="h-4 w-4" />
            Importar
            <input
              type="file"
              accept=".csv"
              onChange={handleImport}
              className="hidden"
            />
          </label>
          
          <button 
            onClick={handleExport}
            className="flex items-center gap-1 px-3 py-2 border border-slate-200 rounded-lg text-sm hover:bg-slate-50 transition-colors"
          >
            <Download className="h-4 w-4" />
            Exportar
          </button>
          
          <button 
            onClick={handleCreateInstitution}
            className="flex items-center gap-1 px-3 py-2 bg-primary-dark text-white rounded-lg text-sm ml-2 hover:bg-primary-darker transition-colors"
          >
            <Plus className="h-4 w-4" />
            Nova Instituição
          </button>
        </div>
      </div>

      {/* Painel de filtros */}
      {showFilters && (
        <div className="bg-white rounded-lg shadow-md p-4 mb-6">
          <h3 className="font-semibold text-slate-800 mb-3">Filtros Avançados</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Status
              </label>
              <select
                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-dark"
                value={filters.active === undefined ? '' : filters.active.toString()}
                onChange={(e) => setFilters({ ...filters, active: e.target.value === '' ? undefined : e.target.value === 'true' })}
              >
                <option value="">Todos</option>
                <option value="true">Ativo</option>
                <option value="false">Inativo</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Cidade
              </label>
              <input
                type="text"
                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-dark"
                value={filters.city || ''}
                onChange={(e) => setFilters({ ...filters, city: e.target.value })}
                placeholder="Filtrar por cidade"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Estado
              </label>
              <input
                type="text"
                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-dark"
                value={filters.state || ''}
                onChange={(e) => setFilters({ ...filters, state: e.target.value })}
                placeholder="Filtrar por estado"
              />
            </div>
          </div>
          
          <div className="flex justify-end gap-2 mt-4">
            <button
              onClick={handleClearFilters}
              className="px-4 py-2 border border-slate-200 rounded-lg text-sm hover:bg-slate-50 transition-colors"
            >
              Limpar Filtros
            </button>
            <button
              onClick={handleApplyFilters}
              className="px-4 py-2 bg-primary-dark text-white rounded-lg text-sm hover:bg-primary-darker transition-colors"
            >
              Aplicar Filtros
            </button>
          </div>
        </div>
      )}

      {/* Tabela de instituições */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-50">
              <tr>
                <th 
                  scope="col" 
                  className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider cursor-pointer hover:bg-slate-100"
                  onClick={() => {
                    setSortBy('name')
                    setSortOrder(sortBy === 'name' && sortOrder === 'asc' ? 'desc' : 'asc')
                  }}
                >
                  <div className="flex items-center gap-1">
                    Nome
                    {sortBy === 'name' && (
                      <span className="text-primary-dark">
                        {sortOrder === 'asc' ? '↑' : '↓'}
                      </span>
                    )}
                  </div>
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Código
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Email
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Telefone
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Status
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Usuários
                </th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Ações
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-slate-200">
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-6 py-4 text-center text-sm text-slate-500">
                    <div className="flex justify-center items-center">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary-dark"></div>
                      <span className="ml-2">Carregando...</span>
                    </div>
                  </td>
                </tr>
              ) : institutions.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-4 text-center text-sm text-slate-500">
                    <div className="flex flex-col items-center justify-center py-8">
                      <Building2 className="h-12 w-12 text-slate-300 mb-3" />
                      <p className="text-lg font-medium text-slate-600 mb-1">Nenhuma instituição encontrada</p>
                      <p className="text-sm text-slate-500">Tente ajustar os filtros ou criar uma nova instituição.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                institutions.map((institution) => (
                  <tr key={institution.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10 bg-primary-light rounded-full flex items-center justify-center">
                          <Building2 className="h-5 w-5 text-primary-dark" />
                        </div>
                        <div className="ml-3">
                          <div className="text-sm font-medium text-slate-900">{institution.name}</div>
                          {institution.address && (
                            <div className="text-xs text-slate-500">{institution.address}</div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                      <code className="bg-slate-100 px-2 py-1 rounded">{institution.code}</code>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                      {institution.email || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                      {institution.phone || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <button
                        onClick={() => handleToggleStatus(institution)}
                        className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full cursor-pointer transition-colors ${
                          institution.active 
                            ? 'bg-green-100 text-green-800 hover:bg-green-200' 
                            : 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200'
                        }`}
                      >
                        {institution.active ? 'Ativo' : 'Inativo'}
                      </button>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                      <div className="flex items-center gap-1">
                        <span className="font-medium">{institution.users_count || 0}</span>
                        <span className="text-xs text-slate-400">usuários</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end space-x-2">
                        <button 
                          onClick={() => handleEditInstitution(institution)} 
                          className="text-indigo-600 hover:text-indigo-900 transition-colors p-1 rounded hover:bg-indigo-50"
                          title="Editar"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button 
                          onClick={() => handleViewInstitution(institution)} 
                          className="text-blue-600 hover:text-blue-900 transition-colors p-1 rounded hover:bg-blue-50"
                          title="Visualizar"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        <button 
                          onClick={() => handleDeleteInstitution(institution.id)} 
                          className="text-red-600 hover:text-red-900 transition-colors p-1 rounded hover:bg-red-50"
                          title="Excluir"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        
        {/* Paginação */}
        {totalPages > 1 && (
          <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-slate-200 sm:px-6">
            <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-slate-700">
                  Mostrando <span className="font-medium">{(currentPage - 1) * itemsPerPage + 1}</span> a{' '}
                  <span className="font-medium">
                    {Math.min(currentPage * itemsPerPage, totalItems)}
                  </span>{' '}
                  de <span className="font-medium">{totalItems}</span> resultados
                </p>
              </div>
              <div>
                <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                  <button
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                    className={`relative inline-flex items-center px-2 py-2 rounded-l-md border border-slate-300 bg-white text-sm font-medium ${
                      currentPage === 1 
                        ? 'text-slate-300 cursor-not-allowed' 
                        : 'text-slate-500 hover:bg-slate-50'
                    }`}
                  >
                    <span className="sr-only">Anterior</span>
                    &larr;
                  </button>
                  
                  {/* Páginas */}
                  {(() => {
                    const pages = []
                    const maxPagesToShow = 5
                    let startPage = Math.max(1, currentPage - Math.floor(maxPagesToShow / 2))
                    let endPage = Math.min(totalPages, startPage + maxPagesToShow - 1)
                    
                    if (endPage - startPage < maxPagesToShow - 1) {
                      startPage = Math.max(1, endPage - maxPagesToShow + 1)
                    }
                    
                    if (startPage > 1) {
                      pages.push(
                        <button
                          key={1}
                          onClick={() => setCurrentPage(1)}
                          className="relative inline-flex items-center px-4 py-2 border border-slate-300 bg-white text-sm font-medium text-slate-500 hover:bg-slate-50"
                        >
                          1
                        </button>
                      )
                      if (startPage > 2) {
                        pages.push(
                          <span key="dots1" className="relative inline-flex items-center px-4 py-2 border border-slate-300 bg-white text-sm font-medium text-slate-700">
                            ...
                          </span>
                        )
                      }
                    }
                    
                    for (let i = startPage; i <= endPage; i++) {
                      pages.push(
                        <button
                          key={i}
                          onClick={() => setCurrentPage(i)}
                          className={`relative inline-flex items-center px-4 py-2 border border-slate-300 bg-white text-sm font-medium ${
                            i === currentPage 
                              ? 'z-10 bg-primary-dark text-white border-primary-dark' 
                              : 'text-slate-500 hover:bg-slate-50'
                          }`}
                        >
                          {i}
                        </button>
                      )
                    }
                    
                    if (endPage < totalPages) {
                      if (endPage < totalPages - 1) {
                        pages.push(
                          <span key="dots2" className="relative inline-flex items-center px-4 py-2 border border-slate-300 bg-white text-sm font-medium text-slate-700">
                            ...
                          </span>
                        )
                      }
                      pages.push(
                        <button
                          key={totalPages}
                          onClick={() => setCurrentPage(totalPages)}
                          className="relative inline-flex items-center px-4 py-2 border border-slate-300 bg-white text-sm font-medium text-slate-500 hover:bg-slate-50"
                        >
                          {totalPages}
                        </button>
                      )
                    }
                    
                    return pages
                  })()}
                  
                  <button
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages}
                    className={`relative inline-flex items-center px-2 py-2 rounded-r-md border border-slate-300 bg-white text-sm font-medium ${
                      currentPage === totalPages 
                        ? 'text-slate-300 cursor-not-allowed' 
                        : 'text-slate-500 hover:bg-slate-50'
                    }`}
                  >
                    <span className="sr-only">Próximo</span>
                    &rarr;
                  </button>
                </nav>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <InstitutionModal
          institution={selectedInstitution}
          onClose={() => {
            setShowModal(false)
            setSelectedInstitution(null)
            loadInstitutions()
          }}
        />
      )}
    </div>
  )
}
