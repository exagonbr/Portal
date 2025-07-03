import { NextRequest, NextResponse } from 'next/server';
import { requireAuth, requirePermission } from '@/middleware/auth';

/**
 * Obter assignment por ID
 * GET /api/assignments/[id]
 */
export const GET = requireAuth(async (request: NextRequest, auth, { params }: { params: { id: string } }) => {
  try {
    const { id } = params;

    if (!id) {
      return NextResponse.json(
        { success: false, message: 'ID do assignment é obrigatório' },
        { status: 400 }
      );
    }

    // Mock de assignment
    const mockAssignment = {
      id,
      title: 'Exercício de Matemática',
      description: 'Resolver os problemas de álgebra linear',
      courseId: '1',
      courseName: 'Matemática Avançada',
      teacherId: '2',
      teacherName: 'Prof. João Silva',
      dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      maxScore: 100,
      status: 'ACTIVE',
      type: 'HOMEWORK',
      instructions: 'Complete todos os exercícios do capítulo 5',
      attachments: [
        {
          id: '1',
          name: 'exercicios.pdf',
          url: '/files/assignments/exercicios.pdf',
          size: 1024000
        }
      ],
      submissions: [
        {
          id: '1',
          studentId: '3',
          studentName: 'Maria Santos',
          submittedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
          score: 85,
          status: 'GRADED'
        }
      ],
      createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString()
    };

    return NextResponse.json({
      success: true,
      message: 'Assignment obtido com sucesso',
      data: mockAssignment
    });

  } catch (error) {
    console.error('Erro ao obter assignment:', error);
    return NextResponse.json(
      { success: false, message: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
});

/**
 * Atualizar assignment
 * PUT /api/assignments/[id]
 */
export const PUT = requirePermission(['assignments.edit'])(async (request: NextRequest, auth, { params }: { params: { id: string } }) => {
  try {
    const { id } = params;
    const body = await request.json();
    const { title, description, dueDate, maxScore, instructions } = body;

    if (!id) {
      return NextResponse.json(
        { success: false, message: 'ID do assignment é obrigatório' },
        { status: 400 }
      );
    }

    // TODO: Implementar atualização real
    const updatedAssignment = {
      id,
      title: title || 'Exercício de Matemática',
      description: description || 'Resolver os problemas de álgebra linear',
      dueDate: dueDate || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      maxScore: maxScore || 100,
      instructions: instructions || 'Complete todos os exercícios',
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
    return NextResponse.json(
      { success: false, message: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
});

/**
 * Deletar assignment
 * DELETE /api/assignments/[id]
 */
export const DELETE = requirePermission(['assignments.delete'])(async (request: NextRequest, auth, { params }: { params: { id: string } }) => {
  try {
    const { id } = params;

    if (!id) {
      return NextResponse.json(
        { success: false, message: 'ID do assignment é obrigatório' },
        { status: 400 }
      );
    }

    // TODO: Implementar deleção real
    return NextResponse.json({
      success: true,
      message: 'Assignment deletado com sucesso',
      data: {
        id,
        deletedAt: new Date().toISOString(),
        deletedBy: auth.user.id
      }
    });

  } catch (error) {
    console.error('Erro ao deletar assignment:', error);
    return NextResponse.json(
      { success: false, message: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
});

export async function OPTIONS() {
  return new NextResponse(null, { status: 204 });
}