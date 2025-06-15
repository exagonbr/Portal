import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { getAuthentication, hasRequiredRole } from '../lib/auth-utils'

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

// Mock database - substituir por Prisma/banco real
const mockBooks = new Map()

// GET - Listar livros
export async function GET(request: NextRequest) {
  try {
    const session = await getAuthentication(request)
    
    if (!session) {
      return NextResponse.json(
        { error: 'Não autorizado' },
        { status: 401 }
      )
    }

    // Parâmetros de query
    const { searchParams } = new URL(request.url)
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

    // Buscar livros (substituir por query real)
    let books = Array.from(mockBooks.values())

    // Aplicar filtros baseados no role do usuário
    const userRole = session.user?.role
    if (userRole === 'STUDENT') {
      // Aluno vê apenas livros ativos e com acesso permitido
      books = books.filter(book => 
        book.is_active && 
        (book.access_type === 'FREE' || 
         (book.course_ids && book.course_ids.some((courseId: string) => 
           // Verificar se o aluno está matriculado no curso
           true // Implementar lógica real
         )))
      )
    }

    // Aplicar filtros de busca
    if (search) {
      const searchLower = search.toLowerCase()
      books = books.filter(book => 
        book.title.toLowerCase().includes(searchLower) ||
        book.author.toLowerCase().includes(searchLower) ||
        (book.isbn && book.isbn.includes(search)) ||
        (book.publisher && book.publisher.toLowerCase().includes(searchLower)) ||
        (book.tags && book.tags.some((tag: string) => tag.toLowerCase().includes(searchLower)))
      )
    }

    if (category) {
      books = books.filter(book => book.category === category)
    }

    if (subject) {
      books = books.filter(book => book.subject === subject)
    }

    if (language) {
      books = books.filter(book => book.language === language)
    }

    if (course_id) {
      books = books.filter(book => 
        book.course_ids && book.course_ids.includes(course_id)
      )
    }

    if (is_digital !== null) {
      books = books.filter(book => book.is_digital === (is_digital === 'true'))
    }

    if (access_type) {
      books = books.filter(book => book.access_type === access_type)
    }

    if (is_active !== null) {
      books = books.filter(book => book.is_active === (is_active === 'true'))
    }

    // Ordenar por título
    books.sort((a, b) => a.title.localeCompare(b.title))

    // Paginação
    const startIndex = (page - 1) * limit
    const endIndex = page * limit
    const paginatedBooks = books.slice(startIndex, endIndex)

    // Adicionar informações extras
    const booksWithInfo = paginatedBooks.map(book => ({
      ...book,
      views_count: book.views_count || 0,
      downloads_count: book.downloads_count || 0,
      rating: book.rating || 0,
      reviews_count: book.reviews_count || 0
    }))

    return NextResponse.json({
      success: true,
      data: {
        items: booksWithInfo,
        pagination: {
          page,
          limit,
          total: books.length,
          totalPages: Math.ceil(books.length / limit)
        }
      }
    })

  } catch (error) {
    console.error('Erro ao listar livros:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

// POST - Criar livro
export async function POST(request: NextRequest) {
  try {
    const session = await getAuthentication(request)
    
    if (!session) {
      return NextResponse.json(
        { error: 'Não autorizado' },
        { status: 401 }
      )
    }

    // Verificar permissões
    const userRole = session.user?.role
    if (!hasRequiredRole(userRole, ['SYSTEM_ADMIN', 'INSTITUTION_ADMIN', 'TEACHER', 'LIBRARIAN'])) {
      return NextResponse.json(
        { error: 'Sem permissão para criar livros' },
        { status: 403 }
      )
    }

    const body = await request.json()

    // Validar dados
    const validationResult = createBookSchema.safeParse(body)
    if (!validationResult.success) {
      return NextResponse.json(
        { 
          error: 'Dados inválidos',
          errors: validationResult.error.flatten().fieldErrors
        },
        { status: 400 }
      )
    }

    const bookData = validationResult.data

    // Verificar se ISBN já existe (se fornecido)
    if (bookData.isbn) {
      const existingISBN = Array.from(mockBooks.values()).find(
        book => book.isbn === bookData.isbn
      )

      if (existingISBN) {
        return NextResponse.json(
          { error: 'Já existe um livro com este ISBN' },
          { status: 409 }
        )
      }
    }

    // Criar livro
    const newBook = {
      id: `book_${Date.now()}`,
      ...bookData,
      institution_id: session.user.institution_id,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      created_by: session.user?.id
    }

    mockBooks.set(newBook.id, newBook)

    return NextResponse.json({
      success: true,
      data: newBook,
      message: 'Livro criado com sucesso'
    }, { status: 201 })

  } catch (error) {
    console.error('Erro ao criar livro:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
} 