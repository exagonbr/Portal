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

// Função para obter o token de autenticação
const getAuthToken = (): string | null => {
  if (typeof window === 'undefined') return null;
  
  // 1. Tentar obter token de localStorage primeiro
  let token = localStorage.getItem('auth_token') || 
              localStorage.getItem('token') ||
              localStorage.getItem('authToken') ||
              sessionStorage.getItem('token') ||
              sessionStorage.getItem('auth_token');
  
  // 2. Se não encontrar no storage, tentar obter dos cookies
  if (!token) {
    const cookies = document.cookie.split(';');
    for (const cookie of cookies) {
      const [name, value] = cookie.trim().split('=');
      if (name === 'auth_token' || name === 'token' || name === 'authToken') {
        token = decodeURIComponent(value);
        break;
      }
    }
  }
  
  // 3. Como último recurso, tentar obter da sessão de usuário (se houver)
  if (!token) {
    try {
      const userCookie = document.cookie
        .split(';')
        .find(cookie => cookie.trim().startsWith('user_session='));
      
      if (userCookie) {
        const userSessionValue = userCookie.split('=')[1];
        const userData = JSON.parse(decodeURIComponent(userSessionValue));
        if (userData && userData.token) {
          token = userData.token;
        }
      }
    } catch (error) {
      console.warn('⚠️ Erro ao extrair token da sessão do usuário:', error);
    }
  }
  
  return token;
};

// Função para criar headers com autenticação
const createAuthHeaders = (): Record<string, string> => {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  
  const token = getAuthToken();
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }
  
  return headers;
};

export class BucketService {
  // Listar buckets configurados
  static async getConfiguredBuckets(): Promise<BucketInfo[]> {
    try {
      const response = await fetch(API_BASE, {
        headers: createAuthHeaders()
      })
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
      console.log('Erro no serviço de buckets:', error)
      throw error
    }
  }

  // Listar todos os buckets da conta AWS
  static async getAllBuckets(): Promise<BucketListResponse> {
    try {
      const response = await fetch(`${API_BASE}?listAll=true`, {
        headers: createAuthHeaders()
      })
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
      console.log('Erro ao buscar todos os buckets:', error)
      throw error
    }
  }

  // Adicionar novo bucket à configuração
  static async addBucket(bucketData: Omit<BucketInfo, 'addedAt'>): Promise<BucketInfo> {
    try {
      const response = await fetch(API_BASE, {
        method: 'POST',
        headers: createAuthHeaders(),
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
      console.log('Erro ao adicionar bucket:', error)
      throw error
    }
  }

  // Verificar se um bucket existe na AWS
  static async verifyBucket(bucketName: string): Promise<boolean> {
    try {
      const data = await this.getAllBuckets()
      return data.all?.some(bucket => bucket.name === bucketName) || false
    } catch (error) {
      console.log('Erro ao verificar bucket:', error)
      return false
    }
  }

  // Obter informações de um bucket específico
  static async getBucketInfo(bucketName: string): Promise<BucketInfo | null> {
    try {
      const buckets = await this.getConfiguredBuckets()
      return buckets.find(bucket => bucket.name === bucketName) || null
    } catch (error) {
      console.log('Erro ao buscar informações do bucket:', error)
      return null
    }
  }
} 