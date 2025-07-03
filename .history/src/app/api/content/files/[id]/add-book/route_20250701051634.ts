import { NextRequest, NextResponse } from 'next/server'
import { connection as db } from '@/config/database'
import { createCorsOptionsResponse, getCorsHeaders } from '@/config/cors'

// Funções CORS
function getCorsHeaders(origin?: string) {
  return {
    'Access-Control-Allow-Origin': origin || '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Credentials': 'true',
  }
}

function createCorsOptionsResponse(origin?: string) {
  return new NextResponse(null, {
    status: 200,
    headers: getCorsHeaders(origin)
  })
}

// Handler para requisições OPTIONS (preflight)
export async function OPTIONS(request: NextRequest) {
  const origin = request.headers.get('origin') || undefined;
  return createCorsOptionsResponse(origin);
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params
    const fileId = resolvedParams.id
    const bookData = await request.json()

    // Validar dados obrigatórios
    if (!bookData.title || !bookData.title.trim()) {
      return NextResponse.json({ error: 'Título do livro é obrigatório' }, { 
      status: 400,
      headers: getCorsHeaders(request.headers.get('origin') || undefined)
    })
    }

    if (!bookData.category) {
      return NextResponse.json({ error: 'Categoria é obrigatória' }, { 
      status: 400,
      headers: getCorsHeaders(request.headers.get('origin') || undefined)
    })
    }

    console.log(`📚 Adicionando livro para arquivo ${fileId}:`, bookData.title)

    // Verificar se o arquivo existe
    const existingFile = await db('files')
      .where({ id: fileId, is_active: true })
      .first()

    if (!existingFile) {
      return NextResponse.json({ error: 'Arquivo não encontrado' }, { 
      status: 404,
      headers: getCorsHeaders(request.headers.get('origin') || undefined)
    })
    }

    // Verificar se já existe um livro para este arquivo
    const existingBook = await db('books')
      .where({ file_url: existingFile.s3_url })
      .first()

    if (existingBook) {
      return NextResponse.json({ error: 'Já existe um livro cadastrado para este arquivo' }, { 
      status: 409,
      headers: getCorsHeaders(request.headers.get('origin') || undefined)
    })
    }

    // Buscar uma instituição padrão (primeira ativa)
    const defaultInstitution = await db('institution')
      .where({ is_active: true })
      .first()

    if (!defaultInstitution) {
      return NextResponse.json({ error: 'Nenhuma instituição ativa encontrada' }, { 
      status: 400,
      headers: getCorsHeaders(request.headers.get('origin') || undefined)
    })
    }

    // Criar registro na tabela books
    const [newBook] = await db('books')
      .insert({
        title: bookData.title.trim(),
        author: bookData.author?.trim() || 'Autor não informado',
        publisher: bookData.publisher?.trim() || 'Editora não informada',
        description: bookData.description?.trim() || 'Descrição não disponível',
        category: bookData.category,
        cover_url: bookData.thumbnail,
        file_url: existingFile.s3_url,
        file_type: existingFile.type,
        file_size: existingFile.size,
        institution_id: defaultInstitution.id,
        language: 'pt-BR',
        status: 'available'
      })
      .returning('*')

    // Atualizar metadados do arquivo para incluir referência ao livro
    await db('files')
      .where({ id: fileId })
      .update({
        metadata: db.raw(`metadata || ?`, [JSON.stringify({ 
          book_id: newBook.id,
          linked_to_library: true,
          linked_at: new Date().toISOString()
        })]),
        updated_at: db.fn.now()
      })

    console.log(`✅ Livro criado com sucesso: ${newBook.title} (ID: ${newBook.id})`)

    // Resposta de sucesso
    return NextResponse.json({
      success: true,
      book: {
        id: newBook.id,
        title: newBook.title,
        author: newBook.author,
        publisher: newBook.publisher,
        description: newBook.description,
        category: newBook.category,
        format: newBook.file_type,
        fileUrl: newBook.file_url,
        fileSize: existingFile.size_formatted,
        coverUrl: newBook.cover_url,
        fileId: fileId,
        institutionId: newBook.institution_id,
        status: newBook.status,
        language: newBook.language,
        createdAt: newBook.created_at,
        updatedAt: newBook.updated_at
      },
      file: {
        id: existingFile.id,
        name: existingFile.name,
        hasLibraryReference: true
      },
      message: 'Livro adicionado à biblioteca com sucesso'
    })

  } catch (error) {
    console.log('❌ Erro ao adicionar livro à biblioteca:', error)
    
    // Verificar tipos de erro específicos
    if (error instanceof Error) {
      if (error.message.includes('unique constraint')) {
        return NextResponse.json({ error: 'Livro com este título já existe' }, { 
      status: 409,
      headers: getCorsHeaders(request.headers.get('origin') || undefined)
    })
      }
      
      if (error.message.includes('foreign key')) {
        return NextResponse.json({ error: 'Erro de referência no banco de dados' }, { 
      status: 400,
      headers: getCorsHeaders(request.headers.get('origin') || undefined)
    })
      }

      // Log detalhado para debug
      console.log('Detalhes do erro:', {
        message: error.message,
        stack: error.stack
      })
    }

    return NextResponse.json({ error: 'Erro interno do servidor' }, { 
      status: 500,
      headers: getCorsHeaders(request.headers.get('origin') || undefined)
    })
  }
} 