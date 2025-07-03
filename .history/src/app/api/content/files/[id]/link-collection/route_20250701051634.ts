import { NextRequest, NextResponse } from 'next/server'
import { createCorsOptionsResponse, getCorsHeaders } from '@/config/cors'



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
    const { collectionId } = await request.json()
    const fileId = resolvedParams.id

    if (!collectionId) {
      return NextResponse.json({ error: 'ID da coleção é obrigatório' }, { 
      status: 400,
      headers: getCorsHeaders(request.headers.get('origin') || undefined)
    })
    }

    // Por enquanto, simular sucesso
    // Aqui você deve implementar a lógica real de banco de dados
    console.log(`Vinculando arquivo ${fileId} à coleção ${collectionId}`)

    // Simulação de resposta de sucesso
    const mockUpdatedFile = {
      id: fileId,
      collectionId: collectionId,
      linkedAt: new Date().toISOString(),
      message: 'Arquivo vinculado à coleção com sucesso'
    }

    return NextResponse.json({
      success: true,
      file: mockUpdatedFile,
      message: 'Arquivo vinculado à coleção com sucesso'
    }, {
      headers: getCorsHeaders(request.headers.get('origin') || undefined)
    })

  } catch (error) {
    console.log('Erro ao vincular arquivo à coleção:', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { 
      status: 500,
      headers: getCorsHeaders(request.headers.get('origin') || undefined)
    })
  }
} 