'use client'

import React, { useState, useEffect } from 'react'
import { TVShowCollection, TVShowVideo, TVShowModuleStructure } from '@/types/collections'
import { Search, Filter, Clock, Play, Folder, Calendar, Star, Eye } from 'lucide-react'

interface TVShowListItem {
  id: number
  name: string
  producer?: string
  total_load?: string
  video_count?: number
  created_at?: string
  poster_path?: string
  backdrop_path?: string
  overview?: string
  popularity?: number
  vote_average?: number
  vote_count?: number
  first_air_date?: string
  contract_term_end?: string
  poster_image_url?: string
  backdrop_image_url?: string
}

interface StatsData {
  totalCollections: number
  totalVideos: number
  totalDuration: string
  avgRating: number
}

export default function TVShowsManagePage() {
  const [tvShows, setTvShows] = useState<TVShowListItem[]>([])
  const [selectedTvShow, setSelectedTvShow] = useState<TVShowCollection | null>(null)
  const [modules, setModules] = useState<TVShowModuleStructure>({})
  const [currentView, setCurrentView] = useState<'list' | 'videos'>('list')
  const [isLoading, setIsLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [stats, setStats] = useState<StatsData>({
    totalCollections: 0,
    totalVideos: 0,
    totalDuration: '0h 0m',
    avgRating: 0
  })

  // Estados para filtros
  const [filters, setFilters] = useState({
    producer: '',
    minDuration: '',
    maxDuration: '',
    dateFrom: '',
    dateTo: '',
    sortBy: 'name' // name, date, duration, popularity
  })
  const [showFilters, setShowFilters] = useState(false)

  useEffect(() => {
    loadTvShows()
    calculateStats()
  }, [])

  const getAuthToken = (): string | null => {
    if (typeof window === 'undefined') return null;
    
    let token = localStorage.getItem('auth_token') || 
                localStorage.getItem('token') ||
                localStorage.getItem('authToken') ||
                sessionStorage.getItem('token') ||
                sessionStorage.getItem('auth_token');
    
    if (!token) {
      const cookies = document.cookie.split(';');
      for (const cookie of cookies) {
        const [name, value] = cookie.trim().split('=');
        if (name === 'auth_token' || name === 'token' || name === 'authToken') {
          token = decodeURIComponent(value);
          break;
        }
      }
    }
    
    if (!token) {
      console.warn('⚠️ Nenhum token encontrado, usando token de fallback para desenvolvimento');
      const fallbackData = {
        userId: 'admin',
        email: 'admin@test.com',
        name: 'Admin Test',
        role: 'SYSTEM_ADMIN',
        institutionId: 'test-institution-id',
        iat: Math.floor(Date.now() / 1000),
        exp: Math.floor(Date.now() / 1000) + (60 * 60)
      };
      token = btoa(JSON.stringify(fallbackData));
    }
    
    return token;
  }

  const loadTvShows = async (page = 1, search = '') => {
    try {
      setIsLoading(true)
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '12',
        ...(search && { search })
      })

      const token = getAuthToken()
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      }
      
      if (token) {
        headers['Authorization'] = `Bearer ${token}`
      }

      const response = await fetch(`/api/tv-shows?${params}`, {
        headers
      })

      if (response.ok) {
        const data = await response.json()
        if (data.success) {
          setTvShows(data.data?.tvShows || [])
          setTotalPages(data.data?.totalPages || 1)
          setCurrentPage(data.data?.page || 1)
        }
      } else {
        console.error('Erro na resposta da API:', response.status, response.statusText)
      }
    } catch (error) {
      console.error('Erro ao carregar TV Shows:', error)
      setTvShows([])
    } finally {
      setIsLoading(false)
    }
  }

  const calculateStats = async () => {
    try {
      const token = getAuthToken()
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      }
      
      if (token) {
        headers['Authorization'] = `Bearer ${token}`
      }

      // Buscar todas as coleções para calcular estatísticas
      const response = await fetch('/api/tv-shows?page=1&limit=1000', { headers })
      
      if (response.ok) {
        const data = await response.json()
        if (data.success && data.data?.tvShows) {
          const collections = data.data.tvShows
          
          const totalCollections = collections.length
          const totalVideos = collections.reduce((sum: number, show: TVShowListItem) => 
            sum + (show.video_count || 0), 0)
          
          // Calcular duração total
          let totalMinutes = 0
          collections.forEach((show: TVShowListItem) => {
            if (show.total_load) {
              const match = show.total_load.match(/(\d+)h(\d+)/)
              if (match) {
                totalMinutes += parseInt(match[1]) * 60 + parseInt(match[2])
              }
            }
          })
          
          const hours = Math.floor(totalMinutes / 60)
          const minutes = totalMinutes % 60
          const totalDuration = `${hours}h ${minutes}m`
          
          // Calcular média de avaliação
          const ratingsSum = collections.reduce((sum: number, show: TVShowListItem) => 
            sum + (show.vote_average || 0), 0)
          const avgRating = collections.length > 0 ? ratingsSum / collections.length : 0
          
          setStats({
            totalCollections,
            totalVideos,
            totalDuration,
            avgRating: Math.round(avgRating * 10) / 10
          })
        }
      }
    } catch (error) {
      console.error('Erro ao calcular estatísticas:', error)
    }
  }

  const loadTvShowDetails = async (id: number) => {
    try {
      setIsLoading(true)
      const token = getAuthToken()
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      }
      
      if (token) {
        headers['Authorization'] = `Bearer ${token}`
      }

      const response = await fetch(`/api/tv-shows/${id}`, { headers })
      if (response.ok) {
        const data = await response.json()
        if (data.success) {
          const tvShowData = data.data
          setSelectedTvShow(tvShowData)
          // Os módulos já vêm incluídos na resposta
          if (tvShowData.modules) {
            setModules(tvShowData.modules)
          }
        }
      }
    } catch (error) {
      console.error('Erro ao carregar detalhes do TV Show:', error)
      setSelectedTvShow(null)
      setModules({})
    } finally {
      setIsLoading(false)
    }
  }

  const handleSearch = (term: string) => {
    setSearchTerm(term)
    setCurrentPage(1)
    loadTvShows(1, term)
  }

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
    loadTvShows(page, searchTerm)
  }

  const applyFilters = () => {
    let filtered = [...tvShows]

    // Filtro por produtor
    if (filters.producer) {
      filtered = filtered.filter(show => 
        show.producer?.toLowerCase().includes(filters.producer.toLowerCase())
      )
    }

    // Filtro por duração
    if (filters.minDuration || filters.maxDuration) {
      filtered = filtered.filter(show => {
        if (!show.total_load) return false
        const match = show.total_load.match(/(\d+)h(\d+)/)
        if (!match) return false
        const totalMinutes = parseInt(match[1]) * 60 + parseInt(match[2])
        
        if (filters.minDuration && totalMinutes < parseInt(filters.minDuration) * 60) return false
        if (filters.maxDuration && totalMinutes > parseInt(filters.maxDuration) * 60) return false
        return true
      })
    }

    // Ordenação
    filtered.sort((a, b) => {
      switch (filters.sortBy) {
        case 'date':
          return new Date(b.first_air_date || '').getTime() - new Date(a.first_air_date || '').getTime()
        case 'duration':
          const getDuration = (show: TVShowListItem) => {
            if (!show.total_load) return 0
            const match = show.total_load.match(/(\d+)h(\d+)/)
            return match ? parseInt(match[1]) * 60 + parseInt(match[2]) : 0
          }
          return getDuration(b) - getDuration(a)
        case 'popularity':
          return (b.popularity || 0) - (a.popularity || 0)
        default: // name
          return a.name.localeCompare(b.name)
      }
    })

    return filtered
  }

  const filteredTvShows = applyFilters()

  if (currentView === 'videos' && selectedTvShow) {
    return (
      <div className="max-w-7xl mx-auto p-6">
        <button 
          onClick={() => setCurrentView('list')}
          className="mb-6 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center gap-2"
        >
          ← Voltar para Lista
        </button>
        
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          {/* Header com informações da coleção */}
          <div className="relative">
            {/* Imagem de fundo */}
            <div className="h-80 bg-gradient-to-r from-gray-800 to-gray-900 relative overflow-hidden">
              {(selectedTvShow.poster_image_url || selectedTvShow.backdrop_image_url) && (
                <img
                  src={selectedTvShow.poster_image_url || selectedTvShow.backdrop_image_url || ''}
                  alt={selectedTvShow.name}
                  className="w-full h-full object-cover opacity-30"
                />
              )}
              <div className="absolute inset-0 bg-black bg-opacity-60"></div>
            </div>
            
            {/* Conteúdo sobreposto */}
            <div className="absolute inset-0 flex items-end">
              <div className="p-8 text-white w-full">
                <div className="flex items-end gap-8">
                  {/* Poster */}
                  <div className="flex-shrink-0">
                    <img
                      src={selectedTvShow.poster_image_url || selectedTvShow.backdrop_image_url || '/placeholder-collection.jpg'}
                      alt={selectedTvShow.name}
                      className="w-40 h-60 object-cover rounded-lg shadow-2xl border-4 border-white"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = '/placeholder-collection.jpg';
                      }}
                    />
                  </div>
                  
                  {/* Informações da Coleção */}
                  <div className="flex-1 min-w-0">
                    <h1 className="text-4xl font-bold mb-3">{selectedTvShow.name}</h1>
                    <div className="mb-4">
                      <span className="inline-block bg-blue-600 text-white px-3 py-1 rounded-full text-sm font-medium">
                        Coleção Educacional
                      </span>
                    </div>
                    
                    {/* Informações principais */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      {selectedTvShow.producer && (
                        <div>
                          <span className="text-gray-300 text-sm">Produtor:</span>
                          <p className="text-lg font-medium">{selectedTvShow.producer}</p>
                        </div>
                      )}
                      
                      {selectedTvShow.first_air_date && (
                        <div>
                          <span className="text-gray-300 text-sm">Data de Lançamento:</span>
                          <p className="text-lg font-medium">
                            {new Date(selectedTvShow.first_air_date).toLocaleDateString('pt-BR')}
                          </p>
                        </div>
                      )}
                      
                      {selectedTvShow.total_load && (
                        <div>
                          <span className="text-gray-300 text-sm">Duração Total:</span>
                          <p className="text-lg font-medium flex items-center gap-2">
                            <Clock className="w-5 h-5" />
                            {selectedTvShow.total_load}
                          </p>
                        </div>
                      )}
                      
                      {selectedTvShow.vote_average && selectedTvShow.vote_average > 0 && (
                        <div>
                          <span className="text-gray-300 text-sm">Avaliação:</span>
                          <p className="text-lg font-medium flex items-center gap-2">
                            <Star className="w-5 h-5 text-yellow-400" />
                            {selectedTvShow.vote_average} / 10
                          </p>
                        </div>
                      )}
                    </div>
                    
                    {/* Estatísticas */}
                    <div className="flex items-center gap-6 text-sm text-gray-300 mb-4">
                      {Object.keys(modules).length > 0 && (
                        <div className="flex items-center gap-2">
                          <Folder className="w-4 h-4" />
                          <span>{Object.keys(modules).length} sessão{Object.keys(modules).length > 1 ? 'ões' : ''}</span>
                        </div>
                      )}
                      
                      {(() => {
                        const totalVideos = Object.values(modules).reduce((sum, videos) => sum + videos.length, 0);
                        return totalVideos > 0 && (
                          <div className="flex items-center gap-2">
                            <Play className="w-4 h-4" />
                            <span>{totalVideos} vídeo{totalVideos > 1 ? 's' : ''}</span>
                          </div>
                        );
                      })()}
                      
                      {selectedTvShow.popularity && (
                        <div className="flex items-center gap-2">
                          <Eye className="w-4 h-4" />
                          <span>Popularidade: {selectedTvShow.popularity.toFixed(1)}</span>
                        </div>
                      )}
                    </div>
                    
                    {/* Descrição */}
                    {selectedTvShow.overview && (
                      <div>
                        <span className="text-gray-300 text-sm">Sinopse:</span>
                        <p className="text-gray-200 text-base leading-relaxed max-w-4xl mt-1">
                          {selectedTvShow.overview}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Conteúdo dos vídeos */}
          <div className="p-8">
            {isLoading ? (
              <div className="flex justify-center items-center py-16">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
                <span className="ml-3 text-gray-600 text-lg">Carregando vídeos...</span>
              </div>
            ) : Object.keys(modules).length === 0 ? (
              <div className="text-center py-16">
                <Play className="w-20 h-20 text-gray-400 mx-auto mb-6" />
                <h3 className="text-xl font-medium text-gray-600 mb-3">Nenhum vídeo encontrado</h3>
                <p className="text-gray-500 text-lg">Esta coleção ainda não possui vídeos cadastrados</p>
              </div>
            ) : (
              <div className="space-y-10">
                <div className="text-center mb-8">
                  <h2 className="text-2xl font-bold text-gray-800 mb-2">Conteúdo da Coleção</h2>
                  <p className="text-gray-600">Explore todos os vídeos organizados por sessões</p>
                </div>
                
                {Object.entries(modules)
                  .sort(([a], [b]) => {
                    // Ordenar por número da sessão
                    const numA = parseInt(a.split('_')[1]) || 0;
                    const numB = parseInt(b.split('_')[1]) || 0;
                    return numA - numB;
                  })
                  .map(([moduleKey, moduleVideos]) => {
                    const sessionNumber = parseInt(moduleKey.split('_')[1]) || 1;
                    
                    return (
                      <div key={moduleKey} className="border border-gray-200 rounded-xl overflow-hidden shadow-sm">
                        {/* Header da sessão */}
                        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 px-8 py-6 border-b border-gray-200">
                          <div className="flex items-center justify-between">
                            <div>
                              <h3 className="text-2xl font-bold text-gray-800 mb-1">
                                Sessão {sessionNumber}
                              </h3>
                              <p className="text-gray-600">
                                {moduleVideos.length} vídeo{moduleVideos.length > 1 ? 's' : ''} disponível{moduleVideos.length > 1 ? 'eis' : ''}
                              </p>
                            </div>
                            <div className="flex items-center gap-2 text-blue-600">
                              <Play className="w-6 h-6" />
                              <span className="font-medium">Assistir Sessão</span>
                            </div>
                          </div>
                        </div>
                        
                        {/* Lista de vídeos da sessão */}
                        <div className="p-6">
                          <div className="space-y-4">
                            {moduleVideos.map((video, index) => (
                              <div key={video.id} className="bg-gray-50 rounded-lg p-6 hover:bg-gray-100 transition-colors border border-gray-200">
                                <div className="flex items-start gap-6">
                                  {/* Thumbnail e botão play */}
                                  <div className="relative flex-shrink-0">
                                    <div className="w-32 h-20 bg-gray-300 rounded-lg overflow-hidden relative group cursor-pointer">
                                      {video.thumbnail_url ? (
                                        <img
                                          src={video.thumbnail_url}
                                          alt={video.title}
                                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                          onError={(e) => {
                                            const target = e.target as HTMLImageElement;
                                            target.src = selectedTvShow.poster_image_url || selectedTvShow.backdrop_image_url || '/placeholder-collection.jpg';
                                          }}
                                        />
                                      ) : (
                                        <img
                                          src={selectedTvShow.poster_image_url || selectedTvShow.backdrop_image_url || '/placeholder-collection.jpg'}
                                          alt={video.title}
                                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                          onError={(e) => {
                                            const target = e.target as HTMLImageElement;
                                            target.src = '/placeholder-collection.jpg';
                                          }}
                                        />
                                      )}
                                      
                                      {/* Overlay com play */}
                                      <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition-all duration-300 flex items-center justify-center">
                                        <Play className="w-8 h-8 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                                      </div>
                                      
                                      {/* Duração */}
                                      {video.duration && (
                                        <div className="absolute bottom-1 right-1 bg-black bg-opacity-70 text-white text-xs px-2 py-1 rounded">
                                          {video.duration}
                                        </div>
                                      )}
                                    </div>
                                    
                                    {/* Número do episódio */}
                                    <div className="absolute -top-2 -left-2 bg-blue-500 text-white text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center">
                                      {video.episode_number || index + 1}
                                    </div>
                                  </div>
                                  
                                  {/* Informações do vídeo */}
                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-start justify-between mb-3">
                                      <h4 className="text-lg font-semibold text-gray-800 line-clamp-2">
                                        {video.title}
                                      </h4>
                                      <span className="text-sm text-gray-500 ml-4 flex-shrink-0">
                                        Ep. {video.episode_number || index + 1}
                                      </span>
                                    </div>
                                    
                                    {/* Informações detalhadas */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
                                      <div>
                                        <span className="text-xs text-gray-500 uppercase tracking-wide">Produtor:</span>
                                        <p className="text-sm font-medium text-gray-700">
                                          {selectedTvShow.producer || 'Não informado'}
                                        </p>
                                      </div>
                                      
                                      {video.duration && (
                                        <div>
                                          <span className="text-xs text-gray-500 uppercase tracking-wide">Duração:</span>
                                          <p className="text-sm font-medium text-gray-700 flex items-center gap-1">
                                            <Clock className="w-3 h-3" />
                                            {video.duration}
                                          </p>
                                        </div>
                                      )}
                                      
                                      <div>
                                        <span className="text-xs text-gray-500 uppercase tracking-wide">Sessão:</span>
                                        <p className="text-sm font-medium text-gray-700">
                                          {sessionNumber}
                                        </p>
                                      </div>
                                    </div>
                                    
                                    {/* Descrição */}
                                    {video.description && (
                                      <div className="mb-4">
                                        <span className="text-xs text-gray-500 uppercase tracking-wide">Descrição:</span>
                                        <p className="text-sm text-gray-600 mt-1 line-clamp-3 leading-relaxed">
                                          {video.description}
                                        </p>
                                      </div>
                                    )}
                                    
                                    {/* Botões de ação */}
                                    <div className="flex items-center gap-3">
                                      <button 
                                        className="px-4 py-2 bg-blue-500 text-white text-sm font-medium rounded-lg hover:bg-blue-600 transition-colors flex items-center gap-2"
                                        onClick={() => {
                                          if (video.video_url) {
                                            window.open(video.video_url, '_blank');
                                          }
                                        }}
                                      >
                                        <Play className="w-4 h-4" />
                                        Assistir Agora
                                      </button>
                                      
                                      <button className="px-4 py-2 bg-gray-100 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-200 transition-colors">
                                        Adicionar à Lista
                                      </button>
                                      
                                      <button className="px-4 py-2 bg-gray-100 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-200 transition-colors">
                                        Compartilhar
                                      </button>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    );
                  })}
              </div>
            )}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Gerenciar Coleções</h1>
        <p className="text-gray-600">Gerencie suas coleções de vídeos educativos</p>
      </div>

      {/* Cards de Estatísticas - Cores mais leves */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-gradient-to-r from-blue-100 to-blue-200 rounded-xl p-6 text-blue-800">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-600 text-sm font-medium">Total de Coleções</p>
              <p className="text-2xl font-bold">{stats.totalCollections}</p>
            </div>
            <Folder className="w-8 h-8 text-blue-400" />
          </div>
        </div>

        <div className="bg-gradient-to-r from-green-100 to-green-200 rounded-xl p-6 text-green-800">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-600 text-sm font-medium">Total de Vídeos</p>
              <p className="text-2xl font-bold">{stats.totalVideos}</p>
            </div>
            <Play className="w-8 h-8 text-green-400" />
          </div>
        </div>

        <div className="bg-gradient-to-r from-purple-100 to-purple-200 rounded-xl p-6 text-purple-800">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-600 text-sm font-medium">Tempo Total</p>
              <p className="text-2xl font-bold">{stats.totalDuration}</p>
            </div>
            <Clock className="w-8 h-8 text-purple-400" />
          </div>
        </div>

        <div className="bg-gradient-to-r from-orange-100 to-orange-200 rounded-xl p-6 text-orange-800">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-orange-600 text-sm font-medium">Avaliação Média</p>
              <p className="text-2xl font-bold">{stats.avgRating}</p>
            </div>
            <Star className="w-8 h-8 text-orange-400" />
          </div>
        </div>
      </div>

      {/* Barra de Busca e Filtros */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <div className="flex flex-col lg:flex-row gap-4 mb-4">
          {/* Busca */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar por nome, produtor ou descrição..."
              value={searchTerm}
              onChange={(e) => handleSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Botão de Filtros */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`px-4 py-2 rounded-lg flex items-center gap-2 transition-colors ${
              showFilters 
                ? 'bg-blue-500 text-white' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <Filter className="w-4 h-4" />
            Filtros
          </button>
        </div>

        {/* Painel de Filtros */}
        {showFilters && (
          <div className="border-t pt-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Produtor</label>
              <input
                type="text"
                placeholder="Filtrar por produtor"
                value={filters.producer}
                onChange={(e) => setFilters({...filters, producer: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Duração Mín. (horas)</label>
              <input
                type="number"
                placeholder="0"
                value={filters.minDuration}
                onChange={(e) => setFilters({...filters, minDuration: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Duração Máx. (horas)</label>
              <input
                type="number"
                placeholder="100"
                value={filters.maxDuration}
                onChange={(e) => setFilters({...filters, maxDuration: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Ordenar por</label>
              <select
                value={filters.sortBy}
                onChange={(e) => setFilters({...filters, sortBy: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="name">Nome</option>
                <option value="date">Data</option>
                <option value="duration">Duração</option>
                <option value="popularity">Popularidade</option>
              </select>
            </div>
          </div>
        )}
      </div>

      {/* Loading */}
      {isLoading && (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
      )}

      {/* Grid de Coleções - Design anterior com imagem responsiva */}
      {!isLoading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredTvShows.map((tvShow) => (
            <div
              key={tvShow.id}
              className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 overflow-hidden cursor-pointer group"
              onClick={() => {
                loadTvShowDetails(tvShow.id)
                setCurrentView('videos')
              }}
            >
              {/* Imagem da coleção - responsiva mas completa */}
              <div className="relative w-full aspect-[496/702] bg-gray-200 overflow-hidden">
                {tvShow.poster_image_url || tvShow.backdrop_image_url ? (
                  <img
                    src={tvShow.poster_image_url || tvShow.backdrop_image_url || ''}
                    alt={tvShow.name}
                    className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = '/placeholder-collection.jpg';
                    }}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200">
                    <Folder className="w-16 h-16 text-gray-400" />
                  </div>
                )}
                
                {/* Overlay com informações */}
                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-300 flex items-end">
                  <div className="w-full p-4 text-white transform translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                    <div className="flex items-center gap-2 text-sm">
                      <Play className="w-4 h-4" />
                      <span>{tvShow.video_count || 0} vídeos</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Conteúdo do Card */}
              <div className="p-4">
                <h3 className="font-bold text-lg text-gray-800 mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors">
                  {tvShow.name}
                </h3>
                
                {tvShow.producer && (
                  <p className="text-sm text-gray-600 mb-2">
                    <span className="font-medium">Produtor:</span> {tvShow.producer}
                  </p>
                )}

                <div className="flex items-center justify-between text-sm text-gray-500 mb-3">
                  {tvShow.total_load && (
                    <div className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      <span>{tvShow.total_load}</span>
                    </div>
                  )}
                  
                  {tvShow.vote_average && tvShow.vote_average > 0 && (
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4 text-yellow-500" />
                      <span>{tvShow.vote_average}</span>
                    </div>
                  )}
                </div>

                {tvShow.overview && (
                  <p className="text-sm text-gray-600 line-clamp-3">
                    {tvShow.overview}
                  </p>
                )}

                {/* Data de lançamento */}
                {tvShow.first_air_date && (
                  <div className="mt-3 flex items-center gap-1 text-xs text-gray-500">
                    <Calendar className="w-3 h-3" />
                    <span>{new Date(tvShow.first_air_date).getFullYear()}</span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Paginação */}
      {!isLoading && totalPages > 1 && (
        <div className="flex justify-center mt-8">
          <div className="flex gap-2">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <button
                key={page}
                onClick={() => handlePageChange(page)}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  currentPage === page
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                {page}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Estado vazio */}
      {!isLoading && filteredTvShows.length === 0 && (
        <div className="text-center py-12">
          <Folder className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-600 mb-2">Nenhuma coleção encontrada</h3>
          <p className="text-gray-500">
            {searchTerm || Object.values(filters).some(f => f) 
              ? 'Tente ajustar os filtros de busca'
              : 'Nenhuma coleção disponível no momento'
            }
          </p>
        </div>
      )}
    </div>
  )
} 