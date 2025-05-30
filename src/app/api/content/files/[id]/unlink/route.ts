import { NextRequest, NextResponse } from 'next/server'

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const fileId = params.id

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
    })

  } catch (error) {
    console.error('Erro ao desvincular arquivo do conteúdo:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
} 