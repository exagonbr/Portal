import { NextRequest, NextResponse } from 'next/server'
import { createCorsOptionsResponse, getCorsHeaders } from '@/config/cors';
import { createStandardApiRoute } from '../lib/api-route-template';
import { teacherSubjectService } from '@/services/teachersubjectService';

// Usar o template padronizado para a rota GET
export const { GET, OPTIONS } = createStandardApiRoute({
  endpoint: '/api/teacher-subjects',
  name: 'teacher-subjects',
  fallbackFunction: async (req: NextRequest) => {
    try {
      const url = new URL(req.url)
      const limit = parseInt(url.searchParams.get('limit') || '10', 10)
      const page = parseInt(url.searchParams.get('page') || '1', 10)
      const search = url.searchParams.get('search') || ''
      const isActive = url.searchParams.get('isActive')

      console.log('📚 [API-TEACHER-SUBJECTS] Buscando disciplinas do professor com serviço');
      
      // Construir objeto de filtros
      const filters = {
        page,
        limit: Math.min(limit, 1000), // máximo 1000
        search,
        isActive: isActive !== null ? isActive === 'true' : undefined
      };
      
      // Usar o serviço de teacher subjects
      const result = await teacherSubjectService.getTeacherSubjects(filters);
      
      console.log('✅ [API-TEACHER-SUBJECTS] Disciplinas encontradas:', result.items?.length || 0);

      return NextResponse.json(result, {
        headers: getCorsHeaders(req.headers.get('origin') || undefined)
      })
    } catch (error) {
      console.error('❌ [API-TEACHER-SUBJECTS] Erro ao buscar disciplinas do professor:', error);
      
      // Retornar estrutura padrão em caso de erro
      const fallbackResponse = {
        success: false,
        message: 'Erro interno do servidor',
        items: [],
        total: 0,
        page: 1,
        limit: 10,
        totalPages: 0
      };
      
      return NextResponse.json(fallbackResponse, {
        status: 500,
        headers: getCorsHeaders(req.headers.get('origin') || undefined)
      })
    }
  }
});

// POST - Criar disciplina do professor
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    console.log('📝 [API-TEACHER-SUBJECTS] Criando disciplina do professor com serviço');
    
    // Usar o serviço para criar a disciplina
    const newTeacherSubject = await teacherSubjectService.createTeacherSubject(body);
    
    console.log('✅ [API-TEACHER-SUBJECTS] Disciplina do professor criada com sucesso');
    
    return NextResponse.json({
      success: true,
      data: newTeacherSubject,
      message: 'Disciplina do professor criada com sucesso'
    }, {
      status: 201,
      headers: getCorsHeaders(request.headers.get('origin') || undefined)
    });
  } catch (error) {
    console.error('❌ [API-TEACHER-SUBJECTS] Erro ao criar disciplina do professor:', error);
    return NextResponse.json(
      { success: false, message: 'Erro interno do servidor' },
      { 
        status: 500,
        headers: getCorsHeaders(request.headers.get('origin') || undefined)
      }
    );
  }
} 