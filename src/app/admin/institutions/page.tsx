'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { institutionService } from '@/services/institutionService'
import { InstitutionDto } from '@/types/institution'
import { useToast } from '@/components/ToastManager'
import { InstitutionModalNew } from '@/components/modals/InstitutionModalNew'
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
  const [institutions, setInstitutions] = useState<InstitutionDto[]>([])
  const [totalItems, setTotalItems] = useState(0)
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage] = useState(10)
  const [searchQuery, setSearchQuery] = useState('')
  
  // Estados para o modal unificado
  const [modalOpen, setModalOpen] = useState(false)
  const [modalMode, setModalMode] = useState<'view' | 'create' | 'edit'>('view')
  const [modalInstitution, setModalInstitution] = useState<InstitutionDto | null>(null)
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

  const fetchInstitutions = async (page = 1, search = '', showLoadingIndicator = true) => {
    if (showLoadingIndicator) {
      setLoading(true)
    } else {
      setRefreshing(true)
    }
    
    try {
      const response = await institutionService.getInstitutions({
        page,
        limit: itemsPerPage,
        search
      })
      
      console.log('📊 Response from institutionService:', response)
      
      setInstitutions(response.items || [])
      setTotalItems(response.total || 0)
      setCurrentPage(page)

      // Calcular estatísticas
      calculateStats(response.items || [])
      
      if (!showLoadingIndicator) {
        showSuccess("Atualizado", "Lista de instituições atualizada com sucesso!")
      }
    } catch (error) {
      console.error('❌ Erro ao carregar instituições:', error)
      showError("Erro ao carregar instituições", "Não foi possível carregar a lista de instituições.")
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  const calculateStats = (institutions: InstitutionDto[]) => {
    const totalInstitutions = institutions.length
    const activeInstitutions = institutions.filter(inst => inst.is_active).length
    
    // Somar escolas reais das instituições
    const totalSchools = institutions.reduce((total, inst) => {
      return total + (inst.schools_count || 0)
    }, 0)

    // Somar usuários reais das instituições
    const totalUsers = institutions.reduce((total, inst) => total + (inst.users_count || 0), 0)
    
    // Calcular distribuição de usuários por role (usando proporções típicas se não houver dados específicos)
    const usersByRole = {
      STUDENT: Math.floor(totalUsers * 0.7), // 70% estudantes
      TEACHER: Math.floor(totalUsers * 0.15), // 15% professores
      COORDINATOR: Math.floor(totalUsers * 0.05), // 5% coordenadores
      ADMIN: Math.floor(totalUsers * 0.03), // 3% administradores
      PARENT: Math.floor(totalUsers * 0.07) // 7% responsáveis
    }

    setStats({
      totalInstitutions,
      activeInstitutions,
      totalSchools,
      totalUsers,
      usersByRole
    })
  }

  useEffect(() => {
    fetchInstitutions(currentPage, searchQuery)
  }, [currentPage])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setCurrentPage(1)
    fetchInstitutions(1, searchQuery)
  }

  const handleRefresh = () => {
    fetchInstitutions(currentPage, searchQuery, false)
  }

  const handleDeleteInstitution = async (institution: InstitutionDto) => {
    // Verificar se a instituição pode ser excluída
    try {
      const canDelete = await institutionService.canDeleteInstitution(institution.id)
      
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
      await institutionService.deleteInstitution(institution.id)
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

  const handleViewInstitution = (institution: InstitutionDto) => {
    router.push(`/admin/institutions/${institution.id}`)
  }

  // Funções para o modal unificado
  const openModal = (mode: 'view' | 'create' | 'edit', institution?: InstitutionDto) => {
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
        const newInstitution = await institutionService.createInstitution(data)
        showSuccess("Sucesso", "Instituição criada com sucesso!")
        console.log('✅ Nova instituição criada:', newInstitution)
      } else if (modalMode === 'edit' && modalInstitution) {
        const updatedInstitution = await institutionService.updateInstitution(modalInstitution.id, data)
        showSuccess("Sucesso", "Instituição atualizada com sucesso!")
        console.log('✅ Instituição atualizada:', updatedInstitution)
      }
      
      closeModal()
      
      // Recarregar a lista
      await fetchInstitutions(currentPage, searchQuery, false)
    } catch (error) {
      console.error('❌ Erro ao salvar instituição:', error)
      showError("Erro ao salvar instituição", "Não foi possível salvar a instituição.")
    } finally {
      setLoading(false)
    }
  }

  const handleToggleStatus = async (institution: InstitutionDto) => {
    try {
      setLoading(true)
      const updatedInstitution = await institutionService.toggleInstitutionStatus(institution.id)
      
      const statusText = updatedInstitution.is_active ? 'ativada' : 'desativada'
      showSuccess("Status alterado", `Instituição ${statusText} com sucesso!`)
      
      // Recarregar a lista
      await fetchInstitutions(currentPage, searchQuery, false)
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
    <AuthenticatedLayout>
      <div className="container mx-auto px-2 sm:px-4 lg:px-6 xl:px-8 py-3 sm:py-4 lg:py-8">
        <div className="bg-white rounded-lg shadow-md">
          {/* Header */}
          <div className="p-4 sm:p-6 border-b border-gray-200">
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between mb-6 gap-4">
              <div className="flex-1">
                <h1 className="text-xl sm:text-2xl font-bold text-gray-900 leading-tight">Gerenciamento de Instituições</h1>
                <p className="text-sm sm:text-base text-gray-600 mt-1">Gerencie as instituições do sistema</p>
              </div>
              <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
                <Button 
                  onClick={handleRefresh} 
                  variant="outline" 
                  disabled={refreshing}
                  className="flex items-center gap-2 w-full sm:w-auto justify-center"
                >
                  <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
                  <span className="hidden sm:inline">Atualizar</span>
                </Button>
                <Button onClick={() => openModal('create')} className="flex items-center gap-2 w-full sm:w-auto justify-center">
                  <Plus className="w-4 h-4" />
                  <span className="hidden sm:inline">Nova Instituição</span>
                  <span className="sm:hidden">Nova</span>
                </Button>
              </div>
            </div>

            {/* Cards de Estatísticas */}
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 lg:gap-6 mb-8">
              <StatCard
                icon={Building2}
                title="Total de Instituições"
                value={stats.totalInstitutions}
                subtitle="Todas registradas"
                trend={`${stats.totalInstitutions} registradas`}
                color="blue"
              />

              <StatCard
                icon={CheckCircle}
                title="Ativas"
                value={stats.activeInstitutions}
                subtitle="Em funcionamento"
                trend={`${Math.round((stats.activeInstitutions / (stats.totalInstitutions || 1)) * 100)}%`}
                color="green"
              />

              <StatCard
                icon={XCircle}
                title="Inativas"
                value={stats.totalInstitutions - stats.activeInstitutions}
                subtitle="Desabilitadas"
                trend={`${Math.round(((stats.totalInstitutions - stats.activeInstitutions) / (stats.totalInstitutions || 1)) * 100)}%`}
                color="red"
              />

              <StatCard
                icon={Users}
                title="Usuários Total"
                value={stats.totalUsers}
                subtitle="Em todas instituições"
                trend={`${stats.usersByRole.STUDENT} estudantes`}
                color="purple"
              />
            </div>

            {/* Search */}
            <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-3 sm:gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="text"
                    placeholder="Buscar instituição..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
                  />
                </div>
              </div>
              <Button type="submit" variant="outline" className="w-full sm:w-auto">
                Buscar
              </Button>
            </form>
          </div>

          {/* Table Container */}
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
                {/* Desktop Table - Full */}
                <div className="hidden xl:block">
                  <div className="min-w-full overflow-x-auto">
                    <table className="w-full divide-y divide-gray-200" style={{minWidth: '1200px'}}>
                      <thead className="bg-gradient-to-r from-gray-50 to-gray-100 border-b-2 border-gray-200">
                        <tr>
                          <th className="px-4 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider" style={{width: '25%'}}>
                            <div className="flex items-center space-x-2">
                              <Building2 className="w-4 h-4 text-gray-600" />
                              <span>Instituição</span>
                            </div>
                          </th>
                          <th className="px-3 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider" style={{width: '12%'}}>
                            <span>Código/Tipo</span>
                          </th>
                          <th className="px-2 py-4 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider" style={{width: '8%'}}>
                            <div className="flex items-center justify-center space-x-1">
                              <School className="w-4 h-4 text-gray-600" />
                              <span className="hidden 2xl:inline">Escolas</span>
                            </div>
                          </th>
                          <th className="px-2 py-4 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider" style={{width: '8%'}}>
                            <div className="flex items-center justify-center space-x-1">
                              <Users className="w-4 h-4 text-gray-600" />
                              <span className="hidden 2xl:inline">Usuários</span>
                            </div>
                          </th>
                          <th className="px-3 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider" style={{width: '15%'}}>
                            <div className="flex items-center space-x-1">
                              <MapPin className="w-4 h-4 text-gray-600" />
                              <span>Local</span>
                            </div>
                          </th>
                          <th className="px-3 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider" style={{width: '15%'}}>
                            <div className="flex items-center space-x-1">
                              <Phone className="w-4 h-4 text-gray-600" />
                              <span>Contato</span>
                            </div>
                          </th>
                          <th className="px-2 py-4 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider" style={{width: '8%'}}>
                            Status
                          </th>
                          <th className="px-2 py-4 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider" style={{width: '9%'}}>
                            Ações
                          </th>
                        </tr>
                      </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {institutions.map((institution) => (
                        <tr key={institution.id} className="hover:bg-gray-50 transition-colors">
                          <td className="px-4 py-4">
                            <div className="flex items-center">
                              <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center mr-2">
                                <Building2 className="w-4 h-4 text-white" />
                              </div>
                              <div className="min-w-0 flex-1">
                                <div className="text-sm font-semibold text-gray-900 truncate">{institution.name}</div>
                                <div className="text-xs text-gray-500">
                                  {institution.description && (
                                    <span className="block truncate" title={institution.description}>
                                      {institution.description}
                                    </span>
                                  )}
                                  <span className="text-gray-400">ID: {institution.id.slice(0, 8)}...</span>
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-3 py-4">
                            <div className="text-xs text-gray-900">
                              {institution.code && (
                                <div className="font-mono text-xs font-semibold bg-blue-100 text-blue-800 px-1 py-0.5 rounded mb-1 inline-block truncate">
                                  {institution.code}
                                </div>
                              )}
                              <div className="text-xs text-gray-600 truncate">
                                {getInstitutionTypeLabel(institution.type)}
                              </div>
                              {!institution.code && (
                                <span className="text-xs text-gray-400">N/A</span>
                              )}
                            </div>
                          </td>
                          <td className="px-2 py-4 text-center">
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-800">
                              <School className="w-3 h-3 mr-1" />
                              {institution.schools_count || 0}
                            </span>
                          </td>
                          <td className="px-2 py-4 text-center">
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-800">
                              <Users className="w-3 h-3 mr-1" />
                              {institution.users_count || 0}
                            </span>
                          </td>
                          <td className="px-3 py-4">
                            <div className="text-xs text-gray-900">
                              {institution.city && (
                                <div className="flex items-center mb-1">
                                  <MapPin className="w-3 h-3 text-gray-500 mr-1" />
                                  <span className="truncate">{institution.city}</span>
                                  {institution.state && <span className="text-gray-400 ml-1">/{institution.state}</span>}
                                </div>
                              )}
                              {institution.zip_code && (
                                <div className="font-mono text-xs text-gray-500 truncate">{institution.zip_code}</div>
                              )}
                              {!institution.city && !institution.zip_code && institution.address && (
                                <div className="text-xs text-gray-600 truncate" title={institution.address}>
                                  {institution.address}
                                </div>
                              )}
                              {!institution.city && !institution.zip_code && !institution.address && (
                                <span className="text-xs text-gray-400">N/A</span>
                              )}
                            </div>
                          </td>
                          <td className="px-3 py-4">
                            <div className="text-xs text-gray-900">
                              {institution.email && (
                                <div className="flex items-center mb-1">
                                  <Mail className="w-3 h-3 text-gray-500 mr-1" />
                                  <span className="truncate" title={institution.email}>{institution.email}</span>
                                </div>
                              )}
                              {institution.phone && (
                                <div className="flex items-center mb-1">
                                  <Phone className="w-3 h-3 text-gray-500 mr-1" />
                                  <span className="truncate">{institution.phone}</span>
                                </div>
                              )}
                              {institution.website && (
                                <div className="flex items-center">
                                  <Globe className="w-3 h-3 text-gray-500 mr-1" />
                                  <a href={institution.website} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800 underline text-xs truncate" title={institution.website}>
                                    {institution.website.replace(/^https?:\/\//, '')}
                                  </a>
                                </div>
                              )}
                              {!institution.email && !institution.phone && !institution.website && (
                                <span className="text-xs text-gray-400">N/A</span>
                              )}
                            </div>
                          </td>
                          <td className="px-2 py-4 text-center">
                            <button
                              onClick={() => handleToggleStatus(institution)}
                              className="group"
                              title={`Clique para ${institution.is_active ? 'desativar' : 'ativar'}`}
                            >
                              <div className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold transition-all duration-300 group-hover:scale-105 ${
                                institution.is_active 
                                  ? 'bg-emerald-100 text-emerald-800 border border-emerald-200 hover:bg-emerald-200' 
                                  : 'bg-red-100 text-red-800 border border-red-200 hover:bg-red-200'
                              }`}>
                                <div className={`w-2 h-2 rounded-full mr-2 ${
                                  institution.is_active ? 'bg-emerald-500' : 'bg-red-500'
                                }`}></div>
                                {institution.is_active ? "Ativa" : "Inativa"}
                              </div>
                            </button>
                          </td>
                          <td className="px-2 py-4 text-center">
                            <div className="flex items-center justify-center gap-1">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => openModal('view', institution)}
                                className="group/action w-8 h-8 p-0 bg-blue-50 hover:bg-blue-100 text-blue-600 hover:text-blue-700 border border-blue-200 hover:border-blue-300 rounded-lg transition-all duration-200 hover:scale-110"
                                title="Visualizar"
                              >
                                <Eye className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => openModal('edit', institution)}
                                className="group/action w-8 h-8 p-0 bg-emerald-50 hover:bg-emerald-100 text-emerald-600 hover:text-emerald-700 border border-emerald-200 hover:border-emerald-300 rounded-lg transition-all duration-200 hover:scale-110"
                                title="Editar"
                              >
                                <Edit className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDeleteInstitution(institution)}
                                className="group/action w-8 h-8 p-0 bg-red-50 hover:bg-red-100 text-red-600 hover:text-red-700 border border-red-200 hover:border-red-300 rounded-lg transition-all duration-200 hover:scale-110"
                                title="Excluir"
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
              </div>

                {/* Tablet Table - Compact */}
                <div className="hidden lg:block xl:hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full divide-y divide-gray-200" style={{minWidth: '900px'}}>
                      <thead className="bg-gradient-to-r from-gray-50 to-gray-100 border-b-2 border-gray-200">
                        <tr>
                          <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider" style={{width: '35%'}}>
                            <div className="flex items-center space-x-2">
                              <Building2 className="w-4 h-4 text-gray-600" />
                              <span>Instituição</span>
                            </div>
                          </th>
                          <th className="px-2 py-3 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider" style={{width: '12%'}}>
                            <div className="flex items-center justify-center space-x-1">
                              <School className="w-4 h-4 text-gray-600" />
                              <span className="hidden lg:inline">Escolas</span>
                            </div>
                          </th>
                          <th className="px-2 py-3 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider" style={{width: '12%'}}>
                            <div className="flex items-center justify-center space-x-1">
                              <Users className="w-4 h-4 text-gray-600" />
                              <span className="hidden lg:inline">Usuários</span>
                            </div>
                          </th>
                          <th className="px-2 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider" style={{width: '18%'}}>
                            <div className="flex items-center space-x-1">
                              <MapPin className="w-4 h-4 text-gray-600" />
                              <span className="hidden lg:inline">Local</span>
                            </div>
                          </th>
                          <th className="px-2 py-3 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider" style={{width: '12%'}}>
                            Status
                          </th>
                          <th className="px-2 py-3 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider" style={{width: '11%'}}>
                            Ações
                          </th>
                        </tr>
                      </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {institutions.map((institution) => (
                        <tr key={institution.id} className="hover:bg-gray-50 transition-colors">
                          <td className="px-4 py-3">
                            <div className="flex items-center">
                              <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center mr-3">
                                <Building2 className="w-4 h-4 text-white" />
                              </div>
                              <div className="min-w-0 flex-1">
                                <div className="text-sm font-semibold text-gray-900 truncate">{institution.name}</div>
                                <div className="text-xs text-gray-500">
                                  {institution.code && (
                                    <span className="font-mono bg-blue-100 text-blue-800 px-1 py-0.5 rounded text-xs mr-2">
                                      {institution.code}
                                    </span>
                                  )}
                                  <span className="truncate">{getInstitutionTypeLabel(institution.type)}</span>
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-2 py-3 text-center">
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-800">
                              <School className="w-3 h-3 mr-1" />
                              {institution.schools_count || 0}
                            </span>
                          </td>
                          <td className="px-2 py-3 text-center">
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-800">
                              <Users className="w-3 h-3 mr-1" />
                              {institution.users_count || 0}
                            </span>
                          </td>
                          <td className="px-2 py-3">
                            <div className="text-xs text-gray-900">
                              {institution.city ? (
                                <div className="flex items-center">
                                  <MapPin className="w-3 h-3 text-gray-500 mr-1" />
                                  <span className="truncate">{institution.city}</span>
                                  {institution.state && <span className="text-gray-400 ml-1">/{institution.state}</span>}
                                </div>
                              ) : (
                                <span className="text-gray-400">N/A</span>
                              )}
                            </div>
                          </td>
                          <td className="px-2 py-3 text-center">
                            <button
                              onClick={() => handleToggleStatus(institution)}
                              className="group"
                              title={`Clique para ${institution.is_active ? 'desativar' : 'ativar'}`}
                            >
                              <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold transition-all duration-300 group-hover:scale-105 ${
                                institution.is_active 
                                  ? 'bg-emerald-100 text-emerald-800 border border-emerald-200 hover:bg-emerald-200' 
                                  : 'bg-red-100 text-red-800 border border-red-200 hover:bg-red-200'
                              }`}>
                                <div className={`w-1.5 h-1.5 rounded-full mr-1.5 ${
                                  institution.is_active ? 'bg-emerald-500' : 'bg-red-500'
                                }`}></div>
                                {institution.is_active ? "Ativa" : "Inativa"}
                              </div>
                            </button>
                          </td>
                          <td className="px-2 py-3 text-center">
                            <div className="flex items-center justify-center gap-1">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => openModal('view', institution)}
                                className="group/action w-7 h-7 p-0 bg-blue-50 hover:bg-blue-100 text-blue-600 hover:text-blue-700 border border-blue-200 hover:border-blue-300 rounded-lg transition-all duration-200 hover:scale-110"
                                title="Visualizar"
                              >
                                <Eye className="w-3 h-3" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => openModal('edit', institution)}
                                className="group/action w-7 h-7 p-0 bg-emerald-50 hover:bg-emerald-100 text-emerald-600 hover:text-emerald-700 border border-emerald-200 hover:border-emerald-300 rounded-lg transition-all duration-200 hover:scale-110"
                                title="Editar"
                              >
                                <Edit className="w-3 h-3" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDeleteInstitution(institution)}
                                className="group/action w-7 h-7 p-0 bg-red-50 hover:bg-red-100 text-red-600 hover:text-red-700 border border-red-200 hover:border-red-300 rounded-lg transition-all duration-200 hover:scale-110"
                                title="Excluir"
                              >
                                <Trash2 className="w-3 h-3" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

                {/* Enhanced Cards for All Screens */}
                <div className="lg:hidden">
                  <div className="space-y-6 p-4">
                    {institutions.map((institution) => (
                      <div key={institution.id} className="group bg-white border border-gray-200 rounded-3xl overflow-hidden shadow-lg hover:shadow-2xl hover:border-blue-300 transition-all duration-500 transform hover:-translate-y-1">
                        {/* Header with Gradient Background */}
                        <div className="bg-gradient-to-r from-blue-600 via-blue-700 to-purple-700 p-6 text-white relative overflow-hidden">
                          <div className="absolute inset-0 bg-black/10"></div>
                          <div className="relative z-10 flex items-start justify-between">
                            <div className="flex items-center flex-1 pr-4">
                              <div className="flex-shrink-0 w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center mr-4 shadow-xl border border-white/30">
                                <Building2 className="w-8 h-8 text-white" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <h3 className="text-xl font-bold leading-tight mb-2 truncate">{institution.name}</h3>
                                <div className="flex flex-wrap items-center gap-2 mb-2">
                                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs bg-white/20 text-white backdrop-blur-sm border border-white/30">
                                    {getInstitutionTypeLabel(institution.type)}
                                  </span>
                                  {institution.code && (
                                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs bg-yellow-400/20 text-yellow-100 font-mono backdrop-blur-sm border border-yellow-300/30">
                                      {institution.code}
                                    </span>
                                  )}
                                </div>
                                {institution.description && (
                                  <p className="text-sm text-blue-100 line-clamp-2 leading-relaxed">{institution.description}</p>
                                )}
                              </div>
                            </div>
                            <button
                              onClick={() => handleToggleStatus(institution)}
                              className="group/status flex-shrink-0 ml-4"
                              title={`Clique para ${institution.is_active ? 'desativar' : 'ativar'}`}
                            >
                              <div className={`px-4 py-2 rounded-full text-xs font-semibold transition-all duration-300 border-2 ${
                                institution.is_active 
                                  ? 'bg-green-500/20 text-green-100 border-green-400/50 hover:bg-green-400/30' 
                                  : 'bg-red-500/20 text-red-100 border-red-400/50 hover:bg-red-400/30'
                              }`}>
                                {institution.is_active ? "✓ Ativa" : "✗ Inativa"}
                              </div>
                            </button>
                          </div>
                        </div>

                        {/* Content Body */}
                        <div className="p-6">
                          {/* Enhanced Stats Grid */}
                          <div className="grid grid-cols-2 gap-4 mb-6">
                            <div className="bg-gradient-to-br from-blue-50 to-indigo-100 rounded-2xl p-4 border border-blue-200/50 group-hover:shadow-md transition-all duration-300">
                              <div className="flex items-center justify-between mb-3">
                                <div className="w-10 h-10 bg-blue-500 rounded-xl flex items-center justify-center shadow-lg">
                                  <School className="w-5 h-5 text-white" />
                                </div>
                                <span className="text-xs font-bold text-blue-700 uppercase tracking-wider">Escolas</span>
                              </div>
                              <p className="text-3xl font-black text-blue-900 mb-1">{institution.schools_count || 0}</p>
                              <p className="text-xs text-blue-600">Unidades cadastradas</p>
                            </div>
                            <div className="bg-gradient-to-br from-emerald-50 to-green-100 rounded-2xl p-4 border border-emerald-200/50 group-hover:shadow-md transition-all duration-300">
                              <div className="flex items-center justify-between mb-3">
                                <div className="w-10 h-10 bg-emerald-500 rounded-xl flex items-center justify-center shadow-lg">
                                  <Users className="w-5 h-5 text-white" />
                                </div>
                                <span className="text-xs font-bold text-emerald-700 uppercase tracking-wider">Usuários</span>
                              </div>
                              <p className="text-3xl font-black text-emerald-900 mb-1">{institution.users_count || 0}</p>
                              <p className="text-xs text-emerald-600">Pessoas ativas</p>
                            </div>
                          </div>

                          {/* Enhanced Contact & Location */}
                          {(institution.email || institution.phone || institution.website || institution.city || institution.address) && (
                            <div className="mb-6 p-4 bg-gradient-to-r from-gray-50 to-slate-50 rounded-2xl border border-gray-200/50">
                              <h4 className="text-sm font-bold text-gray-800 mb-4 flex items-center">
                                <div className="w-6 h-6 bg-gray-600 rounded-lg flex items-center justify-center mr-3">
                                  <Phone className="w-3 h-3 text-white" />
                                </div>
                                Informações de Contato
                              </h4>
                              <div className="grid grid-cols-1 gap-3">
                                {institution.email && (
                                  <div className="flex items-center p-3 bg-white rounded-xl border border-gray-100 hover:border-blue-300 transition-colors">
                                    <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
                                      <Mail className="w-4 h-4 text-blue-600" />
                                    </div>
                                    <span className="text-sm text-gray-700 break-all">{institution.email}</span>
                                  </div>
                                )}
                                {institution.phone && (
                                  <div className="flex items-center p-3 bg-white rounded-xl border border-gray-100 hover:border-green-300 transition-colors">
                                    <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center mr-3">
                                      <Phone className="w-4 h-4 text-green-600" />
                                    </div>
                                    <span className="text-sm text-gray-700">{institution.phone}</span>
                                  </div>
                                )}
                                {institution.website && (
                                  <div className="flex items-center p-3 bg-white rounded-xl border border-gray-100 hover:border-purple-300 transition-colors">
                                    <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center mr-3">
                                      <Globe className="w-4 h-4 text-purple-600" />
                                    </div>
                                    <a href={institution.website} target="_blank" rel="noopener noreferrer" className="text-sm text-purple-600 hover:text-purple-800 underline break-all">
                                      {institution.website}
                                    </a>
                                  </div>
                                )}
                                {(institution.city || institution.address) && (
                                  <div className="flex items-start p-3 bg-white rounded-xl border border-gray-100 hover:border-orange-300 transition-colors">
                                    <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center mr-3 mt-0.5">
                                      <MapPin className="w-4 h-4 text-orange-600" />
                                    </div>
                                    <div className="text-sm text-gray-700">
                                      {institution.city && (
                                        <div className="font-medium">{institution.city}{institution.state && `, ${institution.state}`}</div>
                                      )}
                                      {institution.zip_code && (
                                        <div className="font-mono text-xs text-gray-500 mt-1">CEP: {institution.zip_code}</div>
                                      )}
                                      {institution.address && !institution.city && (
                                        <div>{institution.address}</div>
                                      )}
                                    </div>
                                  </div>
                                )}
                              </div>
                            </div>
                          )}

                          {/* Enhanced Action Buttons */}
                          <div className="grid grid-cols-3 gap-3">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => openModal('view', institution)}
                              className="group/btn bg-gradient-to-r from-blue-50 to-indigo-50 hover:from-blue-100 hover:to-indigo-100 text-blue-700 hover:text-blue-800 border-2 border-blue-200 hover:border-blue-300 rounded-2xl py-4 flex flex-col items-center transition-all duration-300 hover:shadow-lg hover:scale-105"
                            >
                              <div className="w-10 h-10 bg-blue-500 rounded-xl flex items-center justify-center mb-2 group-hover/btn:bg-blue-600 transition-colors shadow-lg">
                                <Eye className="w-5 h-5 text-white" />
                              </div>
                              <span className="text-xs font-bold">Visualizar</span>
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => openModal('edit', institution)}
                              className="group/btn bg-gradient-to-r from-emerald-50 to-green-50 hover:from-emerald-100 hover:to-green-100 text-emerald-700 hover:text-emerald-800 border-2 border-emerald-200 hover:border-emerald-300 rounded-2xl py-4 flex flex-col items-center transition-all duration-300 hover:shadow-lg hover:scale-105"
                            >
                              <div className="w-10 h-10 bg-emerald-500 rounded-xl flex items-center justify-center mb-2 group-hover/btn:bg-emerald-600 transition-colors shadow-lg">
                                <Edit className="w-5 h-5 text-white" />
                              </div>
                              <span className="text-xs font-bold">Editar</span>
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteInstitution(institution)}
                              className="group/btn bg-gradient-to-r from-red-50 to-rose-50 hover:from-red-100 hover:to-rose-100 text-red-700 hover:text-red-800 border-2 border-red-200 hover:border-red-300 rounded-2xl py-4 flex flex-col items-center transition-all duration-300 hover:shadow-lg hover:scale-105"
                            >
                              <div className="w-10 h-10 bg-red-500 rounded-xl flex items-center justify-center mb-2 group-hover/btn:bg-red-600 transition-colors shadow-lg">
                                <Trash2 className="w-5 h-5 text-white" />
                              </div>
                              <span className="text-xs font-bold">Excluir</span>
                            </Button>
                          </div>

                          {/* ID Badge */}
                          <div className="mt-4 text-center">
                            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs bg-gray-100 text-gray-500 font-mono">
                              ID: {institution.id.slice(0, 8)}...
                            </span>
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
            <div className="px-4 sm:px-6 py-4 border-t border-gray-200">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="text-sm text-gray-700 text-center sm:text-left">
                  Mostrando {((currentPage - 1) * itemsPerPage) + 1} a {Math.min(currentPage * itemsPerPage, totalItems)} de {totalItems} resultados
                </div>
                <div className="flex items-center justify-center sm:justify-end gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                    className="flex-1 sm:flex-none"
                  >
                    Anterior
                  </Button>
                  <span className="text-sm text-gray-700 px-2">
                    {currentPage} de {totalPages}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages}
                    className="flex-1 sm:flex-none"
                  >
                    Próxima
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Unificado */}
        <InstitutionModalNew
          isOpen={modalOpen}
          onClose={closeModal}
          onSave={handleModalSave}
          institution={modalInstitution}
          mode={modalMode}
        />
      </div>
    </AuthenticatedLayout>
  )
}
