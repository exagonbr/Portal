import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url)
    const limit = parseInt(url.searchParams.get('limit') || '50', 10)
    const search = url.searchParams.get('search')

    const where: any = {}
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
      ]
    }

    // Usar consulta SQL bruta para contornar problemas de schema
    const users = await prisma.$queryRaw`
      SELECT id, full_name, email
      FROM "user"
      WHERE
        CASE
          WHEN ${search} IS NOT NULL THEN
            (full_name ILIKE ${'%' + (search || '') + '%'} OR email ILIKE ${'%' + (search || '') + '%'})
          ELSE true
        END
      ORDER BY full_name ASC
      LIMIT ${Math.min(limit, 1000)}
    `

    return NextResponse.json({
      success: true,
      data: users,
    })
  } catch (err: any) {
    console.error('Erro ao buscar usuários:', err)
    return NextResponse.json(
      { success: false, message: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
