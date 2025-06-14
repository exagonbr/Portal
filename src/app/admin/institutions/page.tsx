'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { institutionService, Institution } from '@/services/institutionService'
import { InstitutionResponseDto } from '@/types/api'
import { useToast } from '@/components/ToastManager'
import { InstitutionAddModal } from '@/components/InstitutionAddModal'
import { InstitutionEditModal } from '@/components/InstitutionEditModal'
import { InstitutionModalNew } from '@/components/modals/InstitutionModalNew'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import AuthenticatedLayout from '@/components/AuthenticatedLayout'
import { Plus, Search, Edit, Trash2, Eye, Building2, School, Users, UserCheck, GraduationCap, UserCog } from 'lucide-react'

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

// Componente de Card de Estatística - Padrão Simples
const StatCard = ({ 
  icon: Icon, 
  title, 
  value, 
  subtitle, 
  trend
}: {
  icon: any
  title: string
  value: string | number
  subtitle: string
  trend?: string
}) => (
  <div className="bg-white p-6 rounded-lg shadow-md">
    <div className="flex items-center justify-between mb-2">
      <Icon className="w-6 h-6 text-gray-600" />
      {trend && (
        <div className="text-xs text-green-600">{trend}</div>
      )}
    </div>
    <div className="text-sm font-medium text-gray-500 mb-1">{title}</div>
    <div className="text-2xl font-bold text-gray-600">{value}</div>
    <div className="text-xs text-gray-500 mt-2">{subtitle}</div>
  </div>
)

export default function ManageInstitutions() {
  const router = useRouter()
  const { showSuccess, showError } = useToast()
  const [loading, setLoading] = useState(true)
  const [institutions, setInstitutions] = useState<InstitutionResponseDto[]>([])
  const [totalItems, setTotalItems] = useState(0)
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage] = useState(10)
  const [searchQuery, setSearchQuery] = useState('')
  const [addModalOpen, setAddModalOpen] = useState(false)
  const [editModalOpen, setEditModalOpen] = useState(false)
  const [selectedInstitution, setSelectedInstitution] = useState<InstitutionResponseDto | null>(null)
  
  // Estados para o novo modal unificado
  const [modalOpen, setModalOpen] = useState(false)
  const [modalMode, setModalMode] = useState<'view' | 'create' | 'edit'>('view')
  const [modalInstitution, setModalInstitution] = useState<InstitutionResponseDto | null>(null)
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

  const fetchInstitutions = async (page = 1, search = '') => {
    setLoading(true)
    try {
      const response = await institutionService.getInstitutions({
        page,
        limit: itemsPerPage,
        filters: { search }
      })
      
      // Mapear Institution para InstitutionResponseDto
      const mappedInstitutions: InstitutionResponseDto[] = (response.data || []).map(institution => ({
        id: institution.id,
        name: institution.name,
        code: institution.code,
        description: institution.address, // Usando address como description temporariamente
        address: institution.address,
        phone: institution.phone,
        email: institution.email,
        created_at: institution.created_at,
        updated_at: institution.updated_at,
        active: institution.is_active,
        users_count: Math.floor(Math.random() * 500) + 50, // Mock data - substituir por dados reais
        courses_count: Math.floor(Math.random() * 20) + 5 // Mock data - substituir por dados reais
      }))
      
      setInstitutions(mappedInstitutions)
      setTotalItems(response.pagination?.total || 0)
      setCurrentPage(page)

      // Calcular estatísticas
      calculateStats(mappedInstitutions)
    } catch (error) {
      showError("Erro ao carregar instituições", "Não foi possível carregar a lista de instituições.")
    } finally {
      setLoading(false)
    }
  }

  const calculateStats = (institutions: InstitutionResponseDto[]) => {
    const totalInstitutions = institutions.length
    const activeInstitutions = institutions.filter(inst => inst.active).length
    
    // Mock data para escolas - em produção, buscar dados reais da API
    const totalSchools = institutions.reduce((total, inst) => {
      return total + Math.floor(Math.random() * 10) + 1 // 1-10 escolas por instituição
    }, 0)

    // Mock data para usuários - em produção, buscar dados reais da API
    const totalUsers = institutions.reduce((total, inst) => total + (inst.users_count || 0), 0)
    
    // Mock data para usuários por role - em produção, buscar dados reais da API
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

  const handleAddInstitution = () => {
    setAddModalOpen(true)
  }

  const handleEditInstitution = (institution: InstitutionResponseDto) => {
    setSelectedInstitution(institution)
    setEditModalOpen(true)
  }

  const handleDeleteInstitution = async (institution: InstitutionResponseDto) => {
    if (!confirm('Tem certeza que deseja excluir esta instituição?')) {
      return
    }

    try {
      await institutionService.deleteInstitution(institution.id)
      showSuccess("Instituição excluída", "A instituição foi excluída com sucesso.")
      fetchInstitutions(currentPage, searchQuery)
    } catch (error) {
      showError("Erro ao excluir instituição", "Não foi possível excluir a instituição.")
    }
  }

  const handleSaveInstitution = async (data: any) => {
    try {
      // Converter dados do modal para o formato esperado pelo service
      const institutionData: Partial<Institution> = {
        name: data.name,
        code: data.code,
        address: data.address,
        phone: data.phone,
        email: data.email,
        is_active: data.active,
        type: 'SCHOOL' // Valor padrão, pode ser ajustado conforme necessário
      }

      if (selectedInstitution) {
        await institutionService.updateInstitution(selectedInstitution.id, institutionData)
        showSuccess("Instituição atualizada", "A instituição foi atualizada com sucesso.")
      } else {
        await institutionService.createInstitution(institutionData)
        showSuccess("Instituição criada", "A instituição foi criada com sucesso.")
      }
      setAddModalOpen(false)
      setEditModalOpen(false)
      setSelectedInstitution(null)
      fetchInstitutions(currentPage, searchQuery)
    } catch (error) {
      showError("Erro ao salvar instituição", "Não foi possível salvar a instituição.")
    }
  }

  const handleViewInstitution = (institution: InstitutionResponseDto) => {
    router.push(`/admin/institutions/${institution.id}`)
  }

  // Funções para o novo modal unificado
  const openModal = (mode: 'view' | 'create' | 'edit', institution?: InstitutionResponseDto) => {
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
      if (modalMode === 'create') {
        await institutionService.createInstitution(data)
        showSuccess("Sucesso", "Instituição criada com sucesso!")
      } else if (modalMode === 'edit' && modalInstitution) {
        await institutionService.updateInstitution(modalInstitution.id, data)
        showSuccess("Sucesso", "Instituição atualizada com sucesso!")
      }
      
      closeModal()
      fetchInstitutions(currentPage, searchQuery)
    } catch (error) {
      showError("Erro ao salvar instituição", "Não foi possível salvar a instituição.")
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
              <div className="flex-shrink-0">
                <Button onClick={() => openModal('create')} className="flex items-center gap-2 w-full sm:w-auto justify-center">
                  <Plus className="w-4 h-4" />
                  <span className="hidden sm:inline">Nova Instituição</span>
                  <span className="sm:hidden">Nova</span>
                </Button>
              </div>
            </div>

            {/* Cards de Estatísticas */}
            <div className="mb-8">
              {/* Grid Responsivo de Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6">
                <StatCard
                  icon={Building2}
                  title="Instituições"
                  value={stats.totalInstitutions}
                  subtitle={`${stats.activeInstitutions} ativas`}
                  trend="↑ 8.2%"
                />
                <StatCard
                  icon={School}
                  title="Escolas"
                  value={stats.totalSchools}
                  subtitle="Unidades cadastradas"
                  trend="↑ 12.5%"
                />
                <StatCard
                  icon={GraduationCap}
                  title="Alunos"
                  value={stats.usersByRole.STUDENT.toLocaleString('pt-BR')}
                  subtitle={`${stats.totalUsers > 0 ? ((stats.usersByRole.STUDENT / stats.totalUsers) * 100).toFixed(1) : 0}% do total`}
                  trend="↑ 5.7%"
                />
                <StatCard
                  icon={UserCheck}
                  title="Professores"
                  value={stats.usersByRole.TEACHER.toLocaleString('pt-BR')}
                  subtitle="Corpo docente"
                  trend="↑ 3.2%"
                />
                <StatCard
                  icon={UserCog}
                  title="Coordenadores"
                  value={stats.usersByRole.COORDINATOR.toLocaleString('pt-BR')}
                  subtitle="Gestão acadêmica"
                  trend="↓ 1.8%"
                />
                <StatCard
                  icon={Users}
                  title="Total Usuários"
                  value={stats.totalUsers.toLocaleString('pt-BR')}
                  subtitle="Cadastros ativos"
                  trend="↑ 15.3%"
                />
              </div>
            </div>

            {/* Search */}
            <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-3 sm:gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="text"
                    placeholder="Buscar instituições..."
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
                <p className="text-gray-500">Nenhuma instituição encontrada</p>
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
                                <div className="text-xs text-gray-500">ID: {institution.id.slice(0, 8)}...</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-4 text-center">
                            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-800">
                              <School className="w-3 h-3 mr-1" />
                              {Math.floor(Math.random() * 10) + 1}
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
                              {institution.email && (
                                <div className="flex items-center mb-1">
                                  <span className="text-xs text-gray-500 mr-1">📧</span>
                                  <span className="truncate max-w-32">{institution.email}</span>
                                </div>
                              )}
                              {institution.phone && (
                                <div className="flex items-center">
                                  <span className="text-xs text-gray-500 mr-1">📞</span>
                                  <span>{institution.phone}</span>
                                </div>
                              )}
                              {!institution.email && !institution.phone && (
                                <span className="text-xs text-gray-400">Sem contato</span>
                              )}
                            </div>
                          </td>
                          <td className="px-4 py-4 text-center">
                            <Badge variant={institution.active ? "success" : "danger"}>
                              {institution.active ? "Ativa" : "Inativa"}
                            </Badge>
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
                              <p className="text-sm text-gray-500">ID: {institution.id.slice(0, 8)}...</p>
                            </div>
                          </div>
                          <Badge variant={institution.active ? "success" : "danger"} className="flex-shrink-0">
                            {institution.active ? "Ativa" : "Inativa"}
                          </Badge>
                        </div>
                        
                        {/* Stats Grid */}
                        <div className="grid grid-cols-2 gap-4 mb-6">
                          <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-4 border border-blue-200">
                            <div className="flex items-center justify-between mb-2">
                              <School className="w-5 h-5 text-blue-600" />
                              <span className="text-xs font-semibold text-blue-600 uppercase tracking-wide">Escolas</span>
                            </div>
                            <p className="text-2xl font-bold text-blue-800">{Math.floor(Math.random() * 10) + 1}</p>
                          </div>
                          <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-4 border border-green-200">
                            <div className="flex items-center justify-between mb-2">
                              <Users className="w-5 h-5 text-green-600" />
                              <span className="text-xs font-semibold text-green-600 uppercase tracking-wide">Usuários</span>
                            </div>
                            <p className="text-2xl font-bold text-green-800">{institution.users_count || 0}</p>
                          </div>
                        </div>

                        {/* Contact Info */}
                        {(institution.email || institution.phone) && (
                          <div className="mb-6 p-4 bg-gray-50 rounded-xl border border-gray-100">
                            <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center">
                              <span className="mr-2">📞</span>
                              Informações de Contato
                            </h4>
                            <div className="space-y-2">
                              {institution.email && (
                                <div className="flex items-center text-sm text-gray-600">
                                  <span className="w-4 text-center mr-2">📧</span>
                                  <span className="break-all">{institution.email}</span>
                                </div>
                              )}
                              {institution.phone && (
                                <div className="flex items-center text-sm text-gray-600">
                                  <span className="w-4 text-center mr-2">📱</span>
                                  <span>{institution.phone}</span>
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
                            className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 border border-blue-200 rounded-xl py-3"
                          >
                            <Eye className="w-4 h-4 mb-1" />
                            <span className="text-xs font-medium">Ver</span>
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => openModal('edit', institution)}
                            className="text-green-600 hover:text-green-700 hover:bg-green-50 border border-green-200 rounded-xl py-3"
                          >
                            <Edit className="w-4 h-4 mb-1" />
                            <span className="text-xs font-medium">Editar</span>
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteInstitution(institution)}
                            className="text-red-600 hover:text-red-700 hover:bg-red-50 border border-red-200 rounded-xl py-3"
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

        {/* Modais Antigos - Manter para compatibilidade */}
        {addModalOpen && (
          <InstitutionAddModal
            isOpen={addModalOpen}
            onClose={() => setAddModalOpen(false)}
            onSave={handleSaveInstitution}
            title="Adicionar Instituição"
          />
        )}

        {editModalOpen && selectedInstitution && (
          <InstitutionEditModal
            isOpen={editModalOpen}
            onClose={() => {
              setEditModalOpen(false)
              setSelectedInstitution(null)
            }}
            onSave={handleSaveInstitution}
            institution={selectedInstitution}
            title="Editar Instituição"
          />
        )}

        {/* Novo Modal Unificado */}
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
