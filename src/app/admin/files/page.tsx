'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { useToast } from '@/components/ToastManager'
import { filesService } from '@/services/filesService'
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
  File,
  FileText,
  FileVideo,
  FileImage,
  FileAudio,
  Download,
  Upload,
  RefreshCw,
  Filter,
  X,
  Calendar,
  HardDrive,
  Globe,
  Lock,
  Subtitles
} from 'lucide-react'

// Interfaces para tipos
interface FilesDto {
  id: string
  name: string
  content_type?: string
  extension?: string
  size?: number
  local_file?: string
  is_public?: boolean
  is_subtitled?: boolean
  date_created: string
  last_updated: string
  deleted: boolean
  version: number
}

interface FilesFilter {
  page?: number
  limit?: number
  search?: string
  content_type?: string
  is_public?: boolean
  is_subtitled?: boolean
  deleted?: boolean
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
}

interface FilesStats {
  totalFiles: number
  activeFiles: number
  deletedFiles: number
  publicFiles: number
  privateFiles: number
  subtitledFiles: number
  totalSize: number
  filesByType: Record<string, number>
}

interface PaginatedResponse<T> {
  items: T[]
  total: number
  page: number
  limit: number
  totalPages: number
}

export default function AdminFilesPage() {
  const { showSuccess, showError, showWarning } = useToast()
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const router = useRouter()
  
  // Dados principais
  const [files, setFiles] = useState<FilesDto[]>([])

  // Paginação e Filtros
  const [totalItems, setTotalItems] = useState(0)
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage] = useState(10)
  const [searchQuery, setSearchQuery] = useState('')
  const [filters, setFilters] = useState<FilesFilter>({})
  const [showFilterPanel, setShowFilterPanel] = useState(false)

  // Modais
  const [modalOpen, setModalOpen] = useState(false)
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create')
  const [selectedFile, setSelectedFile] = useState<FilesDto | null>(null)

  // Estatísticas
  const [stats, setStats] = useState<FilesStats>({
    totalFiles: 0,
    activeFiles: 0,
    deletedFiles: 0,
    publicFiles: 0,
    privateFiles: 0,
    subtitledFiles: 0,
    totalSize: 0,
    filesByType: {},
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

  const calculateStats = useCallback((allFiles: FilesDto[]) => {
    const totalFiles = allFiles.length
    const activeFiles = allFiles.filter(f => !f.deleted).length
    const deletedFiles = totalFiles - activeFiles
    const publicFiles = allFiles.filter(f => f.is_public && !f.deleted).length
    const privateFiles = activeFiles - publicFiles
    const subtitledFiles = allFiles.filter(f => f.is_subtitled && !f.deleted).length
    
    const totalSize = allFiles
      .filter(f => !f.deleted)
      .reduce((sum, f) => sum + (f.size || 0), 0)
    
    const filesByType = allFiles.reduce((acc, file) => {
      if (file.deleted) return acc
      const type = file.content_type?.split('/')[0] || 'unknown'
      acc[type] = (acc[type] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    setStats({ totalFiles, activeFiles, deletedFiles, publicFiles, privateFiles, subtitledFiles, totalSize, filesByType })
  }, [])

  const fetchPageData = useCallback(async (page = 1, search = '', currentFilters: FilesFilter = {}, showLoadingIndicator = true) => {
    if (showLoadingIndicator) setLoading(true)
    else setRefreshing(true)

    try {
      console.log('🔄 [FILES] Carregando dados da página...', { page, search, currentFilters })
      
      const params: FilesFilter = {
        page,
        limit: itemsPerPage,
        sortBy: 'date_created',
        sortOrder: 'desc',
        search: search || undefined,
        ...currentFilters,
      }

      console.log('🔄 [FILES] Carregando files com parâmetros:', params)
      
      try {
        const response = await filesService.getFiles(params) as PaginatedResponse<FilesDto>
        console.log('✅ [FILES] Resposta do serviço:', {
          items: response.items?.length || 0,
          total: response.total,
          page: response.page,
          format: Array.isArray(response.items) ? 'PaginatedResponse' : 'unknown'
        })
        
        if (!response || !Array.isArray(response.items)) {
          console.error('❌ [FILES] Formato de resposta inválido:', response);
          throw new Error('Formato de resposta inválido do servidor');
        }
        
        setFiles(response.items || [])
        setTotalItems(response.total || 0)
        setCurrentPage(page)

        // Calcular stats com todos os arquivos para uma visão geral
        try {
          const allFilesResponse = await filesService.getFiles({ limit: 1000 }) as PaginatedResponse<FilesDto>;
          calculateStats(allFilesResponse.items || []);
        } catch (statsError) {
          console.warn('⚠️ [FILES] Erro ao calcular estatísticas:', statsError)
          calculateStats(response.items || []);
        }

        if (!showLoadingIndicator) {
          showSuccess("Lista de arquivos atualizada com sucesso!")
        }
        
        console.log('✅ [FILES] Arquivos carregados com sucesso:', response.items.length);
      } catch (error: any) {
        console.error('❌ [FILES] Erro ao carregar arquivos:', error)
        if (error.message?.includes('Sessão expirada') || error.message?.includes('não autenticado')) {
          return handleAuthError()
        }
        throw error
      }
    } catch (error) {
      console.error('❌ [FILES] Erro ao carregar dados:', error)
      showError("Erro ao carregar arquivos. Verifique sua conexão e tente novamente.")
      setFiles([])
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

  const handleFilterChange = (key: keyof FilesFilter, value: any) => {
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

  const handleDeleteFile = async (file: FilesDto) => {
    if (!window.confirm(`Tem certeza que deseja excluir o arquivo "${file.name}"?`)) {
      return
    }

    try {
      await filesService.deleteFile(file.id)
      showSuccess("Arquivo excluído com sucesso!")
      fetchPageData(currentPage, searchQuery, filters, false)
    } catch (error: any) {
      console.error('Erro ao excluir arquivo:', error)
      if (error.message?.includes('Sessão expirada') || error.message?.includes('não autenticado')) {
        return handleAuthError()
      }
      showError("Erro ao excluir arquivo. Tente novamente.")
    }
  }

  const openModal = (mode: 'create' | 'edit', file?: FilesDto) => {
    setModalMode(mode)
    setSelectedFile(file || null)
    setModalOpen(true)
  }

  const closeModal = () => {
    setModalOpen(false)
    setSelectedFile(null)
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
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB']
    const i = Math.floor(Math.log(bytes) / Math.log(1024))
    return Math.round((bytes / Math.pow(1024, i)) * 100) / 100 + ' ' + sizes[i]
  }

  const formatTotalSize = (bytes: number) => {
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB']
    const i = Math.floor(Math.log(bytes) / Math.log(1024))
    return Math.round((bytes / Math.pow(1024, i)) * 100) / 100 + ' ' + sizes[i]
  }

  const getFileIcon = (contentType?: string) => {
    if (!contentType) return <File className="w-5 h-5" />
    
    if (contentType.startsWith('video/')) return <FileVideo className="w-5 h-5" />
    if (contentType.startsWith('image/')) return <FileImage className="w-5 h-5" />
    if (contentType.startsWith('audio/')) return <FileAudio className="w-5 h-5" />
    if (contentType.startsWith('text/') || contentType.includes('document')) return <FileText className="w-5 h-5" />
    
    return <File className="w-5 h-5" />
  }

  const getFileTypeColor = (contentType?: string) => {
    if (!contentType) return 'bg-gray-100 text-gray-600'
    
    if (contentType.startsWith('video/')) return 'bg-red-100 text-red-600'
    if (contentType.startsWith('image/')) return 'bg-green-100 text-green-600'
    if (contentType.startsWith('audio/')) return 'bg-purple-100 text-purple-600'
    if (contentType.startsWith('text/') || contentType.includes('document')) return 'bg-blue-100 text-blue-600'
    
    return 'bg-gray-100 text-gray-600'
  }

  const totalPages = Math.ceil(totalItems / itemsPerPage)

  return (
    <div className="container mx-auto px-4 py-6 max-w-7xl">
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Gerenciamento de Arquivos</h1>
              <p className="text-gray-600 mt-1">Administre todos os arquivos do sistema</p>
            </div>
            <div className="flex gap-3">
              <Button onClick={handleRefresh} variant="outline" disabled={refreshing} className="flex items-center gap-2">
                <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
                Atualizar
              </Button>
              <Button onClick={() => openModal('create')} className="flex items-center gap-2">
                <Plus className="w-4 h-4" />
                Novo Arquivo
              </Button>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-6 gap-4 mb-6">
            <StatCard icon={File} title="Total" value={stats.totalFiles} subtitle="Arquivos" color="blue" />
            <StatCard icon={File} title="Ativos" value={stats.activeFiles} subtitle="Arquivos ativos" color="green" />
            <StatCard icon={Globe} title="Públicos" value={stats.publicFiles} subtitle="Arquivos públicos" color="emerald" />
            <StatCard icon={Lock} title="Privados" value={stats.privateFiles} subtitle="Arquivos privados" color="orange" />
            <StatCard icon={Subtitles} title="Legendados" value={stats.subtitledFiles} subtitle="Com legendas" color="purple" />
            <StatCard icon={HardDrive} title="Tamanho" value={formatTotalSize(stats.totalSize)} subtitle="Total ocupado" color="indigo" />
          </div>

          {/* Search & Filter Trigger */}
          <div className="flex gap-3">
            <form onSubmit={handleSearch} className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Buscar arquivos..."
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
                <label className="block text-sm font-medium mb-1 text-gray-700">Visibilidade</label>
                <select
                  value={filters.is_public === undefined ? '' : String(filters.is_public)}
                  onChange={(e) => handleFilterChange('is_public', e.target.value === '' ? undefined : e.target.value === 'true')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                >
                  <option value="">Todos</option>
                  <option value="true">Públicos</option>
                  <option value="false">Privados</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1 text-gray-700">Legendas</label>
                <select
                  value={filters.is_subtitled === undefined ? '' : String(filters.is_subtitled)}
                  onChange={(e) => handleFilterChange('is_subtitled', e.target.value === '' ? undefined : e.target.value === 'true')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                >
                  <option value="">Todos</option>
                  <option value="true">Com legendas</option>
                  <option value="false">Sem legendas</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1 text-gray-700">Tipo de Conteúdo</label>
                <input
                  type="text"
                  placeholder="ex: video/mp4, image/png..."
                  value={filters.content_type || ''}
                  onChange={(e) => handleFilterChange('content_type', e.target.value)}
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
              <span className="ml-2 text-gray-600">Carregando arquivos...</span>
            </div>
          ) : files.length === 0 ? (
            <div className="text-center py-12">
              <File className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 text-lg mb-2">Nenhum arquivo encontrado</p>
              <p className="text-gray-400 text-sm">{searchQuery || Object.keys(filters).length > 0 ? "Tente ajustar sua busca ou filtros." : "Clique em \"Novo Arquivo\" para adicionar o primeiro"}</p>
            </div>
          ) : (
            <>
              {/* Desktop Table */}
              <div className="hidden lg:block overflow-x-auto">
                <table className="w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Arquivo</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tipo/Tamanho</th>
                      <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Propriedades</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Data de Criação</th>
                      <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Ações</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {files.map((file) => (
                      <tr key={file.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4">
                          <div className="flex items-center">
                            <div className={`flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center ${getFileTypeColor(file.content_type)}`}>
                              {getFileIcon(file.content_type)}
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">{file.name}</div>
                              <div className="text-xs text-gray-500">
                                {file.extension && `.${file.extension}`}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900">
                          <div>
                            <div>{file.content_type || 'N/A'}</div>
                            <div className="text-xs text-gray-500">{formatFileSize(file.size)}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <div className="flex justify-center gap-1 flex-wrap">
                            <Badge variant={file.is_public ? 'success' : 'secondary'} size="sm">
                              {file.is_public ? 'Público' : 'Privado'}
                            </Badge>
                            {file.is_subtitled && (
                              <Badge variant="info" size="sm">Legendado</Badge>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900">{formatDate(file.date_created)}</td>
                        <td className="px-6 py-4 text-center">
                          <Badge variant={!file.deleted ? 'success' : 'danger'}>
                            {!file.deleted ? 'Ativo' : 'Excluído'}
                          </Badge>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <div className="flex items-center justify-center space-x-2">
                            <Button variant="ghost" size="sm" className="text-green-600 hover:text-green-900">
                              <Download className="w-4 h-4" />
                            </Button>
                            <Button variant="ghost" size="sm" onClick={() => openModal('edit', file)} className="text-blue-600 hover:text-blue-900">
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button variant="ghost" size="sm" onClick={() => handleDeleteFile(file)} className="text-red-600 hover:text-red-900">
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
                {files.map(file => (
                  <div key={file.id} className="bg-white border border-gray-200 rounded-lg shadow-sm">
                    <div className="p-4 border-b border-gray-100 flex justify-between items-start">
                      <div className="flex-1 flex items-start">
                        <div className={`flex-shrink-0 w-12 h-12 rounded-lg flex items-center justify-center ${getFileTypeColor(file.content_type)} mr-3`}>
                          {getFileIcon(file.content_type)}
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-800">{file.name}</h3>
                          <p className="text-sm text-gray-500">{file.content_type || 'Tipo não identificado'}</p>
                          <p className="text-xs text-gray-400">{formatFileSize(file.size)}</p>
                        </div>
                      </div>
                      <div className="flex flex-col gap-1 items-end">
                        <Badge variant={!file.deleted ? 'success' : 'danger'} size="sm">
                          {!file.deleted ? 'Ativo' : 'Excluído'}
                        </Badge>
                        <Badge variant={file.is_public ? 'success' : 'secondary'} size="sm">
                          {file.is_public ? 'Público' : 'Privado'}
                        </Badge>
                      </div>
                    </div>
                    <div className="p-4 space-y-2">
                      <div className="flex items-center text-sm">
                        <Calendar className="w-4 h-4 mr-2 text-gray-400"/>
                        {formatDate(file.date_created)}
                      </div>
                      {file.is_subtitled && (
                        <div className="flex items-center text-sm">
                          <Subtitles className="w-4 h-4 mr-2 text-gray-400"/>
                          Arquivo com legendas
                        </div>
                      )}
                      {file.local_file && (
                        <div className="flex items-center text-sm">
                          <HardDrive className="w-4 h-4 mr-2 text-gray-400"/>
                          Arquivo local: {file.local_file}
                        </div>
                      )}
                    </div>
                    <div className="p-4 border-t border-gray-100 flex justify-end space-x-2">
                      <Button variant="outline" size="sm">
                        <Download className="w-4 h-4 mr-1" />
                        Download
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => openModal('edit', file)}>Editar</Button>
                      <Button variant="destructive" size="sm" onClick={() => handleDeleteFile(file)}>Excluir</Button>
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

      {/* Modal TODO: Implementar FileFormModal */}
      {modalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold">
                {modalMode === 'create' ? 'Novo Arquivo' : 'Editar Arquivo'}
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