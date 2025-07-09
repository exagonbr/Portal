'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { unitService, Unit } from '@/services/unitService'
import { institutionService } from '@/services/institutionService'
import { useToast } from '@/components/ToastManager'
import { UnitEditModal } from '@/components/UnitEditModal'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Plus, Search, Edit, Trash2, Eye, Building2, School, Users, CheckCircle, XCircle, MapPin, Phone, Mail, RefreshCw } from 'lucide-react'
import { StatCard } from '@/components/ui/StandardCard'

// Interface para resposta paginada
interface PaginatedResponse<T> {
  items: T[];
  total: number;
}

// Interface para estatísticas das unidades
interface UnitStats {
  totalUnits: number
  activeUnits: number
  totalByType: {
    [key: string]: number
  }
}

// Interface para filtros
interface UnitFilters {
  page?: number;
  limit?: number;
  search?: string;
  course_id?: number;
  status?: 'active' | 'inactive';
}

export default function ManageUnits() {
  const router = useRouter()
  const { showSuccess, showError, showWarning } = useToast()
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [units, setUnits] = useState<Unit[]>([])
  const [institutions, setInstitutions] = useState<{ id: string; name: string }[]>([])
  const [totalItems, setTotalItems] = useState(0)
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage] = useState(10)
  const [searchQuery, setSearchQuery] = useState('')
  const [typeFilter, setTypeFilter] = useState('')
  const [courseFilter, setCourseFilter] = useState<number | ''>('')
  const [statusFilter, setStatusFilter] = useState<'active' | 'inactive' | ''>('')
  
  // Estados para o modal
  const [modalOpen, setModalOpen] = useState(false)
  const [modalMode, setModalMode] = useState<'view' | 'create' | 'edit'>('view')
  const [modalUnit, setModalUnit] = useState<Unit | null>(null)
  const [stats, setStats] = useState<UnitStats>({
    totalUnits: 0,
    activeUnits: 0,
    totalByType: {}
  })

  const fetchUnits = useCallback(async (page = 1, search = '', showLoadingIndicator = true) => {
    if (showLoadingIndicator) {
      setLoading(true);
    } else {
      setRefreshing(true);
    }

    try {
      const filters: UnitFilters = {
        page,
        limit: itemsPerPage
      };
      
      if (search && search.trim()) {
        filters.search = search.trim();
      }
      
      if (courseFilter) {
        filters.course_id = Number(courseFilter);
      }
      
      if (statusFilter) {
        filters.status = statusFilter;
      }
      
      const response = await unitService.getAll(filters) as PaginatedResponse<Unit>;
      
      setUnits(response.items || []);
      setTotalItems(response.total || 0);
      setCurrentPage(page);

      // Calcular estatísticas
      calculateStats(response.items || []);
      
      if (!showLoadingIndicator) {
        showSuccess("Atualizado", "Lista de unidades atualizada com sucesso!");
      }
    } catch (error) {
      console.error('❌ Erro ao carregar unidades:', error);
      showError("Erro ao carregar unidades", "Não foi possível carregar a lista de unidades.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [itemsPerPage, courseFilter, statusFilter, showSuccess, showError]);

  const fetchInstitutions = async () => {
    try {
      const response = await institutionService.getAll() as PaginatedResponse<{ id: string, name: string }>;
      setInstitutions(response.items.map(inst => ({
        id: inst.id,
        name: inst.name
      })));
      return response.items;
    } catch (error) {
      console.warn('⚠️ Erro ao carregar instituições:', error);
      return [];
    }
  };

  const calculateStats = (unitList: Unit[]) => {
    const totalUnits = totalItems || unitList.length;
    const activeUnits = unitList.filter(unit => unit.status === 'active').length;
    
    const totalByType: { [key: string]: number } = {};
    unitList.forEach(unit => {
      const type = unit.course_id ? 'COM_CURSO' : 'SEM_CURSO';
      totalByType[type] = (totalByType[type] || 0) + 1;
    });
    
    setStats({
      totalUnits,
      activeUnits,
      totalByType
    });
  };

  useEffect(() => {
    fetchInstitutions();
    fetchUnits(currentPage, searchQuery);
  }, [currentPage, courseFilter, statusFilter, fetchUnits])

  useEffect(() => {
    if (units.length > 0) {
      calculateStats(units);
    }
  }, [units, totalItems])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setCurrentPage(1)
    fetchUnits(1, searchQuery)
  }

  const handleRefresh = () => {
    fetchUnits(currentPage, searchQuery, false)
  }

  const handleDeleteUnit = async (unit: Unit) => {
    const confirmMessage = `Tem certeza que deseja excluir a unidade "${unit.name}"?\n\nEsta ação não pode ser desfeita.`
    
    if (!confirm(confirmMessage)) {
      return
    }

    try {
      setLoading(true)
      await unitService.delete(unit.id)
      showSuccess("Unidade excluída", "A unidade foi excluída com sucesso.")
      
      await fetchUnits(currentPage, searchQuery, false)
    } catch (error) {
      console.error('❌ Erro ao excluir unidade:', error)
      showError("Erro ao excluir unidade", "Não foi possível excluir a unidade.")
    } finally {
      setLoading(false)
    }
  }

  // Funções para o modal
  const openModal = (mode: 'view' | 'create' | 'edit', unit?: Unit) => {
    setModalMode(mode)
    setModalUnit(unit || null)
    setModalOpen(true)
  }

  const closeModal = () => {
    setModalOpen(false)
    setModalUnit(null)
  }

  const handleModalSave = async (data: any) => {
    try {
      setLoading(true)
      
      if (modalMode === 'create') {
        await unitService.create(data)
        showSuccess("Sucesso", "Unidade criada com sucesso!")
        
      } else if (modalMode === 'edit' && modalUnit) {
        await unitService.update(modalUnit.id, data)
        showSuccess("Sucesso", "Unidade atualizada com sucesso!")
      }
      
      closeModal()
      await fetchUnits(currentPage, searchQuery, false)
    } catch (error) {
      console.error('❌ Erro ao salvar unidade:', error)
      showError("Erro ao salvar unidade", "Não foi possível salvar a unidade.")
    } finally {
      setLoading(false)
    }
  }

  const getUnitStatusLabel = (status: string) => {
    switch (status) {
      case 'active': return 'Ativa'
      case 'inactive': return 'Inativa'
      default: return 'Não definido'
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
              <h1 className="text-2xl font-bold text-gray-900">Unidades</h1>
              <p className="text-gray-600 mt-1">Gerencie as unidades do sistema</p>
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
              <Button onClick={() => openModal('create')} className="flex items-center gap-2">
                <Plus className="w-4 h-4" />
                Nova Unidade
              </Button>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <StatCard
              icon={Building2}
              title="Total"
              value={stats.totalUnits}
              subtitle="Unidades"
              color="blue"
            />
            <StatCard
              icon={CheckCircle}
              title="Ativas"
              value={stats.activeUnits}
              subtitle="Funcionando"
              color="green"
            />
            <StatCard
              icon={School}
              title="Com Curso"
              value={stats.totalByType['COM_CURSO'] || 0}
              subtitle="Associadas"
              color="purple"
            />
            <StatCard
              icon={Users}
              title="Sem Curso"
              value={stats.totalByType['SEM_CURSO'] || 0}
              subtitle="Independentes"
              color="amber"
            />
          </div>

          {/* Filtros */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
            <form onSubmit={handleSearch} className="lg:col-span-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Buscar unidade..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </form>
            
            <select
              value={courseFilter}
              onChange={(e) => setCourseFilter(e.target.value ? Number(e.target.value) : '')}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Todos os cursos</option>
              {/* Aqui você pode adicionar opções de cursos quando disponíveis */}
            </select>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as 'active' | 'inactive' | '')}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Todos os status</option>
              <option value="active">Ativas</option>
              <option value="inactive">Inativas</option>
            </select>
          </div>

          <Button type="submit" onClick={handleSearch} variant="outline">
            Buscar
          </Button>
        </div>

        {/* Content */}
        <div>
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <span className="ml-2 text-gray-600">Carregando...</span>
            </div>
          ) : units.length === 0 ? (
            <div className="text-center py-12">
              <School className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 text-lg mb-2">Nenhuma unidade encontrada</p>
              <p className="text-gray-400 text-sm">Clique em "Nova Unidade" para adicionar a primeira</p>
            </div>
          ) : (
            <>
              {/* Desktop Table */}
              <div className="hidden lg:block overflow-x-auto">
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
                        Ordem
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
                    {units.map((unit) => (
                      <tr key={unit.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                              <School className="w-5 h-5 text-blue-600" />
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">{unit.name}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900">
                          {unit.description || 'N/A'}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900">
                          {unit.order || 0}
                        </td>
                        <td className="px-6 py-4 text-center">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            unit.status === 'active' 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {getUnitStatusLabel(unit.status)}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <div className="flex items-center justify-center space-x-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => openModal('view', unit)}
                              className="text-blue-600 hover:text-blue-900"
                            >
                              <Eye className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => openModal('edit', unit)}
                              className="text-green-600 hover:text-green-900"
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteUnit(unit)}
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

              {/* Cards para Mobile/Tablet */}
              <div className="lg:hidden">
                <div className="space-y-4 p-4">
                  {units.map((unit) => (
                    <div key={unit.id} className="bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow">
                      <div className="p-4 border-b border-gray-100">
                        <div className="flex items-start justify-between">
                          <div className="flex items-center flex-1">
                            <div className="flex-shrink-0 w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                              <School className="w-6 h-6 text-blue-600" />
                            </div>
                            <div className="ml-3 flex-1 min-w-0">
                              <h3 className="text-sm font-medium text-gray-900 truncate">{unit.name}</h3>
                              <div className="flex items-center gap-2 mt-1">
                                <span className="text-xs text-gray-500">Ordem: {unit.order || 0}</span>
                              </div>
                            </div>
                          </div>
                          <span className={`ml-2 inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                            unit.status === 'active' 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {getUnitStatusLabel(unit.status)}
                          </span>
                        </div>
                      </div>

                      <div className="p-4">
                        {unit.description && (
                          <div className="mb-4">
                            <p className="text-sm text-gray-600">{unit.description}</p>
                          </div>
                        )}
                        
                        {unit.course_id && (
                          <div className="flex items-center mb-4">
                            <Building2 className="w-4 h-4 text-gray-400 mr-2" />
                            <span className="text-sm text-gray-600">Curso ID: {unit.course_id}</span>
                          </div>
                        )}

                        <div className="flex justify-end space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => openModal('view', unit)}
                            className="flex items-center gap-1"
                          >
                            <Eye className="w-4 h-4" />
                            Ver
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => openModal('edit', unit)}
                            className="flex items-center gap-1"
                          >
                            <Edit className="w-4 h-4" />
                            Editar
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDeleteUnit(unit)}
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

        {/* Pagination */}
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

      {/* Modal */}
      {modalOpen && (
        <UnitEditModal
          unit={modalUnit || undefined}
          onSave={handleModalSave}
          onClose={closeModal}
        />
      )}
    </div>
  )
}

