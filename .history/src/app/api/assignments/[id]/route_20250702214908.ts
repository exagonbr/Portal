import { NextRequest, NextResponse } from 'next/server';
import { requireAuth, AuthSession } from '@/middleware/auth';

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  return requireAuth(async (req: NextRequest, auth: AuthSession) => {
    try {
      const assignmentId = params.id;

    console.log('📖 [ASSIGNMENT-DETAIL] Buscando tarefa:', assignmentId);

    // Simular busca de tarefa específica
    const assignment = {
      id: assignmentId,
      title: 'Exercícios de Matemática - Capítulo 5',
      description: 'Resolver os exercícios 1 a 20 do capítulo 5 sobre equações quadráticas. Esta tarefa visa consolidar o conhecimento sobre resolução de equações do segundo grau.',
      courseId: 'course_1',
      courseName: 'Matemática Avançada',
      teacherId: 'teacher_1',
      teacherName: 'Prof. João Silva',
      dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date().toISOString(),
      status: 'ACTIVE',
      type: 'HOMEWORK',
      maxScore: 100,
      submissions: 15,
      totalStudents: 25,
      instructions: [
        'Leia atentamente o capítulo 5 antes de iniciar',
        'Use calculadora apenas quando necessário',
        'Mostre todos os cálculos',
        'Entregue em formato PDF'
      ],
      resources: [
        {
          id: 'res_1',
          name: 'Capítulo 5 - Equações Quadráticas',
          type: 'PDF',
          url: '/resources/chapter_5.pdf',
          size: '2.5MB'
        },
        {
          id: 'res_2',
          name: 'Fórmulas de Referência',
          type: 'PDF',
          url: '/resources/formulas.pdf',
          size: '500KB'
        }
      ],
      rubric: {
        criteria: [
          { name: 'Correção dos Cálculos', weight: 40, description: 'Precisão matemática' },
          { name: 'Apresentação', weight: 20, description: 'Organização e clareza' },
          { name: 'Completude', weight: 30, description: 'Todos os exercícios resolvidos' },
          { name: 'Pontualidade', weight: 10, description: 'Entrega no prazo' }
        ]
      },
      metadata: {
        difficulty: 'MEDIUM',
        estimatedTime: 120,
        tags: ['matemática', 'equações', 'álgebra'],
        allowLateSubmission: true,
        latePenalty: 10
      }
    };

    return NextResponse.json({
      success: true,
      data: assignment,
      meta: {
        requestedBy: auth.user.email,
        userRole: auth.user.role,
        timestamp: new Date().toISOString()
      }
    });

  } catch (error: any) {
    console.error('❌ [ASSIGNMENT-DETAIL] Erro:', error);
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

export const PUT = requireAuth(async (request: NextRequest, auth, { params }: { params: { id: string } }) => {
  try {
    const assignmentId = params.id;
    const body = await request.json();
    const { title, description, dueDate, status, maxScore } = body;

    console.log('✏️ [ASSIGNMENT-DETAIL] Atualizando tarefa:', assignmentId);

    // Simular atualização da tarefa
    const updatedAssignment = {
      id: assignmentId,
      title: title || 'Exercícios de Matemática - Capítulo 5',
      description: description || 'Descrição atualizada',
      dueDate: dueDate || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      status: status || 'ACTIVE',
      maxScore: maxScore || 100,
      updatedAt: new Date().toISOString(),
      updatedBy: auth.user.email
    };

    return NextResponse.json({
      success: true,
      message: 'Tarefa atualizada com sucesso',
      data: updatedAssignment
    });

  } catch (error: any) {
    console.error('❌ [ASSIGNMENT-DETAIL] Erro ao atualizar:', error);
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

export const DELETE = requireAuth(async (request: NextRequest, auth, { params }: { params: { id: string } }) => {
  try {
    const assignmentId = params.id;

    console.log('🗑️ [ASSIGNMENT-DETAIL] Removendo tarefa:', assignmentId);

    // Verificar se o usuário tem permissão para deletar
    if (!['TEACHER', 'ADMIN', 'SYSTEM_ADMIN'].includes(auth.user.role)) {
      return NextResponse.json(
        { 
          success: false, 
          message: 'Permissão insuficiente para deletar tarefas',
          code: 'FORBIDDEN'
        },
        { status: 403 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Tarefa removida com sucesso',
      data: { 
        id: assignmentId, 
        deletedAt: new Date().toISOString(),
        deletedBy: auth.user.email
      }
    });

  } catch (error: any) {
    console.error('❌ [ASSIGNMENT-DETAIL] Erro ao remover:', error);
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
      message: 'API de tarefa específica ativa',
      methods: ['GET', 'PUT', 'DELETE', 'OPTIONS'],
      timestamp: new Date().toISOString()
    }
  );
}