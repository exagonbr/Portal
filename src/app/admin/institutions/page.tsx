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
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
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
          <div className="overflow-x-auto">
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
                {/* Desktop Table */}
                <div className="hidden lg:block">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gradient-to-r from-gray-50 to-gray-100 border-b-2 border-gray-200">
                      <tr>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                          <div className="flex items-center space-x-2">
                            <Building2 className="w-4 h-4 text-gray-600" />
                            <span>Instituição</span>
                          </div>
                        </th>
                        <th className="px-4 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                          <span>Código/Tipo</span>
                        </th>
                        <th className="px-4 py-4 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider">
                          <div className="flex items-center justify-center space-x-1">
                            <School className="w-4 h-4 text-gray-600" />
                            <span>Escolas</span>
                          </div>
                        </th>
                        <th className="px-4 py-4 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider">
                          <div className="flex items-center justify-center space-x-1">
                            <Users className="w-4 h-4 text-gray-600" />
                            <span>Usuários</span>
                          </div>
                        </th>
                        <th className="px-4 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                          <div className="flex items-center space-x-1">
                            <MapPin className="w-4 h-4 text-gray-600" />
                            <span>Localização</span>
                          </div>
                        </th>
                        <th className="px-4 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                          <div className="flex items-center space-x-1">
                            <Phone className="w-4 h-4 text-gray-600" />
                            <span>Contato</span>
                          </div>
                        </th>
                        <th className="px-4 py-4 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-4 py-4 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider">
                          Ações
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {institutions.map((institution) => (
                        <tr key={institution.id} className="hover:bg-gray-50 transition-colors">
                          <td className="px-6 py-4">
                            <div className="flex items-center">
                              <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center mr-3">
                                <Building2 className="w-5 h-5 text-white" />
                              </div>
                              <div>
                                <div className="text-sm font-semibold text-gray-900">{institution.name}</div>
                                <div className="text-xs text-gray-500">
                                  {institution.description && (
                                    <span className="block truncate max-w-48" title={institution.description}>
                                      {institution.description}
                                    </span>
                                  )}
                                  <span className="text-gray-400">ID: {institution.id.slice(0, 8)}...</span>
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-4">
                            <div className="text-sm text-gray-900">
                              {institution.code && (
                                <div className="font-mono text-xs font-semibold bg-blue-100 text-blue-800 px-2 py-1 rounded mb-1 inline-block">
                                  {institution.code}
                                </div>
                              )}
                              <div className="text-xs text-gray-600">
                                {getInstitutionTypeLabel(institution.type)}
                              </div>
                              {!institution.code && (
                                <span className="text-xs text-gray-400">Sem código</span>
                              )}
                            </div>
                          </td>
                          <td className="px-4 py-4 text-center">
                            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-800">
                              <School className="w-3 h-3 mr-1" />
                              {institution.schools_count || 0}
                            </span>
                          </td>
                          <td className="px-4 py-4 text-center">
                            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-800">
                              <Users className="w-3 h-3 mr-1" />
                              {institution.users_count || 0}
                            </span>
                          </td>
                          <td className="px-4 py-4">
                            <div className="text-sm text-gray-900">
                              {institution.city && (
                                <div className="flex items-center mb-1">
                                  <MapPin className="w-3 h-3 text-gray-500 mr-1" />
                                  <span className="truncate max-w-32">{institution.city}</span>
                                  {institution.state && <span className="text-gray-400 ml-1">/{institution.state}</span>}
                                </div>
                              )}
                              {institution.zip_code && (
                                <div className="flex items-center">
                                  <span className="text-xs text-gray-500 mr-1">📮</span>
                                  <span className="font-mono text-xs">{institution.zip_code}</span>
                                </div>
                              )}
                              {!institution.city && !institution.zip_code && institution.address && (
                                <div className="text-xs text-gray-600 truncate max-w-32" title={institution.address}>
                                  {institution.address}
                                </div>
                              )}
                              {!institution.city && !institution.zip_code && !institution.address && (
                                <span className="text-xs text-gray-400">Sem localização</span>
                              )}
                            </div>
                          </td>
                          <td className="px-4 py-4">
                            <div className="text-sm text-gray-900">
                              {institution.email && (
                                <div className="flex items-center mb-1">
                                  <Mail className="w-3 h-3 text-gray-500 mr-1" />
                                  <span className="truncate max-w-32" title={institution.email}>{institution.email}</span>
                                </div>
                              )}
                              {institution.phone && (
                                <div className="flex items-center mb-1">
                                  <Phone className="w-3 h-3 text-gray-500 mr-1" />
                                  <span>{institution.phone}</span>
                                </div>
                              )}
                              {institution.website && (
                                <div className="flex items-center">
                                  <Globe className="w-3 h-3 text-gray-500 mr-1" />
                                  <a href={institution.website} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800 underline text-xs truncate max-w-24" title={institution.website}>
                                    {institution.website.replace(/^https?:\/\//, '')}
                                  </a>
                                </div>
                              )}
                              {!institution.email && !institution.phone && !institution.website && (
                                <span className="text-xs text-gray-400">Sem contato</span>
                              )}
                            </div>
                          </td>
                          <td className="px-4 py-4 text-center">
                            <button
                              onClick={() => handleToggleStatus(institution)}
                              className="group"
                              title={`Clique para ${institution.is_active ? 'desativar' : 'ativar'}`}
                            >
                              <Badge 
                                variant={institution.is_active ? "success" : "danger"}
                                className="cursor-pointer group-hover:scale-105 transition-transform"
                              >
                                {institution.is_active ? "Ativa" : "Inativa"}
                              </Badge>
                            </button>
                          </td>
                          <td className="px-4 py-4 text-center">
                            <div className="flex items-center justify-center gap-1">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => openModal('view', institution)}
                                className="text-blue-600 hover:text-blue-900 hover:bg-blue-50 p-1"
                                title="Visualizar"
                              >
                                <Eye className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => openModal('edit', institution)}
                                className="text-green-600 hover:text-green-900 hover:bg-green-50 p-1"
                                title="Editar"
                              >
                                <Edit className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDeleteInstitution(institution)}
                                className="text-red-600 hover:text-red-900 hover:bg-red-50 p-1"
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

                {/* Mobile/Tablet Cards */}
                <div className="lg:hidden">
                  <div className="space-y-6 p-4">
                    {institutions.map((institution) => (
                      <div key={institution.id} className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm hover:shadow-lg hover:border-gray-200 transition-all duration-300">
                        {/* Header */}
                        <div className="flex items-start justify-between mb-6">
                          <div className="flex items-center flex-1 pr-4">
                            <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center mr-4 shadow-lg">
                              <Building2 className="w-6 h-6 text-white" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <h3 className="text-lg font-bold text-gray-900 leading-tight mb-1 truncate">{institution.name}</h3>
                              <div className="flex flex-wrap items-center gap-2 mb-1">
                                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-gray-100 text-gray-600">
                                  {getInstitutionTypeLabel(institution.type)}
                                </span>
                                {institution.code && (
                                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-600 font-mono">
                                    {institution.code}
                                  </span>
                                )}
                              </div>
                              {institution.description && (
                                <p className="text-sm text-gray-600 mb-1 line-clamp-2">{institution.description}</p>
                              )}
                              <p className="text-xs text-gray-400">
                                ID: {institution.id.slice(0, 8)}...
                              </p>
                            </div>
                          </div>
                          <button
                            onClick={() => handleToggleStatus(institution)}
                            className="group flex-shrink-0"
                            title={`Clique para ${institution.is_active ? 'desativar' : 'ativar'}`}
                          >
                            <Badge 
                              variant={institution.is_active ? "success" : "danger"}
                              className="cursor-pointer group-hover:scale-105 transition-transform"
                            >
                              {institution.is_active ? "Ativa" : "Inativa"}
                            </Badge>
                          </button>
                        </div>
                        
                        {/* Stats Grid */}
                        <div className="grid grid-cols-2 gap-4 mb-6">
                          <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-4 border border-blue-200">
                            <div className="flex items-center justify-between mb-2">
                              <School className="w-5 h-5 text-blue-600" />
                              <span className="text-xs font-semibold text-blue-600 uppercase tracking-wide">Escolas</span>
                            </div>
                            <p className="text-2xl font-bold text-blue-800">{institution.schools_count || 0}</p>
                          </div>
                          <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-4 border border-green-200">
                            <div className="flex items-center justify-between mb-2">
                              <Users className="w-5 h-5 text-green-600" />
                              <span className="text-xs font-semibold text-green-600 uppercase tracking-wide">Usuários</span>
                            </div>
                            <p className="text-2xl font-bold text-green-800">{institution.users_count || 0}</p>
                          </div>
                        </div>

                        {/* Contact & Location Info */}
                        {(institution.email || institution.phone || institution.website || institution.city || institution.address) && (
                          <div className="mb-6 p-4 bg-gray-50 rounded-xl border border-gray-100">
                            <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center">
                              <Phone className="w-4 h-4 mr-2" />
                              Informações de Contato e Localização
                            </h4>
                            <div className="space-y-2">
                              {institution.email && (
                                <div className="flex items-center text-sm text-gray-600">
                                  <Mail className="w-4 h-4 text-center mr-2" />
                                  <span className="break-all">{institution.email}</span>
                                </div>
                              )}
                              {institution.phone && (
                                <div className="flex items-center text-sm text-gray-600">
                                  <Phone className="w-4 h-4 text-center mr-2" />
                                  <span>{institution.phone}</span>
                                </div>
                              )}
                              {institution.website && (
                                <div className="flex items-center text-sm text-gray-600">
                                  <Globe className="w-4 h-4 text-center mr-2" />
                                  <a href={institution.website} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800 underline break-all">
                                    {institution.website}
                                  </a>
                                </div>
                              )}
                              {(institution.city || institution.address) && (
                                <div className="flex items-start text-sm text-gray-600">
                                  <MapPin className="w-4 h-4 text-center mr-2 mt-0.5" />
                                  <div>
                                    {institution.city && (
                                      <div>{institution.city}{institution.state && `, ${institution.state}`}</div>
                                    )}
                                    {institution.zip_code && (
                                      <div className="font-mono text-xs">CEP: {institution.zip_code}</div>
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

                        {/* Action Buttons */}
                        <div className="grid grid-cols-3 gap-3">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => openModal('view', institution)}
                            className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 border border-blue-200 rounded-xl py-3 flex flex-col items-center"
                          >
                            <Eye className="w-4 h-4 mb-1" />
                            <span className="text-xs font-medium">Ver</span>
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => openModal('edit', institution)}
                            className="text-green-600 hover:text-green-700 hover:bg-green-50 border border-green-200 rounded-xl py-3 flex flex-col items-center"
                          >
                            <Edit className="w-4 h-4 mb-1" />
                            <span className="text-xs font-medium">Editar</span>
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteInstitution(institution)}
                            className="text-red-600 hover:text-red-700 hover:bg-red-50 border border-red-200 rounded-xl py-3 flex flex-col items-center"
                          >
                            <Trash2 className="w-4 h-4 mb-1" />
                            <span className="text-xs font-medium">Excluir</span>
                          </Button>
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
