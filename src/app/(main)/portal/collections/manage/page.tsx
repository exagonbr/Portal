'use client'

import React, { useState, useEffect } from 'react'
import { TVShowCollection, TVShowVideo, TVShowModuleStructure } from '@/types/collections'
import { 
  Search, Filter, Clock, Play, Folder, Calendar, Star, Eye, BookOpen, FileText,
  Plus, Edit, Trash2, Save, X, Upload, Image, Video, FileVideo, AlertCircle,
  Check, ChevronDown, ChevronUp, Settings, MoreVertical, Download
} from 'lucide-react'
import { formatDate, formatYear } from '@/utils/date'
import DashboardLayout from '@/components/dashboard/DashboardLayout'
import { getCurrentToken } from '@/utils/token-validator'

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

interface TVShowFormData {
  name: string
  overview: string
  producer: string
  first_air_date: string
  contract_term_end: string
  popularity: number
  vote_average: number
  vote_count: number
  total_load: string
  manual_support_path: string
  original_language: string
  poster_image_file?: File
  backdrop_image_file?: File
}

interface VideoFormData {
  title: string
  description: string
  module_number: number
  episode_number: number
  duration_seconds: number
  video_file?: File
  thumbnail_file?: File
}

type ViewMode = 'list' | 'create' | 'edit' | 'videos' | 'video-create' | 'video-edit'

interface StatsData {
  totalCollections: number
  totalVideos: number
  totalDuration: string
  avgRating: number
}

export default function TVShowsManagePage() {
  // Estados principais
  const [tvShows, setTvShows] = useState<TVShowListItem[]>([])
  const [selectedTvShow, setSelectedTvShow] = useState<TVShowCollection | null>(null)
  const [selectedVideo, setSelectedVideo] = useState<TVShowVideo | null>(null)
  const [modules, setModules] = useState<TVShowModuleStructure>({})
  const [currentView, setCurrentView] = useState<ViewMode>('list')
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

  // Estados para formulários
  const [tvShowForm, setTvShowForm] = useState<TVShowFormData>({
    name: '',
    overview: '',
    producer: '',
    first_air_date: '',
    contract_term_end: '',
    popularity: 0,
    vote_average: 0,
    vote_count: 0,
    total_load: '',
    manual_support_path: '',
    original_language: 'pt-BR'
  })

  const [videoForm, setVideoForm] = useState<VideoFormData>({
    title: '',
    description: '',
    module_number: 1,
    episode_number: 1,
    duration_seconds: 0,
  })

  const [formErrors, setFormErrors] = useState<Record<string, string>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)

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

  // Estado removido - não é mais necessário

  // Funções de validação
  const validateTVShowForm = (): boolean => {
    const errors: Record<string, string> = {}
    
    if (!tvShowForm.name.trim()) errors.name = 'Nome é obrigatório'
    if (!tvShowForm.producer.trim()) errors.producer = 'Produtor é obrigatório'
    if (!tvShowForm.first_air_date) errors.first_air_date = 'Data de lançamento é obrigatória'
    if (!tvShowForm.contract_term_end) errors.contract_term_end = 'Data de término do contrato é obrigatória'
    
    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }

  const validateVideoForm = (): boolean => {
    const errors: Record<string, string> = {}
    
    if (!videoForm.title.trim()) errors.title = 'Título é obrigatório'
    if (videoForm.module_number < 1) errors.module_number = 'Número do módulo deve ser maior que 0'
    if (videoForm.episode_number < 1) errors.episode_number = 'Número do episódio deve ser maior que 0'
    
    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }

  // Funções CRUD para TV Shows
  const createTVShow = async (): Promise<boolean> => {
    if (!validateTVShowForm()) return false
    
    setIsSubmitting(true)
    try {
      const token = getAuthToken()
      if (!token) {
        alert('Erro de autenticação. Faça login novamente.')
        return false
      }

      const formData = new FormData()
      Object.entries(tvShowForm).forEach(([key, value]) => {
        if (value !== undefined && value !== null && key !== 'poster_image_file' && key !== 'backdrop_image_file') {
          formData.append(key, value.toString())
        }
      })

      if (tvShowForm.poster_image_file) {
        formData.append('poster_image', tvShowForm.poster_image_file)
      }
      if (tvShowForm.backdrop_image_file) {
        formData.append('backdrop_image', tvShowForm.backdrop_image_file)
      }

      const response = await fetch('https://portal.sabercon.com.br/api/tv-shows', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData
      })

      if (response.ok) {
        const data = await response.json()
        if (data.success) {
          alert('Coleção criada com sucesso!')
          resetTVShowForm()
          setCurrentView('list')
          loadTvShows()
          return true
        }
      }
      
      alert('Erro ao criar coleção. Tente novamente.')
      return false
    } catch (error) {
      console.log('Erro ao criar TV Show:', error)
      alert('Erro ao criar coleção. Tente novamente.')
      return false
    } finally {
      setIsSubmitting(false)
    }
  }

  const updateTVShow = async (): Promise<boolean> => {
    if (!validateTVShowForm() || !selectedTvShow) return false
    
    setIsSubmitting(true)
    try {
      const token = getAuthToken()
      if (!token) {
        alert('Erro de autenticação. Faça login novamente.')
        return false
      }

      const formData = new FormData()
      Object.entries(tvShowForm).forEach(([key, value]) => {
        if (value !== undefined && value !== null && key !== 'poster_image_file' && key !== 'backdrop_image_file') {
          formData.append(key, value.toString())
        }
      })

      if (tvShowForm.poster_image_file) {
        formData.append('poster_image', tvShowForm.poster_image_file)
      }
      if (tvShowForm.backdrop_image_file) {
        formData.append('backdrop_image', tvShowForm.backdrop_image_file)
      }

      const response = await fetch(`https://portal.sabercon.com.br/api/tv-shows/${selectedTvShow.id}`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData
      })

      if (response.ok) {
        const data = await response.json()
        if (data.success) {
          alert('Coleção atualizada com sucesso!')
          resetTVShowForm()
          setShowEditModal(false)
          setSelectedTvShow(null)
          loadTvShows()
          return true
        }
      }
      
      alert('Erro ao atualizar coleção. Tente novamente.')
      return false
    } catch (error) {
      console.log('Erro ao atualizar TV Show:', error)
      alert('Erro ao atualizar coleção. Tente novamente.')
      return false
    } finally {
      setIsSubmitting(false)
    }
  }

  const deleteTVShow = async (id: number): Promise<boolean> => {
    if (!confirm('Tem certeza que deseja excluir esta coleção? Esta ação não pode ser desfeita.')) {
      return false
    }

    try {
      const token = getAuthToken()
      if (!token) {
        alert('Erro de autenticação. Faça login novamente.')
        return false
      }

      const response = await fetch(`https://portal.sabercon.com.br/api/tv-shows/${id}`, {
        method: 'DELETE',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      if (response.ok) {
        const data = await response.json()
        if (data.success) {
          alert('Coleção excluída com sucesso!')
          loadTvShows()
          calculateStats()
          return true
        }
      }
      
      alert('Erro ao excluir coleção. Tente novamente.')
      return false
    } catch (error) {
      console.log('Erro ao excluir TV Show:', error)
      alert('Erro ao excluir coleção. Tente novamente.')
      return false
    }
  }

  // Funções auxiliares
  const resetTVShowForm = () => {
    setTvShowForm({
      name: '',
      overview: '',
      producer: '',
      first_air_date: '',
      contract_term_end: '',
      popularity: 0,
      vote_average: 0,
      vote_count: 0,
      total_load: '',
      manual_support_path: '',
      original_language: 'pt-BR'
    })
    setFormErrors({})
  }

  const resetVideoForm = () => {
    setVideoForm({
      title: '',
      description: '',
      module_number: 1,
      episode_number: 1,
      duration_seconds: 0,
    })
    setFormErrors({})
  }

  const loadTVShowForEdit = (tvShow: TVShowListItem) => {
    setTvShowForm({
      name: tvShow.name || '',
      overview: tvShow.overview || '',
      producer: tvShow.producer || '',
      first_air_date: tvShow.first_air_date || '',
      contract_term_end: tvShow.contract_term_end || '',
      popularity: tvShow.popularity || 0,
      vote_average: tvShow.vote_average || 0,
      vote_count: tvShow.vote_count || 0,
      total_load: tvShow.total_load || '',
      manual_support_path: '',
      original_language: 'pt-BR'
    })
    setSelectedTvShow(tvShow as TVShowCollection)
    setShowEditModal(true)
  }

  // Função para upload de arquivo
  const uploadFile = async (file: File, folder: string = 'tv-shows'): Promise<string | null> => {
    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('folder', folder)

      const response = await fetch('https://portal.sabercon.com.br/api/aws/upload', {
        method: 'POST',
        body: formData
      })

      if (!response.ok) {
        throw new Error('Erro no upload do arquivo')
      }

      const result = await response.json()
      return result.url || null
    } catch (error) {
      console.log('Erro no upload:', error)
      return null
    }
  }

  useEffect(() => {
    loadTvShows().then(() => {
      calculateStats()
    })
  }, [])

  const getAuthToken = (): string | null => {
    if (typeof window === 'undefined') {
      console.log('🔍 getAuthToken: Executando no servidor, retornando null')
      return null;
    }
    
    console.log('🔍 Buscando token de autenticação...')
    
    let token = localStorage.getItem('auth_token') || 
                localStorage.getItem('token') ||
                localStorage.getItem('authToken') ||
                sessionStorage.getItem('token') ||
                sessionStorage.getItem('auth_token');
    
    if (token) {
      console.log('✅ Token encontrado no storage:', token.substring(0, 20) + '...')
      return token;
    }
    
    // Buscar em cookies
    const cookies = document.cookie.split(';');
    for (const cookie of cookies) {
      const [name, value] = cookie.trim().split('=');
      if (name === 'auth_token' || name === 'token' || name === 'authToken') {
        token = decodeURIComponent(value);
        console.log('✅ Token encontrado nos cookies:', token.substring(0, 20) + '...')
        return token;
      }
    }
    
    // Tentar buscar de forma mais ampla
    const allStorageKeys = Object.keys(localStorage);
    console.log('🔍 Chaves disponíveis no localStorage:', allStorageKeys);
    
    for (const key of allStorageKeys) {
      if (key.toLowerCase().includes('token') || key.toLowerCase().includes('auth')) {
        const value = localStorage.getItem(key);
        if (value && value.length > 10) {
          console.log(`✅ Token encontrado na chave '${key}':`, value.substring(0, 20) + '...')
          return value;
        }
      }
    }
    
    console.log('❌ Nenhum token de autenticação encontrado!')
    console.log('💡 Verificando se existe sessão ativa...')
    
    // Em último caso, verificar se há dados de usuário logado
    const userData = localStorage.getItem('user') || sessionStorage.getItem('user');
    if (userData) {
      console.log('👤 Dados de usuário encontrados:', userData.substring(0, 50) + '...')
    }
    
    return null;
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
        Authorization: 'Bearer ' + getCurrentToken(),
        'Content-Type': 'application/json',
      }
      
      if (token) {
        headers['Authorization'] = `Bearer ${token}`
      }

      const response = await fetch(`https://portal.sabercon.com.br/api/tv-shows?${params}`, {
        headers
      })

      if (response.ok) {
        const data = await response.json()
        if (data.success) {
          const tvShowsData = data.data?.tvShows || []
          
          // Log para debug
          console.log('TV Shows carregados:', tvShowsData.length)
          console.log('Contagem de vídeos por show:', tvShowsData.map((show: TVShowListItem) => ({
            name: show.name,
            video_count: show.video_count
          })))
          
          setTvShows(tvShowsData)
          setTotalPages(data.data?.totalPages || 1)
          setCurrentPage(data.data?.page || 1)
          
          // Recalcular estatísticas após carregar os dados
          if (page === 1) {
            setTimeout(() => calculateStats(), 100)
          }
        }
      } else {
        console.log('Erro na resposta da API:', response.status, response.statusText)
      }
    } catch (error) {
      console.log('Erro ao carregar TV Shows:', error)
      setTvShows([])
    } finally {
      setIsLoading(false)
    }
  }

  const calculateStats = async () => {
    try {
      const token = getAuthToken()
      const headers: Record<string, string> = {
        Authorization: 'Bearer ' + getCurrentToken(),
        'Content-Type': 'application/json',
      }
      
      if (token) {
        headers['Authorization'] = `Bearer ${token}`
      }

      // Buscar TODAS as coleções para calcular estatísticas corretas
      const response = await fetch('https://portal.sabercon.com.br/api/tv-shows?page=1&limit=10000', { headers })
      
      if (response.ok) {
        const data = await response.json()
        if (data.success && data.data?.tvShows) {
          const allCollections = data.data.tvShows
          
          const totalCollections = allCollections.length
          
          // Somar TODOS os vídeos de TODAS as coleções ativas
          let totalVideos = 0
          let totalMinutes = 0
          let ratingsSum = 0
          let ratingsCount = 0
          let collectionsWithVideos = 0
          
          console.log('=== CALCULANDO TOTAL DE VÍDEOS ===')
          console.log('Total de coleções encontradas:', allCollections.length)
          
          allCollections.forEach((show: TVShowListItem, index: number) => {
            // Contar vídeos - somar TODOS os vídeos de cada coleção
            let videoCount = show.video_count || 0
            
            // VALIDAÇÃO: Detectar valores absurdos e resetar para 0
            if (videoCount > 10000) {
              console.log(`🚨 VALOR ABSURDO DETECTADO: ${show.name} tem ${videoCount} vídeos - RESETANDO PARA 0`)
              videoCount = 0
            }
            
            if (videoCount > 0) {
              totalVideos += videoCount
              collectionsWithVideos++
              console.log(`${index + 1}. ${show.name}: ${videoCount} vídeos (total acumulado: ${totalVideos})`)
            } else {
              console.log(`${index + 1}. ${show.name}: 0 vídeos`)
            }
            
            // Calcular duração total
            if (show.total_load) {
              // Tentar diferentes formatos de duração
              let match = show.total_load.match(/(\d+)h\s*(\d+)m?/)
              if (!match) {
                match = show.total_load.match(/(\d+)h/)
                if (match) {
                  totalMinutes += parseInt(match[1]) * 60
                }
              } else {
                totalMinutes += parseInt(match[1]) * 60 + (parseInt(match[2]) || 0)
              }
              
              // Tentar formato apenas minutos
              if (!match) {
                const minutesMatch = show.total_load.match(/(\d+)m/)
                if (minutesMatch) {
                  totalMinutes += parseInt(minutesMatch[1])
                }
              }
            }
            
            // Calcular média de avaliação
            if (show.vote_average && show.vote_average > 0) {
              ratingsSum += show.vote_average
              ratingsCount++
            }
          })
          
          const hours = Math.floor(totalMinutes / 60)
          const minutes = totalMinutes % 60
          const totalDuration = totalMinutes > 0 ? `${hours}h ${minutes}m` : '0h 0m'
          
          const avgRating = ratingsCount > 0 ? Math.round((ratingsSum / ratingsCount) * 10) / 10 : 0
          
          console.log('=== RESULTADO FINAL ===')
          console.log('Total de coleções:', totalCollections)
          console.log('Coleções com vídeos:', collectionsWithVideos)
          console.log('TOTAL DE VÍDEOS:', totalVideos)
          console.log('Duração total:', totalDuration)
          console.log('Avaliação média:', avgRating)
          console.log('========================')
          
          setStats({
            totalCollections,
            totalVideos,
            totalDuration,
            avgRating
          })
        }
      }
    } catch (error) {
      console.log('Erro ao calcular estatísticas:', error)
      
      // Em caso de erro, calcular com base nos dados já carregados
      const fallbackTotalVideos = tvShows.reduce((sum, show) => {
        const videoCount = show.video_count || 0
        return sum + videoCount
      }, 0)
      
      console.log('Fallback - Total de vídeos calculado:', fallbackTotalVideos)
      
      setStats({
        totalCollections: tvShows.length,
        totalVideos: fallbackTotalVideos,
        totalDuration: '0h 0m',
        avgRating: 0
      })
    }
  }

  const loadTvShowDetails = async (id: number) => {
    try {
      setIsLoading(true)
      
      // Função removida para simplificar
      
      const token = getAuthToken()
      const headers: Record<string, string> = {
        Authorization: 'Bearer ' + getCurrentToken(),
        'Content-Type': 'application/json',
      }
      
      if (token) {
        headers['Authorization'] = `Bearer ${token}`
      }

      const response = await fetch(`https://portal.sabercon.com.br/api/tv-shows/${id}`, { headers })
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
      console.log('Erro ao carregar detalhes do TV Show:', error)
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

  // Função simplificada para visualizar vídeos (placeholder)
  const handleWatchSession = (moduleKey: string, moduleVideos: TVShowVideo[]) => {
    alert(`Visualizar sessão ${moduleKey} com ${moduleVideos.length} vídeos (funcionalidade em desenvolvimento)`)
  }

  const handleWatchVideo = (video: any, videoTitle: string) => {
    alert(`Reproduzir vídeo: ${videoTitle} (funcionalidade em desenvolvimento)`)
  }

  // Componente do Modal de Edição
  const EditModal = () => {
    if (!showEditModal) return null

    return (
      <div className="fixed inset-0 z-50 overflow-y-auto">
        {/* Backdrop */}
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity" 
             onClick={() => {
               setShowEditModal(false)
               resetTVShowForm()
               setSelectedTvShow(null)
             }} />
        
        {/* Modal Container */}
        <div className="flex min-h-full items-center justify-center p-4">
          <div className="relative w-full max-w-4xl transform overflow-hidden rounded-2xl bg-gradient-to-br from-white via-blue-50 to-indigo-100 shadow-2xl transition-all border border-blue-200">
            
            {/* Header do Modal */}
            <div className="relative bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-700 px-8 py-6">
              <div className="absolute inset-0 bg-black/10"></div>
              <div className="relative flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-white/20 backdrop-blur-sm rounded-xl border border-white/30">
                    <Edit className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-white">Editar Coleção</h2>
                    <p className="text-blue-100 text-sm">Atualize as informações da coleção educativa</p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setShowEditModal(false)
                    resetTVShowForm()
                    setSelectedTvShow(null)
                  }}
                  className="p-2 text-white/80 hover:text-white hover:bg-white/20 rounded-lg transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>

            {/* Conteúdo do Modal */}
            <div className="p-8 max-h-[70vh] overflow-y-auto">
              <form onSubmit={(e) => {
                e.preventDefault()
                updateTVShow()
              }}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Nome */}
                  <div className="md:col-span-2">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      <span className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                        Nome da Coleção *
                      </span>
                    </label>
                    <input
                      type="text"
                      value={tvShowForm.name}
                      onChange={(e) => setTvShowForm({...tvShowForm, name: e.target.value})}
                      className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all duration-200 bg-white/80 backdrop-blur-sm ${
                        formErrors.name ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="Ex: Matemática Fundamental"
                    />
                    {formErrors.name && <p className="text-red-500 text-sm mt-1">{formErrors.name}</p>}
                  </div>

                  {/* Produtor */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      <span className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        Produtor *
                      </span>
                    </label>
                    <input
                      type="text"
                      value={tvShowForm.producer}
                      onChange={(e) => setTvShowForm({...tvShowForm, producer: e.target.value})}
                      className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-4 focus:ring-green-100 focus:border-green-500 transition-all duration-200 bg-white/80 backdrop-blur-sm ${
                        formErrors.producer ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="Ex: Portal Educacional"
                    />
                    {formErrors.producer && <p className="text-red-500 text-sm mt-1">{formErrors.producer}</p>}
                  </div>

                  {/* Data de Lançamento */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      <span className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                        Data de Lançamento *
                      </span>
                    </label>
                    <input
                      type="date"
                      value={tvShowForm.first_air_date}
                      onChange={(e) => setTvShowForm({...tvShowForm, first_air_date: e.target.value})}
                      className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-4 focus:ring-purple-100 focus:border-purple-500 transition-all duration-200 bg-white/80 backdrop-blur-sm ${
                        formErrors.first_air_date ? 'border-red-500' : 'border-gray-300'
                      }`}
                    />
                    {formErrors.first_air_date && <p className="text-red-500 text-sm mt-1">{formErrors.first_air_date}</p>}
                  </div>

                  {/* Data de Término do Contrato */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      <span className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                        Término do Contrato *
                      </span>
                    </label>
                    <input
                      type="date"
                      value={tvShowForm.contract_term_end}
                      onChange={(e) => setTvShowForm({...tvShowForm, contract_term_end: e.target.value})}
                      className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-4 focus:ring-orange-100 focus:border-orange-500 transition-all duration-200 bg-white/80 backdrop-blur-sm ${
                        formErrors.contract_term_end ? 'border-red-500' : 'border-gray-300'
                      }`}
                    />
                    {formErrors.contract_term_end && <p className="text-red-500 text-sm mt-1">{formErrors.contract_term_end}</p>}
                  </div>

                  {/* Popularidade */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      <span className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-pink-500 rounded-full"></div>
                        Popularidade (0-100)
                      </span>
                    </label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={tvShowForm.popularity}
                      onChange={(e) => setTvShowForm({...tvShowForm, popularity: Number(e.target.value)})}
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-4 focus:ring-pink-100 focus:border-pink-500 transition-all duration-200 bg-white/80 backdrop-blur-sm"
                    />
                  </div>

                  {/* Avaliação */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      <span className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                        Avaliação (0-10)
                      </span>
                    </label>
                    <input
                      type="number"
                      min="0"
                      max="10"
                      step="0.1"
                      value={tvShowForm.vote_average}
                      onChange={(e) => setTvShowForm({...tvShowForm, vote_average: Number(e.target.value)})}
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-4 focus:ring-yellow-100 focus:border-yellow-500 transition-all duration-200 bg-white/80 backdrop-blur-sm"
                    />
                  </div>

                  {/* Duração Total */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      <span className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-teal-500 rounded-full"></div>
                        Duração Total
                      </span>
                    </label>
                    <input
                      type="text"
                      value={tvShowForm.total_load}
                      onChange={(e) => setTvShowForm({...tvShowForm, total_load: e.target.value})}
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-4 focus:ring-teal-100 focus:border-teal-500 transition-all duration-200 bg-white/80 backdrop-blur-sm"
                      placeholder="Ex: 5h 30m"
                    />
                  </div>

                  {/* Idioma */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      <span className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-indigo-500 rounded-full"></div>
                        Idioma
                      </span>
                    </label>
                    <select
                      value={tvShowForm.original_language}
                      onChange={(e) => setTvShowForm({...tvShowForm, original_language: e.target.value})}
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-4 focus:ring-indigo-100 focus:border-indigo-500 transition-all duration-200 bg-white/80 backdrop-blur-sm"
                    >
                      <option value="pt-BR">Português (Brasil)</option>
                      <option value="en">Inglês</option>
                      <option value="es">Espanhol</option>
                    </select>
                  </div>
                </div>

                {/* Sinopse */}
                <div className="mt-6">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    <span className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-rose-500 rounded-full"></div>
                      Sinopse
                    </span>
                  </label>
                  <textarea
                    value={tvShowForm.overview}
                    onChange={(e) => setTvShowForm({...tvShowForm, overview: e.target.value})}
                    rows={4}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-4 focus:ring-rose-100 focus:border-rose-500 transition-all duration-200 bg-white/80 backdrop-blur-sm"
                    placeholder="Descreva o conteúdo da coleção..."
                  />
                </div>

                {/* Upload de Imagens */}
                <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Poster */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      <span className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-cyan-500 rounded-full"></div>
                        Imagem do Poster
                      </span>
                    </label>
                    <div className="border-2 border-dashed border-cyan-300 rounded-xl p-6 text-center bg-cyan-50/50 hover:bg-cyan-50 transition-colors">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                          const file = e.target.files?.[0]
                          if (file) {
                            setTvShowForm({...tvShowForm, poster_image_file: file})
                          }
                        }}
                        className="hidden"
                        id="poster-upload-modal"
                      />
                      <label htmlFor="poster-upload-modal" className="cursor-pointer">
                        <Image className="w-8 h-8 text-cyan-500 mx-auto mb-2" />
                        <p className="text-sm text-cyan-700 font-medium">Clique para selecionar imagem</p>
                        {tvShowForm.poster_image_file && (
                          <p className="text-xs text-green-600 mt-1 font-semibold">{tvShowForm.poster_image_file.name}</p>
                        )}
                      </label>
                    </div>
                  </div>

                  {/* Backdrop */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      <span className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                        Imagem de Fundo
                      </span>
                    </label>
                    <div className="border-2 border-dashed border-emerald-300 rounded-xl p-6 text-center bg-emerald-50/50 hover:bg-emerald-50 transition-colors">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                          const file = e.target.files?.[0]
                          if (file) {
                            setTvShowForm({...tvShowForm, backdrop_image_file: file})
                          }
                        }}
                        className="hidden"
                        id="backdrop-upload-modal"
                      />
                      <label htmlFor="backdrop-upload-modal" className="cursor-pointer">
                        <Image className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
                        <p className="text-sm text-emerald-700 font-medium">Clique para selecionar imagem</p>
                        {tvShowForm.backdrop_image_file && (
                          <p className="text-xs text-green-600 mt-1 font-semibold">{tvShowForm.backdrop_image_file.name}</p>
                        )}
                      </label>
                    </div>
                  </div>
                </div>

                {/* Botões */}
                <div className="mt-8 flex items-center justify-end gap-4 pt-6 border-t border-gray-200">
                  <button
                    type="button"
                    onClick={() => {
                      setShowEditModal(false)
                      resetTVShowForm()
                      setSelectedTvShow(null)
                    }}
                    className="px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 hover:border-gray-400 transition-all duration-200 font-medium"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-8 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 flex items-center gap-2"
                  >
                    {isSubmitting ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                        Salvando...
                      </>
                    ) : (
                      <>
                        <Save className="w-5 h-5" />
                        Salvar Alterações
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Função removida - não é mais necessária

  // Renderização dos formulários
  const renderTVShowForm = () => (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-gray-900">
          {currentView === 'create' ? 'Nova Coleção' : 'Editar Coleção'}
        </h2>
        <button
          onClick={() => {
            resetTVShowForm()
            setCurrentView('list')
          }}
          className="text-gray-500 hover:text-gray-700"
        >
          <X className="w-6 h-6" />
        </button>
      </div>

      <form onSubmit={(e) => {
        e.preventDefault()
        if (currentView === 'create') {
          createTVShow()
        } else {
          updateTVShow()
        }
      }}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Nome */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nome da Coleção *
            </label>
            <input
              type="text"
              value={tvShowForm.name}
              onChange={(e) => setTvShowForm({...tvShowForm, name: e.target.value})}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                formErrors.name ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Ex: Matemática Fundamental"
            />
            {formErrors.name && <p className="text-red-500 text-sm mt-1">{formErrors.name}</p>}
          </div>

          {/* Produtor */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Produtor *
            </label>
            <input
              type="text"
              value={tvShowForm.producer}
              onChange={(e) => setTvShowForm({...tvShowForm, producer: e.target.value})}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                formErrors.producer ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Ex: Portal Educacional"
            />
            {formErrors.producer && <p className="text-red-500 text-sm mt-1">{formErrors.producer}</p>}
          </div>

          {/* Data de Lançamento */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Data de Lançamento *
            </label>
            <input
              type="date"
              value={tvShowForm.first_air_date}
              onChange={(e) => setTvShowForm({...tvShowForm, first_air_date: e.target.value})}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                formErrors.first_air_date ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {formErrors.first_air_date && <p className="text-red-500 text-sm mt-1">{formErrors.first_air_date}</p>}
          </div>

          {/* Data de Término do Contrato */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Término do Contrato *
            </label>
            <input
              type="date"
              value={tvShowForm.contract_term_end}
              onChange={(e) => setTvShowForm({...tvShowForm, contract_term_end: e.target.value})}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                formErrors.contract_term_end ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {formErrors.contract_term_end && <p className="text-red-500 text-sm mt-1">{formErrors.contract_term_end}</p>}
          </div>

          {/* Popularidade */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Popularidade (0-100)
            </label>
            <input
              type="number"
              min="0"
              max="100"
              value={tvShowForm.popularity}
              onChange={(e) => setTvShowForm({...tvShowForm, popularity: Number(e.target.value)})}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* Avaliação */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Avaliação (0-10)
            </label>
            <input
              type="number"
              min="0"
              max="10"
              step="0.1"
              value={tvShowForm.vote_average}
              onChange={(e) => setTvShowForm({...tvShowForm, vote_average: Number(e.target.value)})}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* Duração Total */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Duração Total (ex: 10h 30m)
            </label>
            <input
              type="text"
              value={tvShowForm.total_load}
              onChange={(e) => setTvShowForm({...tvShowForm, total_load: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Ex: 5h 30m"
            />
          </div>

          {/* Idioma */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Idioma
            </label>
            <select
              value={tvShowForm.original_language}
              onChange={(e) => setTvShowForm({...tvShowForm, original_language: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="pt-BR">Português (Brasil)</option>
              <option value="en">Inglês</option>
              <option value="es">Espanhol</option>
            </select>
          </div>
        </div>

        {/* Sinopse */}
        <div className="mt-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Sinopse
          </label>
          <textarea
            value={tvShowForm.overview}
            onChange={(e) => setTvShowForm({...tvShowForm, overview: e.target.value})}
            rows={4}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Descreva o conteúdo da coleção..."
          />
        </div>

        {/* Upload de Imagens */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Poster */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Imagem do Poster
            </label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
              <input
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files?.[0]
                  if (file) {
                    setTvShowForm({...tvShowForm, poster_image_file: file})
                  }
                }}
                className="hidden"
                id="poster-upload"
              />
              <label htmlFor="poster-upload" className="cursor-pointer">
                <Image className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                <p className="text-sm text-gray-600">Clique para selecionar imagem</p>
                {tvShowForm.poster_image_file && (
                  <p className="text-xs text-green-600 mt-1">{tvShowForm.poster_image_file.name}</p>
                )}
              </label>
            </div>
          </div>

          {/* Backdrop */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Imagem de Fundo
            </label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
              <input
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files?.[0]
                  if (file) {
                    setTvShowForm({...tvShowForm, backdrop_image_file: file})
                  }
                }}
                className="hidden"
                id="backdrop-upload"
              />
              <label htmlFor="backdrop-upload" className="cursor-pointer">
                <Image className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                <p className="text-sm text-gray-600">Clique para selecionar imagem</p>
                {tvShowForm.backdrop_image_file && (
                  <p className="text-xs text-green-600 mt-1">{tvShowForm.backdrop_image_file.name}</p>
                )}
              </label>
            </div>
          </div>
        </div>

        {/* Botões */}
        <div className="mt-8 flex items-center justify-end gap-4">
          <button
            type="button"
            onClick={() => {
              resetTVShowForm()
              setCurrentView('list')
            }}
            className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
          >
            {isSubmitting ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                Salvando...
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                {currentView === 'create' ? 'Criar Coleção' : 'Salvar Alterações'}
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  )

  if (currentView === 'create') {
    return (
      <DashboardLayout>
        <div className="space-y-6">
          {renderTVShowForm()}
        </div>
      </DashboardLayout>
    )
  }

  if (currentView === 'videos' && selectedTvShow) {
    return (

        <div className="w-full space-y-6">
          <div className="flex items-center justify-between">
            <button 
              onClick={() => setCurrentView('list')}
              className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
            >
              ← Voltar para Lista
            </button>
            
          </div>
          
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="text-center py-12">
              <Video className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-600 mb-2">Visualização de Vídeos</h3>
              <p className="text-gray-500">
                Use a nova página de administração para gerenciar coleções com mais funcionalidades.
              </p>
              <button
                onClick={() => window.open('/portal/collections/admin', '_blank')}
                className="mt-4 flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors mx-auto"
              >
                <Settings className="w-5 h-5" />
                Ir para Administração
              </button>
            </div>
          </div>
        </div>
    )
  }

  return (

      <div className="space-y-6">
        {/* Header da Página */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">
                Gerenciar Coleções Educativas
              </h1>
              <p className="text-gray-600">
                Crie, edite e gerencie todo o conteúdo educacional da plataforma
              </p>
            </div>
            <button
              onClick={() => {
                resetTVShowForm()
                setCurrentView('create')
              }}
              className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-md hover:shadow-lg"
            >
              <Plus className="w-5 h-5" />
              Nova Coleção
            </button>
          </div>
        </div>

        {/* Cards de Estatísticas - Layout Melhorado */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
          {/* Card Total de Coleções */}
          <div className="group relative overflow-hidden bg-gradient-to-br from-blue-500 via-indigo-600 to-purple-700 rounded-2xl shadow-2xl hover:shadow-3xl transition-all duration-500 border-2 border-blue-300 transform hover:-translate-y-2 hover:scale-105">
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12 transform translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>
            <div className="absolute inset-0 opacity-30">
              <div className="absolute top-4 left-8 w-2 h-2 bg-white rounded-full animate-pulse"></div>
              <div className="absolute top-8 right-12 w-1 h-1 bg-blue-200 rounded-full animate-ping"></div>
              <div className="absolute bottom-8 left-12 w-1.5 h-1.5 bg-indigo-200 rounded-full animate-pulse delay-300"></div>
              <div className="absolute bottom-12 right-8 w-1 h-1 bg-purple-200 rounded-full animate-ping delay-500"></div>
            </div>
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
            <div className="absolute inset-0 opacity-30">
              <div className="absolute top-4 left-8 w-2 h-2 bg-white rounded-full animate-pulse"></div>
              <div className="absolute top-8 right-12 w-1 h-1 bg-emerald-200 rounded-full animate-ping"></div>
              <div className="absolute bottom-8 left-12 w-1.5 h-1.5 bg-teal-200 rounded-full animate-pulse delay-300"></div>
              <div className="absolute bottom-12 right-8 w-1 h-1 bg-cyan-200 rounded-full animate-ping delay-500"></div>
            </div>
            <div className="relative p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-white/20 backdrop-blur-sm rounded-xl shadow-lg group-hover:scale-110 transition-transform duration-300 border border-white/30">
                  <Play className="w-6 h-6 text-white" />
                </div>
                <div className="text-right">
                  <p className="text-3xl font-bold text-white">{stats.totalVideos}</p>
                  <div className="flex items-center justify-end gap-2 mt-2">
                    <div className="w-3 h-3 bg-lime-400 rounded-full animate-pulse shadow-lg"></div>
                    <span className="text-sm text-emerald-100 font-semibold tracking-wide">VÍDEOS</span>
                  </div>
                </div>
              </div>
              <div>
                <h3 className="text-xl font-bold text-white mb-1">Total de Vídeos</h3>
                <p className="text-emerald-100 text-sm">Conteúdo disponível</p>
              </div>
            </div>
          </div>

          {/* Card Duração Total */}
          <div className="group relative overflow-hidden bg-gradient-to-br from-purple-500 via-violet-600 to-fuchsia-700 rounded-2xl shadow-2xl hover:shadow-3xl transition-all duration-500 border-2 border-purple-300 transform hover:-translate-y-2 hover:scale-105">
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12 transform translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>
            <div className="absolute inset-0 opacity-30">
              <div className="absolute top-4 left-8 w-2 h-2 bg-white rounded-full animate-pulse"></div>
              <div className="absolute top-8 right-12 w-1 h-1 bg-purple-200 rounded-full animate-ping"></div>
              <div className="absolute bottom-8 left-12 w-1.5 h-1.5 bg-violet-200 rounded-full animate-pulse delay-300"></div>
              <div className="absolute bottom-12 right-8 w-1 h-1 bg-fuchsia-200 rounded-full animate-ping delay-500"></div>
            </div>
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
            <div className="absolute inset-0 opacity-30">
              <div className="absolute top-4 left-8 w-2 h-2 bg-white rounded-full animate-pulse"></div>
              <div className="absolute top-8 right-12 w-1 h-1 bg-amber-200 rounded-full animate-ping"></div>
              <div className="absolute bottom-8 left-12 w-1.5 h-1.5 bg-orange-200 rounded-full animate-pulse delay-300"></div>
              <div className="absolute bottom-12 right-8 w-1 h-1 bg-red-200 rounded-full animate-ping delay-500"></div>
            </div>
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

        {/* Barra de Busca e Filtros - Design Melhorado */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-4 mb-6">
          <div className="flex flex-col lg:flex-row gap-4 mb-4">
            {/* Busca com Design Melhorado */}
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

            {/* Botão de Filtros com Design Melhorado */}
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
              {showFilters && (
                <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
              )}
            </button>
          </div>

          {/* Painel de Filtros com Animação */}
          {showFilters && (
            <div className="border-t-2 border-gray-100 pt-6 animate-fade-in">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
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
                      <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                      Duração Mín. (horas)
                    </span>
                  </label>
                  <input
                    type="number"
                    placeholder="0"
                    value={filters.minDuration}
                    onChange={(e) => setFilters({...filters, minDuration: e.target.value})}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-4 focus:ring-purple-100 focus:border-purple-500 transition-all duration-200"
                  />
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    <span className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                      Duração Máx. (horas)
                    </span>
                  </label>
                  <input
                    type="number"
                    placeholder="100"
                    value={filters.maxDuration}
                    onChange={(e) => setFilters({...filters, maxDuration: e.target.value})}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-4 focus:ring-purple-100 focus:border-purple-500 transition-all duration-200"
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

        {/* Grid de Coleções - Layout Melhorado */}
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
                  <span>{stats.totalVideos} vídeos</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
              {filteredTvShows.map((tvShow) => (
              <div
                key={tvShow.id}
                className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 overflow-hidden group border border-gray-100 hover:border-blue-200 transform hover:-translate-y-2"
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
                        <span>
                          {tvShow.video_count && tvShow.video_count > 0 
                            ? `${tvShow.video_count} vídeo${tvShow.video_count > 1 ? 's' : ''}`
                            : 'Coleção disponível'
                          }
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Conteúdo do Card - Layout Melhorado */}
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

                  {/* Estatísticas do card - Design Melhorado */}
                  <div className="space-y-3 mb-4">
                    {/* Vídeos - Destaque */}
                    <div className="flex items-center gap-3 p-3 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border border-green-100">
                      <div className="p-2 bg-green-500 rounded-lg">
                        <Play className="w-4 h-4 text-white" />
                      </div>
                      <div>
                        <p className="font-semibold text-green-700">
                          {tvShow.video_count && tvShow.video_count > 0 
                            ? `${tvShow.video_count} vídeo${tvShow.video_count > 1 ? 's' : ''}`
                            : 'Vídeos disponíveis'
                          }
                        </p>
                        <p className="text-xs text-green-600">Conteúdo educacional</p>
                      </div>
                    </div>
                    
                    {/* Duração e Avaliação */}
                    <div className="flex items-center gap-3">
                      {tvShow.total_load && (
                        <div className="flex items-center gap-2 text-sm text-gray-600 bg-gray-50 px-3 py-2 rounded-lg">
                          <Clock className="w-4 h-4 text-purple-500" />
                          <span className="font-medium">{tvShow.total_load}</span>
                        </div>
                      )}
                      
                      {tvShow.vote_average && tvShow.vote_average > 0 && (
                        <div className="flex items-center gap-2 text-sm text-gray-600 bg-amber-50 px-3 py-2 rounded-lg">
                          <Star className="w-4 h-4 text-amber-500" />
                          <span className="font-medium">{tvShow.vote_average}/10</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {tvShow.overview && (
                    <div className="mb-4">
                      {/* Container da descrição simplificado */}
                      <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                        <div className="flex items-start gap-2">
                          <svg className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h4v10h-10z"/>
                          </svg>
                          <p className="text-sm text-gray-700 leading-relaxed line-clamp-3">
                            {tvShow.overview}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                {/* Footer do Card com Ações */}
                <div className="pt-4 border-t border-gray-100 space-y-3">
                  {/* Informações */}
                  <div className="flex items-center justify-between">
                    {tvShow.first_air_date && (
                      <div className="flex items-center gap-2 text-xs text-gray-500">
                        <Calendar className="w-3 h-3" />
                        <span>{formatYear(tvShow.first_air_date)}</span>
                      </div>
                    )}
                    
                    <div className="flex items-center gap-1 text-xs text-gray-600">
                      <span>ID: {tvShow.id}</span>
                    </div>
                  </div>

                  {/* Botões de Ação - Layout Responsivo */}
                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                    {/* Botão Ver Vídeos - Principal */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        loadTvShowDetails(tvShow.id)
                        setCurrentView('videos')
                      }}
                      className="flex-1 flex items-center justify-center gap-2 px-3 py-2.5 sm:py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors text-sm font-medium border border-blue-200 hover:border-blue-300"
                    >
                      <Play className="w-4 h-4" />
                      <span className="hidden xs:inline">Ver Vídeos</span>
                      <span className="xs:hidden">Vídeos</span>
                    </button>
                    
                    {/* Botões Secundários */}
                    <div className="flex gap-2 sm:gap-1">
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          loadTVShowForEdit(tvShow)
                        }}
                        className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-3 py-2.5 sm:py-2 bg-amber-50 text-amber-600 rounded-lg hover:bg-amber-100 transition-colors text-sm font-medium border border-amber-200 hover:border-amber-300"
                      >
                        <Edit className="w-4 h-4" />
                        <span className="hidden sm:inline">Editar</span>
                      </button>
                      
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          deleteTVShow(tvShow.id)
                        }}
                        className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-3 py-2.5 sm:py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors text-sm font-medium border border-red-200 hover:border-red-300"
                      >
                        <Trash2 className="w-4 h-4" />
                        <span className="hidden sm:inline">Excluir</span>
                      </button>
                    </div>
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
          <button
            onClick={() => {
              resetTVShowForm()
              setCurrentView('create')
            }}
            className="mt-4 flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors mx-auto"
          >
            <Plus className="w-5 h-5" />
            Criar Primeira Coleção
          </button>
        </div>
      )}

      {/* Modal de Edição */}
      <EditModal />
    </div>
  )

  // Renderização simplificada para visualização de vídeos
  if (currentView === 'videos' && selectedTvShow) {
    return (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <button 
              onClick={() => setCurrentView('list')}
              className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
            >
              ← Voltar para Lista
            </button>
            
            <h1 className="text-2xl font-bold text-gray-900">
              Vídeos: {selectedTvShow?.name || 'Coleção'}
            </h1>
            
            <button
              onClick={() => loadTVShowForEdit(selectedTvShow as TVShowListItem)}
              className="flex items-center gap-2 px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors"
            >
              <Edit className="w-4 h-4" />
              Editar Coleção
            </button>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="text-center py-12">
              <Video className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-600 mb-2">Gerenciamento de Vídeos</h3>
              <p className="text-gray-500 mb-6">
                Esta funcionalidade está em desenvolvimento. Em breve você poderá adicionar e gerenciar vídeos para esta coleção.
              </p>
              <div className="flex items-center justify-center gap-4">
                <button
                  disabled
                  className="flex items-center gap-2 px-6 py-3 bg-gray-300 text-gray-500 rounded-lg cursor-not-allowed"
                >
                  <Plus className="w-5 h-5" />
                  Adicionar Vídeo (Em breve)
                </button>
                
                <button
                  disabled
                  className="flex items-center gap-2 px-6 py-3 bg-gray-300 text-gray-500 rounded-lg cursor-not-allowed"
                >
                  <Upload className="w-5 h-5" />
                  Upload em Lote (Em breve)
                </button>
              </div>
            </div>
          </div>
        </div>
    )
  }

  // Fallback - retorna null se nenhuma condição for atendida
  return null
}