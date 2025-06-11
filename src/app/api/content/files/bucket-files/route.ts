import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const db = getDatabase()
  
  try {
    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category')

    if (!category) {
      return NextResponse.json(
        { error: 'Categoria é obrigatória' },
        { status: 400 }
      )
    }

    if (!['literario', 'professor', 'aluno'].includes(category)) {
      return NextResponse.json(
        { error: 'Categoria inválida. Use: literario, professor ou aluno' },
        { status: 400 }
      )
    }

    console.log(`🔍 Buscando arquivos da categoria: ${category}`)

    // Buscar todos os arquivos ativos da categoria específica
    const files = await db('files')
      .select([
        'id',
        'name',
        'original_name',
        'type',
        'size',
        'size_formatted',
        'bucket',
        's3_key',
        's3_url',
        'description',
        'category',
        'metadata',
        'tags',
        'is_active',
        'created_at',
        'updated_at'
      ])
      .where({
        category: category,
        is_active: true
      })
      .orderBy('name', 'asc')

    console.log(`✅ Encontrados ${files.length} arquivos na categoria ${category}`)

    // Transformar dados para o formato esperado pelo frontend
    const transformedFiles = files.map(file => ({
      id: file.id,
      name: file.name,
      originalName: file.original_name,
      type: file.type,
      size: file.size_formatted,
      sizeBytes: file.size,
      bucket: file.bucket,
      s3Key: file.s3_key,
      url: file.s3_url,
      description: file.description || '',
      category: file.category,
      metadata: file.metadata || {},
      tags: file.tags || [],
      lastModified: file.updated_at,
      createdAt: file.created_at,
      hasDbReference: true // Todos os arquivos retornados têm referência no banco
    }))

    return NextResponse.json(transformedFiles)

  } catch (error) {
    console.error('❌ Erro ao buscar arquivos do bucket:', error)
    
    // Log detalhado do erro para debug
    if (error instanceof Error) {
      console.error('Detalhes do erro:', {
        message: error.message,
        stack: error.stack
      })
    }

    return NextResponse.json(
      { error: 'Erro interno do servidor ao buscar arquivos' },
      { status: 500 }
    )
  }
} 