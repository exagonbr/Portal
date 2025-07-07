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
  Building2
} from 'lucide-react'
import { unitService } from '@/services/unitService'
import { institutionService } from '@/services/institutionService'
import { useRouter } from 'next/navigation'
import UnitFormModal from '@/components/admin/units/UnitFormModal'

// Interface para unidades
interface Unit {
  id: string
  name: string
  institution_id: string
  institutionName?: string
  institution_name?: string
  deleted: boolean
  created_at: string
  updated_at: string
  date_created?: string
  last_updated?: string
}

// Interface para instituições
interface Institution {
  id: number
  name: string
}

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
  const router = useRouter()
  
  // Dados principais
  const [units, setUnits] = useState<Unit[]>([])
  const [institutions, setInstitutions] = useState<Institution[]>([])

  // Modal de formulário
  const [modalOpen, setModalOpen] = useState(false)
  const [selectedUnit, setSelectedUnit] = useState<Unit | null>(null)
  const [modalMode, setModalMode] = useState<'create' | 'edit' | 'view'>('create')

  // Paginação e Filtros
  const [totalItems, setTotalItems] = useState(0)
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage] = useState(10)
  const [searchQuery, setSearchTerm] = useState('')
  const [filters, setFilters] = useState<{ institutionId?: number }>({})
  const [showFilterPanel, setShowFilterPanel] = useState(false)

  // Estatísticas
  const [stats, setStats] = useState<SchoolStats>({
    totalSchools: 0,
    totalStudents: 0,
    totalTeachers: 0,
    totalClasses: 0,
  })

  // Verificar autenticação
  useEffect(() => {
    const checkAuth = () => {
      const token = localStorage.getItem('accessToken') || localStorage.getItem('authToken')
      if (!token) {
        showError("Sessão expirada ou usuário não autenticado")
        router.push('/auth/login')
      }
    }
    
    checkAuth()
  }, [router, showError])

  const calculateStats = useCallback((allUnits: Unit[]) => {
    const totalSchools = allUnits.length
    // Nota: Esses campos podem precisar ser ajustados conforme a estrutura real dos dados
    const totalStudents = 0 // Será necessário buscar esses dados de outra API
    const totalTeachers = 0 // Será necessário buscar esses dados de outra API
    const totalClasses = 0 // Será necessário buscar esses dados de outra API

    setStats({ totalSchools, totalStudents, totalTeachers, totalClasses })
  }, [])

  const fetchInstitutions = async () => {
    try {
      const response = await institutionService.getInstitutions({
        page: 1,
        limit: 100 // Buscar todas as instituições disponíveis
      });
      
      if (response && response.items) {
        // Mapear para o formato simplificado usado nesta página
        const institutionsData = response.items.map(inst => ({
          id: Number(inst.id),
          name: inst.name
        }));
        setInstitutions(institutionsData);
      } else {
        throw new Error('Erro ao buscar instituições');
      }
    } catch (error) {
      showError("Erro ao carregar instituições.");
      
      // Em caso de erro, definir algumas instituições padrão para não quebrar a interface
      setInstitutions([
        { id: 1, name: 'Sabercon Educação' },
      ]);
    }
  }

  const fetchPageData = async (page = 1, search = '', currentFilters: typeof filters = {}, showLoadingIndicator = true) => {
    if (showLoadingIndicator) setLoading(true)
    else setRefreshing(true)

    try {
      // Verificar autenticação antes de fazer a requisição
      const token = localStorage.getItem('accessToken') || localStorage.getItem('authToken')
      if (!token) {
        throw new Error('Usuário não autenticado')
      }

      // Buscar instituições se ainda não tiver
      if (institutions.length === 0) {
        await fetchInstitutions()
      }

      // Preparar parâmetros para o serviço de unidades
      const params: any = {
        page,
        limit: itemsPerPage
      }
      
      if (search) params.search = search
      if (currentFilters.institutionId) params.institution_id = currentFilters.institutionId

      // Usar o serviço de unidades
      const response = await unitService.getUnits(params)

      if (response && response.items) {
        // Mapear dados para o formato esperado pelo frontend
        const mappedUnits = response.items.map(unit => ({
          ...unit,
          institutionName: unit.institution_name
        })) as Unit[] // Forçar o tipo para Unit[]

        setUnits(mappedUnits)
        setTotalItems(response.total || mappedUnits.length)
        setCurrentPage(page)
        
        // Calcular estatísticas baseadas nos dados reais
        calculateStats(mappedUnits)

        if (!showLoadingIndicator) {
          showSuccess("Lista de unidades atualizada!");
        }
      } else {
        throw new Error('Resposta inválida do serviço de unidades')
      }
    } catch (error) {
      // Verificar se é erro de autenticação
      if (error instanceof Error && error.message === 'Usuário não autenticado') {
        showError("Sessão expirada. Por favor, faça login novamente.")
        router.push('/auth/login')
        return
      }
      
      showError("Erro ao carregar unidades.")
      
      // Em caso de erro, limpar os dados
      setUnits([])
      setTotalItems(0)
      setStats({
        totalSchools: 0,
        totalStudents: 0,
        totalTeachers: 0,
        totalClasses: 0,
      })
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  useEffect(() => {
    fetchPageData(currentPage, searchQuery, filters)
  }, [currentPage])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setCurrentPage(1)
    fetchPageData(1, searchQuery, filters)
  }

  const handleFilterChange = (key: keyof typeof filters, value: any) => {
    const newFilters = { ...filters };
    if (value === '' || value === undefined || value === null) {
      delete newFilters[key];
    } else {
      newFilters[key] = value;
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

  const handleDelete = async (unit: Unit) => {
    if (!confirm(`Tem certeza que deseja excluir a unidade "${unit.name}"?`)) return

    try {
      setLoading(true)
      // Usar o serviço de unidades para excluir
      await unitService.deleteUnit(Number(unit.id))
      showSuccess("Unidade excluída com sucesso.")
      await fetchPageData(currentPage, searchQuery, filters, false)
    } catch (error) {
      showError("Erro ao excluir unidade.")
    } finally {
      setLoading(false)
    }
  }

  // Funções para o modal
  const openModal = (mode: 'create' | 'edit' | 'view', unit?: Unit) => {
    setModalMode(mode)
    setSelectedUnit(unit || null)
    setModalOpen(true)
  }

  const closeModal = () => {
    setModalOpen(false)
    setSelectedUnit(null)
  }

  const handleModalSave = async () => {
    closeModal()
    await fetchPageData(currentPage, searchQuery, filters, false)
  }

  const getInstitutionName = (instId?: string | null) => {
    return institutions.find(i => String(i.id) === instId)?.name || 'N/A'
  }

  const totalPages = Math.ceil(totalItems / itemsPerPage)

  return (
      <div className="container mx-auto px-4 py-6 max-w-7xl">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          {/* Header */}
          <div className="p-6 border-b border-gray-200">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Gerenciamento de Unidades</h1>
                <p className="text-gray-600 mt-1">Consulte e gerencie as unidades do sistema</p>
              </div>
              <div className="flex gap-3">
                <Button onClick={handleRefresh} variant="outline" disabled={refreshing} className="flex items-center gap-2">
                  <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
                  Atualizar
                </Button>
                <Button onClick={() => openModal('create')} className="flex items-center gap-2">
                  <Plus className="w-4 h-4" />
                  Nova Unidade
                </Button>
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              <StatCard icon={School} title="Total" value={stats.totalSchools} subtitle="Unidades" color="blue" />
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
                    placeholder="Buscar por nome da unidade ou instituição..."
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
                <span className="ml-2 text-gray-600">Carregando unidades...</span>
              </div>
            ) : units.length === 0 ? (
              <div className="text-center py-12">
                <School className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500 text-lg mb-2">Nenhuma unidade encontrada</p>
                <p className="text-gray-400 text-sm">{searchQuery || Object.keys(filters).length > 0 ? "Tente ajustar sua busca ou filtros." : "Nenhuma unidade cadastrada."}</p>
              </div>
            ) : (
              <>
                {/* Desktop Table */}
                <div className="hidden lg:block overflow-x-auto">
                  <table className="w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Unidade</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Instituição</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                        <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Ações</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {units.map((unit) => (
                        <tr key={unit.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4">
                            <div className="flex items-center">
                              <div className="flex-shrink-0 w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                                <span className="text-blue-600 font-semibold">{unit.name.charAt(0)}</span>
                              </div>
                              <div className="ml-4">
                                <div className="text-sm font-medium text-gray-900">{unit.name}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-600">
                            {getInstitutionName(unit.institution_id)}
                          </td>
                          <td className="px-6 py-4">
                            <Badge variant={unit.deleted ? "danger" : "success"}>
                              {unit.deleted ? "Inativa" : "Ativa"}
                            </Badge>
                          </td>
                          <td className="px-6 py-4 text-center">
                            <div className="flex items-center justify-center space-x-2">
                              <Button variant="ghost" size="sm" onClick={() => openModal('view', unit)} className="text-blue-600 hover:text-blue-900"><Eye className="w-4 h-4" /></Button>
                              <Button variant="ghost" size="sm" onClick={() => openModal('edit', unit)} className="text-green-600 hover:text-green-900"><Edit className="w-4 h-4" /></Button>
                              <Button variant="ghost" size="sm" onClick={() => handleDelete(unit)} className="text-red-600 hover:text-red-900"><Trash2 className="w-4 h-4" /></Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Mobile Cards */}
                <div className="lg:hidden p-4 space-y-4">
                  {units.map(unit => (
                    <div key={unit.id} className="bg-white border border-gray-200 rounded-lg shadow-sm">
                      <div className="p-4 border-b border-gray-100 flex justify-between items-start">
                        <div>
                          <h3 className="font-semibold text-gray-800">{unit.name}</h3>
                        </div>
                        <Badge variant={unit.deleted ? "danger" : "success"}>
                          {unit.deleted ? "Inativa" : "Ativa"}
                        </Badge>
                      </div>
                      <div className="p-4 space-y-2">
                        <div className="flex items-center text-sm">
                          <Building2 className="w-4 h-4 mr-2 text-gray-400"/>
                          {getInstitutionName(unit.institution_id)}
                        </div>
                      </div>
                      <div className="p-4 border-t border-gray-100 flex justify-end space-x-2">
                        <Button variant="outline" size="sm" onClick={() => openModal('view', unit)}>Ver</Button>
                        <Button variant="outline" size="sm" onClick={() => openModal('edit', unit)}>Editar</Button>
                        <Button variant="destructive" size="sm" onClick={() => handleDelete(unit)}>Excluir</Button>
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
                Página {currentPage} de {totalPages} • {totalItems} unidades no total
              </div>
              <div className="flex items-center space-x-2">
                <Button variant="outline" size="sm" onClick={() => setCurrentPage(p => Math.max(p - 1, 1))} disabled={currentPage === 1}>Anterior</Button>
                <Button variant="outline" size="sm" onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))} disabled={currentPage === totalPages}>Próxima</Button>
              </div>
            </div>
          )}
        </div>

        {/* Modal de Unidade */}
        <UnitFormModal
          isOpen={modalOpen}
          onClose={closeModal}
          onSuccess={handleModalSave}
          unit={selectedUnit}
          institutions={institutions.map(inst => ({ id: String(inst.id), name: inst.name }))}
          viewOnly={modalMode === 'view'}
        />
      </div>
  )
}