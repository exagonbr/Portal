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

    // Fazer requisição para o backend
    const result = await backendRequest('/users', {
      method: 'GET',
      params: backendParams,
      token: session.user?.id
    })

    if (!result.success) {
      console.error('Erro ao buscar usuários no backend:', result)
      return NextResponse.json(
        { error: 'Erro ao buscar usuários' },
        { status: result.status }
      )
    }

    // O backend já retorna os dados no formato correto
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

    // Fazer requisição para o backend
    const result = await backendRequest('/users', {
      method: 'POST',
      body: userData,
      token: session.user?.id
    })

    if (!result.success) {
      console.error('Erro ao criar usuário no backend:', result)
      
      // Tratar erros específicos
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

      return NextResponse.json(
        { error: 'Erro ao criar usuário' },
        { status: result.status }
      )
    }

    return NextResponse.json({
      success: true,
      data: result.data.data || result.data,
      message: 'Usuário criado com sucesso'
    }, { status: 201 })

  } catch (error) {
    console.error('Erro ao criar usuário:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}