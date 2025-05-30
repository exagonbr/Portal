import { NextRequest, NextResponse } from 'next/server'
import { S3Client, ListObjectsV2Command, GetObjectCommand, PutObjectCommand, DeleteObjectCommand, CopyObjectCommand } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'
import { FileRecord, S3FileInfo } from '@/types/files'

// Configuração S3 (você deve configurar com suas credenciais)
const s3Client = new S3Client({
  region: process.env.AWS_REGION || 'us-east-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || ''
  }
})

const BUCKETS = {
  literario: process.env.S3_BUCKET_LITERARIO || 'literario-bucket',
  professor: process.env.S3_BUCKET_PROFESSOR || 'professor-bucket',
  aluno: process.env.S3_BUCKET_ALUNO || 'aluno-bucket'
}

// Mock do banco de dados - substitua pela sua implementação
const mockDatabase: FileRecord[] = [
  {
    id: 'db_1',
    name: 'Dom Casmurro.pdf',
    originalName: 'dom-casmurro.pdf',
    type: 'PDF',
    size: 2515968,
    sizeFormatted: '2.4 MB',
    bucket: 'literario-bucket',
    s3Key: 'dom-casmurro.pdf',
    s3Url: 'https://literario-bucket.s3.amazonaws.com/dom-casmurro.pdf',
    description: 'Clássico da literatura brasileira',
    category: 'literario',
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date('2024-01-15'),
    uploadedBy: 'admin',
    isActive: true,
    tags: ['literatura', 'clássico', 'machado-assis']
  }
]

// Função auxiliar para formatar tamanho
function formatFileSize(bytes: number): string {
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  if (bytes === 0) return '0 Bytes'
  const i = Math.floor(Math.log(bytes) / Math.log(1024))
  return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i]
}

// Função para listar arquivos do S3
async function listS3Files(bucket: string): Promise<S3FileInfo[]> {
  try {
    const command = new ListObjectsV2Command({
      Bucket: bucket,
      MaxKeys: 1000
    })

    const response = await s3Client.send(command)
    const files: S3FileInfo[] = []

    if (response.Contents) {
      for (const object of response.Contents) {
        if (object.Key && object.Size && object.LastModified) {
          // Verificar se existe referência no banco
          const dbRecord = mockDatabase.find(record => 
            record.s3Key === object.Key && record.bucket === bucket
          )

          // Gerar URL assinada
          const getObjectCommand = new GetObjectCommand({
            Bucket: bucket,
            Key: object.Key
          })
          const signedUrl = await getSignedUrl(s3Client, getObjectCommand, { expiresIn: 3600 })

          const fileInfo: S3FileInfo = {
            id: object.Key.replace(/[^a-zA-Z0-9]/g, '_'),
            name: object.Key.split('/').pop() || object.Key,
            type: object.Key.split('.').pop()?.toUpperCase() || 'UNKNOWN',
            size: formatFileSize(object.Size),
            bucket: bucket,
            lastModified: object.LastModified.toISOString().split('T')[0],
            description: dbRecord?.description || 'Sem descrição',
            url: signedUrl,
            hasDbReference: !!dbRecord,
            dbRecord: dbRecord || null
          }

          files.push(fileInfo)
        }
      }
    }

    return files
  } catch (error) {
    console.error('Erro ao listar arquivos S3:', error)
    return []
  }
}

// GET - Listar arquivos por categoria
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category') as 'literario' | 'professor' | 'aluno'

    if (category) {
      const bucket = BUCKETS[category]
      const files = await listS3Files(bucket)
      return NextResponse.json(files)
    }

    // Se não especificar categoria, retorna erro
    return NextResponse.json(
      { error: 'Categoria é obrigatória' },
      { status: 400 }
    )

  } catch (error) {
    console.error('Erro na API:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

// POST - Upload de arquivo
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File
    const category = formData.get('category') as string
    const description = formData.get('description') as string
    const tags = formData.get('tags') as string

    if (!file || !category) {
      return NextResponse.json(
        { error: 'Arquivo e categoria são obrigatórios' },
        { status: 400 }
      )
    }

    const bucket = BUCKETS[category as keyof typeof BUCKETS]
    if (!bucket) {
      return NextResponse.json(
        { error: 'Categoria inválida' },
        { status: 400 }
      )
    }

    // Upload para S3
    const fileBuffer = Buffer.from(await file.arrayBuffer())
    const fileName = `${Date.now()}-${file.name}`

    const uploadCommand = new PutObjectCommand({
      Bucket: bucket,
      Key: fileName,
      Body: fileBuffer,
      ContentType: file.type
    })

    await s3Client.send(uploadCommand)

    // Criar registro no banco
    const fileRecord: FileRecord = {
      id: `file_${Date.now()}`,
      name: file.name,
      originalName: file.name,
      type: file.name.split('.').pop()?.toUpperCase() || 'UNKNOWN',
      size: file.size,
      sizeFormatted: formatFileSize(file.size),
      bucket: bucket,
      s3Key: fileName,
      s3Url: `https://${bucket}.s3.amazonaws.com/${fileName}`,
      description: description || 'Sem descrição',
      category: category as 'literario' | 'professor' | 'aluno',
      createdAt: new Date(),
      updatedAt: new Date(),
      uploadedBy: 'admin', // Pegar do contexto de autenticação
      isActive: true,
      tags: tags ? JSON.parse(tags) : []
    }

    // Simular inserção no banco
    mockDatabase.push(fileRecord)

    return NextResponse.json(fileRecord, { status: 201 })

  } catch (error) {
    console.error('Erro no upload:', error)
    return NextResponse.json(
      { error: 'Erro ao fazer upload do arquivo' },
      { status: 500 }
    )
  }
}

// PATCH - Atualizar arquivo
export async function PATCH(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const fileId = searchParams.get('id')
    const body = await request.json()

    if (!fileId) {
      return NextResponse.json(
        { error: 'ID do arquivo é obrigatório' },
        { status: 400 }
      )
    }

    // Encontrar arquivo no banco
    const fileIndex = mockDatabase.findIndex(file => file.id === fileId)
    if (fileIndex === -1) {
      return NextResponse.json(
        { error: 'Arquivo não encontrado' },
        { status: 404 }
      )
    }

    // Atualizar registro
    mockDatabase[fileIndex] = {
      ...mockDatabase[fileIndex],
      ...body,
      updatedAt: new Date()
    }

    return NextResponse.json(mockDatabase[fileIndex])

  } catch (error) {
    console.error('Erro ao atualizar arquivo:', error)
    return NextResponse.json(
      { error: 'Erro ao atualizar arquivo' },
      { status: 500 }
    )
  }
}

// DELETE - Deletar arquivo
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const fileId = searchParams.get('id')

    if (!fileId) {
      return NextResponse.json(
        { error: 'ID do arquivo é obrigatório' },
        { status: 400 }
      )
    }

    // Encontrar arquivo no banco
    const fileRecord = mockDatabase.find(file => file.id === fileId)
    if (!fileRecord) {
      return NextResponse.json(
        { error: 'Arquivo não encontrado' },
        { status: 404 }
      )
    }

    // Deletar do S3
    const deleteCommand = new DeleteObjectCommand({
      Bucket: fileRecord.bucket,
      Key: fileRecord.s3Key
    })

    await s3Client.send(deleteCommand)

    // Remover do banco
    const fileIndex = mockDatabase.findIndex(file => file.id === fileId)
    mockDatabase.splice(fileIndex, 1)

    return NextResponse.json({ success: true })

  } catch (error) {
    console.error('Erro ao deletar arquivo:', error)
    return NextResponse.json(
      { error: 'Erro ao deletar arquivo' },
      { status: 500 }
    )
  }
} 