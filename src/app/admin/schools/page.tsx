'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { useToast } from '@/components/ToastManager'
import { schoolService } from '@/services/schoolService.mock'
import { institutionService } from '@/services/institutionService.mock'
import { SchoolResponseDto, InstitutionResponseDto, BaseFilterDto } from '@/types/api'
import AuthenticatedLayout from '@/components/AuthenticatedLayout'
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
  Building2
} from 'lucide-react'

// Interface para estatísticas de escolas
interface SchoolStats {
  totalSchools: number
  totalStudents: number
  totalTeachers: number
  totalClasses: number
}

export default function AdminSchoolsPage() {
  const { showSuccess, showError } = useToast()
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  
  // Dados principais
  const [schools, setSchools] = useState<SchoolResponseDto[]>([])
  const [institutions, setInstitutions] = useState<InstitutionResponseDto[]>([])

  // Paginação e Filtros
  const [totalItems, setTotalItems] = useState(0)
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage] = useState(10)
  const [searchQuery, setSearchTerm] = useState('')
  const [filters, setFilters] = useState<BaseFilterDto & { institutionId?: number }>({})
  const [showFilterPanel, setShowFilterPanel] = useState(false)

  // Modais (simplificado)
  const [modalOpen, setModalOpen] = useState(false)
  const [selectedSchool, setSelectedSchool] = useState<SchoolResponseDto | null>(null)

  // Estatísticas
  const [stats, setStats] = useState<SchoolStats>({
    totalSchools: 0,
    totalStudents: 0,
    totalTeachers: 0,
    totalClasses: 0,
  })

  const calculateStats = useCallback((allSchools: SchoolResponseDto[]) => {
    const totalSchools = allSchools.length
    const totalStudents = allSchools.reduce((sum, s) => sum + (s.total_students || 0), 0)
    const totalTeachers = allSchools.reduce((sum, s) => sum + (s.total_teachers || 0), 0)
    const totalClasses = allSchools.reduce((sum, s) => sum + (s.total_classes || 0), 0)

    setStats({ totalSchools, totalStudents, totalTeachers, totalClasses })
  }, [])

  const fetchPageData = useCallback(async (page = 1, search = '', currentFilters: typeof filters = {}, showLoadingIndicator = true) => {
    if (showLoadingIndicator) setLoading(true)
    else setRefreshing(true)

    await new Promise(resolve => setTimeout(resolve, 500))

    try {
      if (institutions.length === 0) {
        const instResponse = await institutionService.getInstitutions({ limit: 1000 });
        setInstitutions(instResponse.items);
      }

      const params = {
        page,
        limit: itemsPerPage,
        search,
        ...currentFilters,
      }

      const response = await schoolService.getSchools(params)
      setSchools(response.items || [])
      setTotalItems(response.total || 0)
      setCurrentPage(page)

      const allSchoolsResponse = await schoolService.getSchools({ limit: 1000 })
      calculateStats(allSchoolsResponse.items)

      if (!showLoadingIndicator) {
        showSuccess("Lista de escolas atualizada!")
      }
    } catch (error) {
      showError("Erro ao carregar escolas.")
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [itemsPerPage, calculateStats, showError, showSuccess, institutions.length])

  useEffect(() => {
    fetchPageData(currentPage, searchQuery, filters)
  }, [currentPage, fetchPageData])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setCurrentPage(1)
    fetchPageData(1, searchQuery, filters)
  }

  const handleFilterChange = (key: keyof typeof filters, value: any) => {
    const newFilters = { ...filters };
    if (value === '' || value === undefined || value === null) {
      delete (newFilters as any)[key];
    } else {
      (newFilters as any)[key] = value;
    }
    setFilters(newFilters);
  };

  const applyFilters = () => {
    setCurrentPage(1);
    fetchPageData(1, searchQuery, filters);
  };

  const clearFilters = () => {
    setSearchTerm('');
    setFilters({});
    setCurrentPage(1);
    fetchPageData(1, '', {});
  };

  const handleRefresh = () => {
    fetchPageData(currentPage, searchQuery, filters, false)
  }

  const handleDelete = async (school: SchoolResponseDto) => {
    if (!confirm(`Tem certeza que deseja excluir a escola "${school.name}"?`)) return

    try {
      setLoading(true)
      await schoolService.deleteSchool(school.id)
      showSuccess("Escola excluída com sucesso.")
      await fetchPageData(currentPage, searchQuery, filters, false)
    } catch (error) {
      showError("Erro ao excluir escola.")
    } finally {
      setLoading(false)
    }
  }

  const totalPages = Math.ceil(totalItems / itemsPerPage)

  return (
      <div className="container mx-auto px-4 py-6 max-w-7xl">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          {/* Header */}
          <div className="p-6 border-b border-gray-200">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Gerenciamento de Escolas</h1>
                <p className="text-gray-600 mt-1">Consulte e gerencie as escolas (unidades) do sistema</p>
              </div>
              <div className="flex gap-3">
                <Button onClick={handleRefresh} variant="outline" disabled={refreshing} className="flex items-center gap-2">
                  <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
                  Atualizar
                </Button>
                <Button onClick={() => alert("Funcionalidade de 'Nova Escola' a ser implementada.")} className="flex items-center gap-2">
                  <Plus className="w-4 h-4" />
                  Nova Escola
                </Button>
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              <StatCard icon={School} title="Total" value={stats.totalSchools} subtitle="Escolas" color="blue" />
              <StatCard icon={Users} title="Alunos" value={stats.totalStudents} subtitle="Matriculados" color="green" />
              <StatCard icon={Users} title="Professores" value={stats.totalTeachers} subtitle="Atuando" color="amber" />
              <StatCard icon={BookOpen} title="Turmas" value={stats.totalClasses} subtitle="Ativas" color="purple" />
            </div>

            {/* Search & Filter Trigger */}
            <div className="flex gap-3">
              <form onSubmit={handleSearch} className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="text"
                    placeholder="Buscar por nome da escola ou instituição..."
                    value={searchQuery}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </form>
              <Button onClick={() => setShowFilterPanel(!showFilterPanel)} variant="outline" className="flex items-center gap-2">
                <Filter className="w-4 h-4" />
                Filtros
              </Button>
            </div>
          </div>

          {/* Filter Panel */}
          {showFilterPanel && (
            <div className="p-6 border-b border-gray-200 bg-gray-50">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1 text-gray-700">Instituição</label>
                  <select
                    value={filters.institutionId || ''}
                    onChange={(e) => handleFilterChange('institutionId', e.target.value ? Number(e.target.value) : undefined)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  >
                    <option value="">Todas as Instituições</option>
                    {institutions.map(inst => <option key={inst.id} value={inst.id}>{inst.name}</option>)}
                  </select>
                </div>
              </div>
              <div className="flex justify-end gap-3 mt-4">
                <Button variant="ghost" onClick={clearFilters}>Limpar Filtros</Button>
                <Button onClick={applyFilters}>Aplicar</Button>
              </div>
            </div>
          )}

          {/* Content */}
          <div>
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                <span className="ml-2 text-gray-600">Carregando escolas...</span>
              </div>
            ) : schools.length === 0 ? (
              <div className="text-center py-12">
                <School className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500 text-lg mb-2">Nenhuma escola encontrada</p>
                <p className="text-gray-400 text-sm">{searchQuery || Object.keys(filters).length > 0 ? "Tente ajustar sua busca ou filtros." : "Nenhuma escola cadastrada."}</p>
              </div>
            ) : (
              <>
                {/* Desktop Table */}
                <div className="hidden lg:block overflow-x-auto">
                  <table className="w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Escola</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Instituição</th>
                        <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Alunos</th>
                        <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Professores</th>
                        <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Ações</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {schools.map((school) => (
                        <tr key={school.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4">
                            <div className="text-sm font-semibold text-gray-900">{school.name}</div>
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-600">{school.institutionName}</td>
                          <td className="px-6 py-4 text-center text-sm text-gray-800">{school.total_students}</td>
                          <td className="px-6 py-4 text-center text-sm text-gray-800">{school.total_teachers}</td>
                          <td className="px-6 py-4 text-center">
                            <div className="flex items-center justify-center space-x-2">
                              <Button variant="ghost" size="sm" onClick={() => alert(`Visualizar: ${school.name}`)} className="text-blue-600 hover:text-blue-900"><Eye className="w-4 h-4" /></Button>
                              <Button variant="ghost" size="sm" onClick={() => alert(`Editar: ${school.name}`)} className="text-green-600 hover:text-green-900"><Edit className="w-4 h-4" /></Button>
                              <Button variant="ghost" size="sm" onClick={() => handleDelete(school)} className="text-red-600 hover:text-red-900"><Trash2 className="w-4 h-4" /></Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Mobile Cards */}
                <div className="lg:hidden p-4 space-y-4">
                  {schools.map(school => (
                    <div key={school.id} className="bg-white border border-gray-200 rounded-lg shadow-sm">
                      <div className="p-4 border-b border-gray-100">
                        <h3 className="font-semibold text-gray-800">{school.name}</h3>
                        <p className="text-sm text-gray-500 flex items-center mt-1"><Building2 className="w-4 h-4 mr-2"/>{school.institutionName}</p>
                      </div>
                      <div className="p-4 grid grid-cols-3 gap-2 text-center">
                        <div>
                          <p className="text-xs text-gray-500">Alunos</p>
                          <p className="font-bold text-gray-800">{school.total_students}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">Professores</p>
                          <p className="font-bold text-gray-800">{school.total_teachers}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">Turmas</p>
                          <p className="font-bold text-gray-800">{school.total_classes}</p>
                        </div>
                      </div>
                      <div className="p-4 border-t border-gray-100 flex justify-end space-x-2">
                        <Button variant="outline" size="sm" onClick={() => alert(`Visualizar: ${school.name}`)}>Ver</Button>
                        <Button variant="outline" size="sm" onClick={() => alert(`Editar: ${school.name}`)}>Editar</Button>
                        <Button variant="destructive" size="sm" onClick={() => handleDelete(school)}>Excluir</Button>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
              <div className="text-sm text-gray-700">
                Página {currentPage} de {totalPages}
              </div>
              <div className="flex items-center space-x-2">
                <Button variant="outline" size="sm" onClick={() => setCurrentPage(p => Math.max(p - 1, 1))} disabled={currentPage === 1}>Anterior</Button>
                <Button variant="outline" size="sm" onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))} disabled={currentPage === totalPages}>Próxima</Button>
              </div>
            </div>
          )}
        </div>
      </div>
  )
}