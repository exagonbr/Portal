export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server'
import { createCorsOptionsResponse, getCorsHeaders } from '@/config/cors';
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'


// Handler para requisições OPTIONS (preflight)
export async function OPTIONS(request: NextRequest) {
  const origin = request.headers.get('origin') || undefined;
  return createCorsOptionsResponse(origin);
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: 'Não autorizado' }, { 
      status: 401,
      headers: getCorsHeaders(request.headers.get('origin') || undefined)
    })
    }

    // Simulação de buckets S3
    // Em produção, aqui você usaria o AWS SDK para listar os buckets reais
    const mockBuckets = [
      'portal-educacional-uploads',
      'portal-educacional-backups',
      'portal-educacional-static',
      'portal-educacional-media'
    ]

    return NextResponse.json({
      success: true,
      buckets: mockBuckets
    }, {
      headers: getCorsHeaders(request.headers.get('origin') || undefined)
    })
  } catch (error) {
    console.log('Erro ao listar buckets S3:', error)
    return NextResponse.json(
      { 
        error: 'Erro ao listar buckets S3',
        details: error instanceof Error ? error.message : 'Erro desconhecido'
      },
      { status: 500 }
    )
  }
} 
