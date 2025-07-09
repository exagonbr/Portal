import { apiGet, apiPost, apiPut, apiDelete, apiPatch } from './apiService'

// Interfaces para Files (tabela files do backend)
export interface FilesDto {
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

export interface CreateFilesDto {
  name: string
  content_type?: string
  extension?: string
  size?: number
  local_file?: string
  is_public?: boolean
  is_subtitled?: boolean
}

export interface UpdateFilesDto {
  name?: string
  content_type?: string
  extension?: string
  size?: number
  local_file?: string
  is_public?: boolean
  is_subtitled?: boolean
}

export interface FilesFilter {
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

export interface PaginatedResponse<T> {
  items: T[]
  total: number
  page: number
  limit: number
  totalPages: number
}

// Função para mapear a resposta da API para o DTO do frontend
const mapToFilesDto = (data: any): FilesDto => ({
  id: String(data.id),
  name: data.name || '',
  content_type: data.content_type,
  extension: data.extension,
  size: data.size ? Number(data.size) : undefined,
  local_file: data.local_file,
  is_public: Boolean(data.is_public),
  is_subtitled: Boolean(data.is_subtitled),
  date_created: data.date_created || new Date().toISOString(),
  last_updated: data.last_updated || new Date().toISOString(),
  deleted: Boolean(data.deleted),
  version: data.version || 1,
})

export const getFiles = async (params: FilesFilter): Promise<PaginatedResponse<FilesDto>> => {
  try {
    const response = await apiGet<any>('/files', params)
    console.log('🔍 [DEBUG] Resposta bruta da API de files:', JSON.stringify(response, null, 2))
    
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
      console.warn('⚠️ [API] Formato de resposta não reconhecido para files:', response)
      items = []
      total = 0
      totalPages = 0
    }

    return {
      items: items.map(mapToFilesDto),
      total,
      page,
      limit,
      totalPages,
    }
  } catch (error) {
    console.error('❌ [API] Erro ao buscar files:', error)
    
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

export const getFileById = async (id: string): Promise<FilesDto> => {
  const response = await apiGet<any>(`/files/${id}`)
  return mapToFilesDto(response)
}

export const createFile = async (data: CreateFilesDto): Promise<FilesDto> => {
  const response = await apiPost<any>('/files', data)
  return mapToFilesDto(response)
}

export const updateFile = async (id: string, data: UpdateFilesDto): Promise<FilesDto> => {
  const response = await apiPut<any>(`/files/${id}`, data)
  return mapToFilesDto(response)
}

export const deleteFile = async (id: string): Promise<void> => {
  await apiDelete(`/files/${id}`)
}

export const softDeleteFile = async (id: string): Promise<FilesDto> => {
  const response = await apiPatch<any>(`/files/${id}/soft-delete`, {})
  return mapToFilesDto(response)
}

export const restoreFile = async (id: string): Promise<FilesDto> => {
  const response = await apiPatch<any>(`/files/${id}/restore`, {})
  return mapToFilesDto(response)
}

export const getFilesByContentType = async (contentType: string): Promise<FilesDto[]> => {
  const response = await apiGet<any[]>(`/files/content-type/${contentType}`)
  return response.map(mapToFilesDto)
}

export const getPublicFiles = async (): Promise<FilesDto[]> => {
  const response = await apiGet<any[]>('/files/public')
  return response.map(mapToFilesDto)
}

export const getSubtitledFiles = async (): Promise<FilesDto[]> => {
  const response = await apiGet<any[]>('/files/subtitled')
  return response.map(mapToFilesDto)
}

export const getFilesStats = async (): Promise<any> => {
  return await apiGet<any>('/files/stats')
}

export const getTotalSize = async (): Promise<{ totalSize: number }> => {
  return await apiGet<{ totalSize: number }>('/files/total-size')
}

export const filesService = {
  getFiles,
  getFileById,
  createFile,
  updateFile,
  deleteFile,
  softDeleteFile,
  restoreFile,
  getFilesByContentType,
  getPublicFiles,
  getSubtitledFiles,
  getFilesStats,
  getTotalSize,
} 