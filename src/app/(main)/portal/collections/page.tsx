'use client'

import React, { useState, useEffect } from 'react'
import { Search, Filter, Clock, Play, Folder, Calendar, Star, Eye, BookOpen, FileText } from 'lucide-react'
import { formatDate, formatYear } from '@/utils/date'

import { tvShowService } from '@/services/tvShowService'
import { TvShowDto, TvShowFilter } from '@/types/tvShow'
import { TvShowResponseDto, ApiResponse, PaginationResult } from '@/types/api'

// Interface baseada no retorno real da API
interface TVShowListItem {
  id: string
  version: string
  api_id: string | null
  backdrop_image_id: string | null
  backdrop_path: string | null
  contract_term_end: string
  date_created: string
  deleted: boolean
  first_air_date: string
  imdb_id: string | null
  last_updated: string
  manual_input: boolean
  manual_support_id: string | null
  manual_support_path: string | null
  name: string
  original_language: string | null
  overview: string
  popularity: number | null
  poster_image_id: string | null
  poster_path: string | null
  producer: string
  vote_average: number | null
  vote_count: number | null
  total_load: string | null
}

interface APIResponse {
  success: boolean
  data: {
    items: TVShowListItem[]
    pagination: {
      page: number
      limit: number
      total: number
      totalPages: number
      hasNext: boolean
      hasPrev: boolean
    }
  }
}

interface StatsData {
  totalCollections: number
  totalVideos: number
  totalDuration: string
  avgRating: number
}

export default function TVShowsManagePage() {
  // Estados principais
  const [tvShows, setTvShows] = useState<TVShowListItem[]>([])
  const [selectedTvShow, setSelectedTvShow] = useState<TVShowListItem | null>(null)
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
    sortBy: 'name'
  })
  const [showFilters, setShowFilters] = useState(false)

  const [expandedDescriptions, setExpandedDescriptions] = useState<Set<string>>(new Set())

  // Carregar dados iniciais
  useEffect(() => {
    loadTvShows()
  }, [])

  const loadTvShows = async (page = 1, search = '') => {
    try {
      setIsLoading(true)
      
      const filterParams: TvShowFilter = {
        page,
        limit: 12,
        ...(search && { search })
      }

      console.log('🔗 Carregando TV Shows com filtros:', filterParams)

      const response = await tvShowService.getTvShows(filterParams) as any
      
      console.log('✅ Resposta da API:', response)

      // Verificar se a resposta tem a estrutura esperada da nova API
      if (response.success && response.data && response.data.items) {
        const { items, pagination } = response.data
        
        // Filtrar apenas itens não deletados
        const activeShows = items.filter((show: TVShowListItem) => !show.deleted)
        
        setTvShows(activeShows)
        setTotalPages(pagination.totalPages)
        setCurrentPage(pagination.page)
        
        // Calcular estatísticas baseadas nos dados carregados
        calculateStats(activeShows, pagination.total)
      } else if (response.items && Array.isArray(response.items)) {
        // Fallback para estrutura antiga da API (PaginatedResponse)
        const activeShows = response.items.filter((show: any) => !show.deleted)
        
        setTvShows(activeShows)
        setTotalPages(response.totalPages || 1)
        setCurrentPage(response.page || 1)
        
        calculateStats(activeShows, response.total || activeShows.length)
      } else {
        // Fallback para array direto
        const tvShowsArray = Array.isArray(response) ? response : []
        const activeShows = tvShowsArray.filter((show: any) => !show.deleted)
        
        setTvShows(activeShows)
        setTotalPages(1)
        setCurrentPage(1)
        
        calculateStats(activeShows, activeShows.length)
      }
      
    } catch (error) {
      console.error('❌ Erro ao carregar TV Shows:', error)
      setTvShows([])
      
      if (error instanceof Error && error.message.includes('401')) {
        alert('Sua sessão expirou. Por favor, faça login novamente.')
      }
    } finally {
      setIsLoading(false)
    }
  }

  const calculateStats = (shows: TVShowListItem[], total: number) => {
    const totalCollections = total
    
    // Calcular estatísticas baseadas nos dados disponíveis
    let totalMinutes = 0
    let ratingsSum = 0
    let ratingsCount = 0
    
    shows.forEach((show) => {
      // Calcular duração total se disponível
      if (show.total_load) {
        const match = show.total_load.match(/(\d+)h(\d+)/)
        if (match) {
          totalMinutes += parseInt(match[1]) * 60 + (parseInt(match[2]) || 0)
        }
      }
      
      // Calcular média de avaliação se disponível
      if (show.vote_average && show.vote_average > 0) {
        ratingsSum += show.vote_average
        ratingsCount++
      }
    })
    
    const hours = Math.floor(totalMinutes / 60)
    const minutes = totalMinutes % 60
    const totalDuration = totalMinutes > 0 ? `${hours}h ${minutes}m` : '0h 0m'
    const avgRating = ratingsCount > 0 ? Math.round((ratingsSum / ratingsCount) * 10) / 10 : 0
    
    setStats({
      totalCollections,
      totalVideos: shows.length, // Usando o número de coleções como proxy
      totalDuration,
      avgRating
    })
  }

  const loadTvShowDetails = async (id: string) => {
    try {
      setIsLoading(true)
      
      console.log(`🔍 Carregando detalhes do TV Show ID: ${id}`)
      
      const tvShow = await tvShowService.getTvShowById(Number(id)) as any
      console.log('✅ Detalhes do TV Show carregados:', tvShow.name)
      
      // Converter TvShowDto para TVShowListItem se necessário
      const tvShowData: TVShowListItem = {
        id: tvShow.id?.toString() || id,
        version: tvShow.version?.toString() || '1',
        api_id: tvShow.api_id || null,
        backdrop_image_id: tvShow.backdrop_image_id || null,
        backdrop_path: tvShow.backdrop_path || null,
        contract_term_end: tvShow.contract_term_end,
        date_created: tvShow.date_created || tvShow.created_at || new Date().toISOString(),
        deleted: tvShow.deleted || false,
        first_air_date: tvShow.first_air_date,
        imdb_id: tvShow.imdb_id || null,
        last_updated: tvShow.last_updated || tvShow.updated_at || new Date().toISOString(),
        manual_input: tvShow.manual_input || false,
        manual_support_id: tvShow.manual_support_id || null,
        manual_support_path: tvShow.manual_support_path || null,
        name: tvShow.name,
        original_language: tvShow.original_language || null,
        overview: tvShow.overview || '',
        popularity: tvShow.popularity || null,
        poster_image_id: tvShow.poster_image_id || null,
        poster_path: tvShow.poster_path || null,
        producer: tvShow.producer || '',
        vote_average: tvShow.vote_average || null,
        vote_count: tvShow.vote_count || null,
        total_load: tvShow.total_load || null
      }
      
      setSelectedTvShow(tvShowData)
      
    } catch (error) {
      console.error('❌ Erro ao carregar detalhes do TV Show:', error)
      setSelectedTvShow(null)
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

    // Ordenação
    filtered.sort((a, b) => {
      switch (filters.sortBy) {
        case 'date':
          return new Date(b.first_air_date || '').getTime() - new Date(a.first_air_date || '').getTime()
        case 'duration':
          const getDuration = (show: TVShowListItem) => {
            if (!show.total_load) return 0
            const match = show.total_load.match(/(\d+)h(\d+)/)
            return match ? parseInt(match[1]) * 60 + (parseInt(match[2]) || 0) : 0
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

  const toggleDescriptionExpansion = (tvShowId: string) => {
    setExpandedDescriptions(prev => {
      const newSet = new Set(prev)
      if (newSet.has(tvShowId)) {
        newSet.delete(tvShowId)
      } else {
        newSet.add(tvShowId)
      }
      return newSet
    })
  }

  // Função para obter a imagem da coleção
  const getCollectionImage = (show: TVShowListItem) => {
    if (show.poster_path) return show.poster_path
    if (show.backdrop_path) return show.backdrop_path
    if (show.poster_image_id) return `/file/serve/${show.poster_image_id}.jpg`
    return '/placeholder-collection.jpg'
  }

  // Função placeholder para demonstrar que a coleção foi selecionada
  const handleWatchCollection = (tvShow: TVShowListItem) => {
    console.log('🎬 Abrindo coleção:', tvShow.name)
    alert(`Coleção "${tvShow.name}" selecionada!\n\nEsta funcionalidade será implementada quando os vídeos estiverem disponíveis na API.`)
  }

  if (currentView === 'videos' && selectedTvShow) {
    return (
      <div className="w-full">
        <button 
          onClick={() => {
            setCurrentView('list')
          }}
          className="mb-4 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center gap-2"
        >
          ← Voltar para Lista
        </button>
        
        <div className="overflow-hidden">
          {/* Header com informações da coleção */}
          <div className="relative">
            <div className="h-auto py-8 bg-gradient-to-r from-gray-800 to-gray-900 relative overflow-hidden">
              {/* Imagem de fundo */}
              <img
                src={getCollectionImage(selectedTvShow)}
                alt={selectedTvShow.name}
                className="absolute inset-0 w-full h-full object-cover opacity-15"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src = '/placeholder-collection.jpg';
                }}
              />
              
              {/* Overlay escuro */}
              <div className="absolute inset-0 bg-black bg-opacity-30"></div>
              
              {/* Conteúdo sobreposto */}
              <div className="relative z-10 p-6 text-white w-full">
                <div className="flex items-start gap-6">
                  {/* Poster menor */}
                  <div className="flex-shrink-0">
                    <img
                      src={getCollectionImage(selectedTvShow)}
                      alt={selectedTvShow.name}
                      className="w-24 h-36 object-cover rounded-lg shadow-2xl border-2 border-white"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = '/placeholder-collection.jpg';
                      }}
                    />
                  </div>
                  
                  {/* Informações da Coleção */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between mb-2">
                      <h1 className="text-2xl font-bold text-yellow-300 drop-shadow-2xl">{selectedTvShow.name}</h1>
                      <span className="inline-block bg-blue-600 text-white px-3 py-1 rounded-full text-xs font-medium ml-4">
                        Coleção Educacional
                      </span>
                    </div>
                    
                    {/* Informações principais */}
                    <div className="flex flex-wrap items-center gap-6 text-sm mb-3">
                      {selectedTvShow.producer && (
                        <div className="flex items-center gap-2">
                          <span className="text-gray-300">Produtor:</span>
                          <span className="font-medium">{selectedTvShow.producer}</span>
                        </div>
                      )}
                      
                      {selectedTvShow.first_air_date && (
                        <div className="flex items-center gap-2">
                          <span className="text-gray-300">Lançamento:</span>
                          <span className="font-medium">{formatDate(selectedTvShow.first_air_date)}</span>
                        </div>
                      )}
                      
                      {selectedTvShow.contract_term_end && (
                        <div className="flex items-center gap-2">
                          <span className="text-gray-300">Contrato até:</span>
                          <span className="font-medium">{formatDate(selectedTvShow.contract_term_end)}</span>
                        </div>
                      )}

                      {selectedTvShow.total_load && (
                        <div className="flex items-center gap-2">
                          <span className="text-gray-300">Duração:</span>
                          <span className="font-medium">{selectedTvShow.total_load}</span>
                        </div>
                      )}
                    </div>

                    {/* Sinopse da Coleção */}
                    {selectedTvShow.overview && (
                      <div className="mt-4 pt-4 border-t border-white/20">
                        <h3 className="text-white text-sm font-semibold mb-2 flex items-center gap-2">
                          <BookOpen className="w-4 h-4" />
                          Sinopse da Coleção
                        </h3>
                        <p className="text-gray-200 text-sm leading-relaxed">
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
          <div className="p-4">
            <div className="text-center py-16">
              <Play className="w-20 h-20 text-gray-400 mx-auto mb-6" />
              <h3 className="text-xl font-medium text-gray-600 mb-3">Coleção Carregada com Sucesso</h3>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 max-w-2xl mx-auto">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                      <BookOpen className="w-5 h-5 text-blue-600" />
                    </div>
                  </div>
                  <div className="text-left">
                    <h4 className="text-lg font-semibold text-blue-800 mb-2">
                      {selectedTvShow.name}
                    </h4>
                    <p className="text-blue-700 mb-3">
                      Esta coleção foi carregada com sucesso! Os vídeos estão sendo configurados e em breve estarão disponíveis.
                    </p>
                    <div className="space-y-2 text-sm text-blue-600">
                      <div className="flex items-center gap-2">
                        <Star className="w-4 h-4" />
                        <span>Produtor: {selectedTvShow.producer}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        <span>Lançamento: {formatDate(selectedTvShow.first_air_date)}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4" />
                        <span>Duração: {selectedTvShow.total_load || 'N/A'}</span>
                      </div>
                      {selectedTvShow.contract_term_end && (
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4" />
                          <span>Contrato até: {formatDate(selectedTvShow.contract_term_end)}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
              <p className="text-gray-500 text-base mt-6">
                Em breve você poderá assistir aos vídeos organizados por sessões
              </p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header da Página */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Portal de Coleções Educativas
          </h1>
          <p className="text-gray-600">
            Explore e gerencie todo o conteúdo educacional disponível em nossa plataforma
          </p>
        </div>
      </div>

      {/* Cards de Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        {/* Card Total de Coleções */}
        <div className="group relative overflow-hidden bg-gradient-to-br from-blue-500 via-indigo-600 to-purple-700 rounded-2xl shadow-2xl hover:shadow-3xl transition-all duration-500 border-2 border-blue-300 transform hover:-translate-y-2 hover:scale-105">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12 transform translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>
          <div className="relative p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-white/20 backdrop-blur-sm rounded-xl shadow-lg group-hover:scale-110 transition-transform duration-300 border border-white/30">
                <Folder className="w-6 h-6 text-white" />
              </div>
              <div className="text-right">
                <p className="text-3xl font-bold text-white">{stats.totalCollections}</p>
                <div className="flex items-center justify-end gap-2 mt-2">
                  <div className="w-3 h-3 bg-cyan-400 rounded-full animate-pulse shadow-lg"></div>
                  <span className="text-sm text-blue-100 font-semibold tracking-wide">COLEÇÕES</span>
                </div>
              </div>
            </div>
            <div>
              <h3 className="text-xl font-bold text-white mb-1">Total de Coleções</h3>
              <p className="text-blue-100 text-sm">Organizadas no sistema</p>
            </div>
          </div>
        </div>

        {/* Card Total de Vídeos */}
        <div className="group relative overflow-hidden bg-gradient-to-br from-emerald-500 via-teal-600 to-cyan-700 rounded-2xl shadow-2xl hover:shadow-3xl transition-all duration-500 border-2 border-emerald-300 transform hover:-translate-y-2 hover:scale-105">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12 transform translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>
          <div className="relative p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-white/20 backdrop-blur-sm rounded-xl shadow-lg group-hover:scale-110 transition-transform duration-300 border border-white/30">
                <Play className="w-6 h-6 text-white" />
              </div>
              <div className="text-right">
                <p className="text-3xl font-bold text-white">{stats.totalVideos}</p>
                <div className="flex items-center justify-end gap-2 mt-2">
                  <div className="w-3 h-3 bg-lime-400 rounded-full animate-pulse shadow-lg"></div>
                  <span className="text-sm text-emerald-100 font-semibold tracking-wide">COLEÇÕES</span>
                </div>
              </div>
            </div>
            <div>
              <h3 className="text-xl font-bold text-white mb-1">Coleções Ativas</h3>
              <p className="text-emerald-100 text-sm">Conteúdo disponível</p>
            </div>
          </div>
        </div>

        {/* Card Duração Total */}
        <div className="group relative overflow-hidden bg-gradient-to-br from-purple-500 via-violet-600 to-fuchsia-700 rounded-2xl shadow-2xl hover:shadow-3xl transition-all duration-500 border-2 border-purple-300 transform hover:-translate-y-2 hover:scale-105">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12 transform translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>
          <div className="relative p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-white/20 backdrop-blur-sm rounded-xl shadow-lg group-hover:scale-110 transition-transform duration-300 border border-white/30">
                <Clock className="w-6 h-6 text-white" />
              </div>
              <div className="text-right">
                <p className="text-3xl font-bold text-white">{stats.totalDuration}</p>
                <div className="flex items-center justify-end gap-2 mt-2">
                  <div className="w-3 h-3 bg-pink-400 rounded-full animate-pulse shadow-lg"></div>
                  <span className="text-sm text-purple-100 font-semibold tracking-wide">DURAÇÃO</span>
                </div>
              </div>
            </div>
            <div>
              <h3 className="text-xl font-bold text-white mb-1">Duração Total</h3>
              <p className="text-purple-100 text-sm">Tempo de conteúdo</p>
            </div>
          </div>
        </div>

        {/* Card Avaliação Média */}
        <div className="group relative overflow-hidden bg-gradient-to-br from-amber-500 via-orange-600 to-red-700 rounded-2xl shadow-2xl hover:shadow-3xl transition-all duration-500 border-2 border-amber-300 transform hover:-translate-y-2 hover:scale-105">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12 transform translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>
          <div className="relative p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-white/20 backdrop-blur-sm rounded-xl shadow-lg group-hover:scale-110 transition-transform duration-300 border border-white/30">
                <Star className="w-6 h-6 text-white" />
              </div>
              <div className="text-right">
                <p className="text-3xl font-bold text-white">{stats.avgRating}</p>
                <div className="flex items-center justify-end gap-2 mt-2">
                  <div className="w-3 h-3 bg-yellow-400 rounded-full animate-pulse shadow-lg"></div>
                  <span className="text-sm text-amber-100 font-semibold tracking-wide">ESTRELAS</span>
                </div>
              </div>
            </div>
            <div>
              <h3 className="text-xl font-bold text-white mb-1">Avaliação Média</h3>
              <p className="text-amber-100 text-sm">Qualidade do conteúdo</p>
            </div>
          </div>
        </div>
      </div>

      {/* Barra de Busca e Filtros */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-4 mb-6">
        <div className="flex flex-col lg:flex-row gap-4 mb-4">
          {/* Busca */}
          <div className="flex-1 relative group">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <Search className="w-5 h-5 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
            </div>
            <input
              type="text"
              placeholder="Buscar coleções por nome, produtor ou descrição..."
              value={searchTerm}
              onChange={(e) => handleSearch(e.target.value)}
              className="w-full pl-12 pr-4 py-4 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all duration-200 text-gray-700 placeholder-gray-400"
            />
          </div>

          {/* Botão de Filtros */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`px-6 py-4 rounded-xl flex items-center gap-3 font-medium transition-all duration-200 ${
              showFilters 
                ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg transform scale-105' 
                : 'bg-gray-50 text-gray-700 hover:bg-gray-100 border-2 border-gray-200 hover:border-gray-300'
            }`}
          >
            <Filter className="w-5 h-5" />
            <span>Filtros Avançados</span>
          </button>
        </div>

        {/* Painel de Filtros */}
        {showFilters && (
          <div className="border-t-2 border-gray-100 pt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  <span className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    Produtor
                  </span>
                </label>
                <input
                  type="text"
                  placeholder="Ex: Sabercon, Portal..."
                  value={filters.producer}
                  onChange={(e) => setFilters({...filters, producer: e.target.value})}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all duration-200"
                />
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  <span className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-amber-500 rounded-full"></div>
                    Ordenar por
                  </span>
                </label>
                <select
                  value={filters.sortBy}
                  onChange={(e) => setFilters({...filters, sortBy: e.target.value})}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-4 focus:ring-amber-100 focus:border-amber-500 transition-all duration-200 bg-white"
                >
                  <option value="name">📝 Nome (A-Z)</option>
                  <option value="date">📅 Data de Criação</option>
                  <option value="duration">⏱️ Duração</option>
                  <option value="popularity">⭐ Popularidade</option>
                </select>
              </div>
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

      {/* Grid de Coleções */}
      {!isLoading && (
        <div>
          {/* Header da Seção de Coleções */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl font-bold text-gray-800">Suas Coleções</h2>
              <p className="text-gray-600 mt-1">
                {filteredTvShows.length} de {stats.totalCollections} coleções encontradas
              </p>
            </div>
            <div className="flex items-center gap-3 text-sm text-gray-500">
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                <span>Ativo</span>
              </div>
              <div className="flex items-center gap-1">
                <Play className="w-4 h-4" />
                <span>Disponível</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {filteredTvShows.map((tvShow) => (
              <div
                key={tvShow.id}
                className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 overflow-hidden cursor-pointer group border border-gray-100 hover:border-blue-200 transform hover:-translate-y-2"
                onClick={() => {
                  loadTvShowDetails(tvShow.id)
                  setCurrentView('videos')
                }}
              >
                {/* Imagem da coleção */}
                <div className="relative w-full aspect-[496/702] bg-gray-200 overflow-hidden">
                  <img
                    src={getCollectionImage(tvShow)}
                    alt={tvShow.name}
                    className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = '/placeholder-collection.jpg';
                    }}
                  />
                  
                  {/* Overlay com informações */}
                  <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-300 flex items-end">
                    <div className="w-full p-4 text-white transform translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                      <div className="flex items-center gap-2 text-sm">
                        <Play className="w-4 h-4" />
                        <span>Coleção disponível</span>
                      </div>
                      {tvShow.total_load && (
                        <div className="flex items-center gap-2 text-sm mt-1">
                          <Clock className="w-4 h-4" />
                          <span>{tvShow.total_load}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Conteúdo do Card */}
                <div className="p-6">
                  <h3 className="font-bold text-xl text-gray-800 mb-3 line-clamp-2 group-hover:text-blue-600 transition-colors leading-tight">
                    {tvShow.name}
                  </h3>
                  
                  {tvShow.producer && (
                    <div className="mb-4">
                      <span className="inline-flex items-center gap-2 px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-sm font-medium">
                        <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                        {tvShow.producer}
                      </span>
                    </div>
                  )}

                  {/* Informações da coleção */}
                  <div className="space-y-3 mb-4">
                    <div className="flex items-center gap-3 p-3 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border border-green-100">
                      <div className="p-2 bg-green-500 rounded-lg">
                        <BookOpen className="w-4 h-4 text-white" />
                      </div>
                      <div>
                        <p className="font-semibold text-green-700">Coleção Educacional</p>
                        <p className="text-xs text-green-600">
                          {tvShow.total_load ? `Duração: ${tvShow.total_load}` : 'Conteúdo disponível'}
                        </p>
                      </div>
                    </div>
                    
                    {/* Datas */}
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-2 text-sm text-gray-600 bg-gray-50 px-3 py-2 rounded-lg">
                        <Calendar className="w-4 h-4 text-blue-500" />
                        <span className="font-medium">{formatYear(tvShow.first_air_date)}</span>
                      </div>
                      
                      <div className="flex items-center gap-2 text-sm text-gray-600 bg-green-50 px-3 py-2 rounded-lg">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <span className="font-medium">Ativo</span>
                      </div>
                    </div>
                  </div>

                  {/* Descrição */}
                  {tvShow.overview && (
                    <div className="mb-4">
                      <div className={`relative bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-4 border border-gray-200 transition-all duration-500 ${
                        expandedDescriptions.has(tvShow.id) 
                          ? 'shadow-lg border-blue-200 bg-gradient-to-br from-blue-50 to-indigo-50' 
                          : 'hover:shadow-md hover:border-gray-300'
                      }`}>
                        <div className="absolute top-2 right-2">
                          <svg className="w-4 h-4 text-gray-300" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h4v10h-10z"/>
                          </svg>
                        </div>

                        <div className={`text-sm text-gray-700 leading-relaxed pr-6 transition-all duration-500 ${
                          expandedDescriptions.has(tvShow.id) ? 'max-h-none' : 'line-clamp-3'
                        }`}>
                          <p>{tvShow.overview}</p>
                        </div>
                      </div>
                      
                      {tvShow.overview.length > 150 && (
                        <div className="flex justify-center mt-3">
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              toggleDescriptionExpansion(tvShow.id)
                            }}
                            className="group flex items-center gap-2 text-sm font-semibold text-blue-600 hover:text-blue-700 transition-all duration-300 px-4 py-2 rounded-full bg-white hover:bg-blue-50 border-2 border-blue-200 hover:border-blue-300 shadow-sm hover:shadow-md transform hover:scale-105"
                          >
                            <span>
                              {expandedDescriptions.has(tvShow.id) ? 'Ver menos' : 'Ver mais detalhes'}
                            </span>
                            <div className={`p-1 rounded-full bg-blue-100 group-hover:bg-blue-200 transition-all duration-300 ${
                              expandedDescriptions.has(tvShow.id) ? 'rotate-180' : ''
                            }`}>
                              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                              </svg>
                            </div>
                          </button>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Footer do Card */}
                  <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      <Calendar className="w-3 h-3" />
                      <span>{formatYear(tvShow.first_air_date)}</span>
                    </div>
                    
                    <div className="flex items-center gap-1 text-xs text-blue-600 font-medium group-hover:text-blue-700">
                      <span>Ver coleção</span>
                      <div className="w-1 h-1 bg-blue-400 rounded-full group-hover:animate-bounce"></div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
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