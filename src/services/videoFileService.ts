import { apiGet, apiPost, apiPut, apiDelete, apiPatch } from './apiService'

// Interfaces para VideoFile
export interface VideoFileDto {
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

export interface CreateVideoFileDto {
  video_files_id: string
  file_id: string
}

export interface UpdateVideoFileDto {
  video_files_id?: string
  file_id?: string
}

export interface VideoFileFilter {
  page?: number
  limit?: number
  search?: string
  video_id?: string
  file_id?: string
  deleted?: boolean
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
}

export interface PaginatedResponse<T> {
  items: T[]
  total: number
  page: number
  limit: number
  totalPages: number
}

// Função para mapear a resposta da API para o DTO do frontend
const mapToVideoFileDto = (data: any): VideoFileDto => ({
  id: String(data.id),
  video_files_id: String(data.video_files_id),
  file_id: String(data.file_id),
  date_created: data.date_created || new Date().toISOString(),
  last_updated: data.last_updated || new Date().toISOString(),
  deleted: Boolean(data.deleted),
  version: data.version || 1,
  video: data.video ? {
    id: String(data.video.id),
    title: data.video.title,
    name: data.video.name,
    class: data.video.class,
  } : undefined,
  file: data.file ? {
    id: String(data.file.id),
    name: data.file.name,
    content_type: data.file.content_type,
    size: data.file.size,
    is_public: data.file.is_public,
  } : undefined,
})

export const getVideoFiles = async (params: VideoFileFilter): Promise<PaginatedResponse<VideoFileDto>> => {
  try {
    const response = await apiGet<any>('/video-files', params)
    console.log('🔍 [DEBUG] Resposta bruta da API de video-files:', JSON.stringify(response, null, 2))
    
    // Verificar diferentes formatos de resposta da API
    let items: any[] = []
    let total = 0
    let page = params.page || 1
    let limit = params.limit || 10
    let totalPages = 0

    // Verificar se a resposta tem o formato padrão PaginatedResponse
    if (response && response.items && Array.isArray(response.items)) {
      items = response.items
      total = response.total || 0
      page = response.page || page
      limit = response.limit || limit
      totalPages = response.totalPages || Math.ceil(total / limit)
    }
    // Verificar se a resposta tem formato ApiResponse com data
    else if (response && response.data && response.data.items && Array.isArray(response.data.items)) {
      items = response.data.items
      total = response.data.total || 0
      page = response.data.page || page
      limit = response.data.limit || limit
      totalPages = response.data.totalPages || Math.ceil(total / limit)
    }
    // Verificar se a resposta é diretamente um array
    else if (response && Array.isArray(response)) {
      items = response
      total = response.length
      totalPages = Math.ceil(total / limit)
    }
    // Se não conseguiu identificar o formato, usar valores padrão
    else {
      console.warn('⚠️ [API] Formato de resposta não reconhecido para video-files:', response)
      items = []
      total = 0
      totalPages = 0
    }

    return {
      items: items.map(mapToVideoFileDto),
      total,
      page,
      limit,
      totalPages,
    }
  } catch (error) {
    console.error('❌ [API] Erro ao buscar video-files:', error)
    
    // Retornar uma resposta vazia em caso de erro
    return {
      items: [],
      total: 0,
      page: params.page || 1,
      limit: params.limit || 10,
      totalPages: 0,
    }
  }
}

export const getVideoFileById = async (id: string): Promise<VideoFileDto> => {
  const response = await apiGet<any>(`/video-files/${id}`)
  return mapToVideoFileDto(response)
}

export const createVideoFile = async (data: CreateVideoFileDto): Promise<VideoFileDto> => {
  const response = await apiPost<any>('/video-files', data)
  return mapToVideoFileDto(response)
}

export const updateVideoFile = async (id: string, data: UpdateVideoFileDto): Promise<VideoFileDto> => {
  const response = await apiPut<any>(`/video-files/${id}`, data)
  return mapToVideoFileDto(response)
}

export const deleteVideoFile = async (id: string): Promise<void> => {
  await apiDelete(`/video-files/${id}`)
}

export const softDeleteVideoFile = async (id: string): Promise<VideoFileDto> => {
  const response = await apiPatch<any>(`/video-files/${id}/soft-delete`, {})
  return mapToVideoFileDto(response)
}

export const restoreVideoFile = async (id: string): Promise<VideoFileDto> => {
  const response = await apiPatch<any>(`/video-files/${id}/restore`, {})
  return mapToVideoFileDto(response)
}

export const getVideoFilesByVideo = async (videoId: string): Promise<VideoFileDto[]> => {
  const response = await apiGet<any[]>(`/video-files/video/${videoId}`)
  return response.map(mapToVideoFileDto)
}

export const getVideoFilesByFile = async (fileId: string): Promise<VideoFileDto[]> => {
  const response = await apiGet<any[]>(`/video-files/file/${fileId}`)
  return response.map(mapToVideoFileDto)
}

export const getVideoFilesStats = async (): Promise<any> => {
  return await apiGet<any>('/video-files/stats')
}

export const videoFileService = {
  getVideoFiles,
  getVideoFileById,
  createVideoFile,
  updateVideoFile,
  deleteVideoFile,
  softDeleteVideoFile,
  restoreVideoFile,
  getVideoFilesByVideo,
  getVideoFilesByFile,
  getVideoFilesStats,
} 