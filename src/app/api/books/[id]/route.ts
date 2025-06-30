import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { z } from 'zod'

// Schema de validação para atualização de livro
const updateBookSchema = z.object({
  title: z.string().min(3, 'Título deve ter pelo menos 3 caracteres').optional(),
  author: z.string().min(3, 'Autor deve ter pelo menos 3 caracteres').optional(),
  publisher: z.string().optional(),
  publication_year: z.number().int().min(1900).max(new Date().getFullYear()).optional(),
  edition: z.string().optional(),
  pages: z.number().int().positive().optional(),
  language: z.enum(['PT', 'EN', 'ES', 'FR', 'DE', 'IT', 'OTHER']).optional(),
  category: z.enum(['TEXTBOOK', 'REFERENCE', 'FICTION', 'NON_FICTION', 'ACADEMIC', 'TECHNICAL']).optional(),
  subject: z.string().optional(),
  description: z.string().optional(),
  cover_url: z.string().url().optional(),
  pdf_url: z.string().url().optional(),
  course_ids: z.array(z.string().uuid()).optional(),
  tags: z.array(z.string()).optional(),
  is_active: z.boolean().optional(),
  is_digital: z.boolean().optional(),
  access_type: z.enum(['FREE', 'RESTRICTED', 'PREMIUM']).optional(),
  metadata: z.object({
    dewey_code: z.string().optional(),
    cdd_code: z.string().optional(),
    keywords: z.array(z.string()).optional(),
    age_rating: z.string().optional()
  }).optional()
})

// Mock database - substituir por Prisma/banco real
const mockBooks = new Map()

// Função utilitária para normalizar o valor do userRole
function normalizeUserRole(role: string | undefined): string | undefined {
  switch (role) {
    case 'INSTITUTION_ADMIN':
    case 'SCHOOL_MANAGER':
      return 'INSTITUTION_MANAGER';
    default:
      return role;
  }
}

// GET - Buscar livro por ID

// Handler para requisições OPTIONS (preflight)
export async function OPTIONS(request: NextRequest) {
  const origin = request.headers.get('origin') || undefined;
  return createCorsOptionsResponse(origin);
}

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: 'Não autorizado' }, { 
      status: 401,
      headers: getCorsHeaders(request.headers.get('origin') || undefined)
    })
    }

    const bookId = params.id

    // Buscar livro
    const book = mockBooks.get(bookId)

    if (!book) {
      return NextResponse.json({ error: 'Livro não encontrado' }, { 
      status: 404,
      headers: getCorsHeaders(request.headers.get('origin') || undefined)
    })
    }

    // Verificar permissões de acesso
    const userRole = normalizeUserRole(session.user?.role);
    const canAccess = 
      book.access_type === 'FREE' ||
      userRole === 'SYSTEM_ADMIN' ||
      userRole === 'INSTITUTION_MANAGER' ||
      userRole === 'TEACHER' ||
      (userRole === 'STUDENT' && book.is_active && (
        book.access_type === 'FREE' ||
        (book.course_ids && book.course_ids.some((courseId: string) => 
          // Verificar se o aluno está matriculado no curso
          true // Implementar lógica real
        ))
      ))

    if (!canAccess) {
      return NextResponse.json({ error: 'Sem permissão para acessar este livro' }, { 
      status: 403,
      headers: getCorsHeaders(request.headers.get('origin') || undefined)
    })
    }

    // Incrementar contador de visualizações
    book.views_count = (book.views_count || 0) + 1

    // Adicionar informações de acesso para o usuário
    const bookWithAccess = {
      ...book,
      can_download: book.is_digital && (
        book.access_type === 'FREE' ||
        userRole !== 'STUDENT'
      ),
      user_rating: null, // Buscar avaliação do usuário
      user_notes: [] // Buscar anotações do usuário
    }

    return NextResponse.json({
      success: true,
      data: bookWithAccess
    }, {
      headers: getCorsHeaders(request.headers.get('origin') || undefined)
    })

  } catch (error) {
    console.error('Erro ao buscar livro:', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { 
      status: 500,
      headers: getCorsHeaders(request.headers.get('origin') || undefined)
    })
  }
}

// PUT - Atualizar livro
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: 'Não autorizado' }, { 
      status: 401,
      headers: getCorsHeaders(request.headers.get('origin') || undefined)
    })
    }

    const bookId = params.id
    const body = await request.json()

    // Validar dados
    const validationResult = updateBookSchema.safeParse(body)
    if (!validationResult.success) {
      return NextResponse.json({ 
          error: 'Dados inválidos',
          errors: validationResult.error.flatten(, {
      headers: getCorsHeaders(request.headers.get('origin') || undefined)
    }).fieldErrors
        },
        { status: 400 }
      )
    }

    const updateData = validationResult.data

    // Buscar livro existente
    const existingBook = mockBooks.get(bookId)
    if (!existingBook) {
      return NextResponse.json({ error: 'Livro não encontrado' }, { 
      status: 404,
      headers: getCorsHeaders(request.headers.get('origin') || undefined)
    })
    }

    // Verificar permissões
    const userRole = normalizeUserRole(session.user?.role);
    const canEdit = 
      userRole === 'SYSTEM_ADMIN' ||
      userRole === 'INSTITUTION_MANAGER' ||
      (userRole === 'TEACHER' && existingBook.created_by === session.user?.id)

    if (!canEdit) {
      return NextResponse.json({ error: 'Sem permissão para editar este livro' }, { 
      status: 403,
      headers: getCorsHeaders(request.headers.get('origin') || undefined)
    })
    }

    // Atualizar livro
    const updatedBook = {
      ...existingBook,
      ...updateData,
      updated_at: new Date().toISOString(),
      updated_by: session.user?.id
    }

    mockBooks.set(bookId, updatedBook)

    return NextResponse.json({
      success: true,
      data: updatedBook,
      message: 'Livro atualizado com sucesso'
    }, {
      headers: getCorsHeaders(request.headers.get('origin') || undefined)
    })

  } catch (error) {
    console.error('Erro ao atualizar livro:', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { 
      status: 500,
      headers: getCorsHeaders(request.headers.get('origin') || undefined)
    })
  }
}

// DELETE - Remover livro
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: 'Não autorizado' }, { 
      status: 401,
      headers: getCorsHeaders(request.headers.get('origin') || undefined)
    })
    }

    const bookId = params.id

    // Buscar livro
    const existingBook = mockBooks.get(bookId)
    if (!existingBook) {
      return NextResponse.json({ error: 'Livro não encontrado' }, { 
      status: 404,
      headers: getCorsHeaders(request.headers.get('origin') || undefined)
    })
    }

    // Verificar permissões
    const userRole = normalizeUserRole(session.user?.role);
    const canDelete = 
      userRole === 'SYSTEM_ADMIN' ||
      userRole === 'INSTITUTION_ADMIN' ||
      userRole === 'LIBRARIAN'

    if (!canDelete) {
      return NextResponse.json({ error: 'Sem permissão para deletar este livro' }, { 
      status: 403,
      headers: getCorsHeaders(request.headers.get('origin') || undefined)
    })
    }

    // Verificar se livro está sendo usado em cursos ativos
    if (existingBook.course_ids && existingBook.course_ids.length > 0) {
      return NextResponse.json({ error: 'Não é possível deletar livro vinculado a cursos. Remova as vinculações primeiro' }, { 
      status: 409,
      headers: getCorsHeaders(request.headers.get('origin') || undefined)
    })
    }

    // Deletar livro (em produção, seria soft delete)
    mockBooks.delete(bookId)

    return NextResponse.json({
      success: true,
      message: 'Livro removido com sucesso'
    }, {
      headers: getCorsHeaders(request.headers.get('origin') || undefined)
    })

  } catch (error) {
    console.error('Erro ao deletar livro:', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { 
      status: 500,
      headers: getCorsHeaders(request.headers.get('origin') || undefined)
    })
  }
} 