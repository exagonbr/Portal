import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/middleware/auth';

/**
 * Obter assignment por ID
 * GET /api/assignments/[id]
 */
export const GET = requireAuth(async (request: NextRequest, auth, { params }: { params: { id: string } }) => {
  try {
    const { id } = params;

    if (!id) {
      return NextResponse.json({
        success: false,
        message: 'ID do assignment é obrigatório'
      }, { status: 400 });
    }

    // Simular busca de assignment
    const mockAssignment = {
      id: id,
      title: 'Exercícios de Matemática Básica',
      description: 'Resolva os exercícios sobre operações básicas de matemática.',
      type: 'EXERCISE',
      status: 'ACTIVE',
      dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 dias
      maxScore: 100,
      courseId: 'course-1',
      courseName: 'Matemática Fundamental',
      teacherId: '2',
      teacherName: 'Professor João Silva',
      createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 dias atrás
      updatedAt: new Date().toISOString(),
      instructions: 'Leia atentamente cada questão antes de responder.',
      attachments: [
        {
          id: 'att-1',
          name: 'exercicios.pdf',
          url: '/files/assignments/exercicios.pdf',
          size: 245760,
          type: 'application/pdf'
        }
      ],
      submissions: {
        total: 25,
        submitted: 18,
        pending: 7,
        graded: 12
      }
    };

    return NextResponse.json({
      success: true,
      message: 'Assignment obtido com sucesso',
      data: mockAssignment
    });

  } catch (error) {
    console.error('Erro ao obter assignment:', error);
    return NextResponse.json({
      success: false,
      message: 'Erro interno do servidor'
    }, { status: 500 });
  }
});

/**
 * Atualizar assignment
 * PUT /api/assignments/[id]
 */
export const PUT = requireAuth(async (request: NextRequest, auth, { params }: { params: { id: string } }) => {
  try {
    const { id } = params;
    const body = await request.json();

    if (!id) {
      return NextResponse.json({
        success: false,
        message: 'ID do assignment é obrigatório'
      }, { status: 400 });
    }

    const { title, description, dueDate, maxScore, instructions } = body;

    // Verificar permissões (apenas professores e admins podem editar)
    if (!['TEACHER', 'ADMIN', 'SYSTEM_ADMIN'].includes(auth.user.role)) {
      return NextResponse.json({
        success: false,
        message: 'Permissão insuficiente para editar assignments'
      }, { status: 403 });
    }

    // Simular atualização
    const updatedAssignment = {
      id: id,
      title: title || 'Exercícios de Matemática Básica',
      description: description || 'Resolva os exercícios sobre operações básicas de matemática.',
      dueDate: dueDate || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      maxScore: maxScore || 100,
      instructions: instructions || 'Leia atentamente cada questão antes de responder.',
      updatedAt: new Date().toISOString(),
      updatedBy: auth.user.id
    };

    return NextResponse.json({
      success: true,
      message: 'Assignment atualizado com sucesso',
      data: updatedAssignment
    });

  } catch (error) {
    console.error('Erro ao atualizar assignment:', error);
    return NextResponse.json({
      success: false,
      message: 'Erro interno do servidor'
    }, { status: 500 });
  }
});

/**
 * Deletar assignment
 * DELETE /api/assignments/[id]
 */
export const DELETE = requireAuth(async (request: NextRequest, auth, { params }: { params: { id: string } }) => {
  try {
    const { id } = params;

    if (!id) {
      return NextResponse.json({
        success: false,
        message: 'ID do assignment é obrigatório'
      }, { status: 400 });
    }

    // Verificar permissões (apenas professores e admins podem deletar)
    if (!['TEACHER', 'ADMIN', 'SYSTEM_ADMIN'].includes(auth.user.role)) {
      return NextResponse.json({
        success: false,
        message: 'Permissão insuficiente para deletar assignments'
      }, { status: 403 });
    }

    // Simular deleção
    return NextResponse.json({
      success: true,
      message: 'Assignment deletado com sucesso',
      data: {
        id: id,
        deletedAt: new Date().toISOString(),
        deletedBy: auth.user.id
      }
    });

  } catch (error) {
    console.error('Erro ao deletar assignment:', error);
    return NextResponse.json({
      success: false,
      message: 'Erro interno do servidor'
    }, { status: 500 });
  }
});

/**
 * OPTIONS para CORS
 */
export async function OPTIONS() {
  return NextResponse.json({}, { status: 204 });
}