import api from './api';

export class CrudService<T> {
  constructor(private endpoint: string) {}

  async getAll(params?: any) {
    const response = await api.get<T[]>(this.endpoint, { params });
    return response.data;
  }

  async getById(id: string | number) {
    const response = await api.get<T>(`${this.endpoint}/${id}`);
    return response.data;
  }

  async create(data: Partial<T>) {
    const response = await api.post<T>(this.endpoint, data);
    return response.data;
  }

  async update(id: string | number, data: Partial<T>) {
    const response = await api.put<T>(`${this.endpoint}/${id}`, data);
    return response.data;
  }

  async delete(id: string | number) {
    await api.delete(`${this.endpoint}/${id}`);
  }

  async search(query: string) {
    const response = await api.get<T[]>(`${this.endpoint}/search`, {
      params: { query },
    });
    return response.data;
  }
} 