interface BucketInfo {
  name: string
  label: string
  category: string
  description: string
  creationDate?: string
  isConfigured?: boolean
  addedAt?: string
}

interface BucketListResponse {
  configured: BucketInfo[]
  all?: BucketInfo[]
  total: number
  warning?: string
}

const API_BASE = '/api/content/buckets'

export class BucketService {
  // Listar buckets configurados
  static async getConfiguredBuckets(): Promise<BucketInfo[]> {
    try {
      const response = await fetch(API_BASE)
      if (!response.ok) {
        throw new Error('Erro ao buscar buckets configurados')
      }
      const result = await response.json()
      
      // O backend retorna { success: true, data: {...} }
      if (result.success && result.data) {
        return result.data.configured || []
      }
      
      // Fallback para estrutura antiga
      const data: BucketListResponse = result
      return data.configured || []
    } catch (error) {
      console.error('Erro no serviço de buckets:', error)
      throw error
    }
  }

  // Listar todos os buckets da conta AWS
  static async getAllBuckets(): Promise<BucketListResponse> {
    try {
      const response = await fetch(`${API_BASE}?listAll=true`)
      if (!response.ok) {
        throw new Error('Erro ao buscar todos os buckets')
      }
      const result = await response.json()
      
      // O backend retorna { success: true, data: {...} }
      if (result.success && result.data) {
        return result.data
      }
      
      // Fallback para estrutura antiga
      return result
    } catch (error) {
      console.error('Erro ao buscar todos os buckets:', error)
      throw error
    }
  }

  // Adicionar novo bucket à configuração
  static async addBucket(bucketData: Omit<BucketInfo, 'addedAt'>): Promise<BucketInfo> {
    try {
      const response = await fetch(API_BASE, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(bucketData)
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Erro ao adicionar bucket')
      }

      const result = await response.json()
      
      // O backend retorna { success: true, data: {...} }
      if (result.success && result.data) {
        return result.data
      }
      
      // Fallback para estrutura antiga
      return result
    } catch (error) {
      console.error('Erro ao adicionar bucket:', error)
      throw error
    }
  }

  // Verificar se um bucket existe na AWS
  static async verifyBucket(bucketName: string): Promise<boolean> {
    try {
      const data = await this.getAllBuckets()
      return data.all?.some(bucket => bucket.name === bucketName) || false
    } catch (error) {
      console.error('Erro ao verificar bucket:', error)
      return false
    }
  }

  // Obter informações de um bucket específico
  static async getBucketInfo(bucketName: string): Promise<BucketInfo | null> {
    try {
      const buckets = await this.getConfiguredBuckets()
      return buckets.find(bucket => bucket.name === bucketName) || null
    } catch (error) {
      console.error('Erro ao buscar informações do bucket:', error)
      return null
    }
  }
} 