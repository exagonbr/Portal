import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { Prisma } from '@prisma/client'

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const cert = await prisma.certificate.findUnique({
      where: { id: params.id },
      include: {
        user:   { select: { id: true, name: true, email: true } },
        course: { select: { id: true, title: true, slug: true } },
      },
    })
    if (!cert) {
      return NextResponse.json(
        { success: false, message: 'Certificado não encontrado' },
        { status: 404 }
      )
    }
    return NextResponse.json({ success: true, data: cert })
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
  { params }: { params: { id: string } }
) {
  try {
    const body = await req.json()
    // pick only updatable fields
    const data: Prisma.CertificateUpdateInput = {}
    ;[
      'title',
      'description',
      'certificate_type',
      'expiry_date',
      'certificate_url',
      'metadata',
      'is_active',
    ].forEach((key) => {
      if (body[key] !== undefined) {
        data[key] =
          key === 'expiry_date'
            ? body[key]
              ? new Date(body[key])
              : null
            : body[key]
      }
    })

    const updated = await prisma.certificate.update({
      where: { id: params.id },
      data,
      include: {
        user:   { select: { id: true, name: true, email: true } },
        course: { select: { id: true, title: true, slug: true } },
      },
    })

    return NextResponse.json({ success: true, data: updated })
  } catch (err: any) {
    console.error('Erro ao atualizar certificado:', err)
    const status = err.code === 'P2025' ? 404 : 500
    const msg = status === 404 ? 'Certificado não encontrado' : 'Erro interno do servidor'
    return NextResponse.json({ success: false, message: msg }, { status })
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const deleted = await prisma.certificate.delete({
      where: { id: params.id },
      include: {
        user:   { select: { id: true, name: true, email: true } },
        course: { select: { id: true, title: true, slug: true } },
      },
    })
    return NextResponse.json({ success: true, data: deleted })
  } catch (err: any) {
    console.error('Erro ao deletar certificado:', err)
    const status = err.code === 'P2025' ? 404 : 500
    const msg = status === 404 ? 'Certificado não encontrado' : 'Erro interno do servidor'
    return NextResponse.json({ success: false, message: msg }, { status })
  }
}