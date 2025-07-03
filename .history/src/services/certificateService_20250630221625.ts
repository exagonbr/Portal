import { Certificate, CertificateCreateRequest, CertificateUpdateRequest, CertificateFilters, CertificateListResponse } from '@/types/certificate'

const API_BASE_URL = '/api'

export class CertificateService {
  /**
   * Buscar certificados com filtros e paginação
   */
  static async getCertificates(filters: CertificateFilters = {}): Promise<CertificateListResponse> {
    try {
      const params = new URLSearchParams()
      
      // Paginação
      if (filters.page) params.set('page', filters.page.toString())
      if (filters.limit) params.set('limit', filters.limit.toString())
      
      // Filtros
      if (filters.user_id) params.set('user_id', filters.user_id.toString())
      if (filters.tv_show_id) params.set('tv_show_id', filters.tv_show_id.toString())
      if (filters.score) params.set('score', filters.score.toString())
      if (filters.document) params.set('document', filters.document)
      if (filters.license_code) params.set('license_code', filters.license_code)
      if (filters.tv_show_name) params.set('tv_show_name', filters.tv_show_name)
      if (filters.recreate !== undefined) params.set('recreate', filters.recreate.toString())
      if (filters.search) params.set('search', filters.search)
      
      // Ordenação
      if (filters.sort_by) params.set('sort_by', filters.sort_by)
      if (filters.sort_order) params.set('sort_order', filters.sort_order)

      const response = await fetch(`${API_BASE_URL}/certificates?${params.toString()}`)
      
      if (!response.ok) {
        throw new Error(`Erro ao buscar certificados: ${response.status}`)
      }

      return await response.json()
    } catch (error) {
      console.error('Erro no serviço de certificados:', error)
      throw error
    }
  }

  /**
   * Buscar certificado por ID
   */
  static async getCertificate(id: number): Promise<{ success: boolean; data: Certificate }> {
    try {
      const response = await fetch(`${API_BASE_URL}/certificates/${id}`)
      
      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('Certificado não encontrado')
        }
        throw new Error(`Erro ao buscar certificado: ${response.status}`)
      }

      return await response.json()
    } catch (error) {
      console.error('Erro ao buscar certificado:', error)
      throw error
    }
  }

  /**
   * Criar novo certificado
   */
  static async createCertificate(data: CertificateCreateRequest): Promise<{ success: boolean; data: Certificate; message: string }> {
    try {
      const response = await fetch(`${API_BASE_URL}/certificates`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || `Erro ao criar certificado: ${response.status}`)
      }

      return await response.json()
    } catch (error) {
      console.error('Erro ao criar certificado:', error)
      throw error
    }
  }

  /**
   * Atualizar certificado
   */
  static async updateCertificate(id: number, data: CertificateUpdateRequest): Promise<{ success: boolean; data: Certificate; message: string }> {
    try {
      const response = await fetch(`${API_BASE_URL}/certificates/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        const errorData = await response.json()
        if (response.status === 404) {
          throw new Error('Certificado não encontrado')
        }
        throw new Error(errorData.message || `Erro ao atualizar certificado: ${response.status}`)
      }

      return await response.json()
    } catch (error) {
      console.error('Erro ao atualizar certificado:', error)
      throw error
    }
  }

  /**
   * Excluir certificado
   */
  static async deleteCertificate(id: number): Promise<{ success: boolean; message: string }> {
    try {
      const response = await fetch(`${API_BASE_URL}/certificates/${id}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        const errorData = await response.json()
        if (response.status === 404) {
          throw new Error('Certificado não encontrado')
        }
        throw new Error(errorData.message || `Erro ao excluir certificado: ${response.status}`)
      }

      return await response.json()
    } catch (error) {
      console.error('Erro ao excluir certificado:', error)
      throw error
    }
  }

  /**
   * Buscar certificados por usuário
   */
  static async getCertificatesByUser(userId: number, filters: Omit<CertificateFilters, 'user_id') = {}): Promise<CertificateListResponse> {
    return this.getCertificates({ ...filters, user_id: userId })
  }

  /**
   * Buscar certificados por TV Show
   */
  static async getCertificatesByTvShow(tvShowId: number, filters: Omit<CertificateFilters, 'tv_show_id') = {}): Promise<CertificateListResponse> {
    return this.getCertificates({ ...filters, tv_show_id: tvShowId })
  }

  /**
   * Buscar certificados com pontuação mínima
   */
  static async getCertificatesWithMinScore(minScore: number, filters: Omit<CertificateFilters, 'score'> = {}): Promise<CertificateListResponse> {
    return this.getCertificates({ ...filters, score: minScore })
  }

  /**
   * Buscar certificados recriáveis
   */
  static async getRecreatableCertificates(filters: Omit<CertificateFilters, 'recreate'> = {}): Promise<CertificateListResponse> {
    return this.getCertificates({ ...filters, recreate: true })
  }

  /**
   * Validar dados do certificado antes de enviar
   */
  static validateCertificateData(data: CertificateCreateRequest | CertificateUpdateRequest): { isValid: boolean; errors: string[] } {
    const errors: string[] = []

    // Validações para criação
    if ('user_id' in data) {
      if (!data.user_id) {
        errors.push('Usuário é obrigatório')
      }
    }

    // Validações de pontuação
    if (data.score !== undefined && data.score !== null) {
      if (typeof data.score !== 'number' || data.score < 0) {
        errors.push('Pontuação deve ser um número válido maior ou igual a zero')
      }
    }

    // Validações de campos de texto
    if (data.document && data.document.length > 255) {
      errors.push('Documento não pode ter mais de 255 caracteres')
    }

    if (data.license_code && data.license_code.length > 255) {
      errors.push('Código de licença não pode ter mais de 255 caracteres')
    }

    if (data.tv_show_name && data.tv_show_name.length > 255) {
      errors.push('Nome do programa não pode ter mais de 255 caracteres')
    }

    if (data.path && data.path.length > 255) {
      errors.push('Caminho do arquivo não pode ter mais de 255 caracteres')
    }

    return {
      isValid: errors.length === 0,
      errors
    }
  }

  /**
   * Formatar dados do certificado para exibição
   */
  static formatCertificateForDisplay(certificate: Certificate) {
    return {
      ...certificate,
      displayName: certificate.document || certificate.license_code || `Certificado #${certificate.id}`,
      formattedScore: certificate.score !== null && certificate.score !== undefined ? certificate.score.toString() : 'N/A',
      formattedDate: new Date(certificate.date_created).toLocaleDateString('pt-BR'),
      formattedLastUpdate: certificate.last_updated ? new Date(certificate.last_updated).toLocaleDateString('pt-BR') : 'Nunca',
      statusLabel: certificate.recreate ? 'Recriável' : 'Não Recriável',
      statusColor: certificate.recreate ? 'green' : 'gray'
    }
  }
}

export default CertificateService