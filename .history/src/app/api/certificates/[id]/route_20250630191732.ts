import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { Prisma } from '@prisma/client'
import { createCorsOptionsResponse, getCorsHeaders } from '@/config/cors'

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

// Handler para requisições OPTIONS (preflight)
export async function OPTIONS(request: NextRequest) {
  const origin = request.headers.get('origin') || undefined;
  return createCorsOptionsResponse(origin);
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params
    const cert = await prisma.certificates.findUnique({
      where: { id: parseInt(resolvedParams.id) },
      include: {
        courses: { select: { id: true, title: true, slug: true } },
      },
    })
    if (!cert) {
      return NextResponse.json(
        { success: false, message: 'Certificado não encontrado' },
        { status: 404 }
      )
    }
    return NextResponse.json({ success: true, data: cert }, {
      headers: getCorsHeaders(req.headers.get('origin') || undefined)
    })
  } catch (err: any) {
    console.error('Erro ao buscar certificado:', err)
    return NextResponse.json(
      { success: false, message: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params
    const body = await req.json()
    // pick only updatable fields
    const data: Prisma.certificatesUpdateInput = {}
    
    if (body.title !== undefined) data.title = body.title
    if (body.description !== undefined) data.description = body.description
    if (body.certificate_type !== undefined) data.certificate_type = body.certificate_type
    if (body.expiry_date !== undefined) {
      data.expiry_date = body.expiry_date ? new Date(body.expiry_date) : null
    }
    if (body.certificate_url !== undefined) data.certificate_url = body.certificate_url
    if (body.metadata !== undefined) data.metadata = body.metadata
    if (body.is_active !== undefined) data.is_active = body.is_active

    const updated = await prisma.certificates.update({
      where: { id: parseInt(resolvedParams.id) },
      data,
      include: {
        courses: { select: { id: true, title: true, slug: true } },
      },
    })

    return NextResponse.json({ success: true, data: updated }, {
      headers: getCorsHeaders(req.headers.get('origin') || undefined)
    })
  } catch (err: any) {
    console.error('Erro ao atualizar certificado:', err)
    const status = err.code === 'P2025' ? 404 : 500
    const msg = status === 404 ? 'Certificado não encontrado' : 'Erro interno do servidor'
    return NextResponse.json({ success: false, message: msg }, { status, headers: getCorsHeaders(req.headers.get('origin') || undefined) })
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params
    const deleted = await prisma.certificates.delete({
      where: { id: parseInt(resolvedParams.id) },
      include: {
        courses: { select: { id: true, title: true, slug: true } },
      },
    })
    return NextResponse.json({ success: true, data: deleted }, {
      headers: getCorsHeaders(req.headers.get('origin') || undefined)
    })
  } catch (err: any) {
    console.error('Erro ao deletar certificado:', err)
    const status = err.code === 'P2025' ? 404 : 500
    const msg = status === 404 ? 'Certificado não encontrado' : 'Erro interno do servidor'
    return NextResponse.json({ success: false, message: msg }, { status, headers: getCorsHeaders(req.headers.get('origin') || undefined) })
  }
}