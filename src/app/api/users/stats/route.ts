export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

// Mock database - substituir por Prisma/banco real
const mockUsers = new Map()

// GET - Estatísticas de usuários
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json(
        { error: 'Não autorizado' },
        { status: 401 }
      )
    }

    // Apenas admins podem ver estatísticas
    const userRole = session.user?.role
    if (!['SYSTEM_ADMIN', 'INSTITUTION_ADMIN', 'SCHOOL_MANAGER'].includes(userRole)) {
      return NextResponse.json(
        { error: 'Sem permissão para visualizar estatísticas' },
        { status: 403 }
      )
    }

    // Buscar todos os usuários baseado no escopo de permissão
    let users = Array.from(mockUsers.values())

    // Filtrar por escopo
    if (userRole === 'INSTITUTION_ADMIN' && session.user.institution_id) {
      users = users.filter(user => user.institution_id === session.user.institution_id)
    } else if (userRole === 'SCHOOL_MANAGER' && session.user.school_id) {
      users = users.filter(user => user.school_id === session.user.school_id)
    }

    // Calcular estatísticas
    const stats = {
      total_users: users.length,
      active_users: users.filter(u => u.is_active).length,
      inactive_users: users.filter(u => !u.is_active).length,
      users_by_role: {} as Record<string, number>,
      users_by_institution: {} as Record<string, number>,
      users_by_school: {} as Record<string, number>,
      recent_registrations: 0,
      registrations_by_month: {} as Record<string, number>
    }

    // Contar por role
    users.forEach(user => {
      stats.users_by_role[user.role_id] = (stats.users_by_role[user.role_id] || 0) + 1
      
      if (user.institution_id) {
        stats.users_by_institution[user.institution_id] = 
          (stats.users_by_institution[user.institution_id] || 0) + 1
      }
      
      if (user.school_id) {
        stats.users_by_school[user.school_id] = 
          (stats.users_by_school[user.school_id] || 0) + 1
      }
    })

    // Contar registros recentes (últimos 30 dias)
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
    
    users.forEach(user => {
      const createdAt = new Date(user.created_at)
      if (createdAt >= thirtyDaysAgo) {
        stats.recent_registrations++
      }

      // Agrupar por mês
      const monthKey = `${createdAt.getFullYear()}-${String(createdAt.getMonth() + 1).padStart(2, '0')}`
      stats.registrations_by_month[monthKey] = 
        (stats.registrations_by_month[monthKey] || 0) + 1
    })

    // Adicionar informações de crescimento
    const growth = calculateGrowth(users)

    return NextResponse.json({
      success: true,
      data: {
        ...stats,
        growth
      }
    })

  } catch (error) {
    console.error('Erro ao buscar estatísticas:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

// Função auxiliar para calcular crescimento
function calculateGrowth(users: any[]) {
  const now = new Date()
  const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1)
  const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1)

  const lastMonthUsers = users.filter(u => {
    const created = new Date(u.created_at)
    return created >= lastMonth && created < thisMonth
  }).length

  const thisMonthUsers = users.filter(u => {
    const created = new Date(u.created_at)
    return created >= thisMonth
  }).length

  const growthPercentage = lastMonthUsers > 0 
    ? ((thisMonthUsers - lastMonthUsers) / lastMonthUsers) * 100 
    : 0

  return {
    last_month: lastMonthUsers,
    this_month: thisMonthUsers,
    percentage: Math.round(growthPercentage * 100) / 100
  }
} 