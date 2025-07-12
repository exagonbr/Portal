import {
  ChatMessageDto,
  CreateChatMessageDto,
  ChatMessageFilter,
} from '@/types/chat';
import {
  PaginatedResponse,
  ChatMessageResponseDto as ApiChatMessageResponseDto,
} from '@/types/api';
import { apiGet, apiPost } from './apiService';

// Função para mapear a resposta da API para o DTO do frontend
const mapToChatMessageDto = (data: ApiChatMessageResponseDto): ChatMessageDto => ({
  id: data.id,
  sender_id: data.sender_id,
  content: data.content,
  class_id: data.class_id,
  attachments: data.attachments,
  read_by: data.read_by,
  timestamp: data.timestamp,
  created_at: data.timestamp, // Reutilizando timestamp
  updated_at: data.timestamp, // Reutilizando timestamp
});

export const getChatMessages = async (params: ChatMessageFilter): Promise<PaginatedResponse<ChatMessageDto>> => {
  try {
    const response = await apiGet<any>('/chat/messages', params);
    console.log('🔍 [DEBUG] Resposta bruta da API de chat messages:', JSON.stringify(response, null, 2));
    
    // Verificar diferentes formatos de resposta da API
    let items: ApiChatMessageResponseDto[] = [];
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
      console.warn('⚠️ [API] Formato de resposta não reconhecido para chat messages:', response);
      items = [];
      total = 0;
      totalPages = 0;
    }

    return {
      items: items.map(mapToChatMessageDto),
      total,
      page,
      limit,
      totalPages,
    };
  } catch (error) {
    console.error('❌ [API] Erro ao buscar chat messages:', error);
    
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

export const sendChatMessage = async (data: CreateChatMessageDto): Promise<ChatMessageDto> => {
  const response = await apiPost<ApiChatMessageResponseDto>('/chat/messages', data);
  return mapToChatMessageDto(response);
};

export const chatService = {
  getChatMessages,
  sendChatMessage,
};