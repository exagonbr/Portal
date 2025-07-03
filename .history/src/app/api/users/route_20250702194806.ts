import { NextRequest, NextResponse } from 'next/server'
import { createCorsOptionsResponse, getCorsHeaders } from '@/config/cors'
import { prisma } from '@/lib/prisma'

interface UserQueryResult {
  id: bigint
  full_name: string
  email: string
}


// Handler para requisições OPTIONS (preflight)
export async function OPTIONS(request: NextRequest) {
  const origin = request.headers.get('origin') || undefined;
  return createCorsOptionsResponse(origin);
}

export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url)
    const limit = parseInt(url.searchParams.get('limit') || '50', 10)
    const search = url.searchParams.get('search')

    // Usar consulta SQL bruta para contornar problemas de schema
    let users: UserQueryResult[]
    if (search) {
      users = await prisma.$queryRaw<UserQueryResult[]>`
        SELECT id, full_name, email
        FROM "users"
        WHERE full_name ILIKE ${'%' + search + '%'} OR email ILIKE ${'%' + search + '%'}
        ORDER BY full_name ASC
        LIMIT ${Math.min(limit, 1000)}
      `
    } else {
      users = await prisma.$queryRaw<UserQueryResult[]>`
        SELECT id, full_name, email
        FROM "users"
        ORDER BY full_name ASC
        LIMIT ${Math.min(limit, 1000)}
      `
    }

    // Converter BigInt para string para serialização JSON
    const serializedUsers = users.map((user: UserQueryResult) => ({
      ...user,
      id: user.id.toString()
    }))

    return NextResponse.json({
      success: true,
      data: serializedUsers,
    }, {
      headers: getCorsHeaders(req.headers.get('origin') || undefined)
    })
  } catch (err: any) {
    console.error('Erro ao buscar usuários:', err)
    return NextResponse.json(
      {
        success: false,
        message: 'Erro interno do servidor',
        error: err.message || 'Ocorreu um erro desconhecido'
      },
      {
        status: 500,
        headers: getCorsHeaders(req.headers.get('origin') || undefined)
      }
    )
  }
}

