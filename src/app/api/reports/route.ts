import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { z } from 'zod'

// Schema de validação para geração de relatório
const generateReportSchema = z.object({
  type: z.enum([
    'STUDENT_PERFORMANCE',
    'CLASS_OVERVIEW', 
    'ATTENDANCE',
    'GRADES',
    'COURSE_PROGRESS',
    'ASSIGNMENT_ANALYTICS',
    'QUIZ_RESULTS',
    'ENGAGEMENT',
    'FINANCIAL',
    'CUSTOM'
  ]),
  title: z.string().min(3, 'Título deve ter pelo menos 3 caracteres'),
  description: z.string().optional(),
  filters: z.object({
    date_from: z.string().datetime(),
    date_to: z.string().datetime(),
    institution_id: z.string().uuid().optional(),
    school_id: z.string().uuid().optional(),
    class_id: z.string().uuid().optional(),
    course_id: z.string().uuid().optional(),
    student_ids: z.array(z.string().uuid()).optional(),
    teacher_ids: z.array(z.string().uuid()).optional(),
    subject: z.string().optional(),
    status: z.array(z.string()).optional()
  }),
  format: z.enum(['PDF', 'EXCEL', 'CSV', 'JSON', 'HTML']).default('PDF'),
  sections: z.array(z.enum([
    'SUMMARY',
    'DETAILED_DATA',
    'CHARTS',
    'COMPARISONS',
    'TRENDS',
    'RECOMMENDATIONS'
  ])).optional(),
  schedule: z.object({
    frequency: z.enum(['ONCE', 'DAILY', 'WEEKLY', 'MONTHLY', 'QUARTERLY']).default('ONCE'),
    send_email: z.boolean().default(false),
    recipients: z.array(z.string().email()).optional()
  }).optional(),
  visibility: z.enum(['PRIVATE', 'SHARED', 'PUBLIC']).default('PRIVATE'),
  share_with: z.array(z.string().uuid()).optional()
})

// Mock database - substituir por Prisma/banco real
const mockReports = new Map()

// GET - Listar relatórios
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json(
        { error: 'Não autorizado' },
        { status: 401 }
      )
    }

    // Parâmetros de query
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const search = searchParams.get('search') || ''
    const type = searchParams.get('type')
    const status = searchParams.get('status') // pending, processing, completed, failed
    const format = searchParams.get('format')
    const created_by = searchParams.get('created_by')
    const date_from = searchParams.get('date_from')
    const date_to = searchParams.get('date_to')

    // Buscar relatórios (substituir por query real)
    let reports = Array.from(mockReports.values())

    // Aplicar filtros baseados no role do usuário
    const userRole = session.user?.role
    
    // Filtrar relatórios que o usuário pode ver
    reports = reports.filter(report => {
      // Criador sempre pode ver
      if (report.created_by === session.user?.id) return true
      
      // Admins podem ver todos
      if (['SYSTEM_ADMIN', 'INSTITUTION_ADMIN'].includes(userRole)) return true
      
      // Verificar visibilidade
      if (report.visibility === 'PUBLIC') return true
      if (report.visibility === 'SHARED' && report.share_with?.includes(session.user?.id)) return true
      
      // Professores podem ver relatórios das suas turmas
      if (userRole === 'TEACHER' && report.filters?.class_id) {
        // Verificar se professor leciona na turma
        return true // Implementar verificação real
      }
      
      return false
    })

    // Aplicar filtros
    if (search) {
      const searchLower = search.toLowerCase()
      reports = reports.filter(report => 
        report.title.toLowerCase().includes(searchLower) ||
        report.description?.toLowerCase().includes(searchLower)
      )
    }

    if (type) {
      reports = reports.filter(report => report.type === type)
    }

    if (status) {
      reports = reports.filter(report => report.status === status)
    }

    if (format) {
      reports = reports.filter(report => report.format === format)
    }

    if (created_by) {
      reports = reports.filter(report => report.created_by === created_by)
    }

    // Filtrar por período
    if (date_from || date_to) {
      reports = reports.filter(report => {
        const createdAt = new Date(report.created_at)
        if (date_from && createdAt < new Date(date_from)) return false
        if (date_to && createdAt > new Date(date_to)) return false
        return true
      })
    }

    // Adicionar informações extras
    const reportsWithInfo = reports.map(report => {
      const isOwner = report.created_by === session.user?.id
      const canEdit = isOwner || ['SYSTEM_ADMIN', 'INSTITUTION_ADMIN'].includes(userRole)
      const canDelete = isOwner || userRole === 'SYSTEM_ADMIN'
      
      return {
        ...report,
        is_owner: isOwner,
        can_edit: canEdit,
        can_delete: canDelete,
        can_download: report.status === 'completed',
        processing_time: report.completed_at ? 
          Math.round((new Date(report.completed_at).getTime() - new Date(report.created_at).getTime()) / 1000) : 
          null,
        expires_in: report.expires_at ? 
          Math.max(0, new Date(report.expires_at).getTime() - new Date().getTime()) : 
          null
      }
    })

    // Ordenar por data de criação (mais recente primeiro)
    reportsWithInfo.sort((a, b) => 
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    )

    // Paginação
    const startIndex = (page - 1) * limit
    const endIndex = page * limit
    const paginatedReports = reportsWithInfo.slice(startIndex, endIndex)

    // Estatísticas
    const stats = {
      total: reportsWithInfo.length,
      pending: reportsWithInfo.filter(r => r.status === 'pending').length,
      processing: reportsWithInfo.filter(r => r.status === 'processing').length,
      completed: reportsWithInfo.filter(r => r.status === 'completed').length,
      failed: reportsWithInfo.filter(r => r.status === 'failed').length
    }

    return NextResponse.json({
      success: true,
      data: {
        items: paginatedReports,
        pagination: {
          page,
          limit,
          total: reportsWithInfo.length,
          totalPages: Math.ceil(reportsWithInfo.length / limit)
        },
        stats
      }
    })

  } catch (error) {
    console.error('Erro ao listar relatórios:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

// POST - Gerar relatório
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json(
        { error: 'Não autorizado' },
        { status: 401 }
      )
    }

    const body = await request.json()

    // Validar dados
    const validationResult = generateReportSchema.safeParse(body)
    if (!validationResult.success) {
      return NextResponse.json(
        { 
          error: 'Dados inválidos',
          errors: validationResult.error.flatten().fieldErrors
        },
        { status: 400 }
      )
    }

    const reportData = validationResult.data

    // Verificar permissões baseadas no tipo de relatório
    const userRole = session.user?.role
    
    // Relatórios financeiros apenas para admins
    if (reportData.type === 'FINANCIAL' && !['SYSTEM_ADMIN', 'INSTITUTION_ADMIN'].includes(userRole)) {
      return NextResponse.json(
        { error: 'Sem permissão para gerar relatórios financeiros' },
        { status: 403 }
      )
    }

    // Estudantes só podem gerar relatórios próprios
    if (userRole === 'STUDENT') {
      if (!['STUDENT_PERFORMANCE', 'COURSE_PROGRESS'].includes(reportData.type)) {
        return NextResponse.json(
          { error: 'Tipo de relatório não permitido para estudantes' },
          { status: 403 }
        )
      }
      
      // Garantir que só pode ver dados próprios
      if (reportData.filters.student_ids && 
          reportData.filters.student_ids.length > 0 && 
          !reportData.filters.student_ids.includes(session.user?.id)) {
        return NextResponse.json(
          { error: 'Estudantes só podem gerar relatórios próprios' },
          { status: 403 }
        )
      }
    }

    // Validar período
    const dateFrom = new Date(reportData.filters.date_from)
    const dateTo = new Date(reportData.filters.date_to)
    
    if (dateTo <= dateFrom) {
      return NextResponse.json(
        { error: 'Data final deve ser posterior à data inicial' },
        { status: 400 }
      )
    }

    // Limitar período máximo
    const maxDays = reportData.type === 'DETAILED_DATA' ? 90 : 365
    const daysDiff = Math.ceil((dateTo.getTime() - dateFrom.getTime()) / (1000 * 60 * 60 * 24))
    
    if (daysDiff > maxDays) {
      return NextResponse.json(
        { error: `Período máximo permitido é de ${maxDays} dias para este tipo de relatório` },
        { status: 400 }
      )
    }

    // Criar relatório
    const newReport = {
      id: `report_${Date.now()}`,
      ...reportData,
      created_by: session.user?.id,
      created_by_name: session.user?.name,
      status: 'pending',
      progress: 0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString() // Expira em 7 dias
    }

    mockReports.set(newReport.id, newReport)

    // Simular processamento assíncrono
    setTimeout(() => {
      const report = mockReports.get(newReport.id)
      if (report) {
        report.status = 'processing'
        report.progress = 50
        mockReports.set(newReport.id, report)
        
        // Simular conclusão
        setTimeout(() => {
          report.status = 'completed'
          report.progress = 100
          report.completed_at = new Date().toISOString()
          report.file_url = `/reports/${newReport.id}.${reportData.format.toLowerCase()}`
          report.file_size = Math.floor(Math.random() * 5000000) + 100000 // 100KB - 5MB
          mockReports.set(newReport.id, report)
        }, 3000)
      }
    }, 1000)

    return NextResponse.json({
      success: true,
      data: newReport,
      message: 'Relatório criado e está sendo processado'
    }, { status: 201 })

  } catch (error) {
    console.error('Erro ao gerar relatório:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
} 