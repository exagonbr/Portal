import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { z } from 'zod'

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

// Schema de validação para atualização de relatório
const updateReportSchema = z.object({
  title: z.string().min(3, 'Título deve ter pelo menos 3 caracteres').optional(),
  description: z.string().optional(),
  visibility: z.enum(['PRIVATE', 'SHARED', 'PUBLIC']).optional(),
  share_with: z.array(z.string().uuid()).optional(),
  schedule: z.object({
    frequency: z.enum(['ONCE', 'DAILY', 'WEEKLY', 'MONTHLY', 'QUARTERLY']).optional(),
    send_email: z.boolean().optional(),
    recipients: z.array(z.string().email()).optional()
  }).optional()
})

// Mock database - substituir por Prisma/banco real
const mockReports = new Map()

// GET - Buscar relatório por ID

// Handler para requisições OPTIONS (preflight)
export async function OPTIONS(request: NextRequest) {
  const origin = request.headers.get('origin') || undefined;
  return createCorsOptionsResponse(origin);
}

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: 'Não autorizado' }, { 
      status: 401,
      headers: getCorsHeaders(request.headers.get('origin') || undefined)
    })
    }

    const reportId = params.id

    // Buscar relatório
    const report = mockReports.get(reportId)

    if (!report) {
      return NextResponse.json({ error: 'Relatório não encontrado' }, { 
      status: 404,
      headers: getCorsHeaders(request.headers.get('origin') || undefined)
    })
    }

    // Verificar permissões
    const userRole = session.user?.role
    const isOwner = report.created_by === session.user?.id
    const isAdmin = ['SYSTEM_ADMIN', 'INSTITUTION_ADMIN'].includes(userRole)
    
    // Verificar se pode visualizar
    const canView = 
      isOwner ||
      isAdmin ||
      report.visibility === 'PUBLIC' ||
      (report.visibility === 'SHARED' && report.share_with?.includes(session.user?.id))

    if (!canView) {
      return NextResponse.json({ error: 'Sem permissão para visualizar este relatório' }, { 
      status: 403,
      headers: getCorsHeaders(request.headers.get('origin') || undefined)
    })
    }

    // Preparar resposta com informações extras
    const reportWithDetails = {
      ...report,
      is_owner: isOwner,
      can_edit: isOwner || isAdmin,
      can_delete: isOwner || userRole === 'SYSTEM_ADMIN',
      can_download: report.status === 'completed',
      can_regenerate: (isOwner || isAdmin) && report.status === 'completed',
      processing_time: report.completed_at ? 
        Math.round((new Date(report.completed_at).getTime() - new Date(report.created_at).getTime()) / 1000) : 
        null,
      expires_in: report.expires_at ? 
        Math.max(0, new Date(report.expires_at).getTime() - new Date().getTime()) : 
        null,
      is_expired: report.expires_at ? new Date(report.expires_at) < new Date() : false
    }

    // Se o relatório está processando, adicionar estimativa
    if (report.status === 'processing') {
      const elapsedTime = (new Date().getTime() - new Date(report.created_at).getTime()) / 1000
      const estimatedTotal = 10 // segundos estimados
      reportWithDetails.estimated_completion = Math.max(0, estimatedTotal - elapsedTime)
    }

    // Adicionar metadados se disponível
    if (report.status === 'completed' && report.metadata) {
      reportWithDetails.metadata = {
        total_records: report.metadata.total_records,
        data_points: report.metadata.data_points,
        charts_generated: report.metadata.charts_generated,
        recommendations: report.metadata.recommendations_count
      }
    }

    return NextResponse.json({
      success: true,
      data: reportWithDetails
    }, {
      headers: getCorsHeaders(request.headers.get('origin') || undefined)
    })

  } catch (error) {
    console.error('Erro ao buscar relatório:', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { 
      status: 500,
      headers: getCorsHeaders(request.headers.get('origin') || undefined)
    })
  }
}

// PUT - Atualizar relatório
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: 'Não autorizado' }, { 
      status: 401,
      headers: getCorsHeaders(request.headers.get('origin') || undefined)
    })
    }

    const reportId = params.id
    const body = await request.json()

    // Validar dados
    const validationResult = updateReportSchema.safeParse(body)
    if (!validationResult.success) {
      return NextResponse.json({ 
          error: 'Dados inválidos',
          errors: validationResult.error.flatten(, {
      headers: getCorsHeaders(request.headers.get('origin') || undefined)
    }).fieldErrors
        },
        { status: 400 }
      )
    }

    const updateData = validationResult.data

    // Buscar relatório existente
    const existingReport = mockReports.get(reportId)
    if (!existingReport) {
      return NextResponse.json({ error: 'Relatório não encontrado' }, { 
      status: 404,
      headers: getCorsHeaders(request.headers.get('origin') || undefined)
    })
    }

    // Verificar permissões
    const userRole = session.user?.role
    const canEdit = 
      existingReport.created_by === session.user?.id ||
      ['SYSTEM_ADMIN', 'INSTITUTION_ADMIN'].includes(userRole)

    if (!canEdit) {
      return NextResponse.json({ error: 'Sem permissão para editar este relatório' }, { 
      status: 403,
      headers: getCorsHeaders(request.headers.get('origin') || undefined)
    })
    }

    // Não permitir edição de relatórios em processamento
    if (existingReport.status === 'processing') {
      return NextResponse.json({ error: 'Não é possível editar relatório em processamento' }, { 
      status: 409,
      headers: getCorsHeaders(request.headers.get('origin') || undefined)
    })
    }

    // Se está alterando compartilhamento, validar usuários
    if (updateData.share_with) {
      // Em produção, verificar se os IDs de usuário existem
      // Por enquanto, aceitar
    }

    // Se está alterando agendamento e o relatório já foi executado
    if (updateData.schedule && existingReport.status === 'completed') {
      // Criar novo agendamento ao invés de alterar o existente
      return NextResponse.json(
        { error: 'Para alterar o agendamento de um relatório já executado, crie um novo relatório' },
        { status: 400 }
      )
    }

    // Atualizar relatório
    const updatedReport = {
      ...existingReport,
      ...updateData,
      updated_at: new Date().toISOString(),
      updated_by: session.user?.id
    }

    mockReports.set(reportId, updatedReport)

    return NextResponse.json({
      success: true,
      data: updatedReport,
      message: 'Relatório atualizado com sucesso'
    }, {
      headers: getCorsHeaders(request.headers.get('origin') || undefined)
    })

  } catch (error) {
    console.error('Erro ao atualizar relatório:', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { 
      status: 500,
      headers: getCorsHeaders(request.headers.get('origin') || undefined)
    })
  }
}

// DELETE - Remover relatório
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: 'Não autorizado' }, { 
      status: 401,
      headers: getCorsHeaders(request.headers.get('origin') || undefined)
    })
    }

    const reportId = params.id

    // Buscar relatório
    const existingReport = mockReports.get(reportId)
    if (!existingReport) {
      return NextResponse.json({ error: 'Relatório não encontrado' }, { 
      status: 404,
      headers: getCorsHeaders(request.headers.get('origin') || undefined)
    })
    }

    // Verificar permissões
    const userRole = session.user?.role
    const canDelete = 
      existingReport.created_by === session.user?.id ||
      userRole === 'SYSTEM_ADMIN'

    if (!canDelete) {
      return NextResponse.json({ error: 'Sem permissão para deletar este relatório' }, { 
      status: 403,
      headers: getCorsHeaders(request.headers.get('origin') || undefined)
    })
    }

    // Não permitir deletar relatórios em processamento
    if (existingReport.status === 'processing') {
      return NextResponse.json({ error: 'Não é possível deletar relatório em processamento' }, { 
      status: 409,
      headers: getCorsHeaders(request.headers.get('origin') || undefined)
    })
    }

    // Se tem arquivo associado, marcar para exclusão
    if (existingReport.file_url) {
      // Em produção, agendar exclusão do arquivo
      console.log(`Arquivo marcado para exclusão: ${existingReport.file_url}`)
    }

    // Deletar relatório
    mockReports.delete(reportId)

    return NextResponse.json({
      success: true,
      message: 'Relatório removido com sucesso'
    }, {
      headers: getCorsHeaders(request.headers.get('origin') || undefined)
    })

  } catch (error) {
    console.error('Erro ao deletar relatório:', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { 
      status: 500,
      headers: getCorsHeaders(request.headers.get('origin') || undefined)
    })
  }
} 