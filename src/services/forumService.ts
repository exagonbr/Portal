import {
  ForumThreadDto,
  CreateForumThreadDto,
  UpdateForumThreadDto,
  ForumThreadFilter,
  ForumReplyDto,
  CreateForumReplyDto,
} from '@/types/forum';
import {
  PaginatedResponse,
  ForumThreadResponseDto as ApiForumThreadResponseDto,
  ForumReplyResponseDto as ApiForumReplyResponseDto,
} from '@/types/api';
import { apiGet, apiPost, apiPut, apiDelete } from './apiService';

// Função para mapear a resposta da API para o DTO do frontend
const mapToForumThreadDto = (data: ApiForumThreadResponseDto): ForumThreadDto => ({
  id: data.id,
  class_id: data.class_id,
  title: data.title,
  content: data.content,
  author_id: data.author_id,
  tags: data.tags,
  pinned: data.pinned,
  locked: data.locked,
  views: data.views,
  created_at: data.created_at,
  updated_at: data.updated_at,
});

const mapToForumReplyDto = (data: ApiForumReplyResponseDto): ForumReplyDto => ({
    id: data.id,
    thread_id: data.thread_id,
    parent_reply_id: data.parent_reply_id,
    content: data.content,
    author_id: data.author_id,
    likes: data.likes.length,
    created_at: data.created_at,
    updated_at: data.updated_at,
});

export const getForumThreads = async (params: ForumThreadFilter): Promise<PaginatedResponse<ForumThreadDto>> => {
  try {
    const response = await apiGet<any>('/forum/threads', params);
    console.log('🔍 [DEBUG] Resposta bruta da API de forum threads:', JSON.stringify(response, null, 2));
    
    // Verificar diferentes formatos de resposta da API
    let items: ApiForumThreadResponseDto[] = [];
    let total = 0;
    let page = params.page || 1;
    let limit = params.limit || 10;
    let totalPages = 0;

    // Verificar se a resposta tem o formato padrão PaginatedResponse
    if (response && response.items && Array.isArray(response.items)) {
      items = response.items;
      total = response.total || 0;
      page = response.page || page;
      limit = response.limit || limit;
      totalPages = response.totalPages || Math.ceil(total / limit);
    }
    // Verificar se a resposta tem formato ApiResponse com data
    else if (response && response.data && response.data.items && Array.isArray(response.data.items)) {
      items = response.data.items;
      total = response.data.total || 0;
      page = response.data.page || page;
      limit = response.data.limit || limit;
      totalPages = response.data.totalPages || Math.ceil(total / limit);
    }
    // Verificar se a resposta é diretamente um array
    else if (response && Array.isArray(response)) {
      items = response;
      total = response.length;
      totalPages = Math.ceil(total / limit);
    }
    // Se não conseguiu identificar o formato, usar valores padrão
    else {
      console.warn('⚠️ [API] Formato de resposta não reconhecido para forum threads:', response);
      items = [];
      total = 0;
      totalPages = 0;
    }

    return {
      items: items.map(mapToForumThreadDto),
      total,
      page,
      limit,
      totalPages,
    };
  } catch (error) {
    console.error('❌ [API] Erro ao buscar forum threads:', error);
    
    // Retornar uma resposta vazia em caso de erro
    return {
      items: [],
      total: 0,
      page: params.page || 1,
      limit: params.limit || 10,
      totalPages: 0,
    };
  }
};

export const getForumThreadById = async (id: string): Promise<ForumThreadDto> => {
  const response = await apiGet<ApiForumThreadResponseDto>(`/forum/threads/${id}`);
  return mapToForumThreadDto(response);
};

export const createForumThread = async (data: CreateForumThreadDto): Promise<ForumThreadDto> => {
  const response = await apiPost<ApiForumThreadResponseDto>('/forum/threads', data);
  return mapToForumThreadDto(response);
};

export const updateForumThread = async (id: string, data: UpdateForumThreadDto): Promise<ForumThreadDto> => {
  const response = await apiPut<ApiForumThreadResponseDto>(`/forum/threads/${id}`, data);
  return mapToForumThreadDto(response);
};

export const deleteForumThread = async (id: string): Promise<void> => {
  return apiDelete(`/forum/threads/${id}`);
};

export const getThreadReplies = async (threadId: string): Promise<PaginatedResponse<ForumReplyDto>> => {
    try {
        const response = await apiGet<any>(`/forum/threads/${threadId}/replies`);
        console.log('🔍 [DEBUG] Resposta bruta da API de thread replies:', JSON.stringify(response, null, 2));
        
        // Verificar diferentes formatos de resposta da API
        let items: ApiForumReplyResponseDto[] = [];
        let total = 0;
        let page = 1;
        let limit = 10;
        let totalPages = 0;

        // Verificar se a resposta tem o formato padrão PaginatedResponse
        if (response && response.items && Array.isArray(response.items)) {
            items = response.items;
            total = response.total || 0;
            page = response.page || page;
            limit = response.limit || limit;
            totalPages = response.totalPages || Math.ceil(total / limit);
        }
        // Verificar se a resposta tem formato ApiResponse com data
        else if (response && response.data && response.data.items && Array.isArray(response.data.items)) {
            items = response.data.items;
            total = response.data.total || 0;
            page = response.data.page || page;
            limit = response.data.limit || limit;
            totalPages = response.data.totalPages || Math.ceil(total / limit);
        }
        // Verificar se a resposta é diretamente um array
        else if (response && Array.isArray(response)) {
            items = response;
            total = response.length;
            totalPages = Math.ceil(total / limit);
        }
        // Se não conseguiu identificar o formato, usar valores padrão
        else {
            console.warn('⚠️ [API] Formato de resposta não reconhecido para thread replies:', response);
            items = [];
            total = 0;
            totalPages = 0;
        }

        return {
            items: items.map(mapToForumReplyDto),
            total,
            page,
            limit,
            totalPages,
        };
    } catch (error) {
        console.error('❌ [API] Erro ao buscar thread replies:', error);
        
        // Retornar uma resposta vazia em caso de erro
        return {
            items: [],
            total: 0,
            page: 1,
            limit: 10,
            totalPages: 0,
        };
    }
};

export const createReply = async (data: CreateForumReplyDto): Promise<ForumReplyDto> => {
    const response = await apiPost<ApiForumReplyResponseDto>('/forum/replies', data);
    return mapToForumReplyDto(response);
};

export const forumService = {
  getForumThreads,
  getForumThreadById,
  createForumThread,
  updateForumThread,
  deleteForumThread,
  getThreadReplies,
  createReply,
};