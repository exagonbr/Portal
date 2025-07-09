import { NextRequest, NextResponse } from 'next/server'
import { createCorsOptionsResponse, getCorsHeaders } from '@/config/cors';
import { createStandardApiRoute } from '../lib/api-route-template';
import { courseService } from '@/services/courseService';
import { prisma } from '@/lib/prisma';

// Usar o template padronizado para a rota GET
export const { GET, OPTIONS } = createStandardApiRoute({
  endpoint: '/api/courses',
  name: 'courses',
  fallbackFunction: async (req: NextRequest) => {
    try {
      const url = new URL(req.url)
      const limit = parseInt(url.searchParams.get('limit') || '50', 10)
      const page = parseInt(url.searchParams.get('page') || '1', 10)
      const search = url.searchParams.get('search') || ''

      console.log('📚 [API-COURSES] Buscando cursos com serviço');
      
      // Construir objeto de filtros
      const filters = {
        page,
        limit: Math.min(limit, 1000), // máximo 1000
        search
      };
      
      // Usar o serviço de cursos
      const result = await courseService.getAll(filters);
      
      console.log('✅ [API-COURSES] Cursos encontrados:', Array.isArray(result) ? result.length : 0);

      return NextResponse.json({
        success: true,
        data: result,
      }, {
        headers: getCorsHeaders(req.headers.get('origin') || undefined)
      })
    } catch (error) {
      console.error('❌ [API-COURSES] Erro ao buscar cursos:', error);
      return NextResponse.json(
        { success: false, message: 'Erro interno do servidor' },
        { 
          status: 500,
          headers: getCorsHeaders(req.headers.get('origin') || undefined)
        }
      )
    }
  }
});

// POST - Criar curso
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    console.log('📝 [API-COURSES] Criando curso com serviço');
    
    // Usar o serviço para criar o curso
    const newCourse = await courseService.create(body);
    
    console.log('✅ [API-COURSES] Curso criado com sucesso');
    
    return NextResponse.json({
      success: true,
      data: newCourse,
      message: 'Curso criado com sucesso'
    }, {
      status: 201,
      headers: getCorsHeaders(request.headers.get('origin') || undefined)
    });
  } catch (error) {
    console.error('❌ [API-COURSES] Erro ao criar curso:', error);
    return NextResponse.json(
      { success: false, message: 'Erro interno do servidor' },
      { 
        status: 500,
        headers: getCorsHeaders(request.headers.get('origin') || undefined)
      }
    );
  }
}

// PUT - Atualizar curso
export async function PUT(request: NextRequest) {
  try {
    // Obter ID do curso da URL
    const urlObj = new URL(request.url);
    const id = urlObj.pathname.split('/').pop();
    
    if (!id) {
      return NextResponse.json(
        { success: false, message: 'ID do curso não fornecido' },
        { 
          status: 400,
          headers: getCorsHeaders(request.headers.get('origin') || undefined)
        }
      );
    }
    
    const body = await request.json();
    
    console.log('✏️ [API-COURSES] Atualizando curso com serviço:', id);
    
    // Usar o serviço para atualizar o curso
    const updatedCourse = await courseService.update(parseInt(id), body);
    
    console.log('✅ [API-COURSES] Curso atualizado com sucesso');
    
    return NextResponse.json({
      success: true,
      data: updatedCourse,
      message: 'Curso atualizado com sucesso'
    }, {
      headers: getCorsHeaders(request.headers.get('origin') || undefined)
    });
  } catch (error) {
    console.error('❌ [API-COURSES] Erro ao atualizar curso:', error);
    return NextResponse.json(
      { success: false, message: 'Erro interno do servidor' },
      { 
        status: 500,
        headers: getCorsHeaders(request.headers.get('origin') || undefined)
      }
    );
  }
}

// DELETE - Excluir curso
export async function DELETE(request: NextRequest) {
  try {
    // Obter ID do curso da URL
    const urlObj = new URL(request.url);
    const id = urlObj.pathname.split('/').pop();
    
    if (!id) {
      return NextResponse.json(
        { success: false, message: 'ID do curso não fornecido' },
        { 
          status: 400,
          headers: getCorsHeaders(request.headers.get('origin') || undefined)
        }
      );
    }
    
    console.log('🗑️ [API-COURSES] Excluindo curso com serviço:', id);
    
    // Usar o serviço para excluir o curso
    await courseService.delete(parseInt(id));
    
    console.log('✅ [API-COURSES] Curso excluído com sucesso');
    
    return NextResponse.json({
      success: true,
      message: 'Curso excluído com sucesso'
    }, {
      headers: getCorsHeaders(request.headers.get('origin') || undefined)
    });
  } catch (error) {
    console.error('❌ [API-COURSES] Erro ao excluir curso:', error);
    return NextResponse.json(
      { success: false, message: 'Erro interno do servidor' },
      { 
        status: 500,
        headers: getCorsHeaders(request.headers.get('origin') || undefined)
      }
    );
  }
}
