import { apiGet, apiPost, apiPut, apiDelete } from './apiService';

export class CrudService<T> {
  constructor(private endpoint: string) {}

  async getAll(params?: any) {
    return apiGet<T[]>(this.endpoint, params);
  }

  async getById(id: string | number) {
    return apiGet<T>(`${this.endpoint}/${id}`);
  }

  async create(data: Partial<T>) {
    return apiPost<T>(this.endpoint, data);
  }

  async update(id: string | number, data: Partial<T>) {
    return apiPut<T>(`${this.endpoint}/${id}`, data);
  }

  async delete(id: string | number) {
    return apiDelete(`${this.endpoint}/${id}`);
  }

  async search(query: string) {
    return apiGet<T[]>(`${this.endpoint}/search`, { query });
  }
} 