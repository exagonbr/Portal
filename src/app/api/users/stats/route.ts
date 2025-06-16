export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

// Mock database - substituir por Prisma/banco real
const mockUsers = new Map([
  ['1', { id: '1', role_id: 'STUDENT', institution_id: 'inst1', school_id: 'school1', is_active: true, created_at: '2024-01-15T10:00:00Z' }],
  ['2', { id: '2', role_id: 'STUDENT', institution_id: 'inst1', school_id: 'school1', is_active: true, created_at: '2024-02-10T10:00:00Z' }],
  ['3', { id: '3', role_id: 'TEACHER', institution_id: 'inst1', school_id: 'school1', is_active: true, created_at: '2024-01-20T10:00:00Z' }],
  ['4', { id: '4', role_id: 'TEACHER', institution_id: 'inst1', school_id: 'school2', is_active: true, created_at: '2024-03-05T10:00:00Z' }],
  ['5', { id: '5', role_id: 'PARENT', institution_id: 'inst1', school_id: 'school1', is_active: true, created_at: '2024-02-25T10:00:00Z' }],
  ['6', { id: '6', role_id: 'COORDINATOR', institution_id: 'inst1', school_id: 'school1', is_active: true, created_at: '2024-01-30T10:00:00Z' }],
  ['7', { id: '7', role_id: 'ADMIN', institution_id: 'inst1', school_id: null, is_active: true, created_at: '2024-01-05T10:00:00Z' }],
  ['8', { id: '8', role_id: 'SYSTEM_ADMIN', institution_id: null, school_id: null, is_active: true, created_at: '2024-01-01T10:00:00Z' }],
  // Adicionar mais estudantes para dados realistas
  ...Array.from({ length: 50 }, (_, i) => [
    `student_${i + 9}`, 
    { 
      id: `student_${i + 9}`, 
      role_id: 'STUDENT', 
      institution_id: 'inst1', 
      school_id: i % 2 === 0 ? 'school1' : 'school2', 
      is_active: Math.random() > 0.1, 
      created_at: new Date(2024, Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1).toISOString() 
    }
  ]),
  // Adicionar mais professores
  ...Array.from({ length: 15 }, (_, i) => [
    `teacher_${i + 59}`, 
    { 
      id: `teacher_${i + 59}`, 
      role_id: 'TEACHER', 
      institution_id: 'inst1', 
      school_id: i % 3 === 0 ? 'school1' : 'school2', 
      is_active: Math.random() > 0.05, 
      created_at: new Date(2024, Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1).toISOString() 
    }
  ]),
  // Adicionar mais pais
  ...Array.from({ length: 25 }, (_, i) => [
    `parent_${i + 74}`, 
    { 
      id: `parent_${i + 74}`, 
      role_id: 'PARENT', 
      institution_id: 'inst1', 
      school_id: i % 2 === 0 ? 'school1' : 'school2', 
      is_active: Math.random() > 0.15, 
      created_at: new Date(2024, Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1).toISOString() 
    }
  ])
])

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