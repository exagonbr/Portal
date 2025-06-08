'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { institutionService, Institution } from '@/services/institutionService'
import { InstitutionResponseDto } from '@/types/api'
import { useToast } from '@/hooks/useToast'
import { InstitutionAddModal } from '@/components/InstitutionAddModal'
import { InstitutionEditModal } from '@/components/InstitutionEditModal'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import AuthenticatedLayout from '@/components/AuthenticatedLayout'
import { Plus, Search, Edit, Trash2, Eye } from 'lucide-react'

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
        users_count: 0, // Valor padrão
        courses_count: 0 // Valor padrão
      }))
      
      setInstitutions(mappedInstitutions)
      setTotalItems(response.pagination?.total || 0)
      setCurrentPage(page)
    } catch (error) {
      showError("Erro ao carregar instituições", "Não foi possível carregar a lista de instituições.")
    } finally {
      setLoading(false)
    }
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
      <div className="container mx-auto py-8">
        <div className="bg-white rounded-lg shadow-md">
          {/* Header */}
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Gerenciamento de Instituições</h1>
                <p className="text-gray-600">Gerencie as instituições do sistema</p>
              </div>
              <Button onClick={handleAddInstitution} className="flex items-center gap-2">
                <Plus className="w-4 h-4" />
                Nova Instituição
              </Button>
            </div>

            {/* Search */}
            <form onSubmit={handleSearch} className="flex gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="text"
                    placeholder="Buscar instituições..."
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

          {/* Table */}
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
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Nome
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Código
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Tipo
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Email
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Telefone
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Ações
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {institutions.map((institution) => (
                    <tr key={institution.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{institution.name}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{institution.code}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">N/A</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{institution.email || 'N/A'}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{institution.phone || 'N/A'}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Badge variant={institution.active ? "success" : "danger"}>
                          {institution.active ? "Ativa" : "Inativa"}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleViewInstitution(institution)}
                            className="text-blue-600 hover:text-blue-900"
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEditInstitution(institution)}
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
            )}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="px-6 py-4 border-t border-gray-200">
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-700">
                  Mostrando {((currentPage - 1) * itemsPerPage) + 1} a {Math.min(currentPage * itemsPerPage, totalItems)} de {totalItems} resultados
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                  >
                    Anterior
                  </Button>
                  <span className="text-sm text-gray-700">
                    Página {currentPage} de {totalPages}
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
