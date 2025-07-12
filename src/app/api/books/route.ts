import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { getAuthentication, hasRequiredRole } from '@/lib/auth-utils'
import { createCorsOptionsResponse, getCorsHeaders } from '@/config/cors'
import { bookService } from '@/services/bookService'
import { createStandardApiRoute } from '../lib/api-route-template'

// Schema de validação para criação de livro
const createBookSchema = z.object({
  title: z.string().min(3, 'Título deve ter pelo menos 3 caracteres'),
  author: z.string().min(3, 'Autor deve ter pelo menos 3 caracteres'),
  isbn: z.string().regex(/^(?:ISBN(?:-1[03])?:? )?(?=[0-9X]{10}$|(?=(?:[0-9]+[- ]){3})[- 0-9X]{13}$|97[89][0-9]{10}$|(?=(?:[0-9]+[- ]){4})[- 0-9]{17}$)(?:97[89][- ]?)?[0-9]{1,5}[- ]?[0-9]+[- ]?[0-9]+[- ]?[0-9X]$/, 'ISBN inválido').optional(),
  publisher: z.string().optional(),
  publication_year: z.number().int().min(1900).max(new Date().getFullYear()),
  edition: z.string().optional(),
  pages: z.number().int().positive().optional(),
  language: z.enum(['PT', 'EN', 'ES', 'FR', 'DE', 'IT', 'OTHER']).default('PT'),
  category: z.enum(['TEXTBOOK', 'REFERENCE', 'FICTION', 'NON_FICTION', 'ACADEMIC', 'TECHNICAL']),
  subject: z.string().optional(),
  description: z.string().optional(),
  cover_url: z.string().url().optional(),
  pdf_url: z.string().url().optional(),
  course_ids: z.array(z.string().uuid()).optional(),
  tags: z.array(z.string()).optional(),
  is_active: z.boolean().default(true),
  is_digital: z.boolean().default(false),
  access_type: z.enum(['FREE', 'RESTRICTED', 'PREMIUM']).default('RESTRICTED'),
  metadata: z.object({
    dewey_code: z.string().optional(),
    cdd_code: z.string().optional(),
    keywords: z.array(z.string()).optional(),
    age_rating: z.string().optional()
  }).optional()
})

// Usar o template padronizado para a rota GET
export const { GET, OPTIONS } = createStandardApiRoute({
  endpoint: '/api/books',
  name: 'books',
  fallbackFunction: async (req: NextRequest) => {
    try {
      const session = await getAuthentication(req)
      
      if (!session) {
        return NextResponse.json({ error: 'Não autorizado' }, { 
          status: 401,
          headers: getCorsHeaders(req.headers.get('origin') || undefined)
        })
      }

      // Parâmetros de query
      const { searchParams } = new URL(req.url)
      const page = parseInt(searchParams.get('page') || '1')
      const limit = parseInt(searchParams.get('limit') || '10')
      const search = searchParams.get('search') || ''
      const category = searchParams.get('category')
      const subject = searchParams.get('subject')
      const language = searchParams.get('language')
      const course_id = searchParams.get('course_id')
      const is_digital = searchParams.get('is_digital')
      const access_type = searchParams.get('access_type')
      const is_active = searchParams.get('is_active')

      console.log('📚 [API-BOOKS] Buscando livros com serviço');
      
      // Construir objeto de filtros
      const filters = {
        page,
        limit,
        search,
        category,
        subject,
        language,
        course_id,
        is_digital: is_digital ? is_digital === 'true' : undefined,
        access_type,
        is_active: is_active ? is_active === 'true' : undefined,
        userRole: session.user?.role,
        userId: session.user?.id
      };
      
      // Usar o serviço de livros
      const result = await bookService.getBooks(filters);
      
      console.log('✅ [API-BOOKS] Livros encontrados:', result.data?.items?.length);

      return NextResponse.json(result, {
        headers: getCorsHeaders(req.headers.get('origin') || undefined)
      })
    } catch (error) {
      console.error('❌ [API-BOOKS] Erro ao buscar livros:', error);
      return NextResponse.json(
        { 
          success: false,
          data: {
            items: [],
            pagination: {
              page: 1,
              limit: 10,
              total: 0,
              totalPages: 0
            }
          },
          message: 'Erro interno do servidor'
        },
        { 
          status: 500,
          headers: getCorsHeaders(req.headers.get('origin') || undefined)
        }
      );
    }
  }
});

// POST - Criar livro
export async function POST(request: NextRequest) {
  try {
    const session = await getAuthentication(request)
    
    if (!session) {
      return NextResponse.json({ error: 'Não autorizado' }, { 
        status: 401,
        headers: getCorsHeaders(request.headers.get('origin') || undefined)
      })
    }

    // Verificar permissões
    const userRole = session.user?.role
    if (!hasRequiredRole(userRole, ['SYSTEM_ADMIN', 'INSTITUTION_MANAGER', 'TEACHER', 'LIBRARIAN'])) {
      return NextResponse.json({ error: 'Sem permissão para criar livros' }, { 
        status: 403,
        headers: getCorsHeaders(request.headers.get('origin') || undefined)
      })
    }

    const body = await request.json()

    // Validar dados
    const validationResult = createBookSchema.safeParse(body)
    if (!validationResult.success) {
      return NextResponse.json({
          error: 'Dados inválidos',
          errors: validationResult.error.flatten().fieldErrors
        },
        {
          status: 400,
          headers: getCorsHeaders(request.headers.get('origin') || undefined)
        }
      )
    }

    const bookData = validationResult.data

    console.log('📝 [API-BOOKS] Criando livro com serviço');
    
    // Usar o serviço para criar o livro
    const newBook = await bookService.createBook({
      ...bookData,
      institution_id: session.user.institution_id,
      created_by: session.user?.id
    });
    
    console.log('✅ [API-BOOKS] Livro criado com sucesso');

    return NextResponse.json({
      success: true,
      data: newBook,
      message: 'Livro criado com sucesso'
    }, {
      status: 201,
      headers: getCorsHeaders(request.headers.get('origin') || undefined)
    })
  } catch (error) {
    console.error('❌ [API-BOOKS] Erro ao criar livro:', error);
    
    // Verificar se é erro de ISBN duplicado
    if (error instanceof Error && error.message.includes('ISBN')) {
      return NextResponse.json({ 
        success: false,
        message: 'Já existe um livro com este ISBN'
      }, { 
        status: 409,
        headers: getCorsHeaders(request.headers.get('origin') || undefined)
      })
    }
    
    return NextResponse.json({ 
      success: false,
      message: 'Erro interno do servidor'
    }, { 
      status: 500,
      headers: getCorsHeaders(request.headers.get('origin') || undefined)
    })
  }
}

// PUT - Atualizar livro
export async function PUT(request: NextRequest) {
  try {
    const session = await getAuthentication(request)
    
    if (!session) {
      return NextResponse.json({ 
        success: false,
        message: 'Não autorizado'
      }, { 
        status: 401,
        headers: getCorsHeaders(request.headers.get('origin') || undefined)
      })
    }

    // Verificar permissões
    const userRole = session.user?.role
    if (!hasRequiredRole(userRole, ['SYSTEM_ADMIN', 'INSTITUTION_MANAGER', 'TEACHER', 'LIBRARIAN'])) {
      return NextResponse.json({ 
        success: false,
        message: 'Sem permissão para atualizar livros'
      }, { 
        status: 403,
        headers: getCorsHeaders(request.headers.get('origin') || undefined)
      })
    }

    // Obter ID do livro da URL
    const url = new URL(request.url)
    const id = url.pathname.split('/').pop()
    
    if (!id) {
      return NextResponse.json({ 
        success: false,
        message: 'ID do livro não fornecido'
      }, { 
        status: 400,
        headers: getCorsHeaders(request.headers.get('origin') || undefined)
      })
    }

    const body = await request.json()
    
    console.log('✏️ [API-BOOKS] Atualizando livro com serviço:', id);
    
    // Usar o serviço para atualizar o livro
    const updatedBook = await bookService.updateBook(id, {
      ...body,
      updated_by: session.user?.id,
      updated_at: new Date().toISOString()
    });
    
    console.log('✅ [API-BOOKS] Livro atualizado com sucesso');

    return NextResponse.json({
      success: true,
      data: updatedBook,
      message: 'Livro atualizado com sucesso'
    }, {
      headers: getCorsHeaders(request.headers.get('origin') || undefined)
    })
  } catch (error) {
    console.error('❌ [API-BOOKS] Erro ao atualizar livro:', error);
    return NextResponse.json({ 
      success: false,
      message: 'Erro interno do servidor'
    }, { 
      status: 500,
      headers: getCorsHeaders(request.headers.get('origin') || undefined)
    })
  }
}

// DELETE - Remover livro
export async function DELETE(request: NextRequest) {
  try {
    const session = await getAuthentication(request)
    
    if (!session) {
      return NextResponse.json({ 
        success: false,
        message: 'Não autorizado'
      }, { 
        status: 401,
        headers: getCorsHeaders(request.headers.get('origin') || undefined)
      })
    }

    // Verificar permissões
    const userRole = session.user?.role
    if (!hasRequiredRole(userRole, ['SYSTEM_ADMIN', 'INSTITUTION_MANAGER'])) {
      return NextResponse.json({ 
        success: false,
        message: 'Sem permissão para remover livros'
      }, { 
        status: 403,
        headers: getCorsHeaders(request.headers.get('origin') || undefined)
      })
    }

    // Obter ID do livro da URL
    const url = new URL(request.url)
    const id = url.pathname.split('/').pop()
    
    if (!id) {
      return NextResponse.json({ 
        success: false,
        message: 'ID do livro não fornecido'
      }, { 
        status: 400,
        headers: getCorsHeaders(request.headers.get('origin') || undefined)
      })
    }
    
    console.log('🗑️ [API-BOOKS] Excluindo livro com serviço:', id);
    
    // Usar o serviço para excluir o livro
    await bookService.deleteBook(id);
    
    console.log('✅ [API-BOOKS] Livro excluído com sucesso');

    return NextResponse.json({
      success: true,
      message: 'Livro excluído com sucesso'
    }, {
      headers: getCorsHeaders(request.headers.get('origin') || undefined)
    })
  } catch (error) {
    console.error('❌ [API-BOOKS] Erro ao excluir livro:', error);
    return NextResponse.json({ 
      success: false,
      message: 'Erro interno do servidor'
    }, { 
      status: 500,
      headers: getCorsHeaders(request.headers.get('origin') || undefined)
    })
  }
} 
