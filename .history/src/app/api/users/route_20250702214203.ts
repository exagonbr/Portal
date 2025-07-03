import { NextRequest, NextResponse } from 'next/server'
import { createCorsOptionsResponse, getCorsHeaders } from '@/config/cors'
import { prisma } from '@/lib/prisma'
import { requireAuth, requirePermission } from '@/middleware/auth'

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

export const GET = requirePermission(['users.manage.global', 'users.manage.institution'])(
  async (req: NextRequest, auth) => {
    try {
      const url = new URL(req.url)
      const limit = parseInt(url.searchParams.get('limit') || '50', 10)
      const search = url.searchParams.get('search')

      console.log('👤 [USERS-API] Busca de usuários por:', auth.user.email, 'Role:', auth.user.role);

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
        meta: {
          total: serializedUsers.length,
          limit,
          search,
          requestedBy: {
            id: auth.user.id,
            email: auth.user.email,
            role: auth.user.role
          }
        }
      }, {
        headers: getCorsHeaders(req.headers.get('origin') || undefined)
      })
    } catch (err: any) {
      console.log('❌ [USERS-API] Erro ao buscar usuários:', err)
      return NextResponse.json(
        {
          success: false,
          message: 'Erro interno do servidor',
          code: 'INTERNAL_ERROR'
        },
        {
          status: 500,
          headers: getCorsHeaders(req.headers.get('origin') || undefined)
        }
      )
    }
  }
)

