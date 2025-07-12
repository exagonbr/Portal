import { NextRequest, NextResponse } from 'next/server'
import { getCorsHeaders } from '@/config/cors';
import { teacherSubjectService } from '@/services/teachersubjectService';

// GET - Buscar disciplina do professor por ID
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    
    console.log(`📚 [API-TEACHER-SUBJECTS] Buscando disciplina do professor por ID: ${id}`);
    
    const teacherSubject = await teacherSubjectService.getTeacherSubjectById(parseInt(id));
    
    console.log('✅ [API-TEACHER-SUBJECTS] Disciplina do professor encontrada');
    
    return NextResponse.json({
      success: true,
      data: teacherSubject
    }, {
      headers: getCorsHeaders(request.headers.get('origin') || undefined)
    });
  } catch (error) {
    console.error('❌ [API-TEACHER-SUBJECTS] Erro ao buscar disciplina do professor por ID:', error);
    return NextResponse.json(
      { success: false, message: 'Disciplina do professor não encontrada' },
      { 
        status: 404,
        headers: getCorsHeaders(request.headers.get('origin') || undefined)
      }
    );
  }
}

// PUT - Atualizar disciplina do professor
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const body = await request.json();
    
    console.log(`📝 [API-TEACHER-SUBJECTS] Atualizando disciplina do professor ID: ${id}`);
    
    const updatedTeacherSubject = await teacherSubjectService.updateTeacherSubject(parseInt(id), body);
    
    console.log('✅ [API-TEACHER-SUBJECTS] Disciplina do professor atualizada com sucesso');
    
    return NextResponse.json({
      success: true,
      data: updatedTeacherSubject,
      message: 'Disciplina do professor atualizada com sucesso'
    }, {
      headers: getCorsHeaders(request.headers.get('origin') || undefined)
    });
  } catch (error) {
    console.error('❌ [API-TEACHER-SUBJECTS] Erro ao atualizar disciplina do professor:', error);
    return NextResponse.json(
      { success: false, message: 'Erro ao atualizar disciplina do professor' },
      { 
        status: 500,
        headers: getCorsHeaders(request.headers.get('origin') || undefined)
      }
    );
  }
}

// DELETE - Remover disciplina do professor
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    
    console.log(`🗑️ [API-TEACHER-SUBJECTS] Removendo disciplina do professor ID: ${id}`);
    
    await teacherSubjectService.deleteTeacherSubject(parseInt(id));
    
    console.log('✅ [API-TEACHER-SUBJECTS] Disciplina do professor removida com sucesso');
    
    return NextResponse.json({
      success: true,
      message: 'Disciplina do professor removida com sucesso'
    }, {
      headers: getCorsHeaders(request.headers.get('origin') || undefined)
    });
  } catch (error) {
    console.error('❌ [API-TEACHER-SUBJECTS] Erro ao remover disciplina do professor:', error);
    return NextResponse.json(
      { success: false, message: 'Erro ao remover disciplina do professor' },
      { 
        status: 500,
        headers: getCorsHeaders(request.headers.get('origin') || undefined)
      }
    );
  }
}

// PATCH - Alternar status da disciplina do professor
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    
    console.log(`🔄 [API-TEACHER-SUBJECTS] Alternando status da disciplina do professor ID: ${id}`);
    
    const updatedTeacherSubject = await teacherSubjectService.toggleTeacherSubjectStatus(parseInt(id));
    
    console.log('✅ [API-TEACHER-SUBJECTS] Status da disciplina do professor alternado com sucesso');
    
    return NextResponse.json({
      success: true,
      data: updatedTeacherSubject,
      message: 'Status da disciplina do professor alternado com sucesso'
    }, {
      headers: getCorsHeaders(request.headers.get('origin') || undefined)
    });
  } catch (error) {
    console.error('❌ [API-TEACHER-SUBJECTS] Erro ao alternar status da disciplina do professor:', error);
    return NextResponse.json(
      { success: false, message: 'Erro ao alternar status da disciplina do professor' },
      { 
        status: 500,
        headers: getCorsHeaders(request.headers.get('origin') || undefined)
      }
    );
  }
}

// OPTIONS - Para suporte a CORS
export async function OPTIONS(request: NextRequest) {
  return new NextResponse(null, {
    status: 200,
    headers: getCorsHeaders(request.headers.get('origin') || undefined)
  });
} 