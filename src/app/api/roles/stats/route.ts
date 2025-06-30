export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server'
import { createCorsOptionsResponse, getCorsHeaders } from '@/config/cors';
import { getRoleStats } from '../mockDatabase'
import { getAuthentication, hasRequiredRole } from '@/lib/auth-utils'

// GET - Obter estatísticas das roles

// Handler para requisições OPTIONS (preflight)
export async function OPTIONS(request: NextRequest) {
  const origin = request.headers.get('origin') || undefined;
  return createCorsOptionsResponse(origin);
}

export async function GET(request: NextRequest) {
  try {
    const session = await getAuthentication(request)
    
    if (!session) {
      return NextResponse.json(
        { success: false, error: 'Não autorizado' },
        { status: 401 }
      )
    }

    // Apenas SYSTEM_ADMIN, INSTITUTION_MANAGER e ACADEMIC_COORDINATOR podem ver estatísticas
    if (!hasRequiredRole(session.user?.role, ['SYSTEM_ADMIN', 'INSTITUTION_MANAGER', 'ACADEMIC_COORDINATOR'])) {
      return NextResponse.json(
        { success: false, error: 'Sem permissão para visualizar estatísticas' },
        { status: 403 }
      )
    }

    // Obter estatísticas
    const stats = getRoleStats()

    return NextResponse.json({
      success: true,
      data: stats
    }, {
      headers: getCorsHeaders(request.headers.get('origin') || undefined)
    })

  } catch (error) {
    console.error('Erro ao buscar estatísticas das roles:', error)
    return NextResponse.json(
      { success: false, error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
