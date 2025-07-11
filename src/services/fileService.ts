import { FileRecord, S3FileInfo, FileUploadRequest, FileMoveRequest, FileUpdateRequest } from '@/types/files'
import { fetchWithAuth } from '@/lib/api-client';

const API_BASE = '/api/content/files'

export class FileService {
  // Listar arquivos de uma categoria específica
  static async getFilesByCategory(category: 'literario' | 'professor' | 'aluno'): Promise<S3FileInfo[]> {
    try {
      const response = await fetchWithAuth(`${API_BASE}?category=${category}`)
      if (!response.ok) {
        throw new Error('Erro ao buscar arquivos')
      }
      const result = await response.json()
      
      // O backend retorna { success: true, data: [...] }
      if (result.success && result.data) {
        return Array.isArray(result.data) ? result.data : []
      }
      
      // Fallback para estrutura antiga
      return Array.isArray(result) ? result : []
    } catch (error) {
      console.log('Erro no serviço de arquivos:', error)
      throw error
    }
  }

  // Buscar todos os arquivos
  static async getAllFiles(): Promise<Record<string, S3FileInfo[]>> {
    try {
      const response = await fetchWithAuth(`${API_BASE}/all`)
      if (!response.ok) {
        throw new Error('Erro ao buscar todos os arquivos')
      }
      const result = await response.json()
      
      // O backend retorna { success: true, data: {...} }
      if (result.success && result.data) {
        return result.data
      }
      
      // Fallback para estrutura antiga
      return result || {}
    } catch (error) {
      console.log('Erro no serviço de arquivos:', error)
      throw error
    }
  }

  // Método removido: checkDatabaseReferences

  // Upload de arquivo
  static async uploadFile(uploadData: FileUploadRequest): Promise<FileRecord> {
    try {
      const formData = new FormData()
      formData.append('file', uploadData.file)
      formData.append('category', uploadData.category)
      if (uploadData.description) {
        formData.append('description', uploadData.description)
      }
      if (uploadData.tags) {
        formData.append('tags', JSON.stringify(uploadData.tags))
      }

      const response = await fetchWithAuth(`${API_BASE}/upload`, {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        throw new Error('Erro ao fazer upload do arquivo')
      }

      const result = await response.json()
      
      // O backend retorna { success: true, data: {...} }
      if (result.success && result.data) {
        return result.data
      }
      
      // Fallback para estrutura antiga
      return result
    } catch (error) {
      console.log('Erro no upload:', error)
      throw error
    }
  }

  // Substituir arquivo
  static async replaceFile(fileId: string, newFile: File): Promise<FileRecord> {
    try {
      const formData = new FormData()
      formData.append('file', newFile)
      formData.append('fileId', fileId)

      const response = await fetchWithAuth(`${API_BASE}/replace`, {
        method: 'PUT',
        body: formData,
      })

      if (!response.ok) {
        throw new Error('Erro ao substituir arquivo')
      }

      const result = await response.json()
      
      // O backend retorna { success: true, data: {...} }
      if (result.success && result.data) {
        return result.data
      }
      
      // Fallback para estrutura antiga
      return result
    } catch (error) {
      console.log('Erro ao substituir arquivo:', error)
      throw error
    }
  }

  // Renomear arquivo
  static async renameFile(fileId: string, newName: string): Promise<FileRecord> {
    try {
      const response = await fetchWithAuth(`${API_BASE}/${fileId}/rename`, {
        method: 'PATCH',
        body: JSON.stringify({ name: newName })
      })

      if (!response.ok) {
        throw new Error('Erro ao renomear arquivo')
      }

      const result = await response.json()
      
      // O backend retorna { success: true, data: {...} }
      if (result.success && result.data) {
        return result.data
      }
      
      // Fallback para estrutura antiga
      return result
    } catch (error) {
      console.log('Erro ao renomear arquivo:', error)
      throw error
    }
  }

  // Mover/Copiar arquivo
  static async moveFile(moveData: FileMoveRequest): Promise<FileRecord> {
    try {
      const response = await fetchWithAuth(`${API_BASE}/move`, {
        method: 'POST',
        body: JSON.stringify(moveData)
      })

      if (!response.ok) {
        throw new Error('Erro ao mover/copiar arquivo')
      }

      const result = await response.json()
      
      // O backend retorna { success: true, data: {...} }
      if (result.success && result.data) {
        return result.data
      }
      
      // Fallback para estrutura antiga
      return result
    } catch (error) {
      console.log('Erro ao mover arquivo:', error)
      throw error
    }
  }

  // Deletar arquivo
  static async deleteFile(fileId: string): Promise<boolean> {
    try {
      const response = await fetchWithAuth(`${API_BASE}/${fileId}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        throw new Error('Erro ao deletar arquivo')
      }

      return true
    } catch (error) {
      console.log('Erro ao deletar arquivo:', error)
      throw error
    }
  }

  // Atualizar metadados do arquivo
  static async updateFile(updateData: FileUpdateRequest): Promise<FileRecord> {
    try {
      const response = await fetchWithAuth(`${API_BASE}/${updateData.fileId}`, {
        method: 'PATCH',
        body: JSON.stringify(updateData)
      })

      if (!response.ok) {
        throw new Error('Erro ao atualizar arquivo')
      }

      const result = await response.json()
      
      // O backend retorna { success: true, data: {...} }
      if (result.success && result.data) {
        return result.data
      }
      
      // Fallback para estrutura antiga
      return result
    } catch (error) {
      console.log('Erro ao atualizar arquivo:', error)
      throw error
    }
  }

  // Criar referência no banco para arquivo S3 existente
  static async createDatabaseReference(s3Key: string, category: string, metadata: Partial<FileRecord>): Promise<FileRecord> {
    try {
      const response = await fetchWithAuth(`${API_BASE}/create-reference`, {
        method: 'POST',
        body: JSON.stringify({ s3Key, category, ...metadata })
      })

      if (!response.ok) {
        throw new Error('Erro ao criar referência no banco')
      }

      const result = await response.json()
      
      // O backend retorna { success: true, data: {...} }
      if (result.success && result.data) {
        return result.data
      }
      
      // Fallback para estrutura antiga
      return result
    } catch (error) {
      console.log('Erro ao criar referência:', error)
      throw error
    }
  }

  // Buscar TODOS os arquivos do bucket (incluindo não vinculados)
  static async getAllBucketFiles(category: string): Promise<S3FileInfo[]> {
    try {
      const response = await fetchWithAuth(`${API_BASE}/bucket-files?category=${category}`)
      if (!response.ok) {
        throw new Error('Erro ao buscar arquivos do bucket')
      }
      
      const result = await response.json()
      
      // O backend retorna { success: true, data: {...} }
      if (result.success && result.data) {
        return result.data
      }
      
      // Fallback para estrutura antiga
      return result
    } catch (error) {
      console.log('Erro ao buscar arquivos do bucket:', error)
      throw error
    }
  }

  // Vincular arquivo a uma coleção
  static async linkToCollection(fileId: string, collectionId: string): Promise<FileRecord> {
    try {
      const response = await fetchWithAuth(`${API_BASE}/${fileId}/link-collection`, {
        method: 'POST',
        body: JSON.stringify({ collectionId })
      })

      if (!response.ok) {
        throw new Error('Erro ao vincular arquivo à coleção')
      }

      const result = await response.json()
      
      // O backend retorna { success: true, data: {...} }
      if (result.success && result.data) {
        return result.data
      }
      
      // Fallback para estrutura antiga
      return result
    } catch (error) {
      console.log('Erro ao vincular à coleção:', error)
      throw error
    }
  }

  // Adicionar arquivo à biblioteca
  static async addToLibrary(fileId: string, libraryCategory: string): Promise<FileRecord> {
    try {
      const response = await fetchWithAuth(`${API_BASE}/${fileId}/add-library`, {
        method: 'POST',
        body: JSON.stringify({ libraryCategory })
      })

      if (!response.ok) {
        throw new Error('Erro ao adicionar arquivo à biblioteca')
      }

      const result = await response.json()
      
      // O backend retorna { success: true, data: {...} }
      if (result.success && result.data) {
        return result.data
      }
      
      // Fallback para estrutura antiga
      return result
    } catch (error) {
      console.log('Erro ao adicionar à biblioteca:', error)
      throw error
    }
  }

  // Desvincular arquivo do conteúdo
  static async unlinkFromContent(fileId: string): Promise<FileRecord> {
    try {
      const response = await fetchWithAuth(`${API_BASE}/${fileId}/unlink`, {
        method: 'POST',
      })

      if (!response.ok) {
        throw new Error('Erro ao desvincular arquivo do conteúdo')
      }

      const result = await response.json()
      
      // O backend retorna { success: true, data: {...} }
      if (result.success && result.data) {
        return result.data
      }
      
      // Fallback para estrutura antiga
      return result
    } catch (error) {
      console.log('Erro ao desvincular do conteúdo:', error)
      throw error
    }
  }

  // Adicionar arquivo à biblioteca de livros (books)
  static async addToBookLibrary(fileId: string, bookData: {
    title: string
    author: string
    publisher: string
    format: string
    category: string
    thumbnail: string
    fileUrl: string
    fileSize: string
    description: string
  }): Promise<any> {
    try {
      const response = await fetchWithAuth(`${API_BASE}/${fileId}/add-book`, {
        method: 'POST',
        body: JSON.stringify(bookData)
      })

      if (!response.ok) {
        throw new Error('Erro ao adicionar arquivo à biblioteca de livros')
      }

      const result = await response.json()
      
      // O backend retorna { success: true, data: {...} }
      if (result.success && result.data) {
        return result.data
      }
      
      // Fallback para estrutura antiga
      return result
    } catch (error) {
      console.log('Erro ao adicionar à biblioteca de livros:', error)
      throw error
    }
  }
} 