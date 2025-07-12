'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { useToast } from '@/components/ToastManager'
import { videoFileService } from '@/services/videoFileService'
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
  Link,
  Video,
  File,
  RefreshCw,
  Filter,
  X,
  Calendar,
  Play,
  FileVideo
} from 'lucide-react'

// Interfaces para tipos
interface VideoFileDto {
  id: string
  video_files_id: string
  file_id: string
  date_created: string
  last_updated: string
  deleted: boolean
  version: number
  // Campos relacionados expandidos
  video?: {
    id: string
    title?: string
    name?: string
    class?: string
  }
  file?: {
    id: string
    name: string
    content_type?: string
    size?: number
    is_public?: boolean
  }
}

interface VideoFileFilter {
  page?: number
  limit?: number
  search?: string
  video_id?: string
  file_id?: string
  deleted?: boolean
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
}

interface VideoFileStats {
  totalRelationships: number
  activeRelationships: number
  deletedRelationships: number
  uniqueVideos: number
  uniqueFiles: number
}

interface PaginatedResponse<T> {
  items: T[]
  total: number
  page: number
  limit: number
  totalPages: number
}

export default function AdminVideoFilesPage() {
  const { showSuccess, showError, showWarning } = useToast()
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const router = useRouter()
  
  // Dados principais
  const [videoFiles, setVideoFiles] = useState<VideoFileDto[]>([])

  // Paginação e Filtros
  const [totalItems, setTotalItems] = useState(0)
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage] = useState(10)
  const [searchQuery, setSearchQuery] = useState('')
  const [filters, setFilters] = useState<VideoFileFilter>({})
  const [showFilterPanel, setShowFilterPanel] = useState(false)

  // Modais
  const [modalOpen, setModalOpen] = useState(false)
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create')
  const [selectedVideoFile, setSelectedVideoFile] = useState<VideoFileDto | null>(null)

  // Estatísticas
  const [stats, setStats] = useState<VideoFileStats>({
    totalRelationships: 0,
    activeRelationships: 0,
    deletedRelationships: 0,
    uniqueVideos: 0,
    uniqueFiles: 0,
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

  const calculateStats = useCallback((allVideoFiles: VideoFileDto[]) => {
    const totalRelationships = allVideoFiles.length
    const activeRelationships = allVideoFiles.filter(vf => !vf.deleted).length
    const deletedRelationships = totalRelationships - activeRelationships
    
    const uniqueVideos = new Set(allVideoFiles.map(vf => vf.video_files_id)).size
    const uniqueFiles = new Set(allVideoFiles.map(vf => vf.file_id)).size

    setStats({ totalRelationships, activeRelationships, deletedRelationships, uniqueVideos, uniqueFiles })
  }, [])

  const fetchPageData = useCallback(async (page = 1, search = '', currentFilters: VideoFileFilter = {}, showLoadingIndicator = true) => {
    if (showLoadingIndicator) setLoading(true)
    else setRefreshing(true)

    try {
      console.log('🔄 [VIDEO_FILES] Carregando dados da página...', { page, search, currentFilters })
      
      const params: VideoFileFilter = {
        page,
        limit: itemsPerPage,
        sortBy: 'date_created',
        sortOrder: 'desc',
        search: search || undefined,
        ...currentFilters,
      }

      console.log('🔄 [VIDEO_FILES] Carregando video-files com parâmetros:', params)
      
      try {
        const response = await videoFileService.getVideoFiles(params) as PaginatedResponse<VideoFileDto>
        console.log('✅ [VIDEO_FILES] Resposta do serviço:', {
          items: response.items?.length || 0,
          total: response.total,
          page: response.page,
          format: Array.isArray(response.items) ? 'PaginatedResponse' : 'unknown'
        })
        
        if (!response || !Array.isArray(response.items)) {
          console.error('❌ [VIDEO_FILES] Formato de resposta inválido:', response);
          throw new Error('Formato de resposta inválido do servidor');
        }
        
        setVideoFiles(response.items || [])
        setTotalItems(response.total || 0)
        setCurrentPage(page)

        // Calcular stats com todos os relacionamentos para uma visão geral
        try {
          const allVideoFilesResponse = await videoFileService.getVideoFiles({ limit: 1000 }) as PaginatedResponse<VideoFileDto>;
          calculateStats(allVideoFilesResponse.items || []);
        } catch (statsError) {
          console.warn('⚠️ [VIDEO_FILES] Erro ao calcular estatísticas:', statsError)
          calculateStats(response.items || []);
        }

        if (!showLoadingIndicator) {
          showSuccess("Lista de relacionamentos atualizada com sucesso!")
        }
        
        console.log('✅ [VIDEO_FILES] Relacionamentos carregados com sucesso:', response.items.length);
      } catch (error: any) {
        console.error('❌ [VIDEO_FILES] Erro ao carregar relacionamentos:', error)
        if (error.message?.includes('Sessão expirada') || error.message?.includes('não autenticado')) {
          return handleAuthError()
        }
        throw error
      }
    } catch (error) {
      console.error('❌ [VIDEO_FILES] Erro ao carregar dados:', error)
      showError("Erro ao carregar relacionamentos. Verifique sua conexão e tente novamente.")
      setVideoFiles([])
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

  const handleFilterChange = (key: keyof VideoFileFilter, value: any) => {
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

  const handleDeleteVideoFile = async (videoFile: VideoFileDto) => {
    const videoTitle = videoFile.video?.title || videoFile.video?.name || videoFile.video_files_id
    const fileName = videoFile.file?.name || videoFile.file_id
    
    if (!window.confirm(`Tem certeza que deseja excluir o relacionamento entre "${videoTitle}" e "${fileName}"?`)) {
      return
    }

    try {
      await videoFileService.deleteVideoFile(videoFile.id)
      showSuccess("Relacionamento excluído com sucesso!")
      fetchPageData(currentPage, searchQuery, filters, false)
    } catch (error: any) {
      console.error('Erro ao excluir relacionamento:', error)
      if (error.message?.includes('Sessão expirada') || error.message?.includes('não autenticado')) {
        return handleAuthError()
      }
      showError("Erro ao excluir relacionamento. Tente novamente.")
    }
  }

  const openModal = (mode: 'create' | 'edit', videoFile?: VideoFileDto) => {
    setModalMode(mode)
    setSelectedVideoFile(videoFile || null)
    setModalOpen(true)
  }

  const closeModal = () => {
    setModalOpen(false)
    setSelectedVideoFile(null)
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

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return 'N/A'
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(1024))
    return Math.round((bytes / Math.pow(1024, i)) * 100) / 100 + ' ' + sizes[i]
  }

  const totalPages = Math.ceil(totalItems / itemsPerPage)

  return (
    <div className="container mx-auto px-4 py-6 max-w-7xl">
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Relacionamento Vídeo-Arquivo</h1>
              <p className="text-gray-600 mt-1">Gerencie as associações entre vídeos e arquivos</p>
            </div>
            <div className="flex gap-3">
              <Button onClick={handleRefresh} variant="outline" disabled={refreshing} className="flex items-center gap-2">
                <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
                Atualizar
              </Button>
              <Button onClick={() => openModal('create')} className="flex items-center gap-2">
                <Plus className="w-4 h-4" />
                Novo Relacionamento
              </Button>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
            <StatCard icon={Link} title="Total" value={stats.totalRelationships} subtitle="Relacionamentos" color="blue" />
            <StatCard icon={Link} title="Ativos" value={stats.activeRelationships} subtitle="Relacionamentos ativos" color="green" />
            <StatCard icon={X} title="Excluídos" value={stats.deletedRelationships} subtitle="Relacionamentos excluídos" color="red" />
            <StatCard icon={Video} title="Vídeos" value={stats.uniqueVideos} subtitle="Vídeos únicos" color="purple" />
            <StatCard icon={File} title="Arquivos" value={stats.uniqueFiles} subtitle="Arquivos únicos" color="orange" />
          </div>

          {/* Search & Filter Trigger */}
          <div className="flex gap-3">
            <form onSubmit={handleSearch} className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Buscar relacionamentos..."
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
                  <option value="">Todos</option>
                  <option value="false">Ativos</option>
                  <option value="true">Excluídos</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1 text-gray-700">ID do Vídeo</label>
                <input
                  type="text"
                  placeholder="ID do vídeo..."
                  value={filters.video_id || ''}
                  onChange={(e) => handleFilterChange('video_id', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1 text-gray-700">ID do Arquivo</label>
                <input
                  type="text"
                  placeholder="ID do arquivo..."
                  value={filters.file_id || ''}
                  onChange={(e) => handleFilterChange('file_id', e.target.value)}
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
              <span className="ml-2 text-gray-600">Carregando relacionamentos...</span>
            </div>
          ) : videoFiles.length === 0 ? (
            <div className="text-center py-12">
              <Link className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 text-lg mb-2">Nenhum relacionamento encontrado</p>
              <p className="text-gray-400 text-sm">{searchQuery || Object.keys(filters).length > 0 ? "Tente ajustar sua busca ou filtros." : "Clique em \"Novo Relacionamento\" para adicionar o primeiro"}</p>
            </div>
          ) : (
            <>
              {/* Desktop Table */}
              <div className="hidden lg:block overflow-x-auto">
                <table className="w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Vídeo</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Arquivo</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Data de Criação</th>
                      <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Ações</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {videoFiles.map((videoFile) => (
                      <tr key={videoFile.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                              <Video className="w-5 h-5 text-purple-600" />
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">
                                {videoFile.video?.title || videoFile.video?.name || 'Título não disponível'}
                              </div>
                              <div className="text-xs text-gray-500">ID: {videoFile.video_files_id}</div>
                              {videoFile.video?.class && (
                                <div className="text-xs text-gray-400">Classe: {videoFile.video.class}</div>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                              <FileVideo className="w-5 h-5 text-blue-600" />
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">
                                {videoFile.file?.name || 'Nome não disponível'}
                              </div>
                              <div className="text-xs text-gray-500">ID: {videoFile.file_id}</div>
                              <div className="text-xs text-gray-400">
                                {videoFile.file?.content_type} • {formatFileSize(videoFile.file?.size)}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900">{formatDate(videoFile.date_created)}</td>
                        <td className="px-6 py-4 text-center">
                          <Badge variant={!videoFile.deleted ? 'success' : 'danger'}>
                            {!videoFile.deleted ? 'Ativo' : 'Excluído'}
                          </Badge>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <div className="flex items-center justify-center space-x-2">
                            <Button variant="ghost" size="sm" onClick={() => openModal('edit', videoFile)} className="text-blue-600 hover:text-blue-900">
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button variant="ghost" size="sm" onClick={() => handleDeleteVideoFile(videoFile)} className="text-red-600 hover:text-red-900">
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
                {videoFiles.map(videoFile => (
                  <div key={videoFile.id} className="bg-white border border-gray-200 rounded-lg shadow-sm">
                    <div className="p-4 border-b border-gray-100 flex justify-between items-start">
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-800">Relacionamento #{videoFile.id.substring(0, 8)}</h3>
                        <p className="text-sm text-gray-500">Versão {videoFile.version}</p>
                      </div>
                      <Badge variant={!videoFile.deleted ? 'success' : 'danger'}>
                        {!videoFile.deleted ? 'Ativo' : 'Excluído'}
                      </Badge>
                    </div>
                    <div className="p-4 space-y-3">
                      <div className="flex items-start">
                        <Video className="w-4 h-4 mr-2 text-purple-400 mt-1 flex-shrink-0"/>
                        <div>
                          <div className="text-sm font-medium">
                            {videoFile.video?.title || videoFile.video?.name || 'Título não disponível'}
                          </div>
                          <div className="text-xs text-gray-500">ID: {videoFile.video_files_id}</div>
                        </div>
                      </div>
                      <div className="flex items-start">
                        <FileVideo className="w-4 h-4 mr-2 text-blue-400 mt-1 flex-shrink-0"/>
                        <div>
                          <div className="text-sm font-medium">
                            {videoFile.file?.name || 'Nome não disponível'}
                          </div>
                          <div className="text-xs text-gray-500">ID: {videoFile.file_id}</div>
                          <div className="text-xs text-gray-400">
                            {videoFile.file?.content_type} • {formatFileSize(videoFile.file?.size)}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center text-sm">
                        <Calendar className="w-4 h-4 mr-2 text-gray-400"/>
                        {formatDate(videoFile.date_created)}
                      </div>
                    </div>
                    <div className="p-4 border-t border-gray-100 flex justify-end space-x-2">
                      <Button variant="outline" size="sm" onClick={() => openModal('edit', videoFile)}>Editar</Button>
                      <Button variant="destructive" size="sm" onClick={() => handleDeleteVideoFile(videoFile)}>Excluir</Button>
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

      {/* Modal TODO: Implementar VideoFileFormModal */}
      {modalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold">
                {modalMode === 'create' ? 'Novo Relacionamento' : 'Editar Relacionamento'}
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