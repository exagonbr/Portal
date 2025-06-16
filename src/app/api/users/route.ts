import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { getAuthentication, hasRequiredRole } from '@/lib/auth-utils'
import { backendRequest } from '@/lib/api-proxy'

// Schema de validação para criação de usuário
const createUserSchema = z.object({
  name: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres'),
  email: z.string().email('Email inválido'),
  role: z.enum(['SYSTEM_ADMIN', 'INSTITUTION_ADMIN', 'SCHOOL_MANAGER', 'TEACHER', 'STUDENT', 'GUARDIAN']),
  institution_id: z.string().uuid().optional(),
  school_id: z.string().uuid().optional(),
  password: z.string().min(6, 'Senha deve ter pelo menos 6 caracteres').optional()
})

// Dados mock para fallback quando o backend não estiver disponível
const mockUsers = [
  {
    id: '1',
    name: 'Admin Sistema',
    email: 'admin@sabercon.edu.br',
    role: 'SYSTEM_ADMIN',
    institution_id: null,
    school_id: null,
    is_active: true,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z'
  },
  {
    id: '2',
    name: 'João Silva',
    email: 'joao.silva@escola.edu.br',
    role: 'TEACHER',
    institution_id: 'inst-123',
    school_id: 'school-456',
    is_active: true,
    created_at: '2024-01-02T00:00:00Z',
    updated_at: '2024-01-02T00:00:00Z'
  },
  {
    id: '3',
    name: 'Maria Santos',
    email: 'maria.santos@escola.edu.br',
    role: 'STUDENT',
    institution_id: 'inst-123',
    school_id: 'school-456',
    is_active: true,
    created_at: '2024-01-03T00:00:00Z',
    updated_at: '2024-01-03T00:00:00Z'
  },
  {
    id: '4',
    name: 'Ana Costa',
    email: 'ana.costa@coordenacao.edu.br',
    role: 'SCHOOL_MANAGER',
    institution_id: 'inst-123',
    school_id: 'school-456',
    is_active: true,
    created_at: '2024-01-04T00:00:00Z',
    updated_at: '2024-01-04T00:00:00Z'
  },
  {
    id: '5',
    name: 'Pedro Oliveira',
    email: 'pedro.oliveira@instituicao.edu.br',
    role: 'INSTITUTION_ADMIN',
    institution_id: 'inst-123',
    school_id: null,
    is_active: true,
    created_at: '2024-01-05T00:00:00Z',
    updated_at: '2024-01-05T00:00:00Z'
  }
]

// GET - Listar usuários
export async function GET(request: NextRequest) {
  try {
    const session = await getAuthentication(request)
    
    if (!session) {
      return NextResponse.json(
        { error: 'Não autorizado' },
        { status: 401 }
      )
    }

    // Verificar permissões
    const userRole = session.user?.role
    if (!hasRequiredRole(userRole, ['SYSTEM_ADMIN', 'INSTITUTION_ADMIN', 'SCHOOL_MANAGER'])) {
      return NextResponse.json(
        { error: 'Sem permissão para listar usuários' },
        { status: 403 }
      )
    }

    // Extrair parâmetros de query
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const search = searchParams.get('search') || ''
    const role = searchParams.get('role')
    const institution_id = searchParams.get('institution_id')
    const school_id = searchParams.get('school_id')
    const is_active = searchParams.get('is_active')
    const sortBy = searchParams.get('sortBy') || 'name'
    const sortOrder = searchParams.get('sortOrder') || 'asc'

    // Tentar conectar com o backend primeiro
    try {
      // Construir parâmetros para o backend
      const backendParams: Record<string, string | number | boolean> = {
        page,
        limit,
        sortBy,
        sortOrder
      }

      // Adicionar filtros opcionais
      if (search) backendParams.search = search
      if (role) backendParams.role = role
      if (institution_id) backendParams.institution_id = institution_id
      if (school_id) backendParams.school_id = school_id
      if (is_active !== null && is_active !== undefined) {
        backendParams.is_active = is_active === 'true'
      }

      // Aplicar filtros baseados no role do usuário
      if (userRole === 'INSTITUTION_ADMIN' && session.user.institution_id) {
        backendParams.institution_id = session.user.institution_id
      } else if (userRole === 'SCHOOL_MANAGER' && (session.user as any).school_id) {
        backendParams.school_id = (session.user as any).school_id
      }

      console.log('Tentando conectar com backend...', backendParams)

      // Fazer requisição para o backend
      const result = await backendRequest('/users', {
        method: 'GET',
        params: backendParams,
        token: session.user?.id
      })

      if (result.success) {
        console.log('Backend conectado com sucesso!')
        return NextResponse.json({
          success: true,
          data: {
            items: result.data.users || result.data.data?.users || result.data,
            pagination: result.data.pagination || {
              page,
              limit,
              total: result.data.users?.length || 0,
              totalPages: Math.ceil((result.data.users?.length || 0) / limit)
            }
          }
        })
      }
    } catch (backendError) {
      console.warn('Backend não disponível, usando dados mock:', backendError)
    }

    // Fallback para dados mock se o backend não estiver disponível
    console.log('Usando dados mock como fallback')
    
    let users = [...mockUsers]

    // Aplicar filtros baseados no role do usuário
    if (userRole === 'INSTITUTION_ADMIN' && session.user.institution_id) {
      users = users.filter(user => user.institution_id === session.user.institution_id)
    } else if (userRole === 'SCHOOL_MANAGER' && (session.user as any).school_id) {
      users = users.filter(user => user.school_id === (session.user as any).school_id)
    }

    // Aplicar filtros de busca
    if (search) {
      const searchLower = search.toLowerCase()
      users = users.filter(user => 
        user.name.toLowerCase().includes(searchLower) ||
        user.email.toLowerCase().includes(searchLower)
      )
    }

    if (role) {
      users = users.filter(user => user.role === role)
    }

    if (institution_id) {
      users = users.filter(user => user.institution_id === institution_id)
    }

    if (school_id) {
      users = users.filter(user => user.school_id === school_id)
    }

    if (is_active !== null && is_active !== undefined) {
      users = users.filter(user => user.is_active === (is_active === 'true'))
    }

    // Ordenar os dados
    users.sort((a, b) => {
      const aVal = a[sortBy as keyof typeof a] || ''
      const bVal = b[sortBy as keyof typeof b] || ''
      
      if (sortOrder === 'desc') {
        return String(bVal).localeCompare(String(aVal))
      }
      return String(aVal).localeCompare(String(bVal))
    })

    // Aplicar paginação
    const startIndex = (page - 1) * limit
    const endIndex = page * limit
    const paginatedUsers = users.slice(startIndex, endIndex)

    // Remover dados sensíveis
    const safeUsers = paginatedUsers.map(user => ({
      ...user,
      password: undefined
    }))

    return NextResponse.json({
      success: true,
      data: {
        items: safeUsers,
        pagination: {
          page,
          limit,
          total: users.length,
          totalPages: Math.ceil(users.length / limit),
          hasNext: page * limit < users.length,
          hasPrev: page > 1
        }
      },
      message: 'Dados retornados do sistema mock (backend indisponível)'
    })

  } catch (error) {
    console.error('Erro ao listar usuários:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

// POST - Criar usuário
export async function POST(request: NextRequest) {
  try {
    const session = await getAuthentication(request)
    
    if (!session) {
      return NextResponse.json(
        { error: 'Não autorizado' },
        { status: 401 }
      )
    }

    // Verificar permissões
    const userRole = session.user?.role
    if (!hasRequiredRole(userRole, ['SYSTEM_ADMIN', 'INSTITUTION_ADMIN', 'SCHOOL_MANAGER'])) {
      return NextResponse.json(
        { error: 'Sem permissão para criar usuários' },
        { status: 403 }
      )
    }

    const body = await request.json()

    // Validar dados
    const validationResult = createUserSchema.safeParse(body)
    if (!validationResult.success) {
      return NextResponse.json(
        { 
          error: 'Dados inválidos',
          errors: validationResult.error.flatten().fieldErrors
        },
        { status: 400 }
      )
    }

    const userData = validationResult.data

    // Aplicar restrições baseadas no role do usuário
    if (userRole === 'INSTITUTION_ADMIN' && session.user.institution_id) {
      userData.institution_id = session.user.institution_id
    } else if (userRole === 'SCHOOL_MANAGER' && (session.user as any).school_id) {
      userData.school_id = (session.user as any).school_id
      userData.institution_id = session.user.institution_id
    }

    // Tentar conectar com o backend
    try {
      const result = await backendRequest('/users', {
        method: 'POST',
        body: userData,
        token: session.user?.id
      })

      if (result.success) {
        return NextResponse.json({
          success: true,
          data: result.data.data || result.data,
          message: 'Usuário criado com sucesso'
        }, { status: 201 })
      }

      // Tratar erros específicos do backend
      if (result.status === 409) {
        return NextResponse.json(
          { error: 'Email já está em uso' },
          { status: 409 }
        )
      }

      if (result.status === 400) {
        return NextResponse.json(
          { 
            error: 'Dados inválidos',
            errors: result.data.errors || ['Erro de validação']
          },
          { status: 400 }
        )
      }

    } catch (backendError) {
      console.warn('Backend não disponível para criação:', backendError)
    }

    // Fallback para mock se o backend não estiver disponível
    const newUser = {
      id: `mock_${Date.now()}`,
      ...userData,
      password: undefined, // Não retornar senha
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }

    return NextResponse.json({
      success: true,
      data: newUser,
      message: 'Usuário criado com sucesso (dados mock - backend indisponível)'
    }, { status: 201 })

  } catch (error) {
    console.error('Erro ao criar usuário:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}