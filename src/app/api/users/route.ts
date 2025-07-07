import { NextRequest, NextResponse } from 'next/server'
import { createCorsOptionsResponse, getCorsHeaders } from '@/config/cors'
import { prisma } from '@/lib/prisma'
import { createStandardApiRoute } from '../lib/api-route-template'

interface UserQueryResult {
  id: bigint
  full_name: string
  email: string
}

// Usar o template padronizado para a rota GET
export const { GET, OPTIONS } = createStandardApiRoute({
  endpoint: '/api/users',
  name: 'users',
  fallbackFunction: async (req: NextRequest) => {
    console.log('🔄 [API-USERS] Usando dados locais do banco Prisma');
    try {
      const url = new URL(req.url);
      const limit = parseInt(url.searchParams.get('limit') || '50', 10);
      const search = url.searchParams.get('search');

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
        id: user.id.toString(),
        name: user.full_name,
        full_name: user.full_name,
        email: user.email,
        enabled: true,
        is_active: true,
        role_id: '1',
        date_created: new Date().toISOString(),
        last_updated: new Date().toISOString(),
      }))

      console.log('✅ [API-USERS] Dados locais obtidos com sucesso:', serializedUsers.length);

      return NextResponse.json({
        items: serializedUsers,
        total: serializedUsers.length,
        page: 1,
        limit: limit,
        totalPages: 1,
      }, {
        headers: getCorsHeaders(req.headers.get('origin') || undefined)
      })
    } catch (dbError) {
      console.error('❌ [API-USERS] Erro ao acessar banco local:', dbError);
      return NextResponse.json(
        { 
          success: false, 
          message: 'Erro ao buscar usuários',
          error: String(dbError)
        },
        { status: 500 }
      );
    }
  }
});

