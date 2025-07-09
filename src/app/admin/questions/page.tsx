'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { useToast } from '@/components/ToastManager'
import { questionService } from '@/services/questionService'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { StatCard } from '@/components/ui/StandardCard'
import { useRouter } from 'next/navigation'
import {
  Plus,
  Search,
  Edit,
  Trash2,
  Eye,
  HelpCircle,
  FileText,
  CheckCircle,
  XCircle,
  RefreshCw,
  Filter,
  X,
  Calendar,
  Play
} from 'lucide-react'

// Interfaces para tipos
interface QuestionDto {
  id: string
  test: string
  file_id?: string
  tv_show_id?: string
  episode_id?: string
  date_created: string
  last_updated: string
  deleted: boolean
  version: number
}

interface QuestionFilter {
  page?: number
  limit?: number
  search?: string
  tv_show_id?: string
  episode_id?: string
  deleted?: boolean
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
}

interface QuestionStats {
  totalQuestions: number
  activeQuestions: number
  deletedQuestions: number
  questionsByShow: Record<string, number>
}

interface PaginatedResponse<T> {
  items: T[]
  total: number
  page: number
  limit: number
  totalPages: number
}

export default function AdminQuestionsPage() {
  const { showSuccess, showError, showWarning } = useToast()
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const router = useRouter()
  
  // Dados principais
  const [questions, setQuestions] = useState<QuestionDto[]>([])

  // Paginação e Filtros
  const [totalItems, setTotalItems] = useState(0)
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage] = useState(10)
  const [searchQuery, setSearchQuery] = useState('')
  const [filters, setFilters] = useState<QuestionFilter>({})
  const [showFilterPanel, setShowFilterPanel] = useState(false)

  // Modais
  const [modalOpen, setModalOpen] = useState(false)
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create')
  const [selectedQuestion, setSelectedQuestion] = useState<QuestionDto | null>(null)

  // Estatísticas
  const [stats, setStats] = useState<QuestionStats>({
    totalQuestions: 0,
    activeQuestions: 0,
    deletedQuestions: 0,
    questionsByShow: {},
  })

  // Função para lidar com erros de autenticação
  const handleAuthError = useCallback(() => {
    showError("Sessão expirada. Por favor, faça login novamente.")
    
    if (typeof window !== 'undefined') {
      localStorage.removeItem('accessToken')
      localStorage.removeItem('authToken')
      localStorage.removeItem('token')
      localStorage.removeItem('refreshToken')
      localStorage.removeItem('user')
    }
    
    setTimeout(() => {
      router.push('/auth/login?auth_error=expired')
    }, 1000)
  }, [showError, router])

  const calculateStats = useCallback((allQuestions: QuestionDto[]) => {
    const totalQuestions = allQuestions.length
    const activeQuestions = allQuestions.filter(q => !q.deleted).length
    const deletedQuestions = totalQuestions - activeQuestions
    
    const questionsByShow = allQuestions.reduce((acc, question) => {
      const showId = question.tv_show_id || 'Sem programa'
      acc[showId] = (acc[showId] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    setStats({ totalQuestions, activeQuestions, deletedQuestions, questionsByShow })
  }, [])

  const fetchPageData = useCallback(async (page = 1, search = '', currentFilters: QuestionFilter = {}, showLoadingIndicator = true) => {
    if (showLoadingIndicator) setLoading(true)
    else setRefreshing(true)

    try {
      console.log('🔄 [QUESTIONS] Carregando dados da página...', { page, search, currentFilters })
      
      const params: QuestionFilter = {
        page,
        limit: itemsPerPage,
        sortBy: 'date_created',
        sortOrder: 'desc',
        search: search || undefined,
        ...currentFilters,
      }

      console.log('🔄 [QUESTIONS] Carregando questions com parâmetros:', params)
      
      try {
        const response = await questionService.getQuestions(params) as PaginatedResponse<QuestionDto>
        console.log('✅ [QUESTIONS] Resposta do serviço:', {
          items: response.items?.length || 0,
          total: response.total,
          page: response.page,
          format: Array.isArray(response.items) ? 'PaginatedResponse' : 'unknown'
        })
        
        if (!response || !Array.isArray(response.items)) {
          console.error('❌ [QUESTIONS] Formato de resposta inválido:', response);
          throw new Error('Formato de resposta inválido do servidor');
        }
        
        setQuestions(response.items || [])
        setTotalItems(response.total || 0)
        setCurrentPage(page)

        // Calcular stats com todos as perguntas para uma visão geral
        try {
          const allQuestionsResponse = await questionService.getQuestions({ limit: 1000 }) as PaginatedResponse<QuestionDto>;
          calculateStats(allQuestionsResponse.items || []);
        } catch (statsError) {
          console.warn('⚠️ [QUESTIONS] Erro ao calcular estatísticas:', statsError)
          calculateStats(response.items || []);
        }

        if (!showLoadingIndicator) {
          showSuccess("Lista de perguntas atualizada com sucesso!")
        }
        
        console.log('✅ [QUESTIONS] Perguntas carregadas com sucesso:', response.items.length);
      } catch (error: any) {
        console.error('❌ [QUESTIONS] Erro ao carregar perguntas:', error)
        if (error.message?.includes('Sessão expirada') || error.message?.includes('não autenticado')) {
          return handleAuthError()
        }
        throw error
      }
    } catch (error) {
      console.error('❌ [QUESTIONS] Erro ao carregar dados:', error)
      showError("Erro ao carregar perguntas. Verifique sua conexão e tente novamente.")
      setQuestions([])
      setTotalItems(0)
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [itemsPerPage, calculateStats, showSuccess, showError, handleAuthError])

  useEffect(() => {
    fetchPageData(currentPage, searchQuery, filters)
  }, [])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    fetchPageData(1, searchQuery, filters)
  }

  const handleFilterChange = (key: keyof QuestionFilter, value: any) => {
    setFilters(prev => ({
      ...prev,
      [key]: value === '' ? undefined : value
    }))
  }

  const applyFilters = () => {
    fetchPageData(1, searchQuery, filters)
    setShowFilterPanel(false)
  }

  const clearFilters = () => {
    setFilters({})
    setSearchQuery('')
    fetchPageData(1, '', {})
    setShowFilterPanel(false)
  }

  const handleRefresh = () => {
    fetchPageData(currentPage, searchQuery, filters, false)
  }

  const handleDeleteQuestion = async (question: QuestionDto) => {
    if (!window.confirm(`Tem certeza que deseja excluir a pergunta "${question.test.substring(0, 50)}..."?`)) {
      return
    }

    try {
      await questionService.deleteQuestion(question.id)
      showSuccess("Pergunta excluída com sucesso!")
      fetchPageData(currentPage, searchQuery, filters, false)
    } catch (error: any) {
      console.error('Erro ao excluir pergunta:', error)
      if (error.message?.includes('Sessão expirada') || error.message?.includes('não autenticado')) {
        return handleAuthError()
      }
      showError("Erro ao excluir pergunta. Tente novamente.")
    }
  }

  const openModal = (mode: 'create' | 'edit', question?: QuestionDto) => {
    setModalMode(mode)
    setSelectedQuestion(question || null)
    setModalOpen(true)
  }

  const closeModal = () => {
    setModalOpen(false)
    setSelectedQuestion(null)
  }

  const handleModalSave = async () => {
    closeModal()
    await fetchPageData(currentPage, searchQuery, filters, false)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const truncateText = (text: string, maxLength: number = 100) => {
    return text.length > maxLength ? text.substring(0, maxLength) + '...' : text
  }

  const totalPages = Math.ceil(totalItems / itemsPerPage)

  return (
    <div className="container mx-auto px-4 py-6 max-w-7xl">
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Gerenciamento de Perguntas</h1>
              <p className="text-gray-600 mt-1">Administre as perguntas do sistema de quiz</p>
            </div>
            <div className="flex gap-3">
              <Button onClick={handleRefresh} variant="outline" disabled={refreshing} className="flex items-center gap-2">
                <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
                Atualizar
              </Button>
              <Button onClick={() => openModal('create')} className="flex items-center gap-2">
                <Plus className="w-4 h-4" />
                Nova Pergunta
              </Button>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
            <StatCard icon={HelpCircle} title="Total" value={stats.totalQuestions} subtitle="Perguntas" color="blue" />
            <StatCard icon={CheckCircle} title="Ativas" value={stats.activeQuestions} subtitle="Perguntas ativas" color="green" />
            <StatCard icon={XCircle} title="Excluídas" value={stats.deletedQuestions} subtitle="Perguntas excluídas" color="red" />
          </div>

          {/* Search & Filter Trigger */}
          <div className="flex gap-3">
            <form onSubmit={handleSearch} className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Buscar perguntas..."
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
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1 text-gray-700">Status</label>
                <select
                  value={filters.deleted === undefined ? '' : String(filters.deleted)}
                  onChange={(e) => handleFilterChange('deleted', e.target.value === '' ? undefined : e.target.value === 'true')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                >
                  <option value="">Todas</option>
                  <option value="false">Ativas</option>
                  <option value="true">Excluídas</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1 text-gray-700">Programa de TV</label>
                <input
                  type="text"
                  placeholder="ID do programa..."
                  value={filters.tv_show_id || ''}
                  onChange={(e) => handleFilterChange('tv_show_id', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1 text-gray-700">Episódio</label>
                <input
                  type="text"
                  placeholder="ID do episódio..."
                  value={filters.episode_id || ''}
                  onChange={(e) => handleFilterChange('episode_id', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                />
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
              <span className="ml-2 text-gray-600">Carregando perguntas...</span>
            </div>
          ) : questions.length === 0 ? (
            <div className="text-center py-12">
              <HelpCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 text-lg mb-2">Nenhuma pergunta encontrada</p>
              <p className="text-gray-400 text-sm">{searchQuery || Object.keys(filters).length > 0 ? "Tente ajustar sua busca ou filtros." : "Clique em \"Nova Pergunta\" para adicionar a primeira"}</p>
            </div>
          ) : (
            <>
              {/* Desktop Table */}
              <div className="hidden lg:block overflow-x-auto">
                <table className="w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Pergunta</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Programa/Episódio</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Data de Criação</th>
                      <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Ações</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {questions.map((question) => (
                      <tr key={question.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                              <HelpCircle className="w-5 h-5 text-purple-600" />
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">{truncateText(question.test)}</div>
                              <div className="text-xs text-gray-500">v{question.version}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900">
                          <div>
                            {question.tv_show_id && <div>Show: {question.tv_show_id}</div>}
                            {question.episode_id && <div>Ep: {question.episode_id}</div>}
                            {!question.tv_show_id && !question.episode_id && <span className="text-gray-400">N/A</span>}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900">{formatDate(question.date_created)}</td>
                        <td className="px-6 py-4 text-center">
                          <Badge variant={!question.deleted ? 'success' : 'danger'}>
                            {!question.deleted ? 'Ativa' : 'Excluída'}
                          </Badge>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <div className="flex items-center justify-center space-x-2">
                            <Button variant="ghost" size="sm" onClick={() => openModal('edit', question)} className="text-blue-600 hover:text-blue-900">
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button variant="ghost" size="sm" onClick={() => handleDeleteQuestion(question)} className="text-red-600 hover:text-red-900">
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
                {questions.map(question => (
                  <div key={question.id} className="bg-white border border-gray-200 rounded-lg shadow-sm">
                    <div className="p-4 border-b border-gray-100 flex justify-between items-start">
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-800">{truncateText(question.test, 80)}</h3>
                        <p className="text-sm text-gray-500">Versão {question.version}</p>
                      </div>
                      <Badge variant={!question.deleted ? 'success' : 'danger'}>
                        {!question.deleted ? 'Ativa' : 'Excluída'}
                      </Badge>
                    </div>
                    <div className="p-4 space-y-2">
                      <div className="flex items-center text-sm">
                        <Play className="w-4 h-4 mr-2 text-gray-400"/>
                        {question.tv_show_id ? `Show: ${question.tv_show_id}` : 'Sem programa'}
                      </div>
                      <div className="flex items-center text-sm">
                        <Calendar className="w-4 h-4 mr-2 text-gray-400"/>
                        {formatDate(question.date_created)}
                      </div>
                    </div>
                    <div className="p-4 border-t border-gray-100 flex justify-end space-x-2">
                      <Button variant="outline" size="sm" onClick={() => openModal('edit', question)}>Editar</Button>
                      <Button variant="destructive" size="sm" onClick={() => handleDeleteQuestion(question)}>Excluir</Button>
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
              Página {currentPage} de {totalPages}
            </div>
            <div className="flex items-center space-x-2">
              <Button variant="outline" size="sm" onClick={() => setCurrentPage(p => Math.max(p - 1, 1))} disabled={currentPage === 1}>Anterior</Button>
              <Button variant="outline" size="sm" onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))} disabled={currentPage === totalPages}>Próxima</Button>
            </div>
          </div>
        )}
      </div>

      {/* Modal TODO: Implementar QuestionFormModal */}
      {modalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold">
                {modalMode === 'create' ? 'Nova Pergunta' : 'Editar Pergunta'}
              </h2>
            </div>
            <div className="p-6">
              <p className="text-gray-600 mb-4">
                Modal de criação/edição será implementado em seguida...
              </p>
              <div className="flex justify-end gap-3">
                <Button variant="outline" onClick={closeModal}>Cancelar</Button>
                <Button onClick={handleModalSave}>Salvar</Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
} 