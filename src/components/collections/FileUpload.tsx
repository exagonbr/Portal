'use client'

import React, { useState, useCallback, useRef } from 'react'
import { FileUploadResponse } from '@/types/collections'

interface FileUploadProps {
  onUpload: (file: File) => Promise<string>
  currentFile?: string
  label: string
  accept?: string
  maxSize?: number // em MB
  allowedTypes?: string[]
}

export default function FileUpload({
  onUpload,
  currentFile,
  label,
  accept = ".pdf,.epub",
  maxSize = 50, // 50MB por padrão
  allowedTypes = ['application/pdf', 'application/epub+zip']
}: FileUploadProps) {
  const [isDragging, setIsDragging] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadedFile, setUploadedFile] = useState<string | null>(currentFile || null)
  const [fileName, setFileName] = useState<string>('')
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
  }, [])

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
  }, [])

  const validateFile = (file: File): string | null => {
    // Verificar tipo de arquivo
    if (!allowedTypes.includes(file.type)) {
      return 'Por favor, selecione apenas arquivos PDF ou EPUB.'
    }

    // Verificar tamanho
    const maxSizeBytes = maxSize * 1024 * 1024
    if (file.size > maxSizeBytes) {
      return `O arquivo deve ter no máximo ${maxSize}MB.`
    }

    return null
  }

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const getFileIcon = (fileName: string): string => {
    const extension = fileName.split('.').pop()?.toLowerCase()
    switch (extension) {
      case 'pdf':
        return 'picture_as_pdf'
      case 'epub':
        return 'menu_book'
      default:
        return 'description'
    }
  }

  const processFile = async (file: File) => {
    const validationError = validateFile(file)
    if (validationError) {
      alert(validationError)
      return
    }

    setIsUploading(true)
    setFileName(file.name)
    
    try {
      // Upload para S3
      const uploadedUrl = await onUpload(file)
      setUploadedFile(uploadedUrl)
      
    } catch (error) {
      console.error('Erro no upload:', error)
      alert('Erro ao fazer upload do arquivo. Tente novamente.')
      setUploadedFile(currentFile || null)
      setFileName('')
    } finally {
      setIsUploading(false)
    }
  }

  const handleDrop = useCallback(async (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)

    const files = Array.from(e.dataTransfer.files)
    if (files.length > 0) {
      await processFile(files[0])
    }
  }, [onUpload, maxSize, allowedTypes])

  const handleFileSelect = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files && files.length > 0) {
      await processFile(files[0])
    }
  }, [onUpload, maxSize, allowedTypes])

  const handleClick = () => {
    fileInputRef.current?.click()
  }

  const handleRemove = () => {
    setUploadedFile(null)
    setFileName('')
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const handleDownload = () => {
    if (uploadedFile) {
      window.open(uploadedFile, '_blank')
    }
  }

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
        {label}
      </label>
      
      <div
        className={`
          relative border-2 border-dashed rounded-lg p-6 transition-colors cursor-pointer
          ${isDragging 
            ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' 
            : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500'
          }
          ${isUploading ? 'opacity-50 pointer-events-none' : ''}
        `}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        onClick={handleClick}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept={accept}
          onChange={handleFileSelect}
          className="hidden"
          disabled={isUploading}
        />

        {uploadedFile ? (
          <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <div className="flex items-center space-x-3">
              <span className="material-symbols-outlined text-2xl text-blue-500">
                {getFileIcon(fileName)}
              </span>
              <div>
                <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                  {fileName || 'Arquivo carregado'}
                </p>
                <p className="text-xs text-gray-500">
                  Material complementar
                </p>
              </div>
            </div>
            
            <div className="flex space-x-2">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation()
                  handleDownload()
                }}
                className="p-1 text-blue-500 hover:text-blue-600 transition-colors"
                title="Baixar arquivo"
              >
                <span className="material-symbols-outlined text-sm">download</span>
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation()
                  handleRemove()
                }}
                className="p-1 text-red-500 hover:text-red-600 transition-colors"
                title="Remover arquivo"
                disabled={isUploading}
              >
                <span className="material-symbols-outlined text-sm">delete</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="text-center">
            {isUploading ? (
              <div className="flex flex-col items-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mb-2"></div>
                <p className="text-sm text-gray-500">Fazendo upload...</p>
              </div>
            ) : (
              <div className="flex flex-col items-center">
                <span className="material-symbols-outlined text-4xl text-gray-400 mb-2">
                  upload_file
                </span>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Arraste um arquivo aqui ou clique para selecionar
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  Máximo {maxSize}MB • Formatos: PDF, EPUB
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
} 