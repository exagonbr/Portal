import api from '../lib/api';

const resource = '/permissions';

export const permissionService = {
  getAll: (params?: any) => api.get(resource, { params }),
  getById: (id: number) => api.get(`${resource}/${id}`),
  create: (data: any) => api.post(resource, data),
  update: (id: number, data: any) => api.put(`${resource}/${id}`, data),
  delete: (id: number) => api.delete(`${resource}/${id}`),
};