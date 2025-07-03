import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/middleware/auth';

export const GET = requireAuth(async (request: NextRequest, auth) => {
  try {
    const url = new URL(request.url);
    const limit = parseInt(url.searchParams.get('limit') || '50');
    const status = url.searchParams.get('status');
    const courseId = url.searchParams.get('courseId');
    const search = url.searchParams.get('search');

    console.log('📚 [ASSIGNMENTS] Buscando tarefas para:', auth.user.email);

    // Simular dados de tarefas
    const assignments = [
      {
        id: '1',
        title: 'Exercícios de Matemática - Capítulo 5',
        description: 'Resolver os exercícios 1 a 20 do capítulo 5 sobre equações quadráticas',
        courseId: 'course_1',
        courseName: 'Matemática Avançada',
        teacherId: 'teacher_1',
        teacherName: 'Prof. João Silva',
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        status: 'ACTIVE',
        type: 'HOMEWORK',
        maxScore: 100,
        submissions: 15,
        totalStudents: 25,
        metadata: {
          difficulty: 'MEDIUM',
          estimatedTime: 120,
          resources: ['textbook_chapter_5.pdf', 'calculator']
        }
      },
      {
        id: '2',
        title: 'Ensaio sobre Literatura Brasileira',
        description: 'Escrever um ensaio de 1000 palavras sobre o Romantismo no Brasil',
        courseId: 'course_2',
        courseName: 'Literatura Brasileira',
        teacherId: 'teacher_2',
        teacherName: 'Prof. Maria Santos',
        dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
        createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
        status: 'ACTIVE',
        type: 'ESSAY',
        maxScore: 100,
        submissions: 8,
        totalStudents: 20,
        metadata: {
          difficulty: 'HIGH',
          estimatedTime: 300,
          resources: ['romantismo_brasil.pdf', 'obras_recomendadas.txt']
        }
      },
      {
        id: '3',
        title: 'Laboratório de Química - Reações Ácido-Base',
        description: 'Realizar experimentos práticos sobre reações ácido-base',
        courseId: 'course_3',
        courseName: 'Química Geral',
        teacherId: 'teacher_3',
        teacherName: 'Prof. Carlos Lima',
        dueDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
        status: 'EXPIRED',
        type: 'LAB',
        maxScore: 100,
        submissions: 18,
        totalStudents: 22,
        metadata: {
          difficulty: 'MEDIUM',
          estimatedTime: 180,
          resources: ['roteiro_lab.pdf', 'tabela_ph.pdf']
        }
      }
    ];

    // Filtrar tarefas baseado nos parâmetros
    let filteredAssignments = assignments;

    if (status) {
      filteredAssignments = filteredAssignments.filter(assignment => assignment.status === status);
    }

    if (courseId) {
      filteredAssignments = filteredAssignments.filter(assignment => assignment.courseId === courseId);
    }

    if (search) {
      filteredAssignments = filteredAssignments.filter(assignment => 
        assignment.title.toLowerCase().includes(search.toLowerCase()) ||
        assignment.description.toLowerCase().includes(search.toLowerCase())
      );
    }

    return NextResponse.json({
      success: true,
      data: filteredAssignments.slice(0, limit),
      meta: {
        total: filteredAssignments.length,
        limit,
        filters: { status, courseId, search },
        requestedBy: auth.user.email,
        userRole: auth.user.role
      }
    });

  } catch (error: any) {
    console.error('❌ [ASSIGNMENTS] Erro:', error);
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
    const { title, description, courseId, dueDate, type = 'HOMEWORK', maxScore = 100 } = body;

    if (!title || !description || !courseId || !dueDate) {
      return NextResponse.json(
        { 
          success: false, 
          message: 'Campos obrigatórios: title, description, courseId, dueDate',
          code: 'VALIDATION_ERROR'
        },
        { status: 400 }
      );
    }

    console.log('📝 [ASSIGNMENTS] Criando tarefa:', title);

    // Simular criação de tarefa
    const assignment = {
      id: `assignment_${Date.now()}`,
      title,
      description,
      courseId,
      courseName: 'Curso Exemplo',
      teacherId: auth.user.id,
      teacherName: auth.user.name,
      dueDate,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      status: 'ACTIVE',
      type,
      maxScore,
      submissions: 0,
      totalStudents: 0,
      metadata: {
        createdBy: auth.user.email,
        difficulty: 'MEDIUM',
        estimatedTime: 120
      }
    };

    return NextResponse.json({
      success: true,
      message: 'Tarefa criada com sucesso',
      data: assignment
    });

  } catch (error: any) {
    console.error('❌ [ASSIGNMENTS] Erro ao criar:', error);
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
      message: 'API de tarefas ativa',
      methods: ['GET', 'POST', 'OPTIONS'],
      timestamp: new Date().toISOString()
    }
  );
}
