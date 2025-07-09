import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { createCorsOptionsResponse, getCorsHeaders } from '@/config/cors'
import { getSafeConnection } from '@/lib/database-safe'

export async function OPTIONS(request: NextRequest) {
  const origin = request.headers.get('origin') || undefined;
  return createCorsOptionsResponse(origin);
}

// GET - Buscar template específico por ID
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    const { id } = params;

    const connection = await getSafeConnection();
    const template = await connection('notification_templates')
      .select('*')
      .where('id', id)
      .where(function(query) {
        query.where('user_id', session.user.id)
          .orWhere('is_public', true);
      })
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

    return NextResponse.json({
      success: true,
      data: template
    }, {
      headers: getCorsHeaders(request.headers.get('origin') || undefined)
    });

  } catch (error) {
    console.error('❌ Erro ao buscar template:', error);
    return NextResponse.json({ 
      success: false,
      message: 'Erro interno do servidor' 
    }, { 
      status: 500,
      headers: getCorsHeaders(request.headers.get('origin') || undefined)
    })
  }
}
