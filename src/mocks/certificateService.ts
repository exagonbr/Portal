import { Certificate } from '@/types/certificate'
import { ApiResponse } from '@/types/api'

// Mock data
const mockCertificates: Certificate[] = [
  {
    id: 1,
    document: 'Certificado de Conclusão - Programa 1',
    license_code: 'CERT-001',
    date_created: '2025-01-01T00:00:00Z',
    last_updated: '2025-01-01T00:00:00Z',
    score: 95,
    tv_show_name: 'Programa Educativo 1',
    recreate: true,
    user: {
      id: 1,
      name: 'João Silva',
      email: 'joao@example.com'
    },
    tv_show: {
      id: 1,
      name: 'Programa Educativo 1'
    }
  },
  {
    id: 2,
    document: 'Certificado de Participação - Programa 2',
    license_code: 'CERT-002',
    date_created: '2025-01-02T00:00:00Z',
    score: 87,
    tv_show_name: 'Programa Educativo 2',
    recreate: false,
    user: {
      id: 2,
      name: 'Maria Santos',
      email: 'maria@example.com'
    },
    tv_show: {
      id: 2,
      name: 'Programa Educativo 2'
    }
  },
  {
    id: 3,
    document: 'Certificado de Excelência - Programa 3',
    license_code: 'CERT-003',
    date_created: '2025-01-03T00:00:00Z',
    last_updated: '2025-01-03T12:00:00Z',
    score: 100,
    tv_show_name: 'Programa Educativo 3',
    recreate: true,
    user: {
      id: 3,
      name: 'Pedro Oliveira',
      email: 'pedro@example.com'
    },
    tv_show: {
      id: 3,
      name: 'Programa Educativo 3'
    }
  }
]

export const certificateService = {
  getCertificates: async (params: any): Promise<ApiResponse<Certificate[]>> => {
    const { page = 1, limit = 10, search = '', tv_show_name, recreate } = params
    
    let filteredCertificates = [...mockCertificates]

    // Aplicar filtros
    if (search) {
      const searchLower = search.toLowerCase()
      filteredCertificates = filteredCertificates.filter(cert => 
        cert.document?.toLowerCase().includes(searchLower) ||
        cert.license_code?.toLowerCase().includes(searchLower) ||
        cert.tv_show_name?.toLowerCase().includes(searchLower) ||
        cert.user?.name.toLowerCase().includes(searchLower) ||
        cert.user?.email.toLowerCase().includes(searchLower)
      )
    }

    if (tv_show_name) {
      filteredCertificates = filteredCertificates.filter(cert =>
        cert.tv_show_name?.toLowerCase().includes(tv_show_name.toLowerCase())
      )
    }

    if (recreate !== undefined) {
      filteredCertificates = filteredCertificates.filter(cert =>
        cert.recreate === recreate
      )
    }

    // Paginação
    const start = (page - 1) * limit
    const end = start + limit
    const paginatedCertificates = filteredCertificates.slice(start, end)

    return {
      success: true,
      data: paginatedCertificates,
      pagination: {
        page,
        limit,
        total: filteredCertificates.length,
        totalPages: Math.ceil(filteredCertificates.length / limit),
        hasNext: end < filteredCertificates.length,
        hasPrev: page > 1
      }
    }
  },

  getCertificate: async (id: number): Promise<ApiResponse<Certificate>> => {
    const certificate = mockCertificates.find(c => c.id === id)
    if (!certificate) {
      throw new Error('Certificado não encontrado')
    }

    return {
      success: true,
      data: certificate
    }
  },

  createCertificate: async (data: Partial<Certificate>): Promise<ApiResponse<Certificate>> => {
    const newCertificate: Certificate = {
      id: mockCertificates.length + 1,
      date_created: new Date().toISOString(),
      ...data
    }

    mockCertificates.push(newCertificate)

    return {
      success: true,
      data: newCertificate
    }
  },

  updateCertificate: async (id: number, data: Partial<Certificate>): Promise<ApiResponse<Certificate>> => {
    const index = mockCertificates.findIndex(c => c.id === id)
    if (index === -1) {
      throw new Error('Certificado não encontrado')
    }

    const updatedCertificate = {
      ...mockCertificates[index],
      ...data,
      last_updated: new Date().toISOString()
    }

    mockCertificates[index] = updatedCertificate

    return {
      success: true,
      data: updatedCertificate
    }
  },

  deleteCertificate: async (id: number): Promise<ApiResponse<void>> => {
    const index = mockCertificates.findIndex(c => c.id === id)
    if (index === -1) {
      throw new Error('Certificado não encontrado')
    }

    mockCertificates.splice(index, 1)

    return {
      success: true
    }
  }
}