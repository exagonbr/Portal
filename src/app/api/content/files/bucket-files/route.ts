import { NextRequest, NextResponse } from 'next/server'
import { S3Client, ListObjectsV2Command } from '@aws-sdk/client-s3'
import { S3FileInfo } from '@/types/files'

const s3Client = new S3Client({
  region: process.env.AWS_REGION!,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!
  }
})

// Mapeamento de categorias para buckets
const BUCKET_MAPPING: Record<string, string> = {
  'literario': 'sabercon-liberty',
  'professor': 'editora-sabercon', 
  'aluno': 'editora-sabercon'
}

// Função para determinar o tipo do arquivo
function getFileType(fileName: string): string {
  const extension = fileName.split('.').pop()?.toLowerCase()
  
  switch (extension) {
    case 'pdf': return 'PDF'
    case 'docx': case 'doc': return 'DOCX'
    case 'pptx': case 'ppt': return 'PPTX'
    case 'epub': return 'EPUB'
    case 'zip': case 'rar': return 'ZIP'
    case 'mp4': case 'avi': case 'mkv': return 'MP4'
    case 'mp3': case 'wav': return 'MP3'
    default: return 'OUTROS'
  }
}

// Função para formatar o tamanho do arquivo
function formatFileSize(sizeInBytes: number): string {
  if (sizeInBytes === 0) return '0 B'
  
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(sizeInBytes) / Math.log(k))
  
  return parseFloat((sizeInBytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category')

    if (!category) {
      return NextResponse.json({ error: 'Categoria é obrigatória' }, { status: 400 })
    }

    const bucketName = BUCKET_MAPPING[category]
    if (!bucketName) {
      return NextResponse.json({ error: 'Categoria inválida' }, { status: 400 })
    }

    console.log(`Buscando arquivos no bucket: ${bucketName}`)

    // Listar todos os objetos do bucket
    const command = new ListObjectsV2Command({
      Bucket: bucketName,
      MaxKeys: 1000 // Ajustar conforme necessário
    })

    const response = await s3Client.send(command)
    
    if (!response.Contents) {
      return NextResponse.json([])
    }

    // Converter objetos S3 para formato S3FileInfo
    const files: S3FileInfo[] = response.Contents
      .filter(obj => obj.Key && obj.Size !== undefined && obj.LastModified)
      .map(obj => ({
        id: obj.Key!, // Usar S3 key como ID temporário
        name: obj.Key!.split('/').pop() || obj.Key!,
        type: getFileType(obj.Key!),
        size: formatFileSize(obj.Size!),
        bucket: bucketName,
        lastModified: obj.LastModified!.toISOString(),
        description: '', // Vazio para arquivos não vinculados
        url: `https://${bucketName}.s3.${process.env.AWS_REGION}.amazonaws.com/${obj.Key}`,
        hasDbReference: false, // Será determinado na função que combina os dados
        dbRecord: null
      }))

    return NextResponse.json(files)

  } catch (error) {
    console.error('Erro ao listar arquivos S3 do bucket:', error)
    return NextResponse.json(
      { error: 'Erro ao buscar arquivos do bucket' },
      { status: 500 }
    )
  }
} 