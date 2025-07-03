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
    if (!process.env.DATABASE_URL) {
      return NextResponse.json(
        { success: false, message: 'Configuração do banco de dados ausente. A variável DATABASE_URL não foi definida.' },
        { status: 500, headers: getCorsHeaders(req.headers.get('origin') || undefined) }
      );
    }

    const url = new URL(req.url)
    const limit = parseInt(url.searchParams.get('limit') || '50', 10)
    const search = url.searchParams.get('search')

    const whereClause = search
      ? {
          OR: [
            { full_name: { contains: search, mode: 'insensitive' } },
            { email: { contains: search, mode: 'insensitive' } },
          ],
        }
      : {};

    const users = await prisma.user.findMany({
      where: whereClause,
      take: limit,
      orderBy: {
        full_name: 'asc',
      },
      select: {
        id: true,
        full_name: true,
        email: true,
      },
    });

    const serializedUsers = users.map(user => ({
        ...user,
        id: user.id.toString(),
    }));

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
        error: err.message,
        code: err.code,
      },
      {
        status: 500,
        headers: getCorsHeaders(req.headers.get('origin') || undefined)
      }
    )
  }
}

