import { NextRequest, NextResponse } from 'next/server'
import { getServerSession, Session } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { createCorsOptionsResponse, getCorsHeaders } from '@/config/cors'


// Handler para requisições OPTIONS (preflight)
export async function OPTIONS(request: NextRequest) {
  const origin = request.headers.get('origin') || undefined;
  return createCorsOptionsResponse(origin);
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions) as (Session & { accessToken?: string });
    
    if (!session || session.user?.role !== 'SYSTEM_ADMIN') {
      return NextResponse.json({ error: 'Não autorizado' }, { 
      status: 401,
      headers: getCorsHeaders(request.headers.get('origin') || undefined)
    })
    }

    // Fazer chamada para o backend
    const backendUrl = 'http://localhost:3001/api'
    
    const response = await fetch(`${backendUrl}/api/settings/reconfigure-email`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session.accessToken}`
      }
    })

    const result = await response.json()

    if (!response.ok) {
      return NextResponse.json(
        { error: result.error || 'Erro ao reconfigurar serviço de email' },
        { status: response.status }
      )
    }

    return NextResponse.json(result, {
      headers: getCorsHeaders(request.headers.get('origin') || undefined)
    })
  } catch (error) {
    console.log('Erro ao reconfigurar serviço de email:', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { 
      status: 500,
      headers: getCorsHeaders(request.headers.get('origin') || undefined)
    })
  }
} 
