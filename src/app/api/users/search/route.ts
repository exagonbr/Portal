import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

// Mock database - substituir por Prisma/banco real
const mockUsers = new Map()

// GET - Buscar usuários
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json(
        { error: 'Não autorizado' },
        { status: 401 }
      )
    }

    // Verificar permissões
    const userRole = session.user?.role
    if (!['SYSTEM_ADMIN', 'INSTITUTION_ADMIN', 'SCHOOL_MANAGER', 'TEACHER'].includes(userRole)) {
      return NextResponse.json(
        { error: 'Sem permissão para buscar usuários' },
        { status: 403 }
      )
    }

    // Parâmetros de busca
    const { searchParams } = new URL(request.url)
    const query = searchParams.get('q') || ''
    const role_id = searchParams.get('role_id')
    const institution_id = searchParams.get('institution_id')
    const school_id = searchParams.get('school_id')
    const limit = parseInt(searchParams.get('limit') || '20')

    if (!query || query.length < 2) {
      return NextResponse.json({
        success: true,
        data: [],
        message: 'Digite pelo menos 2 caracteres para buscar'
      })
    }

    // Buscar usuários (substituir por query real com índice de busca)
    let users = Array.from(mockUsers.values())

    // Aplicar busca
    const searchLower = query.toLowerCase()
    users = users.filter(user => 
      user.name.toLowerCase().includes(searchLower) ||
      user.email.toLowerCase().includes(searchLower) ||
      (user.telefone && user.telefone.includes(query))
    )

    // Aplicar filtros adicionais
    if (role_id) {
      users = users.filter(user => user.role_id === role_id)
    }

    // Filtrar por escopo de permissão
    if (userRole === 'INSTITUTION_ADMIN' && session.user.institution_id) {
      users = users.filter(user => user.institution_id === session.user.institution_id)
    } else if (userRole === 'SCHOOL_MANAGER' && session.user.school_id) {
      users = users.filter(user => user.school_id === session.user.school_id)
    } else {
      // Aplicar filtros opcionais
      if (institution_id) {
        users = users.filter(user => user.institution_id === institution_id)
      }
      if (school_id) {
        users = users.filter(user => user.school_id === school_id)
      }
    }

    // Limitar resultados
    const limitedUsers = users.slice(0, limit)

    // Remover senhas e preparar resposta simplificada
    const sanitizedUsers = limitedUsers.map(({ password, ...user }) => ({
      id: user.id,
      name: user.name,
      email: user.email,
      role_id: user.role_id,
      institution_id: user.institution_id,
      school_id: user.school_id,
      is_active: user.is_active
    }))

    return NextResponse.json({
      success: true,
      data: sanitizedUsers,
      total: users.length,
      displayed: sanitizedUsers.length
    })

  } catch (error) {
    console.error('Erro na busca de usuários:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
} 