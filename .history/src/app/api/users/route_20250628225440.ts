import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url)
    const limit = parseInt(url.searchParams.get('limit') || '50', 10)
    const search = url.searchParams.get('search')

    // Usar consulta SQL bruta para contornar problemas de schema
    let users
    if (search) {
      users = await prisma.$queryRaw`
        SELECT id, full_name, email
        FROM "user" 
        WHERE full_name ILIKE ${'%' + search + '%'} OR email ILIKE ${'%' + search + '%'}
        ORDER BY full_name ASC
        LIMIT ${Math.min(limit, 1000)}
      `
    } else {
      users = await prisma.$queryRaw`
        SELECT id, full_name, email
        FROM "user" 
        ORDER BY full_name ASC
        LIMIT ${Math.min(limit, 1000)}
      `
    }

    // Converter BigInt para string para serialização JSON
    const serializedUsers = users.map((user: any) => ({
      ...user,
      id: user.id.toString()
    }))

    return NextResponse.json({
      success: true,
      data: serializedUsers,
    })
  } catch (err: any) {
    console.error('Erro ao buscar usuários:', err)
    return NextResponse.json(
      { success: false, message: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
