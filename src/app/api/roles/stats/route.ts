import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { getRoleStats } from '../mockDatabase'

// GET - Obter estatísticas das roles
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json(
        { success: false, error: 'Não autorizado' },
        { status: 401 }
      )
    }

    // Apenas SYSTEM_ADMIN, INSTITUTION_MANAGER e ACADEMIC_COORDINATOR podem ver estatísticas
    if (!['SYSTEM_ADMIN', 'INSTITUTION_MANAGER', 'ACADEMIC_COORDINATOR'].includes(session.user?.role)) {
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
    })

  } catch (error) {
    console.error('Erro ao buscar estatísticas das roles:', error)
    return NextResponse.json(
      { success: false, error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}