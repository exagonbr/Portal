'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { subjectService } from '@/services/subjectService'
import { SubjectDto } from '@/types/subject'
import { useToast } from '@/components/ToastManager'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Plus, Search, Edit, Trash2, Eye, RefreshCw, CheckCircle, XCircle } from 'lucide-react'
import Modal from '@/components/ui/Modal'
import SubjectForm from '@/components/forms/SubjectForm'

// Interface para resposta paginada
interface PaginatedResponse<T> {
  items: T[];
  total: number;
}

export default function SubjectsPage() {
  const router = useRouter()
  const { showSuccess, showError, showWarning } = useToast()
  const [subjects, setSubjects] = useState<SubjectDto[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [modalOpen, setModalOpen] = useState(false)
  const [modalMode, setModalMode] = useState<'create' | 'edit' | 'view'>('create')
  const [selectedSubject, setSelectedSubject] = useState<SubjectDto | null>(null)
  const [totalItems, setTotalItems] = useState(0)
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage] = useState(10)
  const [searchQuery, setSearchQuery] = useState('')

  const fetchSubjects = async (page = 1, search = '', showLoadingIndicator = true) => {
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
      
      if (search && search.trim()) {
        params.search = search.trim();
      }
      
      const response = await subjectService.getSubjects(params) as PaginatedResponse<SubjectDto>;
      
      console.log('📊 API response:', response);
      
      setSubjects(response.items || []);
      setTotalItems(response.total || 0);
      setCurrentPage(page);
      
      if (!showLoadingIndicator) {
        showSuccess("Atualizado", "Lista de disciplinas atualizada com sucesso!");
      }
    } catch (error) {
      console.error('❌ Erro ao carregar disciplinas:', error);
      showError("Erro ao carregar disciplinas", "Não foi possível carregar a lista de disciplinas.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchSubjects(currentPage, searchQuery)
  }, [currentPage])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setCurrentPage(1)
    fetchSubjects(1, searchQuery)
  }

  const handleRefresh = () => {
    fetchSubjects(currentPage, searchQuery, false)
  }

  // Funções para o modal
  const openModal = (mode: 'view' | 'create' | 'edit', subject?: SubjectDto) => {
    setModalMode(mode)
    setSelectedSubject(subject || null)
    setModalOpen(true)
  }

  const closeModal = () => {
    setModalOpen(false)
    setSelectedSubject(null)
  }

  const handleModalSave = async (data: any) => {
    try {
      setLoading(true)
      
      if (modalMode === 'create') {
        await subjectService.createSubject(data)
        showSuccess("Sucesso", "Disciplina criada com sucesso!")
      } else if (modalMode === 'edit' && selectedSubject) {
        await subjectService.updateSubject(Number(selectedSubject.id), data)
        showSuccess("Sucesso", "Disciplina atualizada com sucesso!")
      }
      
      closeModal()
      
      // Recarregar a lista para garantir sincronização completa
      await fetchSubjects(currentPage, searchQuery, false)
    } catch (error) {
      console.error('❌ Erro ao salvar disciplina:', error)
      showError("Erro ao salvar disciplina", "Não foi possível salvar a disciplina.")
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteSubject = async (subject: SubjectDto) => {
    const confirmMessage = `Tem certeza que deseja excluir a disciplina "${subject.name}"?\n\nEsta ação não pode ser desfeita.`
    
    if (!confirm(confirmMessage)) {
      return
    }

    try {
      setLoading(true)
      await subjectService.deleteSubject(Number(subject.id))
      showSuccess("Disciplina excluída", "A disciplina foi excluída com sucesso.")
      
      // Recarregar a lista
      await fetchSubjects(currentPage, searchQuery, false)
    } catch (error) {
      console.error('❌ Erro ao excluir disciplina:', error)
      showError("Erro ao excluir disciplina", "Não foi possível excluir a disciplina.")
    } finally {
      setLoading(false)
    }
  }

  const handleToggleStatus = async (subject: SubjectDto) => {
    try {
      setLoading(true)
      const updatedSubject = await subjectService.toggleSubjectStatus(Number(subject.id))
      
      const statusText = updatedSubject.is_active ? 'ativada' : 'desativada'
      showSuccess("Status alterado", `Disciplina ${statusText} com sucesso!`)
      
      // Atualizar o estado local imediatamente para feedback visual rápido
      setSubjects(prevSubjects =>
        prevSubjects.map(sub =>
          sub.id === subject.id
            ? { ...sub, is_active: updatedSubject.is_active }
            : sub
        )
      )
    } catch (error) {
      console.error('❌ Erro ao alterar status da disciplina:', error)
      showError("Erro ao alterar status", "Não foi possível alterar o status da disciplina.")
    } finally {
      setLoading(false)
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
              <h1 className="text-2xl font-bold text-gray-900">Disciplinas</h1>
              <p className="text-gray-600 mt-1">Gerencie as disciplinas do sistema</p>
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
                Nova Disciplina
              </Button>
            </div>
          </div>

          {/* Search Simplificado */}
          <form onSubmit={handleSearch} className="flex gap-3">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Buscar disciplina..."
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
          ) : subjects.length === 0 ? (
            <div className="text-center py-12">
              <CheckCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 text-lg mb-2">Nenhuma disciplina encontrada</p>
              <p className="text-gray-400 text-sm">Clique em "Nova Disciplina" para adicionar a primeira</p>
            </div>
          ) : (
            <>
              {/* Desktop Table */}
              <div className="hidden lg:block overflow-x-auto">
                <table className="w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Nome
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Descrição
                      </th>
                      <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Criado em
                      </th>
                      <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Ações
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {subjects.map((subject) => (
                      <tr key={subject.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4">
                          <div className="text-sm font-medium text-gray-900">{subject.name}</div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-500">{subject.description || 'N/A'}</div>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <button
                            onClick={() => handleToggleStatus(subject)}
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              subject.is_active 
                                ? 'bg-green-100 text-green-800 hover:bg-green-200' 
                                : 'bg-red-100 text-red-800 hover:bg-red-200'
                            }`}
                          >
                            {subject.is_active ? 'Ativa' : 'Inativa'}
                          </button>
                        </td>
                        <td className="px-6 py-4 text-center text-sm text-gray-500">
                          {new Date(subject.created_at).toLocaleDateString('pt-BR')}
                        </td>
                        <td className="px-6 py-4 text-center">
                          <div className="flex items-center justify-center space-x-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => openModal('view', subject)}
                              className="text-blue-600 hover:text-blue-900"
                            >
                              <Eye className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => openModal('edit', subject)}
                              className="text-green-600 hover:text-green-900"
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteSubject(subject)}
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
                  {subjects.map((subject) => (
                    <div key={subject.id} className="bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow">
                      {/* Header do Card */}
                      <div className="p-4 border-b border-gray-100">
                        <div className="flex items-start justify-between">
                          <div className="flex-1 min-w-0">
                            <h3 className="text-sm font-medium text-gray-900 truncate">{subject.name}</h3>
                          </div>
                          <button
                            onClick={() => handleToggleStatus(subject)}
                            className={`ml-2 inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                              subject.is_active 
                                ? 'bg-green-100 text-green-800' 
                                : 'bg-red-100 text-red-800'
                            }`}
                          >
                            {subject.is_active ? 'Ativa' : 'Inativa'}
                          </button>
                        </div>
                      </div>

                      {/* Body do Card */}
                      <div className="p-4">
                        {/* Descrição */}
                        <div className="mb-4">
                          <p className="text-sm text-gray-600">{subject.description || 'Sem descrição'}</p>
                        </div>

                        {/* Data de criação */}
                        <div className="flex items-center mb-4">
                          <span className="text-xs text-gray-500">
                            Criado em: {new Date(subject.created_at).toLocaleDateString('pt-BR')}
                          </span>
                        </div>

                        {/* Ações */}
                        <div className="flex justify-end space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => openModal('view', subject)}
                            className="flex items-center gap-1"
                          >
                            <Eye className="w-4 h-4" />
                            Ver
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => openModal('edit', subject)}
                            className="flex items-center gap-1"
                          >
                            <Edit className="w-4 h-4" />
                            Editar
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDeleteSubject(subject)}
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
      <Modal
        isOpen={modalOpen}
        onClose={closeModal}
        title={
          modalMode === 'create' 
            ? 'Nova Disciplina' 
            : modalMode === 'edit' 
              ? 'Editar Disciplina' 
              : 'Visualizar Disciplina'
        }
        size="md"
      >
        <SubjectForm
          subject={selectedSubject}
          mode={modalMode}
          onSubmit={handleModalSave}
          onCancel={closeModal}
        />
      </Modal>
    </div>
  )
} 