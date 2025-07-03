import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/middleware/auth';

export const GET = requireAuth(async (request: NextRequest, auth) => {
  try {
    const url = new URL(request.url);
    const userId = url.searchParams.get('userId') || auth.user.id;
    const limit = parseInt(url.searchParams.get('limit') || '50');
    const type = url.searchParams.get('type');

    console.log('📊 [ACTIVITY-TRACK] Buscando atividades para usuário:', userId);

    // Simular dados de atividade
    const activities = [
      {
        id: '1',
        userId,
        type: 'VIEW',
        resourceId: 'course_1',
        resourceType: 'COURSE',
        duration: 1800,
        timestamp: new Date().toISOString(),
        metadata: {
          progress: 75,
          completed: false
        }
      },
      {
        id: '2',
        userId,
        type: 'COMPLETE',
        resourceId: 'lesson_1',
        resourceType: 'LESSON',
        duration: 3600,
        timestamp: new Date(Date.now() - 86400000).toISOString(),
        metadata: {
          progress: 100,
          completed: true,
          score: 85
        }
      }
    ];

    const filteredActivities = type 
      ? activities.filter(activity => activity.type === type)
      : activities;

    return NextResponse.json({
      success: true,
      data: filteredActivities.slice(0, limit),
      meta: {
        total: filteredActivities.length,
        limit,
        userId,
        type,
        requestedBy: auth.user.email
      }
    });

  } catch (error: any) {
    console.error('❌ [ACTIVITY-TRACK] Erro:', error);
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
    const { type, resourceId, resourceType, duration, metadata } = body;

    if (!type || !resourceId || !resourceType) {
      return NextResponse.json(
        { 
          success: false, 
          message: 'Campos obrigatórios: type, resourceId, resourceType',
          code: 'VALIDATION_ERROR'
        },
        { status: 400 }
      );
    }

    console.log('📝 [ACTIVITY-TRACK] Registrando atividade:', { type, resourceId, resourceType });

    // Simular salvamento da atividade
    const activity = {
      id: `activity_${Date.now()}`,
      userId: auth.user.id,
      type,
      resourceId,
      resourceType,
      duration: duration || 0,
      timestamp: new Date().toISOString(),
      metadata: metadata || {}
    };

    return NextResponse.json({
      success: true,
      message: 'Atividade registrada com sucesso',
      data: activity
    });

  } catch (error: any) {
    console.error('❌ [ACTIVITY-TRACK] Erro ao registrar:', error);
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
      message: 'API de rastreamento de atividades ativa',
      methods: ['GET', 'POST', 'OPTIONS'],
      timestamp: new Date().toISOString()
    }
  );
}
