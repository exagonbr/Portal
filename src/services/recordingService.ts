import { apiGet, apiPost, apiPut, apiDelete } from './apiService';

export interface Recording {
  id: string;
  classId: string;
  title: string;
  description?: string;
  url: string;
  duration: number;
  size: number;
  createdAt: Date;
  updatedAt: Date;
}

class RecordingServiceClass {
  async getClassroomRecordings(classId: string): Promise<Recording[]> {
    try {
      const response = await apiGet<Recording[]>(`/recordings/classroom/${classId}`);
      return response || [];
    } catch (error) {
      console.error('Erro ao buscar gravações da sala:', error);
      return [];
    }
  }

  async getRecording(recordingId: string): Promise<Recording | null> {
    try {
      const response = await apiGet<Recording>(`/recordings/${recordingId}`);
      return response;
    } catch (error) {
      console.error('Erro ao buscar gravação:', error);
      return null;
    }
  }

  async createRecording(recording: Omit<Recording, 'id' | 'createdAt' | 'updatedAt'>): Promise<Recording> {
    try {
      const response = await apiPost<Recording>('/recordings', recording);
      return response;
    } catch (error) {
      console.error('Erro ao criar gravação:', error);
      throw error;
    }
  }

  async updateRecording(recordingId: string, updates: Partial<Recording>): Promise<Recording> {
    try {
      const response = await apiPut<Recording>(`/recordings/${recordingId}`, updates);
      return response;
    } catch (error) {
      console.error('Erro ao atualizar gravação:', error);
      throw error;
    }
  }

  async deleteRecording(recordingId: string): Promise<void> {
    try {
      await apiDelete(`/recordings/${recordingId}`);
    } catch (error) {
      console.error('Erro ao deletar gravação:', error);
      throw error;
    }
  }

  async getRecordingUrl(recordingId: string): Promise<string> {
    try {
      const response = await apiGet<{ url: string }>(`/recordings/${recordingId}/url`);
      return response.url;
    } catch (error) {
      console.error('Erro ao obter URL da gravação:', error);
      throw error;
    }
  }
}

export const recordingService = new RecordingServiceClass(); 