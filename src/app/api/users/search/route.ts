import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001'

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
    const is_active = searchParams.get('is_active')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')

    if (!query || query.length < 2) {
      return NextResponse.json({
        success: true,
        data: [],
        message: 'Digite pelo menos 2 caracteres para buscar'
      })
    }

    // Construir URL com parâmetros
    const params = new URLSearchParams({
      q: query,
      page: page.toString(),
      limit: limit.toString()
    })
    
    if (role_id) params.append('role_id', role_id)
    if (institution_id) params.append('institution_id', institution_id)
    if (school_id) params.append('school_id', school_id)
    if (is_active !== null) params.append('is_active', is_active)

    // Buscar usuários da API
    const response = await fetch(`${BACKEND_URL}/api/users/search?${params.toString()}`, {
      headers: {
        'Authorization': `Bearer ${session.user?.id}`,
        'Content-Type': 'application/json'
      }
    })

    if (!response.ok) {
      throw new Error('Erro ao buscar usuários')
    }

    const responseData = await response.json()

    // O backend pode retornar um array plano ou um objeto { data: [...] }
    const allItems = Array.isArray(responseData) ? responseData : responseData.data || []

    const totalItems = allItems.length
    const totalPages = Math.ceil(totalItems / limit)
    
    // Simula a paginação cortando o array de resultados
    const paginatedItems = allItems.slice((page - 1) * limit, page * limit)

    const result = {
      items: paginatedItems,
      pagination: {
        total: totalItems,
        totalPages: totalPages,
        page: page,
        limit: limit
      }
    }

    return NextResponse.json(result)

  } catch (error) {
    console.error('Erro na busca de usuários:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
} 