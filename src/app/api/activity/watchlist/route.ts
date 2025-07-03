import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/middleware/auth';

export const POST = requireAuth(async (request: NextRequest, auth) => {
  try {
    const body = await request.json();
    const { resourceId, resourceType, action = 'add' } = body;

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

    console.log('📌 [WATCHLIST] Ação:', action, 'para recurso:', resourceId);

    // Simular adição/remoção da watchlist
    const watchlistItem = {
      id: `watchlist_${Date.now()}`,
      userId: auth.user.id,
      resourceId,
      resourceType,
      addedAt: new Date().toISOString(),
      priority: 'NORMAL',
      notes: '',
      metadata: {
        addedBy: auth.user.email,
        source: 'api'
      }
    };

    const message = action === 'add' 
      ? 'Item adicionado à watchlist' 
      : 'Item removido da watchlist';

    return NextResponse.json({
      success: true,
      message,
      data: action === 'add' ? watchlistItem : { resourceId, action: 'removed' }
    });

  } catch (error: any) {
    console.error('❌ [WATCHLIST] Erro ao processar:', error);
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

export const DELETE = requireAuth(async (request: NextRequest, auth) => {
  try {
    const url = new URL(request.url);
    const resourceId = url.searchParams.get('resourceId');

    if (!resourceId) {
      return NextResponse.json(
        { 
          success: false, 
          message: 'Parâmetro obrigatório: resourceId',
          code: 'VALIDATION_ERROR'
        },
        { status: 400 }
      );
    }

    console.log('🗑️ [WATCHLIST] Removendo item:', resourceId);

    return NextResponse.json({
      success: true,
      message: 'Item removido da watchlist',
      data: { resourceId, action: 'removed' }
    });

  } catch (error: any) {
    console.error('❌ [WATCHLIST] Erro ao remover:', error);
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
      message: 'API de watchlist ativa',
      methods: ['POST', 'DELETE', 'OPTIONS'],
      timestamp: new Date().toISOString()
    }
  );
}
