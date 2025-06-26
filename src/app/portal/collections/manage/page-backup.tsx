'use client'

import React, { useState, useEffect } from 'react'
import { TVShowCollection, TVShowVideo, TVShowModuleStructure } from '@/types/collections'
import { Search, Filter, Clock, Play, Folder, Calendar, Star, Eye, BookOpen, FileText } from 'lucide-react'
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

  // Função simplificada para teste
  const loadTvShows = async () => {
    try {
      setIsLoading(true)
      setError(null)
      
      const response = await fetch('/api/tv-shows?page=1&limit=12')
      
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

  useEffect(() => {
    loadTvShows()
  }, [])

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Carregando coleções...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 text-xl mb-4">❌ Erro</div>
          <p className="text-gray-600">{error}</p>
          <button 
            onClick={loadTvShows}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Tentar novamente
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Gerenciamento de Coleções
          </h1>
          <p className="text-gray-600">
            Gerencie suas coleções de vídeos e conteúdo educacional
          </p>
        </div>

        {/* Estatísticas básicas */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
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
          
          <div className="bg-white rounded-lg shadow p-6">
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
          
          <div className="bg-white rounded-lg shadow p-6">
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
          
          <div className="bg-white rounded-lg shadow p-6">
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

        {/* Lista de coleções */}
        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">Coleções Disponíveis</h2>
          </div>
          
          <div className="p-6">
            {tvShows.length === 0 ? (
              <div className="text-center py-8">
                <Folder className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">Nenhuma coleção encontrada</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {tvShows.map((show) => (
                  <div key={show.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                    <h3 className="font-semibold text-gray-900 mb-2">{show.name}</h3>
                    {show.overview && (
                      <p className="text-sm text-gray-600 mb-3 line-clamp-3">{show.overview}</p>
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
                    
                    {show.vote_average && (
                      <div className="flex items-center gap-2 mt-2">
                        <Star className="w-4 h-4 text-yellow-500" />
                        <span className="text-sm text-gray-600">{show.vote_average}/10</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}