import { NextRequest, NextResponse } from 'next/server'
import { createCorsOptionsResponse, getCorsHeaders } from '@/config/cors';
import { createStandardApiRoute } from '../lib/api-route-template';
import { subjectService } from '@/services/subjectService';

// Usar o template padronizado para a rota GET
export const { GET, OPTIONS } = createStandardApiRoute({
  endpoint: '/api/subjects',
  name: 'subjects',
  fallbackFunction: async (req: NextRequest) => {
    try {
      const url = new URL(req.url)
      const limit = parseInt(url.searchParams.get('limit') || '50', 10)
      const page = parseInt(url.searchParams.get('page') || '1', 10)
      const search = url.searchParams.get('search') || ''
      const sortBy = url.searchParams.get('sortBy') || 'name'
      const sortOrder = url.searchParams.get('sortOrder') || 'asc'

      console.log('📚 [API-SUBJECTS] Buscando disciplinas com serviço');
      
      // Construir objeto de filtros
      const filters = {
        page,
        limit: Math.min(limit, 1000), // máximo 1000
        search,
        sortBy,
        sortOrder: sortOrder as 'asc' | 'desc'
      };
      
      // Usar o serviço de subjects
      const result = await subjectService.getSubjects(filters);
      
      console.log('✅ [API-SUBJECTS] Disciplinas encontradas:', result.items?.length || 0);

      return NextResponse.json(result, {
        headers: getCorsHeaders(req.headers.get('origin') || undefined)
      })
    } catch (error) {
      console.error('❌ [API-SUBJECTS] Erro ao buscar disciplinas:', error);
      
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

// POST - Criar disciplina
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    console.log('📝 [API-SUBJECTS] Criando disciplina com serviço');
    
    // Usar o serviço para criar a disciplina
    const newSubject = await subjectService.createSubject(body);
    
    console.log('✅ [API-SUBJECTS] Disciplina criada com sucesso');
    
    return NextResponse.json({
      success: true,
      data: newSubject,
      message: 'Disciplina criada com sucesso'
    }, {
      status: 201,
      headers: getCorsHeaders(request.headers.get('origin') || undefined)
    });
  } catch (error) {
    console.error('❌ [API-SUBJECTS] Erro ao criar disciplina:', error);
    return NextResponse.json(
      { success: false, message: 'Erro interno do servidor' },
      { 
        status: 500,
        headers: getCorsHeaders(request.headers.get('origin') || undefined)
      }
    );
  }
} 