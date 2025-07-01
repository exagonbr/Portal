'use client'

import React, { useState, useCallback, useRef } from 'react'
import { ImageUploadProps, FileUploadResponse } from '@/types/collections'
import Image from 'next/image'

export default function ImageUpload({
  onUpload,
  currentImage,
  label,
  accept = "image/*",
  maxSize = 5 // 5MB por padrão
}: ImageUploadProps) {
  const [isDragging, setIsDragging] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [preview, setPreview] = useState<string | null>(currentImage || null)
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
    if (!file.type.startsWith('image/')) {
      return 'Por favor, selecione apenas arquivos de imagem.'
    }

    // Verificar tamanho
    const maxSizeBytes = maxSize * 1024 * 1024
    if (file.size > maxSizeBytes) {
      return `O arquivo deve ter no máximo ${maxSize}MB.`
    }

    return null
  }

  const processFile = async (file: File) => {
    const validationError = validateFile(file)
    if (validationError) {
      alert(validationError)
      return
    }

    setIsUploading(true)
    
    try {
      // Criar preview local
      const previewUrl = URL.createObjectURL(file)
      setPreview(previewUrl)

      // Upload para S3
      const uploadedUrl = await onUpload(file)
      
      // Limpar preview local e usar URL do S3
      URL.revokeObjectURL(previewUrl)
      setPreview(uploadedUrl)
      
    } catch (error) {
      console.log('Erro no upload:', error)
      alert('Erro ao fazer upload da imagem. Tente novamente.')
      setPreview(currentImage || null)
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
  }, [onUpload, maxSize])

  const handleFileSelect = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files && files.length > 0) {
      await processFile(files[0])
    }
  }, [onUpload, maxSize])

  const handleClick = () => {
    fileInputRef.current?.click()
  }

  const handleRemove = () => {
    setPreview(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
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

        {preview ? (
          <div className="relative">
            <div className="relative w-full h-48 rounded-lg overflow-hidden">
              <Image
                src={preview}
                alt="Preview"
                fill
                className="object-cover"
              />
            </div>
            
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation()
                handleRemove()
              }}
              className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
              disabled={isUploading}
            >
              <span className="material-symbols-outlined text-sm">close</span>
            </button>
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
                  cloud_upload
                </span>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Arraste uma imagem aqui ou clique para selecionar
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  Máximo {maxSize}MB • Formatos: JPG, PNG, GIF, WebP
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
} 