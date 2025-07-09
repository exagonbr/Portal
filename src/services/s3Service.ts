import { apiGet, apiPost, apiDelete } from './apiService';

export interface S3UploadResponse {
  url: string;
  key: string;
  bucket: string;
}

export interface S3File {
  key: string;
  name: string;
  size: number;
  lastModified: Date;
  url?: string;
}

export interface UploadProgress {
  loaded: number;
  total: number;
  percentage: number;
}

class S3ServiceClass {
  async getUploadUrl(fileName: string, fileType: string, bucketName?: string): Promise<S3UploadResponse> {
    try {
      const response = await apiPost<S3UploadResponse>('/s3/upload-url', {
        fileName,
        fileType,
        bucketName
      });
      return response;
    } catch (error) {
      console.error('Erro ao obter URL de upload:', error);
      throw error;
    }
  }

  async uploadFile(file: File, onProgress?: (progress: UploadProgress) => void): Promise<S3UploadResponse> {
    try {
      // Primeiro, obter a URL de upload
      const uploadData = await this.getUploadUrl(file.name, file.type);
      
      // Fazer o upload direto para o S3
      const xhr = new XMLHttpRequest();
      
      return new Promise((resolve, reject) => {
        xhr.upload.addEventListener('progress', (event) => {
          if (event.lengthComputable && onProgress) {
            onProgress({
              loaded: event.loaded,
              total: event.total,
              percentage: Math.round((event.loaded / event.total) * 100)
            });
          }
        });

        xhr.addEventListener('load', () => {
          if (xhr.status === 200 || xhr.status === 204) {
            resolve(uploadData);
          } else {
            reject(new Error(`Upload falhou com status: ${xhr.status}`));
          }
        });

        xhr.addEventListener('error', () => {
          reject(new Error('Erro durante o upload'));
        });

        xhr.open('PUT', uploadData.url);
        xhr.setRequestHeader('Content-Type', file.type);
        xhr.send(file);
      });
    } catch (error) {
      console.error('Erro ao fazer upload do arquivo:', error);
      throw error;
    }
  }

  async listFiles(prefix?: string, bucketName?: string): Promise<S3File[]> {
    try {
      const params: any = {};
      if (prefix) params.prefix = prefix;
      if (bucketName) params.bucket = bucketName;
      
      const response = await apiGet<S3File[]>('/s3/files', params);
      return response || [];
    } catch (error) {
      console.error('Erro ao listar arquivos:', error);
      return [];
    }
  }

  async deleteFile(key: string, bucketName?: string): Promise<void> {
    try {
      const params = bucketName ? `?bucket=${bucketName}` : '';
      await apiDelete(`/s3/files/${encodeURIComponent(key)}${params}`);
    } catch (error) {
      console.error('Erro ao deletar arquivo:', error);
      throw error;
    }
  }

  async getFileUrl(key: string, bucketName?: string, expiresIn?: number): Promise<string> {
    try {
      const params: any = {};
      if (bucketName) params.bucket = bucketName;
      if (expiresIn) params.expiresIn = expiresIn;
      
      const response = await apiGet<{ url: string }>(`/s3/files/${encodeURIComponent(key)}/url`, params);
      return response.url;
    } catch (error) {
      console.error('Erro ao obter URL do arquivo:', error);
      throw error;
    }
  }

  async copyFile(sourceKey: string, destinationKey: string, bucketName?: string): Promise<void> {
    try {
      await apiPost('/s3/files/copy', {
        sourceKey,
        destinationKey,
        bucketName
      });
    } catch (error) {
      console.error('Erro ao copiar arquivo:', error);
      throw error;
    }
  }
}

export const s3Service = new S3ServiceClass(); 