import { apiGet, apiPost, apiDelete } from './apiService';

export interface BucketConfig {
  name: string;
  region: string;
  accessKey?: string;
  secretKey?: string;
}

export interface Bucket {
  id: string;
  name: string;
  region: string;
  createdAt: Date;
  updatedAt: Date;
}

class BucketServiceClass {
  async getConfiguredBuckets(): Promise<Bucket[]> {
    try {
      const response = await apiGet<Bucket[]>('/admin/buckets');
      return response || [];
    } catch (error) {
      console.error('Erro ao buscar buckets:', error);
      return [];
    }
  }

  async addBucket(config: BucketConfig): Promise<Bucket> {
    try {
      const response = await apiPost<Bucket>('/admin/buckets', config);
      return response;
    } catch (error) {
      console.error('Erro ao adicionar bucket:', error);
      throw error;
    }
  }

  async removeBucket(bucketId: string): Promise<void> {
    try {
      await apiDelete(`/admin/buckets/${bucketId}`);
    } catch (error) {
      console.error('Erro ao remover bucket:', error);
      throw error;
    }
  }

  async testBucketConnection(bucketId: string): Promise<boolean> {
    try {
      const response = await apiGet<{ connected: boolean }>(`/admin/buckets/${bucketId}/test`);
      return response?.connected || false;
    } catch (error) {
      console.error('Erro ao testar conexão com bucket:', error);
      return false;
    }
  }
}

export const BucketService = new BucketServiceClass(); 