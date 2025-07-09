'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { subjectService } from '@/services/subjectService'
import { SubjectDto } from '@/types/subject'
import { useToast } from '@/components/ToastManager'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Plus, Search, Edit, Trash2, Eye, RefreshCw, CheckCircle, XCircle, BookOpen, Users, UserCheck, GraduationCap, AlertTriangle } from 'lucide-react'
import { StatCard, ContentCard } from '@/components/ui/StandardCard'
import Modal from '@/components/ui/Modal'
import SubjectForm from '@/components/forms/SubjectForm'

// Interface para resposta paginada - usando a mesma do serviço
interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// Interface para estatísticas das disciplinas
interface SubjectStats {
  totalSubjects: number;
  activeSubjects: number;
  inactiveSubjects: number;
  subjectsWithDescription: number;
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
  const [loadingError, setLoadingError] = useState<string | null>(null)
  const [stats, setStats] = useState<SubjectStats>({
    totalSubjects: 0,
    activeSubjects: 0,
    inactiveSubjects: 0,
    subjectsWithDescription: 0
  })

  const calculateStatsFromSubjects = (subjectsList?: SubjectDto[], totalCount?: number) => {
    const currentSubjects = subjectsList || subjects;
    const totalSubjects = totalCount || totalItems || currentSubjects.length;
    
    // Contar disciplinas ativas e inativas
    const activeSubjects = currentSubjects.filter(subject => subject.is_active).length;
    const inactiveSubjects = currentSubjects.filter(subject => !subject.is_active).length;
    
    // Contar disciplinas com descrição
    const subjectsWithDescription = currentSubjects.filter(subject => subject.description && subject.description.trim()).length;
    
    setStats({
      totalSubjects,
      activeSubjects,
      inactiveSubjects,
      subjectsWithDescription
    });
    
    console.log('📊 Stats de disciplinas calculados:', {
      totalSubjects,
      activeSubjects,
      inactiveSubjects,
      subjectsWithDescription
    });
  };

  const fetchSubjects = async (page = 1, search = '', showLoadingIndicator = true) => {
    if (showLoadingIndicator) {
      setLoading(true);
    } else {
      setRefreshing(true);
    }

    setLoadingError(null); // Limpar erros anteriores

    try {
      console.log('🔄 [SUBJECTS] Carregando disciplinas...', { page, search, limit: itemsPerPage })
      
      const params: any = {
        page,
        limit: itemsPerPage
      };
      
      if (search && search.trim()) {
        params.search = search.trim();
      }
      
      const response = await subjectService.getSubjects(params);
      
      console.log('✅ [SUBJECTS] Resposta do serviço de disciplinas:', {
        items: response.items?.length || 0,
        total: response.total,
        page: response.page,
        totalPages: response.totalPages,
        format: Array.isArray(response.items) ? 'PaginatedResponse' : 'unknown'
      });
      
      // Verificar se a resposta tem o formato esperado
      if (!response || !Array.isArray(response.items)) {
        console.error('❌ [SUBJECTS] Formato de resposta inválido:', response);
        throw new Error('Formato de resposta inválido do servidor');
      }
      
      setSubjects(response.items);
      setTotalItems(response.total || 0);
      setCurrentPage(response.page || page);
      
      // Calcular estatísticas
      calculateStatsFromSubjects(response.items, response.total);
      
      if (!showLoadingIndicator) {
        showSuccess("Atualizado", "Lista de disciplinas atualizada com sucesso!");
      }
      
      console.log('✅ [SUBJECTS] Disciplinas carregadas com sucesso:', response.items.length);
    } catch (error: any) {
      console.error('❌ [SUBJECTS] Erro ao carregar disciplinas:', error);
      
      // Verificar se é um erro de autenticação
      if (error.message?.includes('Sessão expirada') || error.message?.includes('não autenticado')) {
        setLoadingError("Sessão expirada. Por favor, faça login novamente.");
        showError("Sessão expirada", "Por favor, faça login novamente.");
        // Redirecionar para login se necessário
        setTimeout(() => router.push('/auth/login'), 2000);
        return;
      }
      
      const errorMessage = error.message || "Erro desconhecido";
      setLoadingError("Não foi possível carregar a lista de disciplinas. Tente novamente.");
      showError("Erro ao carregar disciplinas", `Não foi possível carregar a lista de disciplinas: ${errorMessage}`);
      
      // Em caso de erro, limpar dados para evitar inconsistências
      setSubjects([]);
      setTotalItems(0);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchSubjects(currentPage, searchQuery)
  }, [currentPage])

  // Recalcular estatísticas quando as disciplinas mudarem
  useEffect(() => {
    if (subjects.length > 0) {
      calculateStatsFromSubjects()
    }
  }, [subjects, totalItems])

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
      
      console.log('💾 [SUBJECTS] Salvando disciplina...', { mode: modalMode, data })
      
      if (modalMode === 'create') {
        const newSubject = await subjectService.createSubject(data)
        console.log('✅ [SUBJECTS] Disciplina criada:', newSubject)
        showSuccess("Sucesso", `Disciplina "${data.name}" criada com sucesso!`)
      } else if (modalMode === 'edit' && selectedSubject) {
        const updatedSubject = await subjectService.updateSubject(Number(selectedSubject.id), data)
        console.log('✅ [SUBJECTS] Disciplina atualizada:', updatedSubject)
        showSuccess("Sucesso", `Disciplina "${data.name}" atualizada com sucesso!`)
      }
      
      closeModal()
      
      // Recarregar a lista para garantir sincronização completa
      await fetchSubjects(currentPage, searchQuery, false)
    } catch (error: any) {
      console.error('❌ [SUBJECTS] Erro ao salvar disciplina:', error)
      
      // Verificar se é um erro de autenticação
      if (error.message?.includes('Sessão expirada') || error.message?.includes('não autenticado')) {
        showError("Sessão expirada", "Por favor, faça login novamente.");
        setTimeout(() => router.push('/auth/login'), 2000);
        return;
      }
      
      const errorMessage = error.message || "Erro desconhecido";
      showError("Erro ao salvar disciplina", `Não foi possível salvar a disciplina: ${errorMessage}`);
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
      console.log('🗑️ [SUBJECTS] Excluindo disciplina:', subject.id)
      
      await subjectService.deleteSubject(Number(subject.id))
      console.log('✅ [SUBJECTS] Disciplina excluída com sucesso')
      
      showSuccess("Disciplina excluída", `Disciplina "${subject.name}" excluída com sucesso.`)
      
      // Recarregar a lista
      await fetchSubjects(currentPage, searchQuery, false)
    } catch (error: any) {
      console.error('❌ [SUBJECTS] Erro ao excluir disciplina:', error)
      
      // Verificar se é um erro de autenticação
      if (error.message?.includes('Sessão expirada') || error.message?.includes('não autenticado')) {
        showError("Sessão expirada", "Por favor, faça login novamente.");
        setTimeout(() => router.push('/auth/login'), 2000);
        return;
      }
      
      const errorMessage = error.message || "Erro desconhecido";
      showError("Erro ao excluir disciplina", `Não foi possível excluir a disciplina: ${errorMessage}`);
    } finally {
      setLoading(false)
    }
  }

  const handleToggleStatus = async (subject: SubjectDto) => {
    try {
      setLoading(true)
      console.log('🔄 [SUBJECTS] Alterando status da disciplina:', subject.id, 'atual:', subject.is_active)
      
      const updatedSubject = await subjectService.toggleSubjectStatus(Number(subject.id))
      console.log('✅ [SUBJECTS] Status alterado:', updatedSubject)
      
      const statusText = updatedSubject.is_active ? 'ativada' : 'desativada'
      showSuccess("Status alterado", `Disciplina "${subject.name}" ${statusText} com sucesso!`)
      
      // Atualizar o estado local imediatamente para feedback visual rápido
      const updatedSubjects = subjects.map(sub =>
        sub.id === subject.id
          ? { ...sub, is_active: updatedSubject.is_active }
          : sub
      )
      
      setSubjects(updatedSubjects)
      
      // Recalcular estatísticas com os dados atualizados
      calculateStatsFromSubjects(updatedSubjects)
    } catch (error: any) {
      console.error('❌ [SUBJECTS] Erro ao alterar status da disciplina:', error)
      
      // Verificar se é um erro de autenticação
      if (error.message?.includes('Sessão expirada') || error.message?.includes('não autenticado')) {
        showError("Sessão expirada", "Por favor, faça login novamente.");
        setTimeout(() => router.push('/auth/login'), 2000);
        return;
      }
      
      const errorMessage = error.message || "Erro desconhecido";
      showError("Erro ao alterar status", `Não foi possível alterar o status da disciplina: ${errorMessage}`);
    } finally {
      setLoading(false)
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

          {/* Stats Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <StatCard
              icon={BookOpen}
              title="Total"
              value={stats.totalSubjects}
              subtitle="Disciplinas"
              color="blue"
            />
            <StatCard
              icon={CheckCircle}
              title="Ativas"
              value={stats.activeSubjects}
              subtitle="Funcionando"
              color="green"
            />
            <StatCard
              icon={XCircle}
              title="Inativas"
              value={stats.inactiveSubjects}
              subtitle="Desativadas"
              color="red"
            />
            <StatCard
              icon={GraduationCap}
              title="Com Descrição"
              value={stats.subjectsWithDescription}
              subtitle="Descrições"
              color="purple"
            />
          </div>

          {/* Search */}
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
          ) : loadingError ? (
            <div className="text-center py-12">
              <AlertTriangle className="w-16 h-16 text-red-300 mx-auto mb-4" />
              <p className="text-red-500 text-lg mb-2">{loadingError}</p>
              <Button onClick={handleRefresh} variant="outline" className="mt-4">
                Tentar novamente
              </Button>
            </div>
          ) : subjects.length === 0 ? (
            <div className="text-center py-12">
              <BookOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 text-lg mb-2">Nenhuma disciplina encontrada</p>
              <p className="text-gray-400 text-sm">
                {searchQuery ? "Tente ajustar sua busca." : "Clique em \"Nova Disciplina\" para adicionar a primeira"}
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
                        Disciplina
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
                          <div className="flex items-center">
                            <div className="flex-shrink-0 w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                              <BookOpen className="w-5 h-5 text-blue-600" />
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">{subject.name}</div>
                              <div className="text-xs text-gray-500">ID: {subject.id}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-900">
                            {subject.description ? (
                              subject.description.length > 100 
                                ? `${subject.description.substring(0, 100)}...`
                                : subject.description
                            ) : (
                              <span className="text-gray-400">Sem descrição</span>
                            )}
                          </div>
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
                          {subject.created_at ? new Date(subject.created_at).toLocaleDateString('pt-BR') : 'N/A'}
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
                        <div className="flex items-center justify-between">
                          <div className="flex items-center flex-1">
                            <div className="flex-shrink-0 w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                              <BookOpen className="w-6 h-6 text-blue-600" />
                            </div>
                            <div className="ml-3 flex-1 min-w-0">
                              <h3 className="text-sm font-medium text-gray-900 truncate">{subject.name}</h3>
                              <div className="text-xs text-gray-500">ID: {subject.id}</div>
                            </div>
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
                            Criado em: {subject.created_at ? new Date(subject.created_at).toLocaleDateString('pt-BR') : 'N/A'}
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