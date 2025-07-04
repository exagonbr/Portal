import { 
  UserResponseDto, 
  RoleResponseDto, 
  InstitutionResponseDto,
  PaginatedResponseDto,
  UserFilterDto
} from '@/types/api'

import {
  Certificate,
  CertificateFilters,
  CertificateListResponse
} from '@/types/certificate'

// Mock de funções (roles)
const mockRoles: RoleResponseDto[] = [
  {
    id: 1,
    name: 'SYSTEM_ADMIN',
    description: 'Administrador do Sistema',
    active: true,
    users_count: 2,
    created_at: '2025-01-01T00:00:00Z',
    updated_at: '2025-01-01T00:00:00Z',
    status: 'active'
  },
  {
    id: 2,
    name: 'INSTITUTION_MANAGER',
    description: 'Gestor da Instituição',
    active: true,
    users_count: 5,
    created_at: '2025-01-01T00:00:00Z',
    updated_at: '2025-01-01T00:00:00Z',
    status: 'active'
  },
  {
    id: 3,
    name: 'TEACHER',
    description: 'Professor',
    active: true,
    users_count: 20,
    created_at: '2025-01-01T00:00:00Z',
    updated_at: '2025-01-01T00:00:00Z',
    status: 'active'
  },
  {
    id: 4,
    name: 'STUDENT',
    description: 'Estudante',
    active: true,
    users_count: 100,
    created_at: '2025-01-01T00:00:00Z',
    updated_at: '2025-01-01T00:00:00Z',
    status: 'active'
  },
  {
    id: 5,
    name: 'COORDINATOR',
    description: 'Coordenador',
    active: true,
    users_count: 10,
    created_at: '2025-01-01T00:00:00Z',
    updated_at: '2025-01-01T00:00:00Z',
    status: 'active'
  }
]

// Mock de instituições
const mockInstitutions: InstitutionResponseDto[] = [
  {
    id: 1,
    version: 1,
    accountable_contact: 'contato@escolaA.edu.br',
    accountable_name: 'João Silva',
    company_name: 'Escola A Ltda',
    complement: 'Bloco A',
    contract_disabled: false,
    contract_invoice_num: '2025001',
    contract_num: 1001,
    contract_term_end: '2026-12-31',
    contract_term_start: '2025-01-01',
    date_created: '2025-01-01T00:00:00Z',
    deleted: false,
    district: 'Centro',
    document: '12.345.678/0001-01',
    invoice_date: '2025-01-01',
    last_updated: '2025-01-01T00:00:00Z',
    name: 'Escola A',
    postal_code: '12345-678',
    state: 'SP',
    street: 'Rua Principal, 123',
    score: 95,
    has_library_platform: true,
    has_principal_platform: true,
    has_student_platform: true
  },
  {
    id: 2,
    version: 1,
    accountable_contact: 'contato@escolaB.edu.br',
    accountable_name: 'Maria Santos',
    company_name: 'Escola B Ltda',
    complement: 'Andar 2',
    contract_disabled: false,
    contract_invoice_num: '2025002',
    contract_num: 1002,
    contract_term_end: '2026-12-31',
    contract_term_start: '2025-01-01',
    date_created: '2025-01-01T00:00:00Z',
    deleted: false,
    district: 'Vila Nova',
    document: '98.765.432/0001-02',
    invoice_date: '2025-01-01',
    last_updated: '2025-01-01T00:00:00Z',
    name: 'Escola B',
    postal_code: '87654-321',
    state: 'RJ',
    street: 'Avenida Secundária, 456',
    score: 88,
    has_library_platform: true,
    has_principal_platform: true,
    has_student_platform: true
  }
]

// Mock de usuários
const mockUsers: UserResponseDto[] = [
  {
    id: 1,
    version: 1,
    uuid: '550e8400-e29b-41d4-a716-446655440000',
    full_name: 'Admin do Sistema',
    email: 'admin@sistema.com',
    username: 'admin',
    account_expired: false,
    account_locked: false,
    enabled: true,
    password_expired: false,
    address: 'Rua Admin, 123',
    phone: '(11) 99999-9999',
    language: 'pt_BR',
    is_admin: true,
    is_manager: false,
    is_student: false,
    is_teacher: false,
    type: 1,
    institution_id: '1',
    role_id: '1',
    date_created: '2025-01-01T00:00:00Z',
    last_updated: '2025-01-01T00:00:00Z'
  },
  {
    id: 2,
    version: 1,
    uuid: '550e8400-e29b-41d4-a716-446655440001',
    full_name: 'Gestor da Escola A',
    email: 'gestor@escolaA.edu.br',
    username: 'gestor.escolaA',
    account_expired: false,
    account_locked: false,
    enabled: true,
    password_expired: false,
    address: 'Rua Gestor, 456',
    phone: '(11) 98888-8888',
    language: 'pt_BR',
    is_admin: false,
    is_manager: true,
    is_student: false,
    is_teacher: false,
    type: 2,
    institution_id: '1',
    role_id: '2',
    date_created: '2025-01-01T00:00:00Z',
    last_updated: '2025-01-01T00:00:00Z'
  },
  {
    id: 3,
    version: 1,
    uuid: '550e8400-e29b-41d4-a716-446655440002',
    full_name: 'Professor João',
    email: 'joao@escolaA.edu.br',
    username: 'prof.joao',
    account_expired: false,
    account_locked: false,
    enabled: true,
    password_expired: false,
    address: 'Rua Professor, 789',
    phone: '(11) 97777-7777',
    language: 'pt_BR',
    is_admin: false,
    is_manager: false,
    is_student: false,
    is_teacher: true,
    type: 3,
    institution_id: '1',
    role_id: '3',
    date_created: '2025-01-01T00:00:00Z',
    last_updated: '2025-01-01T00:00:00Z'
  }
]

// Mock de certificados
const mockCertificates: Certificate[] = [
  {
    id: 1,
    version: 1,
    date_created: '2025-03-15T10:30:00Z',
    last_updated: '2025-03-15T10:30:00Z',
    path: '/certificados/cert-001.pdf',
    score: 95,
    tv_show_id: '1',
    user_id: '3',
    document: 'CERT-2025-001',
    license_code: 'LIC-001-2025',
    tv_show_name: 'Curso de Matemática Avançada',
    recreate: true,
    user: {
      id: 3,
      name: 'Professor João',
      email: 'joao@escolaA.edu.br'
    },
    tv_show: {
      id: 1,
      name: 'Curso de Matemática Avançada'
    }
  },
  {
    id: 2,
    version: 1,
    date_created: '2025-03-16T14:20:00Z',
    last_updated: '2025-03-16T14:20:00Z',
    path: '/certificados/cert-002.pdf',
    score: 88,
    tv_show_id: '2',
    user_id: '2',
    document: 'CERT-2025-002',
    license_code: 'LIC-002-2025',
    tv_show_name: 'Gestão Educacional Moderna',
    recreate: false,
    user: {
      id: 2,
      name: 'Gestor da Escola A',
      email: 'gestor@escolaA.edu.br'
    },
    tv_show: {
      id: 2,
      name: 'Gestão Educacional Moderna'
    }
  },
  {
    id: 3,
    version: 1,
    date_created: '2025-03-17T09:15:00Z',
    last_updated: '2025-03-17T09:15:00Z',
    path: '/certificados/cert-003.pdf',
    score: 100,
    tv_show_id: '3',
    user_id: '1',
    document: 'CERT-2025-003',
    license_code: 'LIC-003-2025',
    tv_show_name: 'Administração de Sistemas Educacionais',
    recreate: true,
    user: {
      id: 1,
      name: 'Admin do Sistema',
      email: 'admin@sistema.com'
    },
    tv_show: {
      id: 3,
      name: 'Administração de Sistemas Educacionais'
    }
  }
]

// Serviço mock de usuários
export const mockUsersService = {
  getUsers: async (params: UserFilterDto): Promise<PaginatedResponseDto<UserResponseDto>> => {
    const page = params.page || 1
    const limit = params.limit || 10
    const start = (page - 1) * limit
    const end = start + limit

    let filteredUsers = [...mockUsers]

    // Aplicar filtros
    if (params.search) {
      const searchLower = params.search.toLowerCase()
      filteredUsers = filteredUsers.filter(user => 
        user.full_name.toLowerCase().includes(searchLower) ||
        user.email.toLowerCase().includes(searchLower)
      )
    }

    if (params.role_id) {
      filteredUsers = filteredUsers.filter(user => user.role_id === params.role_id)
    }

    if (params.institution_id) {
      filteredUsers = filteredUsers.filter(user => user.institution_id === params.institution_id)
    }

    // Ordenação
    if (params.sortBy) {
      filteredUsers.sort((a, b) => {
        const aValue = a[params.sortBy as keyof UserResponseDto]
        const bValue = b[params.sortBy as keyof UserResponseDto]
        if (typeof aValue === 'string' && typeof bValue === 'string') {
          return params.sortOrder === 'desc' 
            ? bValue.localeCompare(aValue)
            : aValue.localeCompare(bValue)
        }
        return 0
      })
    }

    const paginatedUsers = filteredUsers.slice(start, end)
    const total = filteredUsers.length
    const totalPages = Math.ceil(total / limit)

    return {
      items: paginatedUsers,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1
      },
      total,
      page,
      limit,
      totalPages,
      hasNext: page < totalPages,
      hasPrev: page > 1
    }
  },

  deleteUser: async (id: string): Promise<void> => {
    const index = mockUsers.findIndex(user => user.id.toString() === id)
    if (index !== -1) {
      mockUsers.splice(index, 1)
    }
  }
}

// Serviço mock de funções (roles)
export const mockRoleService = {
  getRoles: async (params: any): Promise<PaginatedResponseDto<RoleResponseDto>> => {
    const page = params.page || 1
    const limit = params.limit || 10
    const start = (page - 1) * limit
    const end = start + limit

    const paginatedRoles = mockRoles.slice(start, end)
    const total = mockRoles.length
    const totalPages = Math.ceil(total / limit)

    return {
      items: paginatedRoles,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1
      },
      total,
      page,
      limit,
      totalPages,
      hasNext: page < totalPages,
      hasPrev: page > 1
    }
  },

  createRole: async (data: any): Promise<RoleResponseDto> => {
    const newRole: RoleResponseDto = {
      id: Math.max(...mockRoles.map(r => r.id)) + 1,
      name: data.name,
      description: data.description || '',
      active: data.active ?? true,
      users_count: 0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      status: data.active ? 'active' : 'inactive'
    }
    mockRoles.push(newRole)
    return newRole
  },

  updateRole: async (id: string, data: any): Promise<RoleResponseDto> => {
    const roleIndex = mockRoles.findIndex(r => r.id.toString() === id)
    if (roleIndex === -1) throw new Error('Role não encontrada')
    
    mockRoles[roleIndex] = {
      ...mockRoles[roleIndex],
      name: data.name,
      description: data.description || '',
      active: data.active ?? mockRoles[roleIndex].active,
      updated_at: new Date().toISOString(),
      status: data.active ? 'active' : 'inactive'
    }
    return mockRoles[roleIndex]
  },

  deleteRole: async (id: string): Promise<void> => {
    const roleIndex = mockRoles.findIndex(r => r.id.toString() === id)
    if (roleIndex === -1) throw new Error('Role não encontrada')
    mockRoles.splice(roleIndex, 1)
  },

  toggleRoleStatus: async (id: string, newStatus: boolean): Promise<RoleResponseDto> => {
    const roleIndex = mockRoles.findIndex(r => r.id.toString() === id)
    if (roleIndex === -1) throw new Error('Role não encontrada')
    
    mockRoles[roleIndex].active = newStatus
    mockRoles[roleIndex].status = newStatus ? 'active' : 'inactive'
    mockRoles[roleIndex].updated_at = new Date().toISOString()
    
    return mockRoles[roleIndex]
  }
}

// Serviço mock de instituições
export const mockInstitutionService = {
  getInstitutions: async (params: any): Promise<PaginatedResponseDto<InstitutionResponseDto>> => {
    const page = params.page || 1
    const limit = params.limit || 10
    const start = (page - 1) * limit
    const end = start + limit

    const paginatedInstitutions = mockInstitutions.slice(start, end)
    const total = mockInstitutions.length
    const totalPages = Math.ceil(total / limit)

    return {
      items: paginatedInstitutions,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1
      },
      total,
      page,
      limit,
      totalPages,
      hasNext: page < totalPages,
      hasPrev: page > 1
    }
  }
}

// Serviço mock de certificados
export const mockCertificateService = {
  getCertificates: async (filters: CertificateFilters): Promise<CertificateListResponse> => {
    const page = filters.page || 1
    const limit = filters.limit || 10
    const start = (page - 1) * limit
    const end = start + limit

    let filteredCertificates = [...mockCertificates]

    // Aplicar filtros
    if (filters.search) {
      const searchLower = filters.search.toLowerCase()
      filteredCertificates = filteredCertificates.filter(cert => 
        cert.document?.toLowerCase().includes(searchLower) ||
        cert.license_code?.toLowerCase().includes(searchLower) ||
        cert.tv_show_name?.toLowerCase().includes(searchLower) ||
        cert.user?.name.toLowerCase().includes(searchLower) ||
        cert.user?.email.toLowerCase().includes(searchLower)
      )
    }

    if (filters.user_id) {
      filteredCertificates = filteredCertificates.filter(cert => 
        cert.user_id === filters.user_id
      )
    }

    if (filters.tv_show_id) {
      filteredCertificates = filteredCertificates.filter(cert => 
        cert.tv_show_id === filters.tv_show_id
      )
    }

    if (filters.tv_show_name) {
      const showNameLower = filters.tv_show_name.toLowerCase()
      filteredCertificates = filteredCertificates.filter(cert => 
        cert.tv_show_name?.toLowerCase().includes(showNameLower)
      )
    }

    if (filters.recreate !== undefined) {
      filteredCertificates = filteredCertificates.filter(cert => 
        cert.recreate === filters.recreate
      )
    }

    // Ordenação
    if (filters.sort_by) {
      filteredCertificates.sort((a, b) => {
        const aValue = a[filters.sort_by as keyof Certificate]
        const bValue = b[filters.sort_by as keyof Certificate]
        
        if (typeof aValue === 'string' && typeof bValue === 'string') {
          return filters.sort_order === 'desc'
            ? bValue.localeCompare(aValue)
            : aValue.localeCompare(bValue)
        }
        
        if (typeof aValue === 'number' && typeof bValue === 'number') {
          return filters.sort_order === 'desc'
            ? bValue - aValue
            : aValue - bValue
        }
        
        return 0
      })
    }

    const paginatedCertificates = filteredCertificates.slice(start, end)
    const total = filteredCertificates.length
    const totalPages = Math.ceil(total / limit)

    return {
      success: true,
      data: paginatedCertificates,
      pagination: {
        total,
        page,
        totalPages
      }
    }
  },

  deleteCertificate: async (id: number): Promise<void> => {
    const index = mockCertificates.findIndex(cert => cert.id === id)
    if (index !== -1) {
      mockCertificates.splice(index, 1)
    }
  },

  createCertificate: async (data: Partial<Certificate>): Promise<Certificate> => {
    const newCertificate: Certificate = {
      id: mockCertificates.length + 1,
      version: 1,
      date_created: new Date().toISOString(),
      ...data
    }
    mockCertificates.push(newCertificate)
    return newCertificate
  },

  updateCertificate: async (id: number, data: Partial<Certificate>): Promise<Certificate> => {
    const index = mockCertificates.findIndex(cert => cert.id === id)
    if (index === -1) {
      throw new Error('Certificado não encontrado')
    }
    
    const updatedCertificate = {
      ...mockCertificates[index],
      ...data,
      last_updated: new Date().toISOString()
    }
    
    mockCertificates[index] = updatedCertificate
    return updatedCertificate
  }
}