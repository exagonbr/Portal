'use client'

import React, { useState, useEffect } from 'react'
import { TVShowCollection, TVShowVideo, TVShowModuleStructure } from '@/types/collections'
import { 
  Search, 
  Filter, 
  Clock, 
  Play, 
  Folder, 
  Calendar, 
  Star, 
  Eye, 
  BookOpen, 
  FileText,
  Plus,
  Edit,
  Trash2,
  Settings,
  Users,
  BarChart3,
  Upload,
  Download,
  MoreVertical
} from 'lucide-react'
import { formatDate, formatYear } from '@/utils/date'
// Comentando temporariamente para debug
// import UniversalVideoPlayer from '@/components/UniversalVideoPlayer'
import requestMonitor from '@/utils/requestMonitor'

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
  // Estados básicos
  const [tvShows, setTvShows] = useState<TVShowListItem[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCollection, setSelectedCollection] = useState<TVShowListItem | null>(null)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')

  // Função para carregar TV Shows
  const loadTvShows = async () => {
    try {
      setIsLoading(true)
      setError(null)
      
      const response = await fetch('/api/tv-shows?page=1&limit=50')
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      const data = await response.json()
      
      if (data.success) {
        setTvShows(data.data?.tvShows || [])
      } else {
        setError(data.message || 'Erro ao carregar dados')
      }
    } catch (err) {
      console.error('Erro ao carregar TV Shows:', err)
      setError(err instanceof Error ? err.message : 'Erro desconhecido')
    } finally {
      setIsLoading(false)
    }
  }

  // Função de pesquisa
  const handleSearch = async () => {
    if (!searchTerm.trim()) {
      loadTvShows()
      return
    }

    try {
      setIsLoading(true)
      const response = await fetch(`/api/tv-shows/search?q=${encodeURIComponent(searchTerm)}`)
      
      if (!response.ok) {
        throw new Error('Erro ao pesquisar coleções')
      }
      
      const data = await response.json()
      
      if (data.success) {
        setTvShows(data.data?.tvShows || [])
      } else {
        setError(data.message || 'Nenhuma coleção encontrada')
      }
    } catch (err) {
      console.error('Erro ao pesquisar:', err)
      setError('Erro ao pesquisar coleções')
    } finally {
      setIsLoading(false)
    }
  }

  // Funções utilitárias
  const getImageUrl = (path?: string) => {
    if (!path) return '/collections/placeholder-collection.jpg'
    if (path.startsWith('http')) return path
    return `/collections/${path}`
  }

  const renderStars = (rating?: number) => {
    if (!rating) return null
    
    const stars = []
    const fullStars = Math.floor(rating / 2)
    const hasHalfStar = (rating / 2) % 1 >= 0.5

    for (let i = 0; i < 5; i++) {
      if (i < fullStars) {
        stars.push(<Star key={i} className="w-4 h-4 text-yellow-400 fill-current" />)
      } else if (i === fullStars && hasHalfStar) {
        stars.push(<Star key={i} className="w-4 h-4 text-yellow-400 fill-current opacity-50" />)
      } else {
        stars.push(<Star key={i} className="w-4 h-4 text-gray-300" />)
      }
    }

    return (
      <div className="flex items-center gap-1">
        {stars}
        <span className="text-sm text-gray-600 ml-1">({rating?.toFixed(1)})</span>
      </div>
    )
  }

  useEffect(() => {
    loadTvShows()
  }, [])

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Carregando coleções...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Gerenciamento de Coleções</h1>
              <p className="mt-2 text-gray-600">
                Gerencie suas coleções de vídeos e conteúdo educacional
              </p>
            </div>
            
            {/* Actions */}
            <div className="mt-4 md:mt-0 flex items-center space-x-4">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Pesquisar coleções..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent w-64"
                />
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              </div>
              <button
                onClick={handleSearch}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Buscar
              </button>
              <button
                onClick={() => setShowCreateModal(true)}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Nova Coleção
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-blue-100 text-blue-600">
                <Folder className="w-6 h-6" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Total de Coleções</p>
                <p className="text-2xl font-bold text-gray-900">{tvShows.length}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-green-100 text-green-600">
                <Play className="w-6 h-6" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Total de Vídeos</p>
                <p className="text-2xl font-bold text-gray-900">
                  {tvShows.reduce((sum, show) => sum + (show.video_count || 0), 0)}
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-purple-100 text-purple-600">
                <Clock className="w-6 h-6" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Duração Total</p>
                <p className="text-2xl font-bold text-gray-900">
                  {tvShows.reduce((sum, show) => {
                    if (show.total_load) {
                      const match = show.total_load.match(/(\d+)h/)
                      return sum + (match ? parseInt(match[1]) : 0)
                    }
                    return sum
                  }, 0)}h
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-yellow-100 text-yellow-600">
                <Star className="w-6 h-6" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Avaliação Média</p>
                <p className="text-2xl font-bold text-gray-900">
                  {tvShows.length > 0 
                    ? (tvShows.reduce((sum, show) => sum + (show.vote_average || 0), 0) / tvShows.length).toFixed(1)
                    : '0.0'
                  }
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        {/* Collections Grid */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-900">
                {searchTerm ? `Resultados para "${searchTerm}"` : 'Todas as Coleções'}
              </h2>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded-lg ${viewMode === 'grid' ? 'bg-blue-100 text-blue-600' : 'text-gray-400 hover:text-gray-600'}`}
                >
                  <Folder className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded-lg ${viewMode === 'list' ? 'bg-blue-100 text-blue-600' : 'text-gray-400 hover:text-gray-600'}`}
                >
                  <FileText className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
          
          <div className="p-6">
            {tvShows.length === 0 ? (
              <div className="text-center py-12">
                <Folder className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhuma coleção encontrada</h3>
                <p className="text-gray-600 mb-4">Comece criando sua primeira coleção de vídeos</p>
                <button
                  onClick={() => setShowCreateModal(true)}
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2 mx-auto"
                >
                  <Plus className="w-4 h-4" />
                  Criar Primeira Coleção
                </button>
              </div>
            ) : (
              <div className={viewMode === 'grid' 
                ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6" 
                : "space-y-4"
              }>
                {tvShows.map((show) => (
                  <div 
                    key={show.id} 
                    className={viewMode === 'grid'
                      ? "bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow cursor-pointer border border-gray-200"
                      : "bg-gray-50 rounded-lg p-4 hover:bg-gray-100 transition-colors cursor-pointer border border-gray-200"
                    }
                    onClick={() => setSelectedCollection(show)}
                  >
                    {viewMode === 'grid' ? (
                      <>
                        <div className="relative h-48 bg-gray-200">
                          <img
                            src={getImageUrl(show.poster_path || show.backdrop_path)}
                            alt={show.name}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              e.currentTarget.src = '/collections/placeholder-collection.jpg'
                            }}
                          />
                          <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                            <Play className="w-12 h-12 text-white" />
                          </div>
                          {show.popularity && (
                            <div className="absolute top-2 right-2 bg-blue-600 text-white px-2 py-1 rounded-full text-xs font-semibold">
                              ★ {show.popularity.toFixed(1)}
                            </div>
                          )}
                          <div className="absolute top-2 left-2">
                            <button className="p-1 bg-black bg-opacity-50 text-white rounded-full hover:bg-opacity-70">
                              <MoreVertical className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                        
                        <div className="p-4">
                          <h3 className="font-semibold text-lg mb-2 line-clamp-2">{show.name}</h3>
                          
                          {show.overview && (
                            <p className="text-gray-600 text-sm mb-3 line-clamp-3">{show.overview}</p>
                          )}
                          
                          <div className="space-y-2">
                            {show.vote_average && renderStars(show.vote_average)}
                            
                            {show.producer && (
                              <div className="flex items-center text-sm text-gray-500">
                                <Users className="w-4 h-4 mr-1" />
                                <span className="line-clamp-1">{show.producer}</span>
                              </div>
                            )}
                            
                            <div className="flex items-center justify-between text-sm text-gray-500">
                              <div className="flex items-center gap-2">
                                <Play className="w-4 h-4" />
                                <span>{show.video_count || 0} vídeos</span>
                              </div>
                              
                              {show.total_load && (
                                <div className="flex items-center gap-2">
                                  <Clock className="w-4 h-4" />
                                  <span>{show.total_load}</span>
                                </div>
                              )}
                            </div>
                          </div>
                          
                          <div className="mt-4 flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <button className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg">
                                <Edit className="w-4 h-4" />
                              </button>
                              <button className="p-2 text-gray-600 hover:bg-gray-50 rounded-lg">
                                <Settings className="w-4 h-4" />
                              </button>
                              <button className="p-2 text-red-600 hover:bg-red-50 rounded-lg">
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                            <button className="px-3 py-1 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700">
                              Gerenciar
                            </button>
                          </div>
                        </div>
                      </>
                    ) : (
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <img
                            src={getImageUrl(show.poster_path || show.backdrop_path)}
                            alt={show.name}
                            className="w-16 h-16 object-cover rounded-lg"
                            onError={(e) => {
                              e.currentTarget.src = '/collections/placeholder-collection.jpg'
                            }}
                          />
                          <div>
                            <h3 className="font-semibold text-lg">{show.name}</h3>
                            <div className="flex items-center gap-4 text-sm text-gray-500 mt-1">
                              <span>{show.video_count || 0} vídeos</span>
                              {show.total_load && <span>{show.total_load}</span>}
                              {show.vote_average && renderStars(show.vote_average)}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <button className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg">
                            <Edit className="w-4 h-4" />
                          </button>
                          <button className="p-2 text-gray-600 hover:bg-gray-50 rounded-lg">
                            <Settings className="w-4 h-4" />
                          </button>
                          <button className="p-2 text-red-600 hover:bg-red-50 rounded-lg">
                            <Trash2 className="w-4 h-4" />
                          </button>
                          <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                            Gerenciar
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modal de Detalhes */}
      {selectedCollection && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="relative">
              <img
                src={getImageUrl(selectedCollection.backdrop_path || selectedCollection.poster_path)}
                alt={selectedCollection.name}
                className="w-full h-64 object-cover"
                onError={(e) => {
                  e.currentTarget.src = '/collections/placeholder-collection.jpg'
                }}
              />
              <button
                onClick={() => setSelectedCollection(null)}
                className="absolute top-4 right-4 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-70"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold">{selectedCollection.name}</h2>
                <div className="flex items-center gap-2">
                  <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2">
                    <Edit className="w-4 h-4" />
                    Editar
                  </button>
                  <button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2">
                    <Plus className="w-4 h-4" />
                    Adicionar Vídeo
                  </button>
                </div>
              </div>
              
              {selectedCollection.overview && (
                <p className="text-gray-700 mb-6">{selectedCollection.overview}</p>
              )}
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Play className="w-5 h-5 text-blue-600" />
                    <span className="font-semibold">Vídeos</span>
                  </div>
                  <p className="text-2xl font-bold">{selectedCollection.video_count || 0}</p>
                </div>
                
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Clock className="w-5 h-5 text-purple-600" />
                    <span className="font-semibold">Duração</span>
                  </div>
                  <p className="text-2xl font-bold">{selectedCollection.total_load || '0h'}</p>
                </div>
                
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Star className="w-5 h-5 text-yellow-600" />
                    <span className="font-semibold">Avaliação</span>
                  </div>
                  <p className="text-2xl font-bold">{selectedCollection.vote_average?.toFixed(1) || '0.0'}</p>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                {selectedCollection.producer && (
                  <div>
                    <span className="font-semibold">Produtor:</span>
                    <p className="text-gray-700">{selectedCollection.producer}</p>
                  </div>
                )}
                
                {selectedCollection.first_air_date && (
                  <div>
                    <span className="font-semibold">Data de Lançamento:</span>
                    <p className="text-gray-700">{formatDate(selectedCollection.first_air_date)}</p>
                  </div>
                )}
                
                {selectedCollection.popularity && (
                  <div>
                    <span className="font-semibold">Popularidade:</span>
                    <p className="text-gray-700">{selectedCollection.popularity.toFixed(1)}</p>
                  </div>
                )}
                
                {selectedCollection.vote_count && (
                  <div>
                    <span className="font-semibold">Número de Avaliações:</span>
                    <p className="text-gray-700">{selectedCollection.vote_count}</p>
                  </div>
                )}
              </div>
              
              <div className="flex justify-end space-x-4">
                <button
                  onClick={() => setSelectedCollection(null)}
                  className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  Fechar
                </button>
                <button className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 flex items-center gap-2">
                  <Trash2 className="w-4 h-4" />
                  Excluir
                </button>
                <button className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2">
                  <Settings className="w-4 h-4" />
                  Configurar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}