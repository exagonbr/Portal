'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { useToast } from '@/components/ToastManager'
import { videoService } from '@/services/videoService'
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
  Video,
  Star,
  Calendar,
  RefreshCw,
  Filter,
  X,
  Play,
  Film,
  Users,
  TrendingUp
} from 'lucide-react'

// Interfaces para tipos
interface VideoDto {
  id: string
  api_id?: string
  title: string
  overview?: string
  popularity?: number
  class?: string
  poster_path?: string
  backdrop_path?: string
  release_date?: string
  vote_average?: number
  vote_count?: number
  season_number?: number
  episode_number?: number
  episode_count?: number
  air_date?: string
  name?: string
  first_air_date?: string
  last_air_date?: string
  number_of_episodes?: number
  number_of_seasons?: number
  status?: string
  type?: string
  in_production?: boolean
  original_language?: string
  original_name?: string
  origin_country?: string[]
  genres?: string[]
  production_companies?: string[]
  networks?: string[]
  created_by?: string[]
  seasons?: any[]
  episode_run_time?: number[]
  homepage?: string
  tagline?: string
  adult?: boolean
  video?: boolean
  belongs_to_collection?: any
  budget?: number
  imdb_id?: string
  original_title?: string
  production_countries?: string[]
  revenue?: number
  runtime?: number
  spoken_languages?: string[]
  date_created: string
  last_updated: string
  deleted: boolean
  version: number
}

interface VideoFilter {
  page?: number
  limit?: number
  search?: string
  class?: string
  status?: string
  original_language?: string
  deleted?: boolean
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
}

interface VideoStats {
  totalVideos: number
  activeVideos: number
  deletedVideos: number
  videosByClass: Record<string, number>
  averageRating: number
}

interface PaginatedResponse<T> {
  items: T[]
  total: number
  page: number
  limit: number
  totalPages: number
}

export default function AdminVideosPage() {
  const { showSuccess, showError, showWarning } = useToast()
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const router = useRouter()
  
  // Dados principais
  const [videos, setVideos] = useState<VideoDto[]>([])

  // Paginação e Filtros
  const [totalItems, setTotalItems] = useState(0)
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage] = useState(10)
  const [searchQuery, setSearchQuery] = useState('')
  const [filters, setFilters] = useState<VideoFilter>({})
  const [showFilterPanel, setShowFilterPanel] = useState(false)

  // Modais
  const [modalOpen, setModalOpen] = useState(false)
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create')
  const [selectedVideo, setSelectedVideo] = useState<VideoDto | null>(null)

  // Estatísticas
  const [stats, setStats] = useState<VideoStats>({
    totalVideos: 0,
    activeVideos: 0,
    deletedVideos: 0,
    videosByClass: {},
    averageRating: 0,
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

  const calculateStats = useCallback((allVideos: VideoDto[]) => {
    const totalVideos = allVideos.length
    const activeVideos = allVideos.filter(v => !v.deleted).length
    const deletedVideos = totalVideos - activeVideos
    
    const videosByClass = allVideos.reduce((acc, video) => {
      const videoClass = video.class || 'Sem classe'
      acc[videoClass] = (acc[videoClass] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    const ratingsSum = allVideos
      .filter(v => v.vote_average && v.vote_average > 0)
      .reduce((sum, v) => sum + (v.vote_average || 0), 0)
    const ratingsCount = allVideos.filter(v => v.vote_average && v.vote_average > 0).length
    const averageRating = ratingsCount > 0 ? ratingsSum / ratingsCount : 0

    setStats({ totalVideos, activeVideos, deletedVideos, videosByClass, averageRating })
  }, [])

  const fetchPageData = useCallback(async (page = 1, search = '', currentFilters: VideoFilter = {}, showLoadingIndicator = true) => {
    if (showLoadingIndicator) setLoading(true)
    else setRefreshing(true)

    try {
      console.log('🔄 [VIDEOS] Carregando dados da página...', { page, search, currentFilters })
      
      const params: VideoFilter = {
        page,
        limit: itemsPerPage,
        sortBy: 'date_created',
        sortOrder: 'desc',
        search: search || undefined,
        ...currentFilters,
      }

      console.log('🔄 [VIDEOS] Carregando videos com parâmetros:', params)
      
      try {
        const response = await videoService.getVideos(params) as PaginatedResponse<VideoDto>
        console.log('✅ [VIDEOS] Resposta do serviço:', {
          items: response.items?.length || 0,
          total: response.total,
          page: response.page,
          format: Array.isArray(response.items) ? 'PaginatedResponse' : 'unknown'
        })
        
        if (!response || !Array.isArray(response.items)) {
          console.error('❌ [VIDEOS] Formato de resposta inválido:', response);
          throw new Error('Formato de resposta inválido do servidor');
        }
        
        setVideos(response.items || [])
        setTotalItems(response.total || 0)
        setCurrentPage(page)

        // Calcular stats com todos os vídeos para uma visão geral
        try {
          const allVideosResponse = await videoService.getVideos({ limit: 1000 }) as PaginatedResponse<VideoDto>;
          calculateStats(allVideosResponse.items || []);
        } catch (statsError) {
          console.warn('⚠️ [VIDEOS] Erro ao calcular estatísticas:', statsError)
          calculateStats(response.items || []);
        }

        if (!showLoadingIndicator) {
          showSuccess("Lista de vídeos atualizada com sucesso!")
        }
        
        console.log('✅ [VIDEOS] Vídeos carregados com sucesso:', response.items.length);
      } catch (error: any) {
        console.error('❌ [VIDEOS] Erro ao carregar vídeos:', error)
        if (error.message?.includes('Sessão expirada') || error.message?.includes('não autenticado')) {
          return handleAuthError()
        }
        throw error
      }
    } catch (error) {
      console.error('❌ [VIDEOS] Erro ao carregar dados:', error)
      showError("Erro ao carregar vídeos. Verifique sua conexão e tente novamente.")
      setVideos([])
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

  const handleFilterChange = (key: keyof VideoFilter, value: any) => {
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

  const handleDeleteVideo = async (video: VideoDto) => {
    if (!window.confirm(`Tem certeza que deseja excluir o vídeo "${video.title}"?`)) {
      return
    }

    try {
      await videoService.deleteVideo(video.id)
      showSuccess("Vídeo excluído com sucesso!")
      fetchPageData(currentPage, searchQuery, filters, false)
    } catch (error: any) {
      console.error('Erro ao excluir vídeo:', error)
      if (error.message?.includes('Sessão expirada') || error.message?.includes('não autenticado')) {
        return handleAuthError()
      }
      showError("Erro ao excluir vídeo. Tente novamente.")
    }
  }

  const openModal = (mode: 'create' | 'edit', video?: VideoDto) => {
    setModalMode(mode)
    setSelectedVideo(video || null)
    setModalOpen(true)
  }

  const closeModal = () => {
    setModalOpen(false)
    setSelectedVideo(null)
  }

  const handleModalSave = async () => {
    closeModal()
    await fetchPageData(currentPage, searchQuery, filters, false)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    })
  }

  const truncateText = (text: string, maxLength: number = 100) => {
    return text.length > maxLength ? text.substring(0, maxLength) + '...' : text
  }

  const getRatingStars = (rating?: number) => {
    if (!rating) return 'N/A'
    const stars = Math.round(rating / 2) // Convert 10-scale to 5-star
    return '★'.repeat(stars) + '☆'.repeat(5 - stars) + ` (${rating.toFixed(1)})`
  }

  const totalPages = Math.ceil(totalItems / itemsPerPage)

  return (
    <div className="container mx-auto px-4 py-6 max-w-7xl">
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Gerenciamento de Vídeos</h1>
              <p className="text-gray-600 mt-1">Administre o catálogo de vídeos do sistema</p>
            </div>
            <div className="flex gap-3">
              <Button onClick={handleRefresh} variant="outline" disabled={refreshing} className="flex items-center gap-2">
                <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
                Atualizar
              </Button>
              <Button onClick={() => openModal('create')} className="flex items-center gap-2">
                <Plus className="w-4 h-4" />
                Novo Vídeo
              </Button>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <StatCard icon={Video} title="Total" value={stats.totalVideos} subtitle="Vídeos" color="blue" />
            <StatCard icon={Play} title="Ativos" value={stats.activeVideos} subtitle="Vídeos ativos" color="green" />
            <StatCard icon={X} title="Excluídos" value={stats.deletedVideos} subtitle="Vídeos excluídos" color="red" />
            <StatCard icon={Star} title="Avaliação" value={stats.averageRating.toFixed(1)} subtitle="Média geral" color="yellow" />
          </div>

          {/* Search & Filter Trigger */}
          <div className="flex gap-3">
            <form onSubmit={handleSearch} className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Buscar vídeos..."
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
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
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
                <label className="block text-sm font-medium mb-1 text-gray-700">Classe</label>
                <input
                  type="text"
                  placeholder="Classe do vídeo..."
                  value={filters.class || ''}
                  onChange={(e) => handleFilterChange('class', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1 text-gray-700">Status Produção</label>
                <input
                  type="text"
                  placeholder="Status..."
                  value={filters.status || ''}
                  onChange={(e) => handleFilterChange('status', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1 text-gray-700">Idioma</label>
                <input
                  type="text"
                  placeholder="Idioma original..."
                  value={filters.original_language || ''}
                  onChange={(e) => handleFilterChange('original_language', e.target.value)}
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
              <span className="ml-2 text-gray-600">Carregando vídeos...</span>
            </div>
          ) : videos.length === 0 ? (
            <div className="text-center py-12">
              <Video className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 text-lg mb-2">Nenhum vídeo encontrado</p>
              <p className="text-gray-400 text-sm">{searchQuery || Object.keys(filters).length > 0 ? "Tente ajustar sua busca ou filtros." : "Clique em \"Novo Vídeo\" para adicionar o primeiro"}</p>
            </div>
          ) : (
            <>
              {/* Desktop Table */}
              <div className="hidden lg:block overflow-x-auto">
                <table className="w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Vídeo</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Classe/Tipo</th>
                      <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Avaliação</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Lançamento</th>
                      <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Ações</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {videos.map((video) => (
                      <tr key={video.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 w-16 h-12 bg-gray-200 rounded-lg flex items-center justify-center overflow-hidden">
                              {video.poster_path ? (
                                <img 
                                  src={video.poster_path} 
                                  alt={video.title}
                                  className="w-full h-full object-cover"
                                  onError={(e) => {
                                    e.currentTarget.style.display = 'none'
                                    e.currentTarget.nextElementSibling?.classList.remove('hidden')
                                  }}
                                />
                              ) : null}
                              <Film className="w-6 h-6 text-gray-400" />
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">{video.title || video.name}</div>
                              <div className="text-xs text-gray-500">
                                {video.overview ? truncateText(video.overview, 50) : 'Sem descrição'}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900">
                          <div>
                            <div>{video.class || 'N/A'}</div>
                            {video.type && <div className="text-xs text-gray-500">{video.type}</div>}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-center text-sm">
                          <div className="flex flex-col items-center">
                            <div className="text-yellow-500 text-xs">{getRatingStars(video.vote_average)}</div>
                            {video.vote_count && (
                              <div className="text-xs text-gray-400">{video.vote_count} votos</div>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900">
                          {video.release_date && formatDate(video.release_date)}
                          {video.first_air_date && formatDate(video.first_air_date)}
                          {!video.release_date && !video.first_air_date && 'N/A'}
                        </td>
                        <td className="px-6 py-4 text-center">
                          <Badge variant={!video.deleted ? 'success' : 'danger'}>
                            {!video.deleted ? 'Ativo' : 'Excluído'}
                          </Badge>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <div className="flex items-center justify-center space-x-2">
                            <Button variant="ghost" size="sm" onClick={() => openModal('edit', video)} className="text-blue-600 hover:text-blue-900">
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button variant="ghost" size="sm" onClick={() => handleDeleteVideo(video)} className="text-red-600 hover:text-red-900">
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
                {videos.map(video => (
                  <div key={video.id} className="bg-white border border-gray-200 rounded-lg shadow-sm">
                    <div className="p-4 border-b border-gray-100 flex justify-between items-start">
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-800">{video.title || video.name}</h3>
                        <p className="text-sm text-gray-500">{video.overview ? truncateText(video.overview, 100) : 'Sem descrição'}</p>
                      </div>
                      <Badge variant={!video.deleted ? 'success' : 'danger'}>
                        {!video.deleted ? 'Ativo' : 'Excluído'}
                      </Badge>
                    </div>
                    <div className="p-4 space-y-2">
                      <div className="flex items-center text-sm">
                        <Film className="w-4 h-4 mr-2 text-gray-400"/>
                        {video.class || 'Sem classe'}
                      </div>
                      <div className="flex items-center text-sm">
                        <Star className="w-4 h-4 mr-2 text-gray-400"/>
                        {getRatingStars(video.vote_average)}
                      </div>
                      <div className="flex items-center text-sm">
                        <Calendar className="w-4 h-4 mr-2 text-gray-400"/>
                        {video.release_date && formatDate(video.release_date)}
                        {video.first_air_date && formatDate(video.first_air_date)}
                        {!video.release_date && !video.first_air_date && 'Data não informada'}
                      </div>
                    </div>
                    <div className="p-4 border-t border-gray-100 flex justify-end space-x-2">
                      <Button variant="outline" size="sm" onClick={() => openModal('edit', video)}>Editar</Button>
                      <Button variant="destructive" size="sm" onClick={() => handleDeleteVideo(video)}>Excluir</Button>
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

      {/* Modal TODO: Implementar VideoFormModal */}
      {modalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold">
                {modalMode === 'create' ? 'Novo Vídeo' : 'Editar Vídeo'}
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