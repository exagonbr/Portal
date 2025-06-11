import { NextRequest, NextResponse } from 'next/server'
import { S3Client, ListObjectsV2Command, GetObjectCommand } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'
import { S3FileInfo, FileRecord } from '@/types/files'

// Configuração S3
const s3Client = new S3Client({
  region: process.env.AWS_REGION || 'sa-east-1',
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

// Função para listar TODOS os arquivos do S3 (incluindo os que não têm referência no banco)
async function listAllS3Files(bucket: string): Promise<S3FileInfo[]> {
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
            id: object.Key?.replace(/[^a-zA-Z0-9]/g, '_') || 'unknown_id',
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

// GET - Listar TODOS os arquivos do bucket (incluindo não vinculados)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category') as 'literario' | 'professor' | 'aluno'

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

    const bucket = BUCKETS[category]
    const files = await listAllS3Files(bucket)
    
    return NextResponse.json(files)

  } catch (error) {
    console.error('Erro ao buscar arquivos do bucket:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}