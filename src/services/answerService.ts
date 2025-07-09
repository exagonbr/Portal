import { apiGet, apiPost, apiPut, apiDelete, apiPatch } from './apiService'

// Interfaces para Answer
export interface AnswerDto {
  id: string
  reply: string
  is_correct: boolean
  question_id: string
  date_created: string
  last_updated: string
  deleted: boolean
  version: number
}

export interface CreateAnswerDto {
  reply: string
  is_correct: boolean
  question_id: string
}

export interface UpdateAnswerDto {
  reply?: string
  is_correct?: boolean
  question_id?: string
}

export interface AnswerFilter {
  page?: number
  limit?: number
  search?: string
  question_id?: string
  is_correct?: boolean
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
const mapToAnswerDto = (data: any): AnswerDto => ({
  id: String(data.id),
  reply: data.reply || '',
  is_correct: Boolean(data.is_correct),
  question_id: String(data.question_id),
  date_created: data.date_created || new Date().toISOString(),
  last_updated: data.last_updated || new Date().toISOString(),
  deleted: Boolean(data.deleted),
  version: data.version || 1,
})

export const getAnswers = async (params: AnswerFilter): Promise<PaginatedResponse<AnswerDto>> => {
  try {
    const response = await apiGet<any>('/answers', params)
    console.log('🔍 [DEBUG] Resposta bruta da API de answers:', JSON.stringify(response, null, 2))
    
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
      console.warn('⚠️ [API] Formato de resposta não reconhecido para answers:', response)
      items = []
      total = 0
      totalPages = 0
    }

    return {
      items: items.map(mapToAnswerDto),
      total,
      page,
      limit,
      totalPages,
    }
  } catch (error) {
    console.error('❌ [API] Erro ao buscar answers:', error)
    
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

export const getAnswerById = async (id: string): Promise<AnswerDto> => {
  const response = await apiGet<any>(`/answers/${id}`)
  return mapToAnswerDto(response)
}

export const createAnswer = async (data: CreateAnswerDto): Promise<AnswerDto> => {
  const response = await apiPost<any>('/answers', data)
  return mapToAnswerDto(response)
}

export const updateAnswer = async (id: string, data: UpdateAnswerDto): Promise<AnswerDto> => {
  const response = await apiPut<any>(`/answers/${id}`, data)
  return mapToAnswerDto(response)
}

export const deleteAnswer = async (id: string): Promise<void> => {
  await apiDelete(`/answers/${id}`)
}

export const softDeleteAnswer = async (id: string): Promise<AnswerDto> => {
  const response = await apiPatch<any>(`/answers/${id}/soft-delete`, {})
  return mapToAnswerDto(response)
}

export const restoreAnswer = async (id: string): Promise<AnswerDto> => {
  const response = await apiPatch<any>(`/answers/${id}/restore`, {})
  return mapToAnswerDto(response)
}

export const getAnswersByQuestion = async (questionId: string): Promise<AnswerDto[]> => {
  const response = await apiGet<any[]>(`/answers/question/${questionId}`)
  return response.map(mapToAnswerDto)
}

export const getCorrectAnswers = async (): Promise<AnswerDto[]> => {
  const response = await apiGet<any[]>('/answers/correct')
  return response.map(mapToAnswerDto)
}

export const getAnswersStats = async (): Promise<any> => {
  return await apiGet<any>('/answers/stats')
}

export const answerService = {
  getAnswers,
  getAnswerById,
  createAnswer,
  updateAnswer,
  deleteAnswer,
  softDeleteAnswer,
  restoreAnswer,
  getAnswersByQuestion,
  getCorrectAnswers,
  getAnswersStats,
} 