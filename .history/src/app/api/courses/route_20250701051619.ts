import { NextRequest, NextResponse } from 'next/server'
import { createCorsOptionsResponse, getCorsHeaders } from '@/config/cors';
import { prisma } from '@/lib/prisma'


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

    const where: any = {}
    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ]
    }

    const courses = await prisma.course.findMany({
      where,
      select: {
        id: true,
        title: true,
        slug: true,
        description: true,
      },
      orderBy: { title: 'asc' },
      take: Math.min(limit, 1000), // máximo 1000
    })

    return NextResponse.json({
      success: true,
      data: courses,
    }, {
      headers: getCorsHeaders(request.headers.get('origin') || undefined)
    })
  } catch (err: any) {
    console.log('Erro ao buscar cursos:', err)
    return NextResponse.json(
      { success: false, message: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
