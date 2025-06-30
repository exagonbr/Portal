import { NextRequest, NextResponse } from 'next/server'
import { createCorsOptionsResponse, getCorsHeaders } from '@/config/cors'
import { connection as db } from '@/config/database'

// Para agora, vou usar uma versão simplificada sem AWS SDK até que as dependências sejam instaladas

// Handler para requisições OPTIONS (preflight)
export async function OPTIONS(request: NextRequest) {
  const origin = request.headers.get('origin') || undefined;
  return createCorsOptionsResponse(origin);
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category')

    if (!category) {
      return NextResponse.json({ error: 'Categoria é obrigatória' }, { 
      status: 400,
      headers: getCorsHeaders(request.headers.get('origin') || undefined)
    })
    }

    if (!['literario', 'professor', 'aluno'].includes(category)) {
      return NextResponse.json(
        { error: 'Categoria inválida. Use: literario, professor ou aluno' },
        { status: 400 }
      )
    }

    console.log(`🔍 Verificando referências para categoria: ${category}`)

    // Buscar arquivos com suas referências
    const filesWithReferences = await db('files')
      .select([
        'files.id',
        'files.name',
        'files.original_name',
        'files.type',
        'files.size_formatted',
        'files.bucket',
        'files.s3_url',
        'files.description',
        'files.category',
        'files.metadata',
        'files.created_at',
        'files.updated_at',
        // Referências para livros
        'books.id as book_id',
        'books.title as book_title',
        'books.author as book_author',
        'books.status as book_status'
      ])
      .leftJoin('books', 'files.s3_url', 'books.file_url')
      .where({
        'files.category': category,
        'files.is_active': true
      })
      .orderBy('files.name', 'asc')

    console.log(`✅ Encontrados ${filesWithReferences.length} arquivos com verificação de referências`)

    // Transformar dados para o formato esperado
    const transformedFiles = filesWithReferences.map(file => ({
      id: file.id,
      name: file.name,
      originalName: file.original_name,
      type: file.type,
      size: file.size_formatted,
      bucket: file.bucket,
      url: file.s3_url,
      description: file.description || '',
      category: file.category,
      metadata: file.metadata || {},
      lastModified: file.updated_at,
      createdAt: file.created_at,
      hasDbReference: true, // Todos estão no banco
      dbRecord: {
        id: file.id,
        name: file.name,
        hasBookReference: !!file.book_id,
        bookData: file.book_id ? {
          id: file.book_id,
          title: file.book_title,
          author: file.book_author,
          status: file.book_status
        } : null
      }
    }))

    return NextResponse.json(transformedFiles, {
      headers: getCorsHeaders(request.headers.get('origin') || undefined)
    })

  } catch (error) {
    console.error('❌ Erro ao verificar referências:', error)
    
    // Log detalhado do erro para debug
    if (error instanceof Error) {
      console.error('Detalhes do erro:', {
        message: error.message,
        stack: error.stack
      })
    }

    return NextResponse.json({ error: 'Erro interno do servidor ao verificar referências' }, { 
      status: 500,
      headers: getCorsHeaders(request.headers.get('origin') || undefined)
    })
  }
}

// POST - Criar referência no banco para arquivo existente no S3
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { s3Key, category, name, description, tags } = body

    if (!s3Key || !category) {
      return NextResponse.json({ error: 'S3 Key e categoria são obrigatórios' }, { 
      status: 400,
      headers: getCorsHeaders(request.headers.get('origin') || undefined)
    })
    }

    // Simular criação de referência no banco
    const newRecord = {
      id: `ref_${Date.now()}`,
      name: name || s3Key.split('/').pop(),
      originalName: s3Key.split('/').pop(),
      type: s3Key.split('.').pop()?.toUpperCase() || 'UNKNOWN',
      size: 0,
      sizeFormatted: 'Desconhecido',
      bucket: `${category}-bucket`,
      s3Key: s3Key,
      s3Url: `https://${category}-bucket.s3.amazonaws.com/${s3Key}`,
      description: description || 'Referência criada manualmente',
      category: category,
      createdAt: new Date(),
      updatedAt: new Date(),
      uploadedBy: 'admin',
      isActive: true,
      tags: tags || []
    }

    return NextResponse.json(newRecord, { 
      status: 201,
      headers: getCorsHeaders(request.headers.get('origin') || undefined)
    })

  } catch (error) {
    console.error('Erro ao criar referência:', error)
    return NextResponse.json({ error: 'Erro ao criar referência no banco' }, { 
      status: 500,
      headers: getCorsHeaders(request.headers.get('origin') || undefined)
    })
  }
} 
