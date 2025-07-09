import { getBackendUrl } from './backend-config';

export interface InstitutionDto {
  id: number;
  name: string;
  companyName: string;
  document: string;
  active?: boolean;
  deleted?: boolean;
}

export interface InstitutionFilterDto {
  page?: number;
  limit?: number;
  search?: string;
}

class InstitutionService {
  private baseUrl = getBackendUrl('/institutions');

  async findInstitutionsWithFilters(filters: InstitutionFilterDto): Promise<{ institutions: InstitutionDto[], total: number }> {
    const { page = 1, limit = 10, search } = filters;
    const queryParams = new URLSearchParams();
    queryParams.append('page', page.toString());
    queryParams.append('limit', limit.toString());
    if (search) queryParams.append('search', search);

    const response = await fetch(`${this.baseUrl}?${queryParams}`);
    if (!response.ok) {
      throw new Error('Failed to fetch institutions');
    }

    const data = await response.json();
    return {
      institutions: data.items || [],
      total: data.total || 0
    };
  }

  async findInstitutionById(id: number): Promise<InstitutionDto | null> {
    const response = await fetch(`${this.baseUrl}/${id}`);
    if (!response.ok) {
      if (response.status === 404) {
        return null;
      }
      throw new Error('Failed to fetch institution');
    }

    return response.json();
  }

  async createInstitution(data: Partial<InstitutionDto>): Promise<InstitutionDto> {
    const response = await fetch(this.baseUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    });

    if (!response.ok) {
      throw new Error('Failed to create institution');
    }

    return response.json();
  }

  async updateInstitution(id: number, data: Partial<InstitutionDto>): Promise<InstitutionDto | null> {
    const response = await fetch(`${this.baseUrl}/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    });

    if (!response.ok) {
      if (response.status === 404) {
        return null;
      }
      throw new Error('Failed to update institution');
    }

    return response.json();
  }

  async deleteInstitution(id: number): Promise<boolean> {
    const response = await fetch(`${this.baseUrl}/${id}`, {
      method: 'DELETE'
    });

    if (!response.ok) {
      if (response.status === 404) {
        return false;
      }
      throw new Error('Failed to delete institution');
    }

    return true;
  }
}

export const institutionService = new InstitutionService(); 