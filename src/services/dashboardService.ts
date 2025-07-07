import { SystemDashboardDto } from '@/types/dashboard';
import { apiGet } from './apiService';

export const getSystemDashboardData = async (): Promise<SystemDashboardDto> => {
  const response = await apiGet<SystemDashboardDto>('/dashboard/system');
  
  // Log para debug
  console.log('🔍 Dashboard service - resposta da API:', response);
  
  return response;
};

export const dashboardService = {
  getSystemDashboardData,
};