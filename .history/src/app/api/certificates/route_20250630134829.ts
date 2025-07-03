import { NextRequest, NextResponse } from 'next/server'
import { Prisma } from '@prisma/client'
import { prisma } from '@/lib/prisma'

// Funções CORS
function getCorsHeaders(origin?: string) {
  return {
    'Access-Control-Allow-Origin': origin || '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Credentials': 'true',
  }
}

function createCorsOptionsResponse(origin?: string) {
  return new NextResponse(null, {
    status: 200,
    headers: getCorsHeaders(origin)
  })
}

// helpers
function sanitizeInt(s: string|null|undefined, fallback: number): number {
  const n = parseInt(s||'', 10)
  return isNaN(n) || n < 1 ? fallback : n
}

// generate a unique verification code
function genCode(len = 8) {
  return Array.from({ length: len })
    .map(() => (Math.random() * 36 | 0).toString(36).toUpperCase())
    .join('')
}

// Handler para requisições OPTIONS (preflight)
export async function OPTIONS(request: NextRequest) {
  const origin = request.headers.get('origin') || undefined;
  return createCorsOptionsResponse(origin);
}

export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url)
    const page  = sanitizeInt(url.searchParams.get('page'),  1)
    const limit = sanitizeInt(url.searchParams.get('limit'), 10)
    const skip  = (page - 1) * limit

    // build where-clause
    const where: Prisma.certificatesWhereInput = {}
    if (url.searchParams.has('user_id')) {
      where.user_id = parseInt(url.searchParams.get('user_id')!)
    }
    if (url.searchParams.has('course_id')) {
      where.course_id = parseInt(url.searchParams.get('course_id')!)
    }
    if (url.searchParams.has('certificate_type')) {
      where.certificate_type = url.searchParams.get('certificate_type')! as any
    }
    if (url.searchParams.has('is_active')) {
      where.is_active = url.searchParams.get('is_active') === 'true'
    }
    if (url.searchParams.has('search')) {
      const q = url.searchParams.get('search')!
      where.OR = [
        { title: { contains: q, mode: 'insensitive' } },
        { description: { contains: q, mode: 'insensitive' } },
        { verification_code: { contains: q, mode: 'insensitive' } },
      ]
    }

    // sorting
    let orderBy: Prisma.certificatesOrderByWithRelationInput = { issued_date: 'desc' }
    const sb = url.searchParams.get('sort_by')
    const so = url.searchParams.get('sort_order') === 'asc' ? 'asc' : 'desc'
    if (sb === 'title' || sb === 'created_at' || sb === 'issued_date') {
      orderBy = { [sb]: so }
    }

    // run count + find in one transaction
    const [total, certificates] = await prisma.$transaction([
      prisma.certificates.count({ where }),
      prisma.certificates.findMany({
        where,
        skip,
        take: limit,
        orderBy,
        include: {
          courses: { select: { id: true, title: true, slug: true } },
        },
      }),
    ])

    const totalPages = Math.ceil(total / limit) || 1
    return NextResponse.json({
      success: true,
      data: certificates,
      pagination: { page, limit, total, totalPages },
    }, {
      headers: getCorsHeaders(req.headers.get('origin') || undefined)
    })
  } catch (err: any) {
    console.error('Erro ao buscar certificados:', err)
    return NextResponse.json(
      { success: false, message: err.message || 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const {
      user_id,
      course_id,
      title,
      description,
      certificate_type,
      expiry_date,
      certificate_url,
      metadata,
    } = body

    // basic validation
    if (!user_id || !title || !certificate_type) {
      return NextResponse.json(
        { success: false, message: 'Campos obrigatórios: user_id, title, certificate_type' },
        { status: 400 }
      )
    }

    let code = genCode()
    while (
      await prisma.certificates.findUnique({
        where: { verification_code: code },
      })
    ) {
      code = genCode()
    }

    const cert = await prisma.certificates.create({
      data: {
        user_id: parseInt(user_id),
        course_id: course_id ? parseInt(course_id) : null,
        title,
        description,
        certificate_type,
        issued_date: new Date(),
        expiry_date: expiry_date ? new Date(expiry_date) : null,
        certificate_url,
        metadata: metadata || undefined,
        verification_code: code,
        is_active: true,
        updated_at: new Date(),
      },
      include: {
        user: { select: { id: true, name: true, email: true } },
        course: { select: { id: true, title: true, slug: true } },
      },
    })

    return NextResponse.json({ success: true, data: cert }, { status: 201 })
  } catch (err: any) {
    console.error('Erro ao criar certificado:', err)
    const msg =
      err.code === 'P2002'
        ? 'Código de verificação duplicado'
        : err.message || 'Erro interno do servidor'
    return NextResponse.json({ success: false, message: msg }, { status: 500 })
  }
}
