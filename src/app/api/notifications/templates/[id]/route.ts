import { NextRequest, NextResponse } from 'next/server';
import { createCorsOptionsResponse, getCorsHeaders } from '@/config/cors';
import { getAuthentication } from '@/lib/auth-utils';
import { getSafeConnection } from '@/lib/database-safe';

export async function OPTIONS(request: NextRequest) {
  return createCorsOptionsResponse(request.headers.get('origin') || undefined);
}

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getAuthentication(request);
    
    if (!session) {
      return NextResponse.json({ 
        success: false, 
        message: 'Token de autorização necessário' 
      }, { 
        status: 401,
        headers: getCorsHeaders(request.headers.get('origin') || undefined)
      });
    }

    const { id } = params;
    console.log('🔍 [Templates API] Buscando template por ID:', id);

    const db = await getSafeConnection();
    
    const template = await db('notification_templates')
      .where('id', id)
      .first();

    if (!template) {
      return NextResponse.json({
        success: false,
        message: 'Template não encontrado'
      }, { 
        status: 404,
        headers: getCorsHeaders(request.headers.get('origin') || undefined)
      });
    }

    console.log('✅ [Templates API] Template encontrado:', template.name);

    return NextResponse.json({
      success: true,
      data: template
    }, {
      headers: getCorsHeaders(request.headers.get('origin') || undefined)
    });

  } catch (error) {
    console.error('❌ [Templates API] Erro ao buscar template:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: 'Erro interno do servidor' 
      },
      { 
        status: 500,
        headers: getCorsHeaders(request.headers.get('origin') || undefined)
      }
    );
  }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getAuthentication(request);
    
    if (!session) {
      return NextResponse.json({ 
        success: false, 
        message: 'Token de autorização necessário' 
      }, { 
        status: 401,
        headers: getCorsHeaders(request.headers.get('origin') || undefined)
      });
    }

    const { id } = params;
    const body = await request.json();
    const { name, subject, message, html, category, is_public, user_id, created_by, created_at, updated_at } = body;

    console.log('🔍 [Templates API] Atualizando template:', id, { name, subject, category, is_public, user_id, created_by });

    const db = await getSafeConnection();
    
    const updateData: any = {
      name,
      subject,
      message,
      html: html || false,
      category: category || 'custom',
      is_public: is_public || false,
      updated_at: updated_at ? new Date(updated_at) : new Date()
    };

    // Incluir user_id e created_by apenas se fornecidos
    if (user_id !== undefined) {
      updateData.user_id = user_id;
    }
    if (created_by !== undefined) {
      updateData.created_by = created_by;
    }
    if (created_at !== undefined) {
      updateData.created_at = new Date(created_at);
    }

    const [updatedTemplate] = await db('notification_templates')
      .where('id', id)
      .update(updateData)
      .returning('*');

    if (!updatedTemplate) {
      return NextResponse.json({
        success: false,
        message: 'Template não encontrado'
      }, { 
        status: 404,
        headers: getCorsHeaders(request.headers.get('origin') || undefined)
      });
    }

    console.log('✅ [Templates API] Template atualizado com sucesso:', id);

    return NextResponse.json({
      success: true,
      data: updatedTemplate,
      message: 'Template atualizado com sucesso'
    }, {
      headers: getCorsHeaders(request.headers.get('origin') || undefined)
    });

  } catch (error) {
    console.error('❌ [Templates API] Erro ao atualizar template:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: 'Erro interno do servidor' 
      },
      { 
        status: 500,
        headers: getCorsHeaders(request.headers.get('origin') || undefined)
      }
    );
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getAuthentication(request);
    
    if (!session) {
      return NextResponse.json({ 
        success: false, 
        message: 'Token de autorização necessário' 
      }, { 
        status: 401,
        headers: getCorsHeaders(request.headers.get('origin') || undefined)
      });
    }

    const { id } = params;
    console.log('🔍 [Templates API] Deletando template:', id);

    const db = await getSafeConnection();
    
    const deletedCount = await db('notification_templates')
      .where('id', id)
      .del();

    if (deletedCount === 0) {
      return NextResponse.json({
        success: false,
        message: 'Template não encontrado'
      }, { 
        status: 404,
        headers: getCorsHeaders(request.headers.get('origin') || undefined)
      });
    }

    console.log('✅ [Templates API] Template deletado com sucesso:', id);

    return NextResponse.json({
      success: true,
      message: 'Template deletado com sucesso'
    }, {
      headers: getCorsHeaders(request.headers.get('origin') || undefined)
    });

  } catch (error) {
    console.error('❌ [Templates API] Erro ao deletar template:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: 'Erro interno do servidor' 
      },
      { 
        status: 500,
        headers: getCorsHeaders(request.headers.get('origin') || undefined)
      }
    );
  }
}
