import { CrudService } from './crudService';

export interface Institution {
  id: number;
  name: string;
  code?: string;
  type: string;
  description?: string;
  is_active: boolean;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  postal_code?: string;
  phone?: string;
  email?: string;
  website?: string;
  logo_url?: string;
  schools_count?: number;
  users_count?: number;
  created_at?: string;
  updated_at?: string;
}

class InstitutionService extends CrudService<Institution> {
  constructor() {
    super('/institutions');
  }

  async uploadLogo(id: number, file: File) {
    const formData = new FormData();
    formData.append('logo', file);
    
    const response = await fetch(`${this.endpoint}/${id}/logo`, {
      method: 'POST',
      body: formData,
    });
    
    return response.json();
  }

  async getStats(id: number) {
    const response = await fetch(`${this.endpoint}/${id}/stats`);
    return response.json();
  }

  async toggleInstitutionStatus(id: number) {
    const response = await fetch(`${this.endpoint}/${id}/toggle-status`, {
      method: 'POST',
    });
    return response.json();
  }

  async canDeleteInstitution(id: number) {
    try {
      const response = await fetch(`${this.endpoint}/${id}/can-delete`);
      const data = await response.json();
      return data.canDelete;
    } catch (error) {
      console.error('Error checking if institution can be deleted:', error);
      return false;
    }
  }

  async getInstitutions(params: { page?: number; limit?: number; search?: string }) {
    const queryParams = new URLSearchParams();
    if (params.page) queryParams.append('page', params.page.toString());
    if (params.limit) queryParams.append('limit', params.limit.toString());
    if (params.search) queryParams.append('search', params.search);

    const response = await fetch(`${this.endpoint}?${queryParams}`);
    return response.json();
  }

  async createInstitution(data: Partial<Institution>) {
    const response = await fetch(this.endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    return response.json();
  }

  async updateInstitution(id: number, data: Partial<Institution>) {
    const response = await fetch(`${this.endpoint}/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    return response.json();
  }

  async deleteInstitution(id: number) {
    const response = await fetch(`${this.endpoint}/${id}`, {
      method: 'DELETE',
    });
    return response.json();
  }
}

export const institutionService = new InstitutionService();