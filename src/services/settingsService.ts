import {
  SettingDto,
  UpdateSettingsDto,
  SettingsFilter,
} from '@/types/settings';
import {
  PaginatedResponse,
  SettingsResponseDto as ApiSettingsResponseDto,
} from '@/types/api';
import { apiGet, apiPut } from './apiService';

// Função para parsear o valor da setting
const parseValue = (value: string | undefined, type: string | undefined): any => {
    if (value === undefined || value === null) return null;
    switch (type) {
        case 'boolean':
            return value === 'true';
        case 'number':
            return Number(value);
        default:
            try {
                return JSON.parse(value);
            } catch (e) {
                return value;
            }
    }
};

// Função para mapear a resposta da API para o DTO do frontend
const mapToSettingDto = (data: ApiSettingsResponseDto): SettingDto => ({
  id: data.id,
  key: data.settings_key,
  value: parseValue(data.value, data.settings_type),
  name: data.name,
  description: data.description,
  type: data.settings_type,
  is_public: true, // Assumindo como público se não especificado
});

export const getSettings = async (params: SettingsFilter): Promise<SettingDto[]> => {
  const response = await apiGet<ApiSettingsResponseDto[]>('/settings', params);
  return response.map(mapToSettingDto);
};

export const getPublicSettings = async (): Promise<Record<string, any>> => {
    const settings = await getSettings({ is_public: true });
    return settings.reduce((acc, setting) => {
        acc[setting.key] = setting.value;
        return acc;
    }, {} as Record<string, any>);
};

export const updateSettings = async (data: UpdateSettingsDto): Promise<void> => {
  return apiPut('/settings', data);
};

export const settingsService = {
  getSettings,
  getPublicSettings,
  updateSettings,
};