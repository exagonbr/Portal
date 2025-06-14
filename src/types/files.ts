export interface FileRecord {
  id: string
  name: string
  originalName: string
  type: string
  size: number
  sizeFormatted: string
  bucket: string
  s3Key: string
  s3Url: string
  description?: string
  category: 'literario' | 'professor' | 'aluno'
  metadata?: Record<string, any>
  checksum?: string
  createdAt: Date
  updatedAt: Date
  uploadedBy: string
  isActive: boolean
  tags?: string[]
}

export interface S3FileInfo {
  id: string
  name: string
  type: string
  size: string
  bucket: string
  lastModified: string
  description: string
  url: string
  hasDbReference?: boolean
  dbRecord?: FileRecord | null
  category?: string
}

export interface FileUploadRequest {
  file: File
  category: 'literario' | 'professor' | 'aluno'
  description?: string
  tags?: string[]
}

export interface FileMoveRequest {
  fileId: string
  sourceBucket: string
  targetBucket: string
  action: 'copy' | 'move'
}

export interface FileUpdateRequest {
  fileId: string
  name?: string
  description?: string
  tags?: string[]
  metadata?: Record<string, any>
} 