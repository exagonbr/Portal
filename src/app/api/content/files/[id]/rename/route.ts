import { NextRequest, NextResponse } from 'next/server'
import { getDatabase } from '@/lib/database'

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const db = getDatabase()
  
  try {
    const fileId = params.id
    const { name } = await request.json()

    if (!name || !name.trim()) {
      return NextResponse.json(
        { error: 'Nome do arquivo é obrigatório' },
        { status: 400 }
      )
    }

    const newName = name.trim()

    // Verificar se o arquivo existe
    const existingFile = await db('files')
      .where({ id: fileId, is_active: true })
      .first()

    if (!existingFile) {
      return NextResponse.json(
        { error: 'Arquivo não encontrado' },
        { status: 404 }
      )
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
      return NextResponse.json(
        { error: 'Já existe um arquivo com este nome no mesmo bucket' },
        { status: 409 }
      )
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
    })

  } catch (error) {
    console.error('❌ Erro ao renomear arquivo:', error)
    
    // Verificar tipos de erro específicos
    if (error instanceof Error) {
      if (error.message.includes('unique constraint')) {
        return NextResponse.json(
          { error: 'Nome de arquivo já está em uso' },
          { status: 409 }
        )
      }
      
      if (error.message.includes('foreign key')) {
        return NextResponse.json(
          { error: 'Erro de referência no banco de dados' },
          { status: 400 }
        )
      }
    }

    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
} 