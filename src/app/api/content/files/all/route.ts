import { NextRequest, NextResponse } from 'next/server'
import { S3Client, ListObjectsV2Command, GetObjectCommand } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'
import { S3FileInfo, FileRecord } from '@/types/files'

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

// Mock do banco de dados
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

function formatFileSize(bytes: number): string {
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  if (bytes === 0) return '0 Bytes'
  const i = Math.floor(Math.log(bytes) / Math.log(1024))
  return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i]
}

async function listS3Files(bucket: string, category: string): Promise<S3FileInfo[]> {
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
          const dbRecord = mockDatabase.find(record => 
            record.s3Key === object.Key && record.bucket === bucket
          )

          const getObjectCommand = new GetObjectCommand({
            Bucket: bucket,
            Key: object.Key
          })
          const signedUrl = await getSignedUrl(s3Client, getObjectCommand, { expiresIn: 3600 })

          const fileInfo: S3FileInfo = {
            id: `${category}_${object.Key?.replace(/[^a-zA-Z0-9]/g, '_') || 'unknown_id'}`,
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
    console.error(`Erro ao listar arquivos S3 do bucket ${bucket}:`, error)
    return []
  }
}


// Handler para requisições OPTIONS (preflight)
export async function OPTIONS(request: NextRequest) {
  const origin = request.headers.get('origin') || undefined;
  return createCorsOptionsResponse(origin);
}

export async function GET(request: NextRequest) {
  try {
    const allFiles: Record<string, S3FileInfo[]> = {}

    // Buscar arquivos de todos os buckets
    for (const [category, bucket] of Object.entries(BUCKETS)) {
      allFiles[category] = await listS3Files(bucket, category)
    }

    return NextResponse.json(allFiles, {
      headers: getCorsHeaders(request.headers.get('origin') || undefined)
    })

  } catch (error) {
    console.error('Erro ao buscar todos os arquivos:', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { 
      status: 500,
      headers: getCorsHeaders(request.headers.get('origin') || undefined)
    })
  }
} 
