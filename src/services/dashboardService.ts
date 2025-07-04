import { SystemDashboardDto } from '@/types/dashboard';
import { apiGet } from './apiService';

export const getSystemDashboardData = async (): Promise<SystemDashboardDto> => {
  return apiGet<SystemDashboardDto>('/dashboard/system');
};

export const dashboardService = {
  getSystemDashboardData,
};