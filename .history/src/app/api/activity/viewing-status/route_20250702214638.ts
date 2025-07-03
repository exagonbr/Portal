import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/middleware/auth';

export const GET = requireAuth(async (request: NextRequest, auth) => {
  try {
    const url = new URL(request.url);
    const resourceId = url.searchParams.get('resourceId');
    const resourceType = url.searchParams.get('resourceType');
    const userId = url.searchParams.get('userId') || auth.user.id;

    console.log('👁️ [VIEWING-STATUS] Buscando status para:', { resourceId, resourceType, userId });

    if (!resourceId || !resourceType) {
      return NextResponse.json(
        { 
          success: false, 
          message: 'Parâmetros obrigatórios: resourceId, resourceType',
          code: 'VALIDATION_ERROR'
        },
        { status: 400 }
      );
    }

    // Simular dados de status de visualização
    const viewingStatus = {
      resourceId,
      resourceType,
      userId,
      status: 'IN_PROGRESS',
      progress: 65,
      lastViewed: new Date(Date.now() - 3600000).toISOString(),
      totalTime: 2400,
      completed: false,
      bookmarks: [
        { position: 120, note: 'Conceito importante' },
        { position: 480, note: 'Revisar este tópico' }
      ],
      metadata: {
        device: 'desktop',
        quality: 'HD',
        speed: 1.0
      }
    };

    return NextResponse.json({
      success: true,
      data: viewingStatus,
      meta: {
        requestedBy: auth.user.email,
        timestamp: new Date().toISOString()
      }
    });

  } catch (error: any) {
    console.error('❌ [VIEWING-STATUS] Erro:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: 'Erro interno do servidor',
        code: 'INTERNAL_ERROR'
      },
      { status: 500 }
    );
  }
});

export const POST = requireAuth(async (request: NextRequest, auth) => {
  try {
    const body = await request.json();
    const { resourceId, resourceType, progress, status, metadata } = body;

    if (!resourceId || !resourceType) {
      return NextResponse.json(
        { 
          success: false, 
          message: 'Campos obrigatórios: resourceId, resourceType',
          code: 'VALIDATION_ERROR'
        },
        { status: 400 }
      );
    }

    console.log('💾 [VIEWING-STATUS] Atualizando status:', { resourceId, progress, status });

    // Simular atualização do status
    const updatedStatus = {
      resourceId,
      resourceType,
      userId: auth.user.id,
      status: status || 'IN_PROGRESS',
      progress: progress || 0,
      lastViewed: new Date().toISOString(),
      metadata: metadata || {}
    };

    return NextResponse.json({
      success: true,
      message: 'Status de visualização atualizado',
      data: updatedStatus
    });

  } catch (error: any) {
    console.error('❌ [VIEWING-STATUS] Erro ao atualizar:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: 'Erro interno do servidor',
        code: 'INTERNAL_ERROR'
      },
      { status: 500 }
    );
  }
});

export async function OPTIONS() {
  return NextResponse.json(
    { 
      success: true,
      message: 'API de status de visualização ativa',
      methods: ['GET', 'POST', 'OPTIONS'],
      timestamp: new Date().toISOString()
    }
  );
}
