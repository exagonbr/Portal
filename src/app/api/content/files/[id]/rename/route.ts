import { NextRequest, NextResponse } from 'next/server'
import { connection as db } from '@/config/database'

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

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params
    const fileId = resolvedParams.id
    const { name } = await request.json()

    if (!name || !name.trim()) {
      return NextResponse.json({ error: 'Nome do arquivo é obrigatório' }, { 
      status: 400,
      headers: getCorsHeaders(request.headers.get('origin') || undefined)
    })
    }

    const newName = name.trim()

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

    // Verificar se já existe outro arquivo com o mesmo nome no mesmo bucket
    const duplicateFile = await db('files')
      .where({ 
        name: newName, 
        bucket: existingFile.bucket,
        is_active: true 
      })
      .whereNot({ id: fileId })
      .first()

    if (duplicateFile) {
      return NextResponse.json({ error: 'Já existe um arquivo com este nome no mesmo bucket' }, { 
      status: 409,
      headers: getCorsHeaders(request.headers.get('origin') || undefined)
    })
    }

    // Atualizar o nome do arquivo no banco
    const [updatedFile] = await db('files')
      .where({ id: fileId })
      .update({ 
        name: newName,
        updated_at: db.fn.now()
      })
      .returning('*')

    console.log(`✅ Arquivo ${fileId} renomeado de "${existingFile.name}" para "${newName}"`)

    // Resposta de sucesso
    return NextResponse.json({
      success: true,
      file: {
        id: updatedFile.id,
        name: updatedFile.name,
        originalName: existingFile.name,
        type: updatedFile.type,
        size: updatedFile.size_formatted,
        bucket: updatedFile.bucket,
        category: updatedFile.category,
        renamedAt: updatedFile.updated_at
      },
      message: 'Arquivo renomeado com sucesso'
    }, {
      headers: getCorsHeaders(request.headers.get('origin') || undefined)
    })

  } catch (error) {
    console.error('❌ Erro ao renomear arquivo:', error)
    
    // Verificar tipos de erro específicos
    if (error instanceof Error) {
      if (error.message.includes('unique constraint')) {
        return NextResponse.json({ error: 'Nome de arquivo já está em uso' }, { 
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
    }

    return NextResponse.json({ error: 'Erro interno do servidor' }, { 
      status: 500,
      headers: getCorsHeaders(request.headers.get('origin') || undefined)
    })
  }
} 