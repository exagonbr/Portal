'use client'

import React, { useState, useEffect } from 'react'
import { 
  Plus, Edit, Trash2, Save, X, Upload, Image, Video, Search, Filter,
  Clock, Play, Folder, Calendar, Star, Eye, BookOpen, FileText,
  AlertCircle, Check, ChevronDown, ChevronUp, Settings, MoreVertical
} from 'lucide-react'
import DashboardLayout from '@/components/dashboard/DashboardLayout'
import { getCurrentToken } from '@/utils/token-validator'

interface TVShow {
  id: number
  name: string
  overview?: string
  producer?: string
  first_air_date?: string
  contract_term_end?: string
  popularity?: number
  vote_average?: number
  vote_count?: number
  total_load?: string
  manual_support_path?: string
  original_language?: string
  poster_image_url?: string
  backdrop_image_url?: string
  video_count?: number
  created_at?: string
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

type ViewMode = 'list'

export default function TVShowAdminPage() {
  // Estados principais
  const [tvShows, setTvShows] = useState<TVShow[]>([])
  const [selectedTvShow, setSelectedTvShow] = useState<TVShow | null>(null)
  const [currentView, setCurrentView] = useState<ViewMode>('list')
  const [isLoading, setIsLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  
  // Estados para modais
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)

  // Estados para formulário
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

  const [formErrors, setFormErrors] = useState<Record<string, string>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Função para obter token de autenticação
  const getAuthToken = (): string | null => {
    if (typeof window === 'undefined') return null
    return localStorage.getItem('auth_token') || 
           localStorage.getItem('token') ||
           sessionStorage.getItem('token')
  }

  // Funções de validação
  const validateForm = (): boolean => {
    const errors: Record<string, string> = {}
    
    if (!tvShowForm.name.trim()) errors.name = 'Nome é obrigatório'
    if (!tvShowForm.producer.trim()) errors.producer = 'Produtor é obrigatório'
    if (!tvShowForm.first_air_date) errors.first_air_date = 'Data de lançamento é obrigatória'
    if (!tvShowForm.contract_term_end) errors.contract_term_end = 'Data de término do contrato é obrigatória'
    
    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }

  // Funções CRUD
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
      };
      
      if (token) {
        headers['Authorization'] = `Bearer ${token}`
      }

      const response = await fetch(`https://portal.sabercon.com.br/api/tv-shows?${params}`, { headers })

      if (response.ok) {
        const data = await response.json()
        if (data.success) {
          setTvShows(data.data?.tvShows || [])
          setTotalPages(data.data?.totalPages || 1)
          setCurrentPage(data.data?.page || 1)
        }
      }
    } catch (error) {
      console.log('Erro ao carregar TV Shows:', error)
      setTvShows([])
    } finally {
      setIsLoading(false)
    }
  }

  const createTVShow = async (): Promise<boolean> => {
    if (!validateForm()) return false
    
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
          resetForm()
          setShowCreateModal(false)
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
    if (!validateForm() || !selectedTvShow) return false
    
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
          resetForm()
          setShowEditModal(false)
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
  const resetForm = () => {
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
    setSelectedTvShow(null)
  }

  const loadForEdit = (tvShow: TVShow) => {
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
      manual_support_path: tvShow.manual_support_path || '',
      original_language: tvShow.original_language || 'pt-BR'
    })
    setSelectedTvShow(tvShow)
    setShowEditModal(true)
  }

  const handleSearch = (term: string) => {
    setSearchTerm(term)
    setCurrentPage(1)
    loadTvShows(1, term)
  }

  // Carregar dados iniciais
  useEffect(() => {
    loadTvShows()
  }, [])

  // Componente Modal de Criação
  const CreateModal = () => {
    if (!showCreateModal) return null

    return (
      <div className="fixed inset-0 z-50 overflow-y-auto">
        {/* Backdrop */}
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity" 
             onClick={() => {
               setShowCreateModal(false)
               resetForm()
             }} />
        
        {/* Modal Container */}
        <div className="flex min-h-full items-center justify-center p-4">
          <div className="relative w-full max-w-4xl transform overflow-hidden rounded-2xl bg-gradient-to-br from-white via-green-50 to-emerald-100 shadow-2xl transition-all border border-green-200">
            
            {/* Header do Modal */}
            <div className="relative bg-gradient-to-r from-green-600 via-emerald-600 to-teal-700 px-8 py-6">
              <div className="absolute inset-0 bg-black/10"></div>
              <div className="relative flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-white/20 backdrop-blur-sm rounded-xl border border-white/30">
                    <Plus className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-white">Nova Coleção</h2>
                    <p className="text-green-100 text-sm">Crie uma nova coleção educativa</p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setShowCreateModal(false)
                    resetForm()
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
                createTVShow()
              }}>
                {renderFormFields()}
                
                {/* Botões */}
                <div className="mt-8 flex items-center justify-end gap-4 pt-6 border-t border-gray-200">
                  <button
                    type="button"
                    onClick={() => {
                      setShowCreateModal(false)
                      resetForm()
                    }}
                    className="px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 hover:border-gray-400 transition-all duration-200 font-medium"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-8 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl hover:from-green-700 hover:to-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 flex items-center gap-2"
                  >
                    {isSubmitting ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                        Criando...
                      </>
                    ) : (
                      <>
                        <Save className="w-5 h-5" />
                        Criar Coleção
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

  // Componente Modal de Edição
  const EditModal = () => {
    if (!showEditModal) return null

    return (
      <div className="fixed inset-0 z-50 overflow-y-auto">
        {/* Backdrop */}
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity" 
             onClick={() => {
               setShowEditModal(false)
               resetForm()
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
                    <p className="text-blue-100 text-sm">Atualize as informações da coleção</p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setShowEditModal(false)
                    resetForm()
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
                {renderFormFields()}
                
                {/* Botões */}
                <div className="mt-8 flex items-center justify-end gap-4 pt-6 border-t border-gray-200">
                  <button
                    type="button"
                    onClick={() => {
                      setShowEditModal(false)
                      resetForm()
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

  // Função para renderizar os campos do formulário (reutilizada nos modais)
  const renderFormFields = () => (
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

      {/* Sinopse */}
      <div className="md:col-span-2">
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
      <div className="md:col-span-2">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
      </div>
    </div>
  )



  return (
      <div className="space-y-6">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">
                Administração de Coleções
              </h1>
              <p className="text-gray-600">
                Gerencie todas as coleções educacionais da plataforma
              </p>
            </div>
            <button
              onClick={() => {
                resetForm()
                setShowCreateModal(true)
              }}
              className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-md hover:shadow-lg"
            >
              <Plus className="w-5 h-5" />
              Nova Coleção
            </button>
          </div>
        </div>

        {/* Busca */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Buscar coleções por nome, produtor..."
              value={searchTerm}
              onChange={(e) => handleSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>

        {/* Lista de Coleções */}
        {isLoading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {tvShows.map((tvShow) => (
              <div
                key={tvShow.id}
                className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow"
              >
                {/* Imagem */}
                <div className="aspect-video bg-gray-100 relative">
                  {tvShow.poster_image_url ? (
                    <img
                      src={tvShow.poster_image_url}
                      alt={tvShow.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Video className="w-12 h-12 text-gray-400" />
                    </div>
                  )}
                </div>

                {/* Conteúdo */}
                <div className="p-4">
                  <h3 className="font-semibold text-lg text-gray-900 mb-2 line-clamp-1">
                    {tvShow.name}
                  </h3>
                  
                  {tvShow.producer && (
                    <p className="text-sm text-gray-600 mb-2">
                      Produtor: {tvShow.producer}
                    </p>
                  )}

                  {tvShow.overview && (
                    <p className="text-sm text-gray-700 mb-3 line-clamp-2">
                      {tvShow.overview}
                    </p>
                  )}

                  <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                    <span>{tvShow.video_count || 0} vídeos</span>
                    {tvShow.vote_average && (
                      <div className="flex items-center gap-1">
                        <Star className="w-4 h-4 text-yellow-400" />
                        <span>{tvShow.vote_average}/10</span>
                      </div>
                    )}
                  </div>

                  {/* Botões de Ação */}
                  <div className="flex gap-2">
                    <button
                      onClick={() => loadForEdit(tvShow)}
                      className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors text-sm font-medium"
                    >
                      <Edit className="w-4 h-4" />
                      Editar
                    </button>
                    
                    <button
                      onClick={() => deleteTVShow(tvShow.id)}
                      className="flex items-center justify-center gap-2 px-3 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors text-sm font-medium"
                    >
                      <Trash2 className="w-4 h-4" />
                      Excluir
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Estado vazio */}
        {!isLoading && tvShows.length === 0 && (
          <div className="text-center py-12">
            <Folder className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-600 mb-2">
              {searchTerm ? 'Nenhuma coleção encontrada' : 'Nenhuma coleção cadastrada'}
            </h3>
            <p className="text-gray-500 mb-6">
              {searchTerm 
                ? 'Tente ajustar os termos de busca'
                : 'Comece criando sua primeira coleção educacional'
              }
            </p>
            {!searchTerm && (
              <button
                onClick={() => {
                  resetForm()
                  setShowCreateModal(true)
                }}
                className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors mx-auto"
              >
                <Plus className="w-5 h-5" />
                Criar Primeira Coleção
              </button>
            )}
          </div>
        )}

        {/* Paginação */}
        {totalPages > 1 && (
          <div className="flex justify-center">
            <div className="flex gap-2">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <button
                  key={page}
                  onClick={() => {
                    setCurrentPage(page)
                    loadTvShows(page, searchTerm)
                  }}
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

        {/* Modais */}
        <CreateModal />
        <EditModal />
      </div>
  )
} 