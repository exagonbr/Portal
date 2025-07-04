import { InstitutionResponseDto, PaginatedResponse } from '@/types/api';

const API_BASE_URL = '/api';

async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    try {
      const error = await response.json();
      throw new Error(error.message || `Erro na API: ${response.statusText}`);
    } catch (e) {
      throw new Error(`Erro na API: ${response.statusText}`);
    }
  }
  return response.json() as Promise<T>;
}

const getInstitutions = async (params: { page?: number; limit?: number; active?: boolean }): Promise<PaginatedResponse<InstitutionResponseDto>> => {
  const query = new URLSearchParams(params as any).toString();
  const response = await fetch(`${API_BASE_URL}/institutions?${query}`);
  return handleResponse<PaginatedResponse<InstitutionResponseDto>>(response);
};

export const institutionService = {
  getInstitutions,
};