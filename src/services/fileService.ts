import { FileUploadResponseDto, FileFilter, FileDto } from '@/types/file';
import { PaginatedResponse, FileResponseDto as ApiFileResponseDto } from '@/types/api';
import { apiGet, apiPost, apiDelete } from './apiService';

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
  const response = await fetch('/api/upload', {
    method: 'POST',
    body: formData,
    // onUploadProgress pode ser implementado com Axios ou XHR
  });

  if (!response.ok) {
    throw new Error('Erro no upload do arquivo');
  }

  return response.json();
};

export const getFiles = async (params: FileFilter): Promise<PaginatedResponse<FileDto>> => {
    const response = await apiGet<PaginatedResponse<ApiFileResponseDto>>('/files', params);
    return {
        ...response,
        items: response.items.map(mapToFileDto),
    };
};

export const deleteFile = async (id: number): Promise<void> => {
    return apiDelete(`/files/${id}`);
};


export const fileService = {
  uploadFile,
  getFiles,
  deleteFile,
};