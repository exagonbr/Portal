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
    const fileId = resolvedParams.id

    // Por enquanto, simular sucesso
    // Aqui você deve implementar a lógica real de banco de dados para desvincular
    console.log(`Desvinculando arquivo ${fileId} do conteúdo`)

    // Simulação de resposta de sucesso
    const mockUpdatedFile = {
      id: fileId,
      isLinked: false,
      unlinkedAt: new Date().toISOString(),
      message: 'Arquivo desvinculado do conteúdo com sucesso'
    }

    return NextResponse.json({
      success: true,
      file: mockUpdatedFile,
      message: 'Arquivo desvinculado do conteúdo com sucesso'
    }, {
      headers: getCorsHeaders(request.headers.get('origin') || undefined)
    })

  } catch (error) {
    console.log('Erro ao desvincular arquivo do conteúdo:', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { 
      status: 500,
      headers: getCorsHeaders(request.headers.get('origin') || undefined)
    })
  }
} 