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
  MapPin,
  ShieldAlert
} from 'lucide-react'
import { unitService } from '@/services/unitService'
import { institutionService } from '@/services/institutionService'
import { useRouter } from 'next/navigation'
import UnitFormModal from '@/components/admin/units/UnitFormModal'
import { UnitDto, UnitFilter } from '@/types/unit'
import { InstitutionDto, InstitutionType } from '@/types/institution'
import { useAuth } from '@/contexts/AuthContext'
import { UnifiedAuthService } from '@/services/unifiedAuthService'
import { UserRole } from '@/types/roles'
import ProtectedRoute from '@/components/auth/ProtectedRoute'

// Interface para estatísticas de unidades
interface UnitStats {
  totalUnits: number
  activeUnits: number
  inactiveUnits: number
  totalInstitutions: number
}

export default function AdminUnitsPage() {
  const { showSuccess, showError } = useToast()
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [authError, setAuthError] = useState<string | null>(null)
  const router = useRouter()
  const { user, isAuthenticated, isLoading, refreshUser } = useAuth()
  
  // Dados principais
  const [units, setUnits] = useState<UnitDto[]>([])
  const [institutions, setInstitutions] = useState<InstitutionDto[]>([])

  // Modal de formulário
  const [modalOpen, setModalOpen] = useState(false)
  const [selectedUnit, setSelectedUnit] = useState<UnitDto | null>(null)
  const [modalMode, setModalMode] = useState<'create' | 'edit' | 'view'>('create')

  // Paginação e Filtros
  const [totalItems, setTotalItems] = useState(0)
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage] = useState(10)
  const [searchQuery, setSearchQuery] = useState('')
  const [filters, setFilters] = useState<UnitFilter>({})
  const [showFilterPanel, setShowFilterPanel] = useState(false)

  // Estatísticas
  const [stats, setStats] = useState<UnitStats>({
    totalUnits: 0,
    activeUnits: 0,
    inactiveUnits: 0,
    totalInstitutions: 0,
  })

  // Verificar autenticação e permissões - com tentativa de recuperação
  useEffect(() => {
    const checkAuth = async () => {
      // Aguardar carregamento do contexto de autenticação
      if (isLoading) return
      
      // Verificar se o usuário está autenticado
      if (!isAuthenticated || !user) {
        console.log('Usuário não autenticado, tentando recuperar sessão...')
        
        // Verificar se temos token armazenado
        const token = UnifiedAuthService.getAccessToken()
        
        if (token) {
          try {
            // Tentar atualizar dados do usuário
            await refreshUser()
            
            // Se chegou aqui, conseguiu recuperar a sessão
            console.log('Sessão recuperada com sucesso')
          } catch (error) {
            console.error('Falha ao recuperar sessão:', error)
            setAuthError('Sua sessão expirou. Redirecionando para login...')
            
            // Redirecionar para login após um pequeno delay
            setTimeout(() => {
              router.push('/auth/login?redirect=/admin/schools')
            }, 1500)
          }
        } else {
          setAuthError('Usuário não autenticado. Redirecionando para login...')
          
          // Redirecionar para login após um pequeno delay
          setTimeout(() => {
            router.push('/auth/login?redirect=/admin/schools')
          }, 1500)
        }
      } else {
        // Verificar se o usuário tem a role SYSTEM_ADMIN
        if (user.role !== UserRole.SYSTEM_ADMIN) {
          console.log('Usuário não tem permissão para acessar esta página')
          setAuthError('Você não tem permissão para acessar esta página. Apenas administradores do sistema podem gerenciar unidades de ensino.')
          
          // Redirecionar para o dashboard após um pequeno delay
          setTimeout(() => {
            router.push('/dashboard')
          }, 3000)
        }
      }
    }
    
    checkAuth()
  }, [isAuthenticated, user, isLoading, router, refreshUser])

  const calculateStats = useCallback((allUnits: UnitDto[], allInstitutions: InstitutionDto[]) => {
    const totalUnits = allUnits.length
    const activeUnits = allUnits.filter(unit => !unit.deleted).length
    const inactiveUnits = allUnits.filter(unit => unit.deleted).length
    const totalInstitutions = allInstitutions.length

    setStats({ totalUnits, activeUnits, inactiveUnits, totalInstitutions })
  }, [])

  const fetchInstitutions = async () => {
    try {
      // Verificar autenticação antes de fazer a requisição
      if (!UnifiedAuthService.isAuthenticated()) {
        throw new Error('Usuário não autenticado')
      }
      
      const response = await institutionService.getInstitutions({
        page: 1,
        limit: 100 // Buscar todas as instituições disponíveis
      });
      
      if (response && response.items) {
        setInstitutions(response.items);
        return response.items;
      } else {
        throw new Error('Erro ao buscar instituições');
      }
    } catch (error) {
      console.error('Erro ao carregar instituições:', error)
      
      // Verificar se é erro de autenticação
      if (error instanceof Error && 
          (error.message.includes('não autenticado') || 
           error.message.includes('expirada'))) {
        setAuthError('Sua sessão expirou. Redirecionando para login...')
        setTimeout(() => {
          router.push('/auth/login?redirect=/admin/schools')
        }, 1500)
        return []
      }
      
      showError("Erro ao carregar instituições.");
      
      // Em caso de erro, definir algumas instituições padrão
      const defaultInstitutions: InstitutionDto[] = [
        { 
          id: '1', 
          name: 'Sabercon Educação', 
          code: 'SAB001',
          type: InstitutionType.SCHOOL,
          is_active: true,
          created_at: '',
          updated_at: ''
        },
      ];
      setInstitutions(defaultInstitutions);
      return defaultInstitutions;
    }
  }

  const fetchPageData = async (
    page = 1, 
    search = '', 
    currentFilters: UnitFilter = {}, 
    showLoadingIndicator = true
  ) => {
    if (showLoadingIndicator) setLoading(true)
    else setRefreshing(true)

    try {
      // Verificar autenticação antes de fazer a requisição
      if (!UnifiedAuthService.isAuthenticated()) {
        throw new Error('Usuário não autenticado')
      }

      // Buscar instituições se ainda não tiver
      let currentInstitutions = institutions;
      if (institutions.length === 0) {
        currentInstitutions = await fetchInstitutions()
      }

      // Preparar parâmetros para o serviço de unidades
      const params: UnitFilter = {
        page,
        limit: itemsPerPage,
        ...currentFilters
      }
      
      if (search) params.search = search

      // Usar o serviço de unidades
      const response = await unitService.getUnits(params)

      if (response && response.items) {
        setUnits(response.items)
        setTotalItems(response.total || response.items.length)
        setCurrentPage(page)
        
        // Calcular estatísticas baseadas nos dados reais
        calculateStats(response.items, currentInstitutions)

        if (!showLoadingIndicator) {
          showSuccess("Lista de unidades atualizada!");
        }
        
        // Se havia erro de autenticação, limpar
        if (authError) {
          setAuthError(null)
        }
      } else {
        throw new Error('Resposta inválida do serviço de unidades')
      }
    } catch (error) {
      console.error('Erro ao carregar unidades:', error)
      
      // Verificar se é erro de autenticação
      if (error instanceof Error && 
          (error.message.includes('não autenticado') || 
           error.message.includes('expirada'))) {
        setAuthError('Sua sessão expirou. Redirecionando para login...')
        setTimeout(() => {
          router.push('/auth/login?redirect=/admin/schools')
        }, 1500)
      } else {
        showError("Erro ao carregar unidades.")
      }
      
      // Em caso de erro, limpar os dados
      setUnits([])
      setTotalItems(0)
      setStats({
        totalUnits: 0,
        activeUnits: 0,
        inactiveUnits: 0,
        totalInstitutions: 0,
      })
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  useEffect(() => {
    // Só carrega os dados quando a autenticação estiver verificada e não houver erro de autenticação
    if (!isLoading && isAuthenticated && !authError && user?.role === UserRole.SYSTEM_ADMIN) {
      fetchPageData(currentPage, searchQuery, filters)
    }
  }, [currentPage, isLoading, isAuthenticated, authError, user])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setCurrentPage(1)
    fetchPageData(1, searchQuery, filters)
  }

  const handleFilterChange = (key: keyof UnitFilter, value: any) => {
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
    setSearchQuery('');
    setFilters({});
    setCurrentPage(1);
    fetchPageData(1, '', {});
  };

  const handleRefresh = () => {
    fetchPageData(currentPage, searchQuery, filters, false)
  }

  const handleDelete = async (unit: UnitDto) => {
    if (!confirm(`Tem certeza que deseja excluir a unidade "${unit.name}"?`)) return

    try {
      setLoading(true)
      await unitService.deleteUnit(Number(unit.id))
      showSuccess("Unidade excluída com sucesso.")
      await fetchPageData(currentPage, searchQuery, filters, false)
    } catch (error) {
      console.error('Erro ao excluir unidade:', error)
      
      // Verificar se é erro de autenticação
      if (error instanceof Error && 
          (error.message.includes('não autenticado') || 
           error.message.includes('expirada'))) {
        setAuthError('Sua sessão expirou. Redirecionando para login...')
        setTimeout(() => {
          router.push('/auth/login?redirect=/admin/schools')
        }, 1500)
      } else {
        showError("Erro ao excluir unidade.")
      }
    } finally {
      setLoading(false)
    }
  }

  // Funções para o modal
  const openModal = (mode: 'create' | 'edit' | 'view', unit?: UnitDto) => {
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

  const getInstitutionName = (institutionId?: string) => {
    if (!institutionId) return 'N/A'
    return institutions.find(i => String(i.id) === String(institutionId))?.name || 'N/A'
  }

  const totalPages = Math.ceil(totalItems / itemsPerPage)

  // Se houver erro de autenticação, mostrar mensagem de erro
  if (authError) {
    return (
      <div className="container mx-auto px-4 py-12 max-w-md">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center">
          <ShieldAlert className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Acesso Negado</h1>
          <p className="text-gray-600 mb-6">{authError}</p>
          <div className="animate-pulse flex justify-center">
            <div className="h-2 w-24 bg-blue-200 rounded"></div>
          </div>
        </div>
      </div>
    )
  }

  // Usar o componente ProtectedRoute para garantir que apenas SYSTEM_ADMIN pode acessar
  return (
    <ProtectedRoute requiredRole={UserRole.SYSTEM_ADMIN}>
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
              <StatCard 
                icon={School} 
                title="Total" 
                value={stats.totalUnits} 
                subtitle="Unidades" 
                color="blue" 
              />
              <StatCard 
                icon={Users} 
                title="Ativas" 
                value={stats.activeUnits} 
                subtitle="Funcionando" 
                color="green" 
              />
              <StatCard 
                icon={X} 
                title="Inativas" 
                value={stats.inactiveUnits} 
                subtitle="Suspensas" 
                color="red" 
              />
              <StatCard 
                icon={Building2} 
                title="Instituições" 
                value={stats.totalInstitutions} 
                subtitle="Cadastradas" 
                color="purple" 
              />
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
                    onChange={(e) => setSearchQuery(e.target.value)}
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
                    value={filters.institution_id || ''}
                    onChange={(e) => handleFilterChange('institution_id', e.target.value || undefined)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  >
                    <option value="">Todas as Instituições</option>
                    {institutions.map(inst => (
                      <option key={inst.id} value={inst.id}>{inst.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1 text-gray-700">Status</label>
                  <select
                    value={filters.deleted === undefined ? '' : filters.deleted ? 'true' : 'false'}
                    onChange={(e) => handleFilterChange('deleted', e.target.value === '' ? undefined : e.target.value === 'true')}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  >
                    <option value="">Todos os Status</option>
                    <option value="false">Apenas Ativas</option>
                    <option value="true">Apenas Inativas</option>
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
                <p className="text-gray-400 text-sm">
                  {searchQuery || Object.keys(filters).length > 0 
                    ? "Tente ajustar sua busca ou filtros." 
                    : "Nenhuma unidade cadastrada."}
                </p>
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
                          Instituição
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Criada em
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
                                <School className="w-5 h-5 text-blue-600" />
                              </div>
                              <div className="ml-4">
                                <div className="text-sm font-medium text-gray-900">{unit.name}</div>
                                <div className="text-sm text-gray-500">ID: {unit.id}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-600">
                            <div className="flex items-center">
                              <Building2 className="w-4 h-4 mr-2 text-gray-400" />
                              {getInstitutionName(unit.institution_id)}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <Badge variant={unit.deleted ? "danger" : "success"}>
                              {unit.deleted ? "Inativa" : "Ativa"}
                            </Badge>
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-500">
                            {new Date(unit.created_at).toLocaleDateString('pt-BR')}
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
                                onClick={() => handleDelete(unit)} 
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
                <div className="lg:hidden p-4 space-y-4">
                  {units.map(unit => (
                    <div key={unit.id} className="bg-white border border-gray-200 rounded-lg shadow-sm">
                      <div className="p-4 border-b border-gray-100 flex justify-between items-start">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                            <School className="w-5 h-5 text-blue-600" />
                          </div>
                          <div>
                            <h3 className="font-semibold text-gray-800">{unit.name}</h3>
                            <p className="text-sm text-gray-500">ID: {unit.id}</p>
                          </div>
                        </div>
                        <Badge variant={unit.deleted ? "danger" : "success"}>
                          {unit.deleted ? "Inativa" : "Ativa"}
                        </Badge>
                      </div>
                      <div className="p-4 space-y-2">
                        <div className="flex items-center text-sm">
                          <Building2 className="w-4 h-4 mr-2 text-gray-400"/>
                          <span className="text-gray-600">{getInstitutionName(unit.institution_id)}</span>
                        </div>
                        <div className="flex items-center text-sm">
                          <MapPin className="w-4 h-4 mr-2 text-gray-400"/>
                          <span className="text-gray-600">Criada em {new Date(unit.created_at).toLocaleDateString('pt-BR')}</span>
                        </div>
                      </div>
                      <div className="p-4 border-t border-gray-100 flex justify-end space-x-2">
                        <Button variant="outline" size="sm" onClick={() => openModal('view', unit)}>
                          Ver
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => openModal('edit', unit)}>
                          Editar
                        </Button>
                        <Button variant="destructive" size="sm" onClick={() => handleDelete(unit)}>
                          Excluir
                        </Button>
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
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => setCurrentPage(p => Math.max(p - 1, 1))} 
                  disabled={currentPage === 1}
                >
                  Anterior
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))} 
                  disabled={currentPage === totalPages}
                >
                  Próxima
                </Button>
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
          institutions={institutions}
          viewOnly={modalMode === 'view'}
        />
      </div>
    </ProtectedRoute>
  )
}