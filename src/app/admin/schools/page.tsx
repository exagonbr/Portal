'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { useToast } from '@/components/ToastManager'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { StatCard } from '@/components/ui/StandardCard'
import {
  Plus,
  Search,
  Edit,
  Trash2,
  Eye,
  School,
  Users,
  BookOpen,
  RefreshCw,
  Filter,
  X,
  Building2,
  MapPin
} from 'lucide-react'
import { schoolService } from '@/services/schoolService'
import { institutionService } from '@/services/institutionService'
import { useRouter } from 'next/navigation'
import UnitFormModal from '@/components/admin/units/UnitFormModal'
import { SchoolDto, SchoolFilter } from '@/types/school'
import { InstitutionDto } from '@/types/institution'
import { useAuth } from '@/contexts/AuthContext'
import { UserRole } from '@/types/roles'

// Interface para resposta paginada
interface PaginatedResponse<T> {
  items: T[];
  total: number;
}

// Interface para estatísticas de escolas
interface SchoolStats {
  totalSchools: number
  activeSchools: number
  inactiveSchools: number
  totalInstitutions: number
}

export default function AdminSchoolsPage() {
  const { showSuccess, showError } = useToast()
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const router = useRouter()
  
  // Dados principais
  const [schools, setSchools] = useState<SchoolDto[]>([])
  const [institutions, setInstitutions] = useState<InstitutionDto[]>([])

  // Modal de formulário
  const [modalOpen, setModalOpen] = useState(false)
  const [selectedSchool, setSelectedSchool] = useState<SchoolDto | null>(null)
  const [modalMode, setModalMode] = useState<'create' | 'edit' | 'view'>('create')

  // Paginação e Filtros
  const [totalItems, setTotalItems] = useState(0)
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage] = useState(10)
  const [searchQuery, setSearchQuery] = useState('')
  const [filters, setFilters] = useState<SchoolFilter>({})
  const [showFilterPanel, setShowFilterPanel] = useState(false)

  // Estatísticas
  const [stats, setStats] = useState<SchoolStats>({
    totalSchools: 0,
    activeSchools: 0,
    inactiveSchools: 0,
    totalInstitutions: 0,
  })

  const calculateStats = useCallback((allSchools: SchoolDto[], allInstitutions: InstitutionDto[]) => {
    const totalSchools = allSchools.length
    const activeSchools = allSchools.filter(school => school.is_active).length
    const inactiveSchools = allSchools.filter(school => !school.is_active).length
    const totalInstitutions = allInstitutions.length

    setStats({ totalSchools, activeSchools, inactiveSchools, totalInstitutions })
  }, [])

  const fetchInstitutions = async () => {
    try {
      setLoading(true);
      console.log('Buscando instituições...');
      
      const response = await institutionService.getInstitutions({
        page: 1,
        limit: 100 // Buscar todas as instituições disponíveis
      });
      
      if (response && response.items) {
        console.log(`Instituições carregadas: ${response.items.length}`);
        setInstitutions(response.items);
        return response.items;
      } else {
        throw new Error('Resposta vazia do serviço de instituições');
      }
    } catch (error) {
      console.error('Erro ao carregar instituições:', error);
      
      // Verificar se é um erro de timeout
      const errorMessage = error instanceof Error ? error.message : String(error);
      if (errorMessage.includes('timeout') || errorMessage.includes('Timeout')) {
        showError("Timeout ao carregar instituições. Tente novamente mais tarde.");
      } else {
        showError("Erro ao carregar instituições. Tente novamente.");
      }
      
      setInstitutions([]);
      return [];
    }
  }

  const fetchPageData = useCallback(async (
    page = 1, 
    search = '', 
    currentFilters: SchoolFilter = {}, 
    showLoadingIndicator = true
  ) => {
    if (showLoadingIndicator) setLoading(true)
    else setRefreshing(true)

    try {
      // Buscar instituições se ainda não tiver
      let currentInstitutions = institutions;
      if (institutions.length === 0) {
        currentInstitutions = await fetchInstitutions()
      }

      // Preparar parâmetros para o serviço de escolas
      const params: SchoolFilter = {
        page,
        limit: itemsPerPage,
        ...currentFilters
      }
      
      if (search) params.search = search

      // Usar o serviço de escolas
      const response = await schoolService.getSchools(params) as PaginatedResponse<SchoolDto>

      if (response && response.items) {
        setSchools(response.items)
        setTotalItems(response.total || response.items.length)
        setCurrentPage(page)
        
        // Calcular estatísticas baseadas nos dados reais
        calculateStats(response.items, currentInstitutions)

        if (!showLoadingIndicator) {
          showSuccess("Lista de escolas atualizada!");
        }
      } else {
        throw new Error('Resposta inválida do serviço de escolas')
      }
    } catch (error) {
      console.error('Erro ao carregar escolas:', error)
      showError("Erro ao carregar escolas.")
      
      // Em caso de erro, limpar os dados
      setSchools([])
      setTotalItems(0)
      setStats({
        totalSchools: 0,
        activeSchools: 0,
        inactiveSchools: 0,
        totalInstitutions: 0
      })
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [institutions, itemsPerPage, calculateStats, showSuccess, showError])

  useEffect(() => {
    fetchPageData(currentPage, searchQuery, filters)
  }, [currentPage, fetchPageData])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setCurrentPage(1)
    fetchPageData(1, searchQuery, filters)
  }

  const handleFilterChange = (key: keyof SchoolFilter, value: any) => {
    const newFilters = { ...filters }
    
    if (value === '') {
      delete newFilters[key]
    } else {
      newFilters[key] = value
    }
    
    setFilters(newFilters)
  }

  const applyFilters = () => {
    setCurrentPage(1)
    fetchPageData(1, searchQuery, filters)
    setShowFilterPanel(false)
  }

  const clearFilters = () => {
    setFilters({})
    setCurrentPage(1)
    fetchPageData(1, searchQuery, {})
    setShowFilterPanel(false)
  }

  const handleRefresh = () => {
    fetchPageData(currentPage, searchQuery, filters, false)
  }

  const handleDelete = async (school: SchoolDto) => {
    if (!confirm(`Tem certeza que deseja excluir a escola "${school.name}"?`)) {
      return
    }
    
    try {
      setLoading(true)
      await schoolService.deleteSchool(Number(school.id))
      showSuccess("Escola excluída com sucesso!")
      fetchPageData(currentPage, searchQuery, filters)
    } catch (error) {
      console.error('Erro ao excluir escola:', error)
      showError("Erro ao excluir a escola.")
    } finally {
      setLoading(false)
    }
  }

  const openModal = (mode: 'create' | 'edit' | 'view', school?: SchoolDto) => {
    setModalMode(mode)
    setSelectedSchool(school || null)
    setModalOpen(true)
  }

  const closeModal = () => {
    setModalOpen(false)
    setSelectedSchool(null)
  }

  const handleModalSave = async (data: any) => {
    try {
      setLoading(true)
      
      if (modalMode === 'create') {
        await schoolService.createSchool(data)
        showSuccess("Escola criada com sucesso!")
      } else if (modalMode === 'edit' && selectedSchool) {
        await schoolService.updateSchool(Number(selectedSchool.id), data)
        showSuccess("Escola atualizada com sucesso!")
      }
      
      closeModal()
      fetchPageData(currentPage, searchQuery, filters)
    } catch (error) {
      console.error('Erro ao salvar escola:', error)
      showError("Erro ao salvar escola.")
    } finally {
      setLoading(false)
    }
  }

  const getInstitutionName = (institutionId?: string) => {
    if (!institutionId) return 'N/A'
    const institution = institutions.find(i => i.id === institutionId)
    return institution ? institution.name : 'N/A'
  }

  const totalPages = Math.ceil(totalItems / itemsPerPage)

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Escolas</h1>
              <p className="text-gray-600 mt-1">Gerencie as escolas do sistema</p>
            </div>
            <div className="flex gap-3">
              <Button 
                onClick={handleRefresh} 
                variant="outline" 
                disabled={refreshing}
                className="flex items-center gap-2"
              >
                <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
                Atualizar
              </Button>
              <Button 
                onClick={() => openModal('create')} 
                className="flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Nova Escola
              </Button>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <StatCard
              icon={School}
              title="Total"
              value={stats.totalSchools}
              subtitle="Escolas"
              color="blue"
            />
            <StatCard
              icon={Building2}
              title="Instituições"
              value={stats.totalInstitutions}
              subtitle="Associadas"
              color="purple"
            />
            <StatCard
              icon={BookOpen}
              title="Ativas"
              value={stats.activeSchools}
              subtitle="Em funcionamento"
              color="green"
            />
            <StatCard
              icon={Users}
              title="Inativas"
              value={stats.inactiveSchools}
              subtitle="Desativadas"
              color="amber"
            />
          </div>

          {/* Filtros e Busca */}
          <div className="flex flex-col md:flex-row gap-4 mb-4">
            <form onSubmit={handleSearch} className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Buscar escola..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </form>
            
            <div className="flex gap-2">
              <Button 
                type="submit" 
                onClick={handleSearch}
                variant="outline"
                className="whitespace-nowrap"
              >
                Buscar
              </Button>
              
              <Button
                onClick={() => setShowFilterPanel(!showFilterPanel)}
                variant="outline"
                className="flex items-center gap-2"
              >
                <Filter className="w-4 h-4" />
                Filtros
                {Object.keys(filters).length > 0 && (
                  <Badge variant="primary" className="ml-1">
                    {Object.keys(filters).length}
                  </Badge>
                )}
              </Button>
            </div>
          </div>

          {/* Painel de Filtros */}
          {showFilterPanel && (
            <div className="bg-gray-50 p-4 rounded-lg mb-4 border border-gray-200">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-medium">Filtros avançados</h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowFilterPanel(false)}
                  className="text-gray-500"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Instituição
                  </label>
                  <select
                    value={filters.institution_id || ''}
                    onChange={(e) => handleFilterChange('institution_id', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Todas as instituições</option>
                    {institutions.map((inst) => (
                      <option key={inst.id} value={inst.id}>
                        {inst.name}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Status
                  </label>
                  <select
                    value={filters.is_active === undefined ? '' : String(filters.is_active)}
                    onChange={(e) => {
                      const value = e.target.value;
                      if (value === '') {
                        handleFilterChange('is_active', undefined);
                      } else {
                        handleFilterChange('is_active', value === 'true');
                      }
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Todos os status</option>
                    <option value="true">Ativas</option>
                    <option value="false">Inativas</option>
                  </select>
                </div>
              </div>
              
              <div className="flex justify-end gap-2">
                <Button
                  variant="outline"
                  onClick={clearFilters}
                  className="flex items-center gap-2"
                >
                  <X className="w-4 h-4" />
                  Limpar
                </Button>
                <Button
                  onClick={applyFilters}
                  className="flex items-center gap-2"
                >
                  <Filter className="w-4 h-4" />
                  Aplicar Filtros
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Lista de Escolas */}
        <div>
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <span className="ml-2 text-gray-600">Carregando...</span>
            </div>
          ) : schools.length === 0 ? (
            <div className="text-center py-12">
              <School className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 text-lg mb-2">Nenhuma escola encontrada</p>
              <p className="text-gray-400 text-sm">Tente ajustar seus filtros ou criar uma nova escola</p>
            </div>
          ) : (
            <>
              {/* Desktop Table */}
              <div className="hidden lg:block overflow-x-auto">
                <table className="w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Escola
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Instituição
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Cidade/Estado
                      </th>
                      <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Ações
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {schools.map((school) => (
                      <tr key={school.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                              <School className="w-5 h-5 text-blue-600" />
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">{school.name}</div>
                              <div className="text-xs text-gray-500">{school.code || 'Sem código'}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900">
                          {school.institution_name || getInstitutionName(school.institution_id)}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900">
                          {school.city}{school.city && school.state ? ', ' : ''}{school.state}
                        </td>
                        <td className="px-6 py-4 text-center">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            school.is_active 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {school.is_active ? 'Ativa' : 'Inativa'}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <div className="flex items-center justify-center space-x-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => openModal('view', school)}
                              className="text-blue-600 hover:text-blue-900"
                            >
                              <Eye className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => openModal('edit', school)}
                              className="text-green-600 hover:text-green-900"
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDelete(school)}
                              className="text-red-600 hover:text-red-900"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile Cards */}
              <div className="lg:hidden">
                <div className="space-y-4 p-4">
                  {schools.map((school) => (
                    <div key={school.id} className="bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow">
                      <div className="p-4 border-b border-gray-100">
                        <div className="flex items-start justify-between">
                          <div className="flex items-center flex-1">
                            <div className="flex-shrink-0 w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                              <School className="w-6 h-6 text-blue-600" />
                            </div>
                            <div className="ml-3 flex-1 min-w-0">
                              <h3 className="text-sm font-medium text-gray-900 truncate">{school.name}</h3>
                              <div className="flex items-center gap-2 mt-1">
                                <span className="text-xs text-gray-500">{school.code || 'Sem código'}</span>
                              </div>
                            </div>
                          </div>
                          <span className={`ml-2 inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                            school.is_active 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {school.is_active ? 'Ativa' : 'Inativa'}
                          </span>
                        </div>
                      </div>

                      <div className="p-4">
                        <div className="flex flex-col gap-2 mb-4">
                          <div className="flex items-center">
                            <Building2 className="w-4 h-4 text-gray-400 mr-2" />
                            <span className="text-sm text-gray-600">
                              {school.institution_name || getInstitutionName(school.institution_id)}
                            </span>
                          </div>
                          
                          {(school.city || school.state) && (
                            <div className="flex items-center">
                              <MapPin className="w-4 h-4 text-gray-400 mr-2" />
                              <span className="text-sm text-gray-600">
                                {school.city}{school.city && school.state ? ', ' : ''}{school.state}
                              </span>
                            </div>
                          )}
                        </div>

                        <div className="flex justify-end space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => openModal('view', school)}
                            className="flex items-center gap-1"
                          >
                            <Eye className="w-4 h-4" />
                            Ver
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => openModal('edit', school)}
                            className="flex items-center gap-1"
                          >
                            <Edit className="w-4 h-4" />
                            Editar
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDelete(school)}
                            className="flex items-center gap-1 text-red-600 hover:text-red-700 hover:border-red-300"
                          >
                            <Trash2 className="w-4 h-4" />
                            Excluir
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>

        {/* Paginação */}
        {totalPages > 1 && (
          <div className="px-6 py-4 border-t border-gray-200">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-700">
                Mostrando {((currentPage - 1) * itemsPerPage) + 1} a {Math.min(currentPage * itemsPerPage, totalItems)} de {totalItems} resultados
              </div>
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                >
                  Anterior
                </Button>
                <span className="text-sm text-gray-700">
                  {currentPage} de {totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                >
                  Próxima
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Modal de Formulário */}
      {modalOpen && (
        <UnitFormModal
          isOpen={modalOpen}
          onClose={closeModal}
          onSave={handleModalSave}
          mode={modalMode}
          school={selectedSchool}
          institutions={institutions}
        />
      )}
    </div>
  )
}