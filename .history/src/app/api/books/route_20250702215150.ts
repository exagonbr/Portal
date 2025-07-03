import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/middleware/auth';

export const GET = requireAuth(async (request: NextRequest, auth) => {
  try {
    const url = new URL(request.url);
    const limit = parseInt(url.searchParams.get('limit') || '50');
    const search = url.searchParams.get('search');
    const category = url.searchParams.get('category');
    const author = url.searchParams.get('author');

    console.log('📖 [BOOKS] Buscando livros para:', auth.user.email);

    // Simular dados de livros
    const books = [
      {
        id: 'book_1',
        title: 'Dom Casmurro',
        author: 'Machado de Assis',
        isbn: '978-85-359-0277-5',
        category: 'LITERATURE',
        description: 'Romance clássico da literatura brasileira que narra a história de Bentinho e Capitu',
        publisher: 'Companhia das Letras',
        publishedYear: 1899,
        pages: 256,
        language: 'pt-BR',
        format: 'DIGITAL',
        status: 'AVAILABLE',
        coverUrl: '/covers/dom-casmurro.jpg',
        fileUrl: '/books/dom-casmurro.pdf',
        fileSize: '2.5MB',
        downloads: 1250,
        rating: 4.6,
        reviews: 89,
        tags: ['clássico', 'romance', 'literatura brasileira'],
        metadata: {
          difficulty: 'MEDIUM',
          readingTime: 480,
          genre: 'Romance',
          period: 'Realismo'
        }
      },
      {
        id: 'book_2',
        title: 'Cálculo Volume I',
        author: 'James Stewart',
        isbn: '978-85-221-0660-8',
        category: 'MATHEMATICS',
        description: 'Livro fundamental para o estudo de cálculo diferencial e integral',
        publisher: 'Cengage Learning',
        publishedYear: 2016,
        pages: 892,
        language: 'pt-BR',
        format: 'DIGITAL',
        status: 'AVAILABLE',
        coverUrl: '/covers/calculo-stewart.jpg',
        fileUrl: '/books/calculo-stewart-v1.pdf',
        fileSize: '15.2MB',
        downloads: 2340,
        rating: 4.8,
        reviews: 156,
        tags: ['matemática', 'cálculo', 'ensino superior'],
        metadata: {
          difficulty: 'HIGH',
          readingTime: 1200,
          genre: 'Acadêmico',
          edition: '8ª Edição'
        }
      },
      {
        id: 'book_3',
        title: 'Química Orgânica',
        author: 'Paula Yurkanis Bruice',
        isbn: '978-85-8143-475-7',
        category: 'SCIENCE',
        description: 'Texto abrangente sobre química orgânica com foco em mecanismos de reação',
        publisher: 'Pearson',
        publishedYear: 2018,
        pages: 1248,
        language: 'pt-BR',
        format: 'DIGITAL',
        status: 'AVAILABLE',
        coverUrl: '/covers/quimica-organica-bruice.jpg',
        fileUrl: '/books/quimica-organica-bruice.pdf',
        fileSize: '28.7MB',
        downloads: 890,
        rating: 4.5,
        reviews: 67,
        tags: ['química', 'orgânica', 'ciências'],
        metadata: {
          difficulty: 'HIGH',
          readingTime: 1800,
          genre: 'Acadêmico',
          edition: '7ª Edição'
        }
      },
      {
        id: 'book_4',
        title: 'O Cortiço',
        author: 'Aluísio Azevedo',
        isbn: '978-85-254-2156-3',
        category: 'LITERATURE',
        description: 'Romance naturalista que retrata a vida em um cortiço no Rio de Janeiro',
        publisher: 'Ática',
        publishedYear: 1890,
        pages: 184,
        language: 'pt-BR',
        format: 'DIGITAL',
        status: 'AVAILABLE',
        coverUrl: '/covers/o-cortico.jpg',
        fileUrl: '/books/o-cortico.pdf',
        fileSize: '1.8MB',
        downloads: 980,
        rating: 4.3,
        reviews: 45,
        tags: ['naturalismo', 'literatura brasileira', 'século XIX'],
        metadata: {
          difficulty: 'MEDIUM',
          readingTime: 360,
          genre: 'Romance',
          period: 'Naturalismo'
        }
      }
    ];

    // Filtrar livros baseado nos parâmetros
    let filteredBooks = books;

    if (search) {
      filteredBooks = filteredBooks.filter(book => 
        book.title.toLowerCase().includes(search.toLowerCase()) ||
        book.author.toLowerCase().includes(search.toLowerCase()) ||
        book.description.toLowerCase().includes(search.toLowerCase())
      );
    }

    if (category) {
      filteredBooks = filteredBooks.filter(book => book.category === category);
    }

    if (author) {
      filteredBooks = filteredBooks.filter(book => 
        book.author.toLowerCase().includes(author.toLowerCase())
      );
    }

    return NextResponse.json({
      success: true,
      data: filteredBooks.slice(0, limit),
      meta: {
        total: filteredBooks.length,
        limit,
        filters: { search, category, author },
        requestedBy: auth.user.email,
        userRole: auth.user.role
      }
    });

  } catch (error: any) {
    console.error('❌ [BOOKS] Erro:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: 'Erro interno do servidor',
        code: 'INTERNAL_ERROR'
      },
      { status: 500 }
    );
  }
});

export const POST = requireAuth(async (request: NextRequest, auth) => {
  try {
    const body = await request.json();
    const { title, author, isbn, category, description, publisher } = body;

    if (!title || !author || !category) {
      return NextResponse.json(
        { 
          success: false, 
          message: 'Campos obrigatórios: title, author, category',
          code: 'VALIDATION_ERROR'
        },
        { status: 400 }
      );
    }

    // Verificar se o usuário tem permissão para adicionar livros
    if (!['LIBRARIAN', 'ADMIN', 'SYSTEM_ADMIN'].includes(auth.user.role)) {
      return NextResponse.json(
        { 
          success: false, 
          message: 'Permissão insuficiente para adicionar livros',
          code: 'FORBIDDEN'
        },
        { status: 403 }
      );
    }

    console.log('📚 [BOOKS] Adicionando livro:', title);

    // Simular adição de livro
    const book = {
      id: `book_${Date.now()}`,
      title,
      author,
      isbn: isbn || '',
      category,
      description: description || '',
      publisher: publisher || '',
      publishedYear: new Date().getFullYear(),
      pages: 0,
      language: 'pt-BR',
      format: 'DIGITAL',
      status: 'PENDING',
      coverUrl: '',
      fileUrl: '',
      fileSize: '0MB',
      downloads: 0,
      rating: 0,
      reviews: 0,
      tags: [],
      metadata: {
        difficulty: 'MEDIUM',
        readingTime: 0,
        addedBy: auth.user.email,
        addedAt: new Date().toISOString()
      }
    };

    return NextResponse.json({
      success: true,
      message: 'Livro adicionado com sucesso',
      data: book
    });

  } catch (error: any) {
    console.error('❌ [BOOKS] Erro ao adicionar:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: 'Erro interno do servidor',
        code: 'INTERNAL_ERROR'
      },
      { status: 500 }
    );
  }
});

export async function OPTIONS() {
  return NextResponse.json(
    { 
      success: true,
      message: 'API de livros ativa',
      methods: ['GET', 'POST', 'OPTIONS'],
      timestamp: new Date().toISOString()
    }
  );
}
