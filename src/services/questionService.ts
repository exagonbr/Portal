import { apiGet, apiPost, apiPut, apiDelete, apiPatch } from './apiService'

// Interfaces para Question
export interface QuestionDto {
  id: string
  test: string
  file_id?: string
  tv_show_id?: string
  episode_id?: string
  date_created: string
  last_updated: string
  deleted: boolean
  version: number
}

export interface CreateQuestionDto {
  test: string
  file_id?: string
  tv_show_id?: string
  episode_id?: string
}

export interface UpdateQuestionDto {
  test?: string
  file_id?: string
  tv_show_id?: string
  episode_id?: string
}

export interface QuestionFilter {
  page?: number
  limit?: number
  search?: string
  tv_show_id?: string
  episode_id?: string
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
const mapToQuestionDto = (data: any): QuestionDto => ({
  id: String(data.id),
  test: data.test || '',
  file_id: data.file_id ? String(data.file_id) : undefined,
  tv_show_id: data.tv_show_id ? String(data.tv_show_id) : undefined,
  episode_id: data.episode_id ? String(data.episode_id) : undefined,
  date_created: data.date_created || new Date().toISOString(),
  last_updated: data.last_updated || new Date().toISOString(),
  deleted: Boolean(data.deleted),
  version: data.version || 1,
})

export const getQuestions = async (params: QuestionFilter): Promise<PaginatedResponse<QuestionDto>> => {
  try {
    const response = await apiGet<any>('/questions', params)
    console.log('🔍 [DEBUG] Resposta bruta da API de questions:', JSON.stringify(response, null, 2))
    
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
      console.warn('⚠️ [API] Formato de resposta não reconhecido para questions:', response)
      items = []
      total = 0
      totalPages = 0
    }

    return {
      items: items.map(mapToQuestionDto),
      total,
      page,
      limit,
      totalPages,
    }
  } catch (error) {
    console.error('❌ [API] Erro ao buscar questions:', error)
    
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

export const getQuestionById = async (id: string): Promise<QuestionDto> => {
  const response = await apiGet<any>(`/questions/${id}`)
  return mapToQuestionDto(response)
}

export const createQuestion = async (data: CreateQuestionDto): Promise<QuestionDto> => {
  const response = await apiPost<any>('/questions', data)
  return mapToQuestionDto(response)
}

export const updateQuestion = async (id: string, data: UpdateQuestionDto): Promise<QuestionDto> => {
  const response = await apiPut<any>(`/questions/${id}`, data)
  return mapToQuestionDto(response)
}

export const deleteQuestion = async (id: string): Promise<void> => {
  await apiDelete(`/questions/${id}`)
}

export const softDeleteQuestion = async (id: string): Promise<QuestionDto> => {
  const response = await apiPatch<any>(`/questions/${id}/soft-delete`, {})
  return mapToQuestionDto(response)
}

export const restoreQuestion = async (id: string): Promise<QuestionDto> => {
  const response = await apiPatch<any>(`/questions/${id}/restore`, {})
  return mapToQuestionDto(response)
}

export const getQuestionsByTvShow = async (tvShowId: string): Promise<QuestionDto[]> => {
  const response = await apiGet<any[]>(`/questions/tv-show/${tvShowId}`)
  return response.map(mapToQuestionDto)
}

export const getQuestionsByEpisode = async (episodeId: string): Promise<QuestionDto[]> => {
  const response = await apiGet<any[]>(`/questions/episode/${episodeId}`)
  return response.map(mapToQuestionDto)
}

export const getQuestionsStats = async (): Promise<any> => {
  return await apiGet<any>('/questions/stats')
}

export const questionService = {
  getQuestions,
  getQuestionById,
  createQuestion,
  updateQuestion,
  deleteQuestion,
  softDeleteQuestion,
  restoreQuestion,
  getQuestionsByTvShow,
  getQuestionsByEpisode,
  getQuestionsStats,
} 