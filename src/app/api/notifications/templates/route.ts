import { NextRequest, NextResponse } from 'next/server'
import { createCorsOptionsResponse, getCorsHeaders } from '@/config/cors';
import { createStandardApiRoute } from '../../lib/api-route-template';
import { notificationTemplateService } from '@/services/notificationTemplateService';

// Usar o template padronizado para a rota GET
export const { GET, OPTIONS } = createStandardApiRoute({
  endpoint: '/api/notifications/templates',
  name: 'notification-templates',
  fallbackFunction: async (req: NextRequest) => {
    try {
      const url = new URL(req.url)
      const limit = parseInt(url.searchParams.get('limit') || '50', 10)
      const page = parseInt(url.searchParams.get('page') || '1', 10)
      const search = url.searchParams.get('search') || ''
      const sortBy = url.searchParams.get('sortBy') || 'created_at'
      const sortOrder = url.searchParams.get('sortOrder') || 'desc'
      
      // Filtros específicos
      const name = url.searchParams.get('name') || ''
      const category = url.searchParams.get('category') || ''
      const isPublic = url.searchParams.get('isPublic')
      const userId = url.searchParams.get('userId') || ''
      const createdBy = url.searchParams.get('createdBy') || ''

      const filters = {
        ...(name && { name }),
        ...(category && { category }),
        ...(isPublic !== null && { isPublic: isPublic === 'true' }),
        ...(userId && { userId }),
        ...(createdBy && { createdBy }),
      }

      const result = await notificationTemplateService.getTemplatesPaginated(page, limit, filters)

      return NextResponse.json(result, {
        status: 200,
        headers: getCorsHeaders()
      })
    } catch (error) {
      console.error('❌ [API] Erro ao buscar templates de notificação:', error)
      return NextResponse.json(
        { 
          success: false, 
          message: 'Erro ao buscar templates de notificação',
          error: error instanceof Error ? error.message : 'Erro desconhecido'
        },
        { 
          status: 500,
          headers: getCorsHeaders()
        }
      )
    }
  }
});

// POST - Criar novo template
export async function POST(req: NextRequest) {
  try {
    const data = await req.json()
    
    // Validar dados
    const validationErrors = await notificationTemplateService.validateTemplate(data)
    if (validationErrors.length > 0) {
      return NextResponse.json(
        {
          success: false,
          message: 'Dados inválidos',
          errors: validationErrors
        },
        { 
          status: 400,
          headers: getCorsHeaders()
        }
      )
    }

    const template = await notificationTemplateService.createTemplate(data)
    
    return NextResponse.json(
      {
        success: true,
        data: template,
        message: 'Template de notificação criado com sucesso'
      },
      { 
        status: 201,
        headers: getCorsHeaders()
      }
    )
  } catch (error) {
    console.error('❌ [API] Erro ao criar template de notificação:', error)
    return NextResponse.json(
      {
        success: false,
        message: 'Erro ao criar template de notificação',
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      },
      { 
        status: 500,
        headers: getCorsHeaders()
      }
    )
  }
}

// PUT - Atualizar template
export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ 
        success: false,
        message: 'Não autorizado' 
      }, { 
        status: 401,
        headers: getCorsHeaders(request.headers.get('origin') || undefined)
      })
    }

    const body = await request.json()
    const { id, name, subject, message, html, category, is_public } = body

    if (!id) {
      return NextResponse.json({
        success: false,
        message: 'ID do template é obrigatório'
      }, {
        status: 400,
        headers: getCorsHeaders(request.headers.get('origin') || undefined)
      })
    }

    const connection = await getSafeConnection();
    
    // Verificar se o template existe e pertence ao usuário
    const existingTemplate = await connection('notification_templates')
      .where('id', id)
      .where('user_id', session.user.id)
      .first();

    if (!existingTemplate) {
      return NextResponse.json({
        success: false,
        message: 'Template não encontrado ou sem permissão'
      }, {
        status: 404,
        headers: getCorsHeaders(request.headers.get('origin') || undefined)
      })
    }

    // Atualizar template
    await connection('notification_templates')
      .where('id', id)
      .update({
        name: name || existingTemplate.name,
        subject: subject || existingTemplate.subject,
        message: message || existingTemplate.message,
        html: html !== undefined ? html : existingTemplate.html,
        category: category || existingTemplate.category,
        is_public: is_public !== undefined ? is_public : existingTemplate.is_public,
        updated_at: new Date()
      });

    const updatedTemplate = await connection('notification_templates')
      .where('id', id)
      .first();

    return NextResponse.json({
      success: true,
      message: 'Template atualizado com sucesso',
      data: updatedTemplate
    }, {
      headers: getCorsHeaders(request.headers.get('origin') || undefined)
    });

  } catch (error) {
    console.error('❌ Erro ao atualizar template:', error);
    return NextResponse.json({ 
      success: false,
      message: 'Erro interno do servidor' 
    }, { 
      status: 500,
      headers: getCorsHeaders(request.headers.get('origin') || undefined)
    })
  }
}

// DELETE - Excluir template
export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ 
        success: false,
        message: 'Não autorizado' 
      }, { 
        status: 401,
        headers: getCorsHeaders(request.headers.get('origin') || undefined)
      })
    }

    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({
        success: false,
        message: 'ID do template é obrigatório'
      }, {
        status: 400,
        headers: getCorsHeaders(request.headers.get('origin') || undefined)
      })
    }

    const connection = await getSafeConnection();
    
    // Verificar se o template existe e pertence ao usuário
    const existingTemplate = await connection('notification_templates')
      .where('id', id)
      .where('user_id', session.user.id)
      .first();

    if (!existingTemplate) {
      return NextResponse.json({
        success: false,
        message: 'Template não encontrado ou sem permissão'
      }, {
        status: 404,
        headers: getCorsHeaders(request.headers.get('origin') || undefined)
      })
    }

    // Excluir template
    await connection('notification_templates')
      .where('id', id)
      .delete();

    return NextResponse.json({
      success: true,
      message: 'Template excluído com sucesso'
    }, {
      headers: getCorsHeaders(request.headers.get('origin') || undefined)
    });

  } catch (error) {
    console.error('❌ Erro ao excluir template:', error);
    return NextResponse.json({ 
      success: false,
      message: 'Erro interno do servidor' 
    }, { 
      status: 500,
      headers: getCorsHeaders(request.headers.get('origin') || undefined)
    })
  }
}
