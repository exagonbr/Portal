import { ApiResponse, UserResponseDto, PaginatedResponseDto } from '@/types/api'

// Mock data
const mockUsers: UserResponseDto[] = [
  {
    id: 1,
    full_name: 'João Silva',
    email: 'joao@example.com',
    username: 'joao.silva',
    enabled: true,
    is_admin: false,
    is_manager: false,
    is_student: true,
    is_teacher: false,
    date_created: '2025-01-01T00:00:00Z',
    role_id: '2', // Student
    institution_id: '1'
  },
  {
    id: 2,
    full_name: 'Maria Santos',
    email: 'maria@example.com',
    username: 'maria.santos',
    enabled: true,
    is_admin: false,
    is_manager: false,
    is_student: true,
    is_teacher: false,
    date_created: '2025-01-02T00:00:00Z',
    role_id: '2', // Student
    institution_id: '1'
  },
  {
    id: 3,
    full_name: 'Pedro Oliveira',
    email: 'pedro@example.com',
    username: 'pedro.oliveira',
    enabled: true,
    is_admin: false,
    is_manager: false,
    is_student: false,
    is_teacher: true,
    date_created: '2025-01-03T00:00:00Z',
    role_id: '3', // Teacher
    institution_id: '1'
  }
]

export const userService = {
  getUsers: async (params: any): Promise<PaginatedResponseDto<UserResponseDto>> => {
    const { page = 1, limit = 10, search = '' } = params
    
    let filteredUsers = [...mockUsers]

    // Aplicar busca
    if (search) {
      const searchLower = search.toLowerCase()
      filteredUsers = filteredUsers.filter(user => 
        user.full_name.toLowerCase().includes(searchLower) ||
        user.email.toLowerCase().includes(searchLower) ||
        user.username?.toLowerCase().includes(searchLower)
      )
    }

    // Paginação
    const start = (page - 1) * limit
    const end = start + limit
    const paginatedUsers = filteredUsers.slice(start, end)

    return {
      items: paginatedUsers,
      pagination: {
        page,
        limit,
        total: filteredUsers.length,
        totalPages: Math.ceil(filteredUsers.length / limit),
        hasNext: end < filteredUsers.length,
        hasPrev: page > 1
      },
      total: filteredUsers.length,
      page,
      limit,
      totalPages: Math.ceil(filteredUsers.length / limit),
      hasNext: end < filteredUsers.length,
      hasPrev: page > 1
    }
  },

  getUser: async (id: number): Promise<ApiResponse<UserResponseDto>> => {
    const user = mockUsers.find(u => u.id === id)
    if (!user) {
      throw new Error('Usuário não encontrado')
    }

    return {
      success: true,
      data: user
    }
  }
}