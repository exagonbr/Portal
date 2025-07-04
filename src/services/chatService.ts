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
  const response = await apiGet<PaginatedResponse<ApiChatMessageResponseDto>>('/chat/messages', params);
  return {
    ...response,
    items: response.items.map(mapToChatMessageDto),
  };
};

export const sendChatMessage = async (data: CreateChatMessageDto): Promise<ChatMessageDto> => {
  const response = await apiPost<ApiChatMessageResponseDto>('/chat/messages', data);
  return mapToChatMessageDto(response);
};

export const chatService = {
  getChatMessages,
  sendChatMessage,
};