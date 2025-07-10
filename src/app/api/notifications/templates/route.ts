import { NextRequest, NextResponse } from 'next/server'
import { createCorsOptionsResponse, getCorsHeaders } from '@/config/cors';
import { getAuthentication } from '@/lib/auth-utils';
import { getSafeConnection } from '@/lib/database-safe';

export async function OPTIONS(request: NextRequest) {
  return createCorsOptionsResponse(request.headers.get('origin') || undefined);
}

export async function GET(request: NextRequest) {
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

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const search = searchParams.get('search') || '';
    const category = searchParams.get('category') || '';
    const isPublic = searchParams.get('isPublic');
    const userId = searchParams.get('userId') || '';
    const createdBy = searchParams.get('createdBy') || '';

    console.log('🔍 [Templates API] Buscando templates com parâmetros:', {
      page, limit, search, category, isPublic, userId, createdBy
    });

    const db = await getSafeConnection();
    
    // Construir query base
    let query = db('notification_templates').select('*');
    
    // Aplicar filtros
    if (search) {
      query = query.where(function() {
        this.where('name', 'like', `%${search}%`)
            .orWhere('subject', 'like', `%${search}%`)
            .orWhere('message', 'like', `%${search}%`);
      });
    }
    
    if (category) {
      query = query.where('category', category);
    }
    
    if (isPublic !== null && isPublic !== undefined) {
      query = query.where('is_public', isPublic === 'true');
    }
    
    if (userId) {
      query = query.where('user_id', userId);
    }
    
    if (createdBy) {
      query = query.where('created_by', createdBy);
    }

    // Contar total
    const totalQuery = query.clone().count('* as total');
    const totalResult = await totalQuery.first();
    const total = totalResult ? Number(totalResult.total) : 0;

    // Aplicar paginação
    const offset = (page - 1) * limit;
    const templates = await query
      .orderBy('created_at', 'desc')
      .limit(limit)
      .offset(offset);

    console.log('✅ [Templates API] Templates encontrados:', templates.length);

    return NextResponse.json({
      success: true,
      data: templates,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    }, {
      headers: getCorsHeaders(request.headers.get('origin') || undefined)
    });

  } catch (error) {
    console.error('❌ [Templates API] Erro ao buscar templates:', error);
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

export async function POST(request: NextRequest) {
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

    const body = await request.json();
    const { name, subject, message, html, category, is_public, user_id, created_by, created_at, updated_at } = body;

    console.log('🔍 [Templates API] Criando template:', { name, subject, category, is_public, user_id, created_by });

    // Validação básica
    if (!name || !subject || !message) {
      return NextResponse.json({
        success: false,
        message: 'Nome, assunto e mensagem são obrigatórios'
      }, { 
        status: 400,
        headers: getCorsHeaders(request.headers.get('origin') || undefined)
      });
    }

    const db = await getSafeConnection();
    
    const templateData = {
      name,
      subject,
      message,
      html: html || false,
      category: category || 'custom',
      is_public: is_public || false,
      user_id: user_id || session.user.id,
      created_by: created_by || session.user.name || session.user.email,
      created_at: created_at ? new Date(created_at) : new Date(),
      updated_at: updated_at ? new Date(updated_at) : new Date()
    };

    const [newTemplate] = await db('notification_templates')
      .insert(templateData)
      .returning('*');

    console.log('✅ [Templates API] Template criado com sucesso:', newTemplate.id);

    return NextResponse.json({
      success: true,
      data: newTemplate,
      message: 'Template criado com sucesso'
    }, {
      headers: getCorsHeaders(request.headers.get('origin') || undefined)
    });

  } catch (error) {
    console.error('❌ [Templates API] Erro ao criar template:', error);
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

export async function PUT(request: NextRequest) {
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

    const body = await request.json();
    const { id, name, subject, message, html, category, is_public } = body;

    console.log('🔍 [Templates API] Atualizando template:', id);

    if (!id) {
      return NextResponse.json({
        success: false,
        message: 'ID do template é obrigatório'
      }, { 
        status: 400,
        headers: getCorsHeaders(request.headers.get('origin') || undefined)
      });
    }

    const db = await getSafeConnection();
    
    const updateData = {
      name,
      subject,
      message,
      html: html || false,
      category: category || 'custom',
      is_public: is_public || false,
      updated_at: new Date()
    };

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

export async function DELETE(request: NextRequest) {
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

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    console.log('🔍 [Templates API] Deletando template:', id);

    if (!id) {
      return NextResponse.json({
        success: false,
        message: 'ID do template é obrigatório'
      }, { 
        status: 400,
        headers: getCorsHeaders(request.headers.get('origin') || undefined)
      });
    }

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
