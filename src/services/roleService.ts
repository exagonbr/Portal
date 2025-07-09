import {
  RoleDto,
  CreateRoleDto,
  UpdateRoleDto,
  RoleFilter,
} from '@/types/roles';
import {
  PaginatedResponse,
  RoleResponseDto as ApiRoleResponseDto,
} from '@/types/api';
import { apiGet, apiPost, apiPut, apiDelete, apiPatch } from './apiService';

// Cache local para roles
let rolesCache: {
  data: any;
  timestamp: number;
  expiresIn: number;
} | null = null;

// Tempo de expiração do cache em ms
const CACHE_EXPIRATION = 60000; // 1 minuto

// Função para mapear a resposta da API para o DTO do frontend
const mapToRoleDto = (data: ApiRoleResponseDto): RoleDto => ({
  id: String(data.id),
  name: data.name,
  description: data.description,
  is_active: data.active,
  users_count: data.users_count,
  created_at: data.created_at,
  updated_at: data.updated_at,
});

export const getRoles = async (params: RoleFilter): Promise<PaginatedResponse<RoleDto>> => {
  // Verificar se temos um cache válido
  const cacheKey = JSON.stringify(params);
  
  if (rolesCache && 
      rolesCache.timestamp > Date.now() - CACHE_EXPIRATION &&
      JSON.stringify(rolesCache.data.params) === cacheKey) {
    console.log('📦 [CACHE] Usando cache para roles');
    return rolesCache.data.result;
  }
  
  console.log('🔄 [API] Buscando roles do servidor');
  
  try {
    const response = await apiGet<any>('/roles', params);
    console.log('🔍 [DEBUG] Resposta bruta da API de roles:', JSON.stringify(response, null, 2));
    
    // Verificar diferentes formatos de resposta da API
    let items: ApiRoleResponseDto[] = [];
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
      console.warn('⚠️ [API] Formato de resposta não reconhecido para roles:', response);
      items = [];
      total = 0;
      totalPages = 0;
    }

    const result: PaginatedResponse<RoleDto> = {
      items: items.map(mapToRoleDto),
      total,
      page,
      limit,
      totalPages,
    };

    // Armazenar no cache
    rolesCache = {
      data: {
        params,
        result
      },
      timestamp: Date.now(),
      expiresIn: CACHE_EXPIRATION
    };

    return result;
  } catch (error) {
    console.error('❌ [API] Erro ao buscar roles:', error);
    
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

export const getRoleById = async (id: string): Promise<RoleDto> => {
  const response = await apiGet<ApiRoleResponseDto>(`/roles/${id}`);
  return mapToRoleDto(response);
};

export const createRole = async (data: CreateRoleDto): Promise<RoleDto> => {
  // Invalidar cache ao criar
  rolesCache = null;
  const response = await apiPost<ApiRoleResponseDto>('/roles', data);
  return mapToRoleDto(response);
};

export const updateRole = async (id: string, data: UpdateRoleDto): Promise<RoleDto> => {
  // Invalidar cache ao atualizar
  rolesCache = null;
  const response = await apiPut<ApiRoleResponseDto>(`/roles/${id}`, data);
  return mapToRoleDto(response);
};

export const deleteRole = async (id: string): Promise<void> => {
  // Invalidar cache ao deletar
  rolesCache = null;
  await apiDelete(`/roles/${id}`);
};

export const toggleRoleStatus = async (id: string): Promise<RoleDto> => {
  // Invalidar cache ao alterar status
  rolesCache = null;
  const role = await getRoleById(id);
  const response = await apiPatch<ApiRoleResponseDto>(`/roles/${id}/status`, { active: !role.is_active });
  return mapToRoleDto(response);
};

export const roleService = {
  getRoles,
  getRoleById,
  createRole,
  updateRole,
  deleteRole,
  toggleRoleStatus,
};