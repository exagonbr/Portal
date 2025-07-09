'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { institutionService, Institution } from '@/services/institutionService'
import { dashboardService } from '@/services/dashboardService'
import schoolService from '@/services/schoolService'
import { useToast } from '@/components/ToastManager'
import { InstitutionModalWithSchools } from '@/components/modals/InstitutionModalWithSchools'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import AuthenticatedLayout from '@/components/AuthenticatedLayout'
import { Plus, Search, Edit, Trash2, Eye, Building2, School, Users, UserCheck, GraduationCap, UserCog, CheckCircle, XCircle, MapPin, Phone, Mail, Globe, AlertTriangle, RefreshCw, Download, Upload } from 'lucide-react'
import { StatCard, ContentCard } from '@/components/ui/StandardCard'

// Interface para estatísticas das instituições
interface InstitutionStats {
  totalInstitutions: number
  activeInstitutions: number
  totalSchools: number
  totalUsers: number
  usersByRole: {
    STUDENT: number
    TEACHER: number
    COORDINATOR: number
    ADMIN: number
    PARENT: number
  }
}

export default function ManageInstitutions() {
  const router = useRouter()
  const { showSuccess, showError, showWarning } = useToast()
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [institutions, setInstitutions] = useState<Institution[]>([])
  const [totalItems, setTotalItems] = useState(0)
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage] = useState(10)
  const [searchQuery, setSearchQuery] = useState('')
  
  // Estados para o modal unificado
  const [modalOpen, setModalOpen] = useState(false)
  const [modalMode, setModalMode] = useState<'view' | 'create' | 'edit'>('view')
  const [modalInstitution, setModalInstitution] = useState<Institution | null>(null)
  const [stats, setStats] = useState<InstitutionStats>({
    totalInstitutions: 0,
    activeInstitutions: 0,
    totalSchools: 0,
    totalUsers: 0,
    usersByRole: {
      STUDENT: 0,
      TEACHER: 0,
      COORDINATOR: 0,
      ADMIN: 0,
      PARENT: 0
    }
  })

  const enrichInstitutionsWithSchoolData = async (institutions: Institution[]): Promise<Institution[]> => {
    // Por enquanto, vamos comentar o enriquecimento para evitar erros
    // e usar os dados básicos das instituições
    console.log('📝 Usando dados básicos das instituições (sem enriquecimento por enquanto)');
    return institutions;
    
    /* TODO: Implementar enriquecimento quando a API de escolas estiver funcionando
    try {
      const enrichedInstitutions = await Promise.all(
        institutions.map(async (institution) => {
          try {
            // Buscar escolas da instituição
            const schoolsResponse = await schoolService.getSchools({
              institution_id: institution.id,
              page: 1,
              limit: 1000 // Buscar todas as escolas da instituição
            });
            
            // Calcular totais de estudantes e professores
            const totalStudents = schoolsResponse.items.reduce((sum, school) => sum + (school.students_count || 0), 0);
            const totalTeachers = schoolsResponse.items.reduce((sum, school) => sum + (school.teachers_count || 0), 0);
            
            return {
              ...institution,
              schools_count: schoolsResponse.total || 0,
              users_count: totalStudents + totalTeachers
            };
          } catch (error) {
            console.warn(`⚠️ Erro ao buscar dados da instituição ${institution.name}:`, error);
            return institution; // Retornar instituição original se houver erro
          }
        })
      );
      
      return enrichedInstitutions;
    } catch (error) {
      console.warn('⚠️ Erro ao enriquecer dados das instituições:', error);
      return institutions; // Retornar instituições originais se houver erro
    }
    */
  };

  const fetchInstitutions = async (page = 1, search = '', showLoadingIndicator = true) => {
    if (showLoadingIndicator) {
      setLoading(true);
    } else {
      setRefreshing(true);
    }

    try {
      const params: any = {
        page,
        limit: itemsPerPage
      };
      
      // Só adicionar parâmetros se eles tiverem valor
      if (search && search.trim()) {
        params.search = search.trim();
      }
      
      const response = await institutionService.getInstitutions(params);
      
      console.log('📊 API response:', response);
      
      // Enriquecer instituições com dados de escolas
      const enrichedInstitutions = await enrichInstitutionsWithSchoolData(response.items || []);
      
      setInstitutions(enrichedInstitutions);
      setTotalItems(response.total || 0);
      setCurrentPage(page);

      // Buscar estatísticas do dashboard
      await fetchDashboardStats();
      
      if (!showLoadingIndicator) {
        showSuccess("Atualizado", "Lista de instituições atualizada com sucesso!");
      }
    } catch (error) {
      console.error('❌ Erro ao carregar instituições:', error);
      showError("Erro ao carregar instituições", "Não foi possível carregar a lista de instituições.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const fetchDashboardStats = async () => {
    try {
      const response = await dashboardService.getSystemDashboardData();
      
      console.log('📊 Resposta completa da API:', response);
      
      // A API retorna a estrutura: { success: true, data: { institutions: { total: 3 }, ... } }
      // Precisamos acessar response.data para obter os dados reais
      const dashboardData = response.data || response;
      
      // IMPORTANTE: O total correto de instituições vem da paginação (totalItems)
      // que é setado em fetchInstitutions, não da API do dashboard
      const totalInstitutions = totalItems || dashboardData.institutions?.total || 0;
      const totalSchools = dashboardData.schools?.total || 0;
      const totalUsers = dashboardData.users?.total || 0;

      // Calcular instituições ativas com base nos dados atuais carregados
      const activeInstitutions = institutions.filter(inst => inst.is_active).length;
      
      setStats({
        totalInstitutions,
        activeInstitutions,
        totalSchools,
        totalUsers,
        usersByRole: {
          STUDENT: dashboardData.users_by_role?.STUDENT || 0,
          TEACHER: dashboardData.users_by_role?.TEACHER || 0,
          COORDINATOR: dashboardData.users_by_role?.COORDINATOR || 0,
          ADMIN: dashboardData.users_by_role?.ADMIN || 0,
          PARENT: dashboardData.users_by_role?.PARENT || 0
        }
      });
      
      console.log('📊 Estatísticas do dashboard carregadas:', {
        totalInstitutions: `${totalInstitutions} (fonte: ${totalItems ? 'paginação' : 'dashboard'})`,
        activeInstitutions,
        totalSchools,
        totalUsers,
        totalItemsFromPagination: totalItems,
        dashboardTotal: dashboardData.institutions?.total,
        rawData: dashboardData
      });
    } catch (error) {
      console.warn('⚠️ Erro ao carregar estatísticas do dashboard:', error);
      // Manter estatísticas baseadas apenas nos dados das instituições carregadas
      calculateStatsFromInstitutions();
    }
  };

  const calculateStatsFromInstitutions = () => {
    // Use totalItems (total real da paginação) se disponível, senão institutions.length (dados da página atual)
    const totalInstitutions = totalItems || institutions.length;
    const activeInstitutions = institutions.filter(inst => inst.is_active).length;
    
    // Somar escolas das instituições
    const totalSchools = institutions.reduce((total, inst) => {
      return total + (inst.schools_count || 0);
    }, 0);

    // Somar usuários das instituições
    const totalUsers = institutions.reduce((total, inst) => total + (inst.users_count || 0), 0);
    
    setStats({
      totalInstitutions,
      activeInstitutions,
      totalSchools,
      totalUsers,
      usersByRole: {
        STUDENT: 0,
        TEACHER: 0,
        COORDINATOR: 0,
        ADMIN: 0,
        PARENT: 0
      }
    });
    
    console.log('📊 Stats calculados localmente:', {
      totalInstitutions: `${totalInstitutions} (fonte: ${totalItems ? 'totalItems' : 'institutions.length'})`,
      totalItemsAvailable: totalItems,
      institutionsLength: institutions.length,
      activeInstitutions
    });
  };

  useEffect(() => {
    fetchInstitutions(currentPage, searchQuery)
  }, [currentPage])

  // Recalcular estatísticas quando as instituições mudarem
  useEffect(() => {
    if (institutions.length > 0) {
      calculateStatsFromInstitutions()
    }
  }, [institutions])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setCurrentPage(1)
    fetchInstitutions(1, searchQuery)
  }

  const handleRefresh = () => {
    fetchInstitutions(currentPage, searchQuery, false)
  }

  const handleDeleteInstitution = async (institution: Institution) => {
    // Verificar se a instituição pode ser excluída
    try {
      const canDelete = await institutionService.canDeleteInstitution(Number(institution.id))
      
      if (!canDelete) {
        showWarning(
          "Não é possível excluir", 
          "Esta instituição possui usuários ou escolas vinculadas. Remova as dependências primeiro."
        )
        return
      }
    } catch (error) {
      console.warn('⚠️ Erro ao verificar dependências, prosseguindo com confirmação:', error)
    }

    const confirmMessage = `Tem certeza que deseja excluir a instituição "${institution.name}"?\n\nEsta ação não pode ser desfeita.`
    
    if (!confirm(confirmMessage)) {
      return
    }

    try {
      setLoading(true)
      await institutionService.deleteInstitution(Number(institution.id))
      showSuccess("Instituição excluída", "A instituição foi excluída com sucesso.")
      
      // Recarregar a lista
      await fetchInstitutions(currentPage, searchQuery, false)
    } catch (error) {
      console.error('❌ Erro ao excluir instituição:', error)
      showError("Erro ao excluir instituição", "Não foi possível excluir a instituição.")
    } finally {
      setLoading(false)
    }
  }

  const handleViewInstitution = (institution: Institution) => {
    router.push(`/admin/institutions/${institution.id}`)
  }

  // Funções para o modal unificado
  const openModal = (mode: 'view' | 'create' | 'edit', institution?: Institution) => {
    setModalMode(mode)
    setModalInstitution(institution || null)
    setModalOpen(true)
  }

  const closeModal = () => {
    setModalOpen(false)
    setModalInstitution(null)
  }

  const handleModalSave = async (data: any) => {
    try {
      setLoading(true)
      
      if (modalMode === 'create') {
        // Extrair escolas atribuídas dos dados
        const { assignedSchools, ...institutionData } = data
        
        const newInstitution = await institutionService.createInstitution(institutionData)
        showSuccess("Sucesso", "Instituição criada com sucesso!")
        console.log('✅ Nova instituição criada:', newInstitution)
        
        // Se há escolas atribuídas, atualizar cada uma para vincular à nova instituição
        if (assignedSchools && assignedSchools.length > 0) {
          try {
            const schoolService = await import('@/services/schoolService')
            for (const school of assignedSchools) {
              await schoolService.default.updateSchool(Number(school.id), {
                ...school,
                institution_id: newInstitution.id
              })
            }
            console.log('✅ Escolas atribuídas à nova instituição:', assignedSchools.length)
          } catch (schoolError) {
            console.error('⚠️ Erro ao atribuir escolas:', schoolError)
            showWarning("Atenção", "Instituição criada, mas algumas escolas não puderam ser atribuídas.")
          }
        }
        
        // Adicionar a nova instituição à lista local se estivermos na primeira página
        if (currentPage === 1) {
          setInstitutions(prevInstitutions => [newInstitution, ...prevInstitutions.slice(0, itemsPerPage - 1)])
          setTotalItems(prev => prev + 1)
        }
        
      } else if (modalMode === 'edit' && modalInstitution) {
        const updatedInstitution = await institutionService.updateInstitution(Number(modalInstitution.id), data)
        showSuccess("Sucesso", "Instituição atualizada com sucesso!")
        console.log('✅ Instituição atualizada:', updatedInstitution)
        
        // Atualizar a instituição na lista local
        setInstitutions(prevInstitutions =>
          prevInstitutions.map(inst =>
            inst.id === modalInstitution.id ? updatedInstitution : inst
          )
        )
      }
      
      closeModal()
      
      // Recarregar a lista para garantir sincronização completa
      await fetchInstitutions(currentPage, searchQuery, false)
    } catch (error) {
      console.error('❌ Erro ao salvar instituição:', error)
      showError("Erro ao salvar instituição", "Não foi possível salvar a instituição.")
    } finally {
      setLoading(false)
    }
  }

  const handleToggleStatus = async (institution: Institution) => {
    try {
      setLoading(true)
      const updatedInstitution = await institutionService.toggleInstitutionStatus(Number(institution.id))
      
      const statusText = updatedInstitution.is_active ? 'ativada' : 'desativada'
      showSuccess("Status alterado", `Instituição ${statusText} com sucesso!`)
      
      // Atualizar o estado local imediatamente para feedback visual rápido
      setInstitutions(prevInstitutions =>
        prevInstitutions.map(inst =>
          inst.id === institution.id
            ? { ...inst, is_active: updatedInstitution.is_active }
            : inst
        )
      )
      
      // Recalcular estatísticas com os dados atualizados
      const updatedInstitutions = institutions.map(inst =>
        inst.id === institution.id
          ? { ...inst, is_active: updatedInstitution.is_active }
          : inst
      )
      
      // Atualizar stats baseado nos dados atualizados
      const activeInstitutions = updatedInstitutions.filter(inst => inst.is_active).length
      setStats(prevStats => ({
        ...prevStats,
        activeInstitutions
      }))
      
    } catch (error) {
      console.error('❌ Erro ao alterar status da instituição:', error)
      showError("Erro ao alterar status", "Não foi possível alterar o status da instituição.")
    } finally {
      setLoading(false)
    }
  }

  const getInstitutionTypeLabel = (type: string) => {
    switch (type) {
      case 'SCHOOL': return 'Escola'
      case 'COLLEGE': return 'Faculdade'
      case 'UNIVERSITY': return 'Universidade'
      case 'TECH_CENTER': return 'Centro Técnico'
      case 'PUBLIC': return 'Pública'
      case 'PRIVATE': return 'Privada'
      case 'MIXED': return 'Mista'
      default: return type || 'Não definido'
    }
  }

  const totalPages = Math.ceil(totalItems / itemsPerPage)

  return (
      <div className="container mx-auto px-4 py-6 max-w-7xl">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          {/* Header Simplificado */}
          <div className="p-6 border-b border-gray-200">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Instituições</h1>
                <p className="text-gray-600 mt-1">Gerencie as instituições do sistema</p>
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
                  Nova Instituição
                </Button>
              </div>
            </div>

            {/* Stats Cards Compactos */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              <StatCard
                icon={Building2}
                title="Total"
                value={stats.totalInstitutions}
                subtitle="Instituições"
                color="blue"
              />
              <StatCard
                icon={CheckCircle}
                title="Ativas"
                value={stats.activeInstitutions}
                subtitle="Funcionando"
                color="green"
              />
              <StatCard
                icon={School}
                title="Escolas"
                value={stats.totalSchools}
                subtitle="Unidades"
                color="purple"
              />
              <StatCard
                icon={Users}
                title="Usuários"
                value={stats.totalUsers}
                subtitle="Total"
                color="amber"
              />
            </div>

            {/* Search Simplificado */}
            <form onSubmit={handleSearch} className="flex gap-3">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="text"
                    placeholder="Buscar instituição..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
              <Button type="submit" variant="outline">
                Buscar
              </Button>
            </form>
          </div>

          {/* Content */}
          <div>
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                <span className="ml-2 text-gray-600">Carregando...</span>
              </div>
            ) : institutions.length === 0 ? (
              <div className="text-center py-12">
                <Building2 className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500 text-lg mb-2">Nenhuma instituição encontrada</p>
                <p className="text-gray-400 text-sm">Clique em "Nova Instituição" para adicionar a primeira</p>
              </div>
            ) : (
              <>
                {/* Desktop Table - Simplificada */}
                <div className="hidden lg:block overflow-x-auto">
                  <table className="w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Instituição
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Tipo
                        </th>
                        <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Escolas
                        </th>
                        <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Usuários
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Localização
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
                      {institutions.map((institution) => (
                        <tr key={institution.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4">
                            <div className="flex items-center">
                              <div className="flex-shrink-0 w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                                <Building2 className="w-5 h-5 text-blue-600" />
                              </div>
                              <div className="ml-4">
                                <div className="text-sm font-medium text-gray-900">{institution.name}</div>
                                {institution.code && (
                                  <div className="text-xs text-gray-500 font-mono">{institution.code}</div>
                                )}
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-900">
                            {getInstitutionTypeLabel(institution.type)}
                          </td>
                          <td className="px-6 py-4 text-center">
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                              {institution.schools_count || 0}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-center">
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                              {institution.users_count || 0}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-900">
                            {institution.city ? (
                              <div>
                                <div>{institution.city}</div>
                                {institution.state && (
                                  <div className="text-xs text-gray-500">{institution.state}</div>
                                )}
                              </div>
                            ) : (
                              <span className="text-gray-400">N/A</span>
                            )}
                          </td>
                          <td className="px-6 py-4 text-center">
                            <button
                              onClick={() => handleToggleStatus(institution)}
                              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                institution.is_active 
                                  ? 'bg-green-100 text-green-800 hover:bg-green-200' 
                                  : 'bg-red-100 text-red-800 hover:bg-red-200'
                              }`}
                            >
                              {institution.is_active ? 'Ativa' : 'Inativa'}
                            </button>
                          </td>
                          <td className="px-6 py-4 text-center">
                            <div className="flex items-center justify-center space-x-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => openModal('view', institution)}
                                className="text-blue-600 hover:text-blue-900"
                              >
                                <Eye className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => openModal('edit', institution)}
                                className="text-green-600 hover:text-green-900"
                              >
                                <Edit className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDeleteInstitution(institution)}
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
                    {institutions.map((institution) => (
                      <div key={institution.id} className="bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow">
                        {/* Header do Card */}
                        <div className="p-4 border-b border-gray-100">
                          <div className="flex items-start justify-between">
                            <div className="flex items-center flex-1">
                              <div className="flex-shrink-0 w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                                <Building2 className="w-6 h-6 text-blue-600" />
                              </div>
                              <div className="ml-3 flex-1 min-w-0">
                                <h3 className="text-sm font-medium text-gray-900 truncate">{institution.name}</h3>
                                <div className="flex items-center gap-2 mt-1">
                                  {institution.code && (
                                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800 font-mono">
                                      {institution.code}
                                    </span>
                                  )}
                                  <span className="text-xs text-gray-500">{getInstitutionTypeLabel(institution.type)}</span>
                                </div>
                              </div>
                            </div>
                            <button
                              onClick={() => handleToggleStatus(institution)}
                              className={`ml-2 inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                                institution.is_active 
                                  ? 'bg-green-100 text-green-800' 
                                  : 'bg-red-100 text-red-800'
                              }`}
                            >
                              {institution.is_active ? 'Ativa' : 'Inativa'}
                            </button>
                          </div>
                        </div>

                        {/* Body do Card */}
                        <div className="p-4">
                          {/* Stats */}
                          <div className="flex justify-between items-center mb-4">
                            <div className="flex items-center">
                              <School className="w-4 h-4 text-gray-400 mr-1" />
                              <span className="text-sm text-gray-600">{institution.schools_count || 0} escolas</span>
                            </div>
                            <div className="flex items-center">
                              <Users className="w-4 h-4 text-gray-400 mr-1" />
                              <span className="text-sm text-gray-600">{institution.users_count || 0} usuários</span>
                            </div>
                          </div>

                          {/* Localização */}
                          {institution.city && (
                            <div className="flex items-center mb-4">
                              <MapPin className="w-4 h-4 text-gray-400 mr-2" />
                              <span className="text-sm text-gray-600">
                                {institution.city}{institution.state && `, ${institution.state}`}
                              </span>
                            </div>
                          )}

                          {/* Contato */}
                          <div className="space-y-2 mb-4">
                            {institution.email && (
                              <div className="flex items-center">
                                <Mail className="w-4 h-4 text-gray-400 mr-2" />
                                <span className="text-sm text-gray-600 truncate">{institution.email}</span>
                              </div>
                            )}
                            {institution.phone && (
                              <div className="flex items-center">
                                <Phone className="w-4 h-4 text-gray-400 mr-2" />
                                <span className="text-sm text-gray-600">{institution.phone}</span>
                              </div>
                            )}
                          </div>

                          {/* Ações */}
                          <div className="flex justify-end space-x-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => openModal('view', institution)}
                              className="flex items-center gap-1"
                            >
                              <Eye className="w-4 h-4" />
                              Ver
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => openModal('edit', institution)}
                              className="flex items-center gap-1"
                            >
                              <Edit className="w-4 h-4" />
                              Editar
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDeleteInstitution(institution)}
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

        {/* Modal Unificado */}
        <InstitutionModalWithSchools
          isOpen={modalOpen}
          onClose={closeModal}
          onSave={handleModalSave}
          institution={modalInstitution}
          mode={modalMode}
        />
      </div>
  )
}
