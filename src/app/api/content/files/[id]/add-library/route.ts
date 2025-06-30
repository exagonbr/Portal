import { NextRequest, NextResponse } from 'next/server'
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
    const { libraryCategory } = await request.json()
    const resolvedParams = await params
    const fileId = resolvedParams.id

    if (!libraryCategory) {
      return NextResponse.json({ error: 'Categoria da biblioteca é obrigatória' }, { 
      status: 400,
      headers: getCorsHeaders(request.headers.get('origin') || undefined)
    })
    }

    // Por enquanto, simular sucesso
    // Aqui você deve implementar a lógica real de banco de dados
    console.log(`Adicionando arquivo ${fileId} à biblioteca categoria ${libraryCategory}`)

    // Simulação de resposta de sucesso
    const mockUpdatedFile = {
      id: fileId,
      libraryCategory: libraryCategory,
      addedToLibraryAt: new Date().toISOString(),
      isInLibrary: true,
      message: 'Arquivo adicionado à biblioteca com sucesso'
    }

    return NextResponse.json({
      success: true,
      file: mockUpdatedFile,
      message: 'Arquivo adicionado à biblioteca com sucesso'
    }, {
      headers: getCorsHeaders(request.headers.get('origin') || undefined)
    })

  } catch (error) {
    console.error('Erro ao adicionar arquivo à biblioteca:', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { 
      status: 500,
      headers: getCorsHeaders(request.headers.get('origin') || undefined)
    })
  }
} 