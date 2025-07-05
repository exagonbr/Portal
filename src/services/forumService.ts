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
  const response = await apiGet<PaginatedResponse<ApiForumThreadResponseDto>>('/forum/threads', params);
  return {
    ...response,
    items: response.items.map(mapToForumThreadDto),
  };
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
    const response = await apiGet<PaginatedResponse<ApiForumReplyResponseDto>>(`/forum/threads/${threadId}/replies`);
    return {
        ...response,
        items: response.items.map(mapToForumReplyDto),
    };
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