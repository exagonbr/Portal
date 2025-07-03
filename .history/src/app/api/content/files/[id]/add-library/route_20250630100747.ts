import { NextRequest, NextResponse } from 'next/server'


// Handler para requisições OPTIONS (preflight)
export async function OPTIONS(request: NextRequest) {
  const origin = request.headers.get('origin') || undefined;
  return createCorsOptionsResponse(origin);
}

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { libraryCategory } = await request.json()
    const fileId = params.id

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