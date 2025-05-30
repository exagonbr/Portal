import { NextRequest, NextResponse } from 'next/server'

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { collectionId } = await request.json()
    const fileId = params.id

    if (!collectionId) {
      return NextResponse.json({ error: 'ID da coleção é obrigatório' }, { status: 400 })
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
    })

  } catch (error) {
    console.error('Erro ao vincular arquivo à coleção:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
} 