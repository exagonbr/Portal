import { FileUploadResponseDto, FileFilter, FileDto } from '@/types/file';
import { PaginatedResponse, FileResponseDto as ApiFileResponseDto } from '@/types/api';
import { apiGet, apiPost, apiDelete } from './apiService';
import { AuthHeaderService } from './authHeaderService';

// Função para mapear a resposta da API para o DTO do frontend
const mapToFileDto = (data: ApiFileResponseDto): FileDto => ({
    id: data.id,
    url: data.external_link || '',
    name: data.name || '',
    original_name: data.original_filename || '',
    content_type: data.content_type || '',
    size: data.size || 0,
    is_public: data.is_public || false,
    created_at: data.date_created,
});

export const uploadFile = async (file: File, onUploadProgress?: (progressEvent: any) => void): Promise<FileUploadResponseDto> => {
  const formData = new FormData();
  formData.append('file', file);

  // A função apiPost precisaria ser adaptada para lidar com FormData e onUploadProgress
  // Por agora, vamos assumir uma implementação simplificada.
  const headers = await AuthHeaderService.getHeaders(false); // Não incluir Content-Type para FormData
  
  const response = await fetch('/api/upload', {
    method: 'POST',
    headers,
    credentials: 'omit',
    body: formData,
    // onUploadProgress pode ser implementado com Axios ou XHR
  });

  if (!response.ok) {
    throw new Error('Erro no upload do arquivo');
  }

  return response.json();
};

export const getFiles = async (params: FileFilter): Promise<PaginatedResponse<FileDto>> => {
    try {
        const response = await apiGet<any>('/files', params);
        console.log('🔍 [DEBUG] Resposta bruta da API de files:', JSON.stringify(response, null, 2));
        
        // Verificar diferentes formatos de resposta da API
        let items: ApiFileResponseDto[] = [];
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
            console.warn('⚠️ [API] Formato de resposta não reconhecido para files:', response);
            items = [];
            total = 0;
            totalPages = 0;
        }

        return {
            items: items.map(mapToFileDto),
            total,
            page,
            limit,
            totalPages,
        };
    } catch (error) {
        console.error('❌ [API] Erro ao buscar files:', error);
        
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

export const deleteFile = async (id: number): Promise<void> => {
    return apiDelete(`/files/${id}`);
};


export const fileService = {
  uploadFile,
  getFiles,
  deleteFile,
};

export const FileService = fileService;