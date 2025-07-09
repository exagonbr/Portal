import { NextRequest, NextResponse } from 'next/server'
import { createCorsOptionsResponse, getCorsHeaders } from '@/config/cors';
import { createStandardApiRoute } from '../lib/api-route-template';
import { themeService } from '@/services/themeService';

// Usar o template padronizado para a rota GET
export const { GET, OPTIONS } = createStandardApiRoute({
  endpoint: '/api/themes',
  name: 'themes',
  fallbackFunction: async (req: NextRequest) => {
    try {
      const url = new URL(req.url)
      const limit = parseInt(url.searchParams.get('limit') || '50', 10)
      const page = parseInt(url.searchParams.get('page') || '1', 10)
      const search = url.searchParams.get('search') || ''
      const sortBy = url.searchParams.get('sortBy') || 'name'
      const sortOrder = url.searchParams.get('sortOrder') || 'asc'

      console.log('📚 [API-THEMES] Buscando temas com serviço');
      
      // Construir objeto de filtros
      const filters = {
        page,
        limit: Math.min(limit, 1000), // máximo 1000
        search,
        sortBy,
        sortOrder: sortOrder as 'asc' | 'desc'
      };
      
      // Usar o serviço de themes
      const result = await themeService.getThemes(filters);
      
      console.log('✅ [API-THEMES] Temas encontrados:', result.items?.length || 0);

      return NextResponse.json(result, {
        headers: getCorsHeaders(req.headers.get('origin') || undefined)
      })
    } catch (error) {
      console.error('❌ [API-THEMES] Erro ao buscar temas:', error);
      
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

// POST - Criar tema
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    console.log('📝 [API-THEMES] Criando tema com serviço');
    
    // Usar o serviço para criar o tema
    const newTheme = await themeService.createTheme(body);
    
    console.log('✅ [API-THEMES] Tema criado com sucesso');
    
    return NextResponse.json({
      success: true,
      data: newTheme,
      message: 'Tema criado com sucesso'
    }, {
      status: 201,
      headers: getCorsHeaders(request.headers.get('origin') || undefined)
    });
  } catch (error) {
    console.error('❌ [API-THEMES] Erro ao criar tema:', error);
    return NextResponse.json(
      { success: false, message: 'Erro interno do servidor' },
      { 
        status: 500,
        headers: getCorsHeaders(request.headers.get('origin') || undefined)
      }
    );
  }
} 