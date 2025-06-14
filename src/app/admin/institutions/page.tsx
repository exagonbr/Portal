'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { institutionService, Institution } from '@/services/institutionService'
import { InstitutionResponseDto } from '@/types/api'
import { useToast } from '@/components/ToastManager'
import { InstitutionAddModal } from '@/components/InstitutionAddModal'
import { InstitutionEditModal } from '@/components/InstitutionEditModal'
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

// Componente de Card de Estatística
const StatCard = ({ 
  icon: Icon, 
  title, 
  value, 
  subtitle, 
  color = 'bg-blue-600' 
}: {
  icon: any
  title: string
  value: string | number
  subtitle: string
  color?: string
}) => (
  <div className="bg-white rounded-xl shadow-lg p-4 sm:p-5 border-l-4 border-l-blue-500 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
    <div className="flex items-start">
      <div className={`${color} rounded-xl p-2 sm:p-3 mr-3 sm:mr-4 flex-shrink-0 shadow-md`}>
        <Icon className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
      </div>
      <div className="flex-1">
        <h3 className="text-xs sm:text-sm font-semibold text-gray-600 uppercase tracking-wide mb-1 leading-relaxed">
          {title}
        </h3>
        <p className="text-xl sm:text-2xl font-bold text-gray-900 mb-1 leading-tight">
          {value}
        </p>
        <p className="text-xs sm:text-sm text-gray-500 leading-relaxed">
          {subtitle}
        </p>
      </div>
    </div>
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
                <Button onClick={handleAddInstitution} className="flex items-center gap-2 w-full sm:w-auto justify-center">
                  <Plus className="w-4 h-4" />
                  <span className="hidden sm:inline">Nova Instituição</span>
                  <span className="sm:hidden">Nova</span>
                </Button>
              </div>
            </div>

            {/* Cards de Estatísticas */}
            <div className="space-y-6 mb-8">
              {/* Primeira linha - Estatísticas principais */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                <StatCard
                  icon={Building2}
                  title="Instituições"
                  value={stats.totalInstitutions}
                  subtitle={`${stats.activeInstitutions} instituições ativas no sistema`}
                  color="bg-slate-600"
                />
                <StatCard
                  icon={School}
                  title="Escolas"
                  value={stats.totalSchools}
                  subtitle="Unidades educacionais cadastradas"
                  color="bg-indigo-600"
                />
                <StatCard
                  icon={Users}
                  title="Total Usuários"
                  value={stats.totalUsers.toLocaleString('pt-BR')}
                  subtitle="Usuários cadastrados no sistema"
                  color="bg-purple-600"
                />
              </div>
              
              {/* Segunda linha - Usuários por categoria */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                <StatCard
                  icon={GraduationCap}
                  title="Alunos"
                  value={stats.usersByRole.STUDENT.toLocaleString('pt-BR')}
                  subtitle={`${stats.totalUsers > 0 ? ((stats.usersByRole.STUDENT / stats.totalUsers) * 100).toFixed(1) : 0}% do total de usuários`}
                  color="bg-blue-600"
                />
                <StatCard
                  icon={UserCheck}
                  title="Professores"
                  value={stats.usersByRole.TEACHER.toLocaleString('pt-BR')}
                  subtitle="Educadores ativos no sistema"
                  color="bg-green-600"
                />
                <StatCard
                  icon={UserCog}
                  title="Coordenadores"
                  value={stats.usersByRole.COORDINATOR.toLocaleString('pt-BR')}
                  subtitle="Profissionais de gestão acadêmica"
                  color="bg-orange-600"
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
                                onClick={() => handleViewInstitution(institution)}
                                className="text-blue-600 hover:text-blue-900 hover:bg-blue-50 p-1"
                                title="Visualizar"
                              >
                                <Eye className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleEditInstitution(institution)}
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
                  <div className="space-y-4 p-4">
                    {institutions.map((institution) => (
                      <div key={institution.id} className="bg-white border border-gray-200 rounded-lg p-5 shadow-sm hover:shadow-md transition-shadow">
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex-1 pr-3">
                            <h3 className="text-lg font-semibold text-gray-900 leading-tight mb-1">{institution.name}</h3>
                          </div>
                          <Badge variant={institution.active ? "success" : "danger"} className="flex-shrink-0">
                            {institution.active ? "Ativa" : "Inativa"}
                          </Badge>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4 mb-4">
                          <div className="text-center p-3 bg-blue-50 rounded-lg border border-blue-100">
                            <p className="text-xs text-blue-600 font-semibold uppercase tracking-wide">Escolas</p>
                            <p className="text-xl font-bold text-blue-800 mt-1">{Math.floor(Math.random() * 10) + 1}</p>
                          </div>
                          <div className="text-center p-3 bg-green-50 rounded-lg border border-green-100">
                            <p className="text-xs text-green-600 font-semibold uppercase tracking-wide">Usuários</p>
                            <p className="text-xl font-bold text-green-800 mt-1">{institution.users_count || 0}</p>
                          </div>
                        </div>

                        {(institution.email || institution.phone) && (
                          <div className="mb-4 space-y-2 p-3 bg-gray-50 rounded-lg">
                            {institution.email && (
                              <p className="text-sm text-gray-700 flex items-center">
                                <span className="font-semibold text-gray-600 min-w-0 flex-shrink-0 mr-2">Email:</span>
                                <span className="break-all">{institution.email}</span>
                              </p>
                            )}
                            {institution.phone && (
                              <p className="text-sm text-gray-700 flex items-center">
                                <span className="font-semibold text-gray-600 min-w-0 flex-shrink-0 mr-2">Telefone:</span>
                                <span>{institution.phone}</span>
                              </p>
                            )}
                          </div>
                        )}

                        <div className="flex items-center justify-between gap-2 pt-4 border-t border-gray-200">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleViewInstitution(institution)}
                            className="text-blue-600 hover:text-blue-900 hover:bg-blue-50 flex-1"
                          >
                            <Eye className="w-4 h-4 mr-1" />
                            Ver
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEditInstitution(institution)}
                            className="text-green-600 hover:text-green-900 hover:bg-green-50 flex-1"
                          >
                            <Edit className="w-4 h-4 mr-1" />
                            Editar
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteInstitution(institution)}
                            className="text-red-600 hover:text-red-900 hover:bg-red-50 flex-1"
                          >
                            <Trash2 className="w-4 h-4 mr-1" />
                            Excluir
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

        {/* Modals */}
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
      </div>
    </AuthenticatedLayout>
  )
}
