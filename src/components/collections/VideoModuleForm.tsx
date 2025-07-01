'use client'

import React, { useState } from 'react'
import { VideoModule, EducationCycle } from '@/types/collections'
import ImageUpload from './ImageUpload'

interface VideoModuleFormProps {
  initialData?: Partial<VideoModule>
  collectionId: number
  collectionPosterUrl?: string
  useDefaultCover?: boolean
  onSubmit: (data: VideoModule) => Promise<void>
  onCancel: () => void
  isLoading?: boolean
}

export default function VideoModuleForm({
  initialData,
  collectionId,
  collectionPosterUrl,
  useDefaultCover = true,
  onSubmit,
  onCancel,
  isLoading = false
}: VideoModuleFormProps) {
  const [formData, setFormData] = useState<VideoModule>({
    collection_id: collectionId,
    module_number: 1,
    title: '',
    synopsis: '',
    release_year: new Date().getFullYear(),
    duration: '00:00:00',
    education_cycle: EducationCycle.LIVRE,
    order_in_module: 1,
    ...initialData
  })

  const [errors, setErrors] = useState<Record<string, string>>({})
  const [customCover, setCustomCover] = useState(!useDefaultCover || !!initialData?.poster_image)

  // Função para upload de arquivos para S3
  const uploadFile = async (file: File): Promise<string> => {
    const formDataUpload = new FormData()
    formDataUpload.append('file', file)
    formDataUpload.append('folder', 'collections/videos')

    const response = await fetch('/api/aws/upload', {
      method: 'POST',
      body: formDataUpload
    })

    if (!response.ok) {
      throw new Error('Erro no upload do arquivo')
    }

    const result = await response.json()
    return result.url
  }

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (!formData.title.trim()) {
      newErrors.title = 'Título do vídeo é obrigatório'
    }

    if (!formData.synopsis.trim()) {
      newErrors.synopsis = 'Sinopse é obrigatória'
    }

    if (formData.module_number < 1) {
      newErrors.module_number = 'Número do módulo deve ser maior que 0'
    }

    if (formData.release_year < 1900 || formData.release_year > new Date().getFullYear() + 10) {
      newErrors.release_year = 'Ano de lançamento inválido'
    }

    if (formData.order_in_module < 1) {
      newErrors.order_in_module = 'Ordem no módulo deve ser maior que 0'
    }

    // Validar formato de tempo
    const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]:[0-5][0-9]$/
    if (!timeRegex.test(formData.duration)) {
      newErrors.duration = 'Formato de duração inválido (HH:MM:SS)'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }

    try {
      // Se usar capa padrão e não tiver capa customizada, usar a da coleção
      const finalData = {
        ...formData,
        poster_image: customCover ? formData.poster_image : collectionPosterUrl
      }
      
      await onSubmit(finalData)
    } catch (error) {
      console.log('Erro ao salvar vídeo:', error)
    }
  }

  const handleInputChange = (field: keyof VideoModule, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    
    // Limpar erro do campo quando o usuário começar a digitar
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  const handleCoverOptionChange = (useCustom: boolean) => {
    setCustomCover(useCustom)
    if (!useCustom) {
      // Limpar capa customizada se optar por usar a padrão
      handleInputChange('poster_image', undefined)
    }
  }

  return (
    <div className="max-w-3xl mx-auto p-6 bg-white dark:bg-gray-800 rounded-lg shadow-lg">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
          {initialData?.id ? 'Editar Vídeo' : 'Novo Vídeo'}
        </h2>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          Adicione um vídeo ao módulo da coleção
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Informações do Módulo */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Número do Módulo *
            </label>
            <input
              type="number"
              min="1"
              value={formData.module_number}
              onChange={(e) => handleInputChange('module_number', parseInt(e.target.value))}
              className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white ${
                errors.module_number ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {errors.module_number && <p className="text-red-500 text-xs mt-1">{errors.module_number}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Ordem no Módulo *
            </label>
            <input
              type="number"
              min="1"
              value={formData.order_in_module}
              onChange={(e) => handleInputChange('order_in_module', parseInt(e.target.value))}
              className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white ${
                errors.order_in_module ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {errors.order_in_module && <p className="text-red-500 text-xs mt-1">{errors.order_in_module}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Ano de Lançamento *
            </label>
            <input
              type="number"
              min="1900"
              max={new Date().getFullYear() + 10}
              value={formData.release_year}
              onChange={(e) => handleInputChange('release_year', parseInt(e.target.value))}
              className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white ${
                errors.release_year ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {errors.release_year && <p className="text-red-500 text-xs mt-1">{errors.release_year}</p>}
          </div>
        </div>

        {/* Título */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Título do Vídeo *
          </label>
          <input
            type="text"
            value={formData.title}
            onChange={(e) => handleInputChange('title', e.target.value)}
            className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white ${
              errors.title ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="Ex: Introdução às Equações do Primeiro Grau"
          />
          {errors.title && <p className="text-red-500 text-xs mt-1">{errors.title}</p>}
        </div>

        {/* Sinopse */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Sinopse do Vídeo *
          </label>
          <textarea
            value={formData.synopsis}
            onChange={(e) => handleInputChange('synopsis', e.target.value)}
            rows={3}
            className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white ${
              errors.synopsis ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="Descreva o conteúdo específico deste vídeo..."
          />
          {errors.synopsis && <p className="text-red-500 text-xs mt-1">{errors.synopsis}</p>}
        </div>

        {/* Duração e Ciclo de Ensino */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Duração *
            </label>
            <input
              type="text"
              value={formData.duration}
              onChange={(e) => handleInputChange('duration', e.target.value)}
              placeholder="00:00:00"
              pattern="[0-9]{2}:[0-9]{2}:[0-9]{2}"
              className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white ${
                errors.duration ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {errors.duration && <p className="text-red-500 text-xs mt-1">{errors.duration}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Ciclo de Ensino *
            </label>
            <select
              value={formData.education_cycle}
              onChange={(e) => handleInputChange('education_cycle', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            >
              {Object.values(EducationCycle).map((cycle) => (
                <option key={cycle} value={cycle}>
                  {cycle}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* URL do Vídeo */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            URL do Vídeo
          </label>
          <input
            type="url"
            value={formData.video_url || ''}
            onChange={(e) => handleInputChange('video_url', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            placeholder="https://exemplo.com/video.mp4"
          />
        </div>

        {/* Opções de Capa */}
        <div className="border-t pt-6">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
            Capa do Vídeo
          </h3>
          
          <div className="space-y-4">
            <div className="flex space-x-4">
              <label className="flex items-center space-x-2">
                <input
                  type="radio"
                  name="coverOption"
                  checked={!customCover}
                  onChange={() => handleCoverOptionChange(false)}
                  className="text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700 dark:text-gray-300">
                  Usar capa da coleção
                </span>
              </label>
              
              <label className="flex items-center space-x-2">
                <input
                  type="radio"
                  name="coverOption"
                  checked={customCover}
                  onChange={() => handleCoverOptionChange(true)}
                  className="text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700 dark:text-gray-300">
                  Usar capa personalizada
                </span>
              </label>
            </div>

            {!customCover && collectionPosterUrl && (
              <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                  Preview da capa da coleção:
                </p>
                <div className="relative w-32 h-48 rounded-lg overflow-hidden">
                  <img
                    src={collectionPosterUrl}
                    alt="Capa da coleção"
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
            )}

            {customCover && (
              <ImageUpload
                label="Capa Personalizada do Vídeo"
                onUpload={uploadFile}
                currentImage={typeof formData.poster_image === 'string' ? formData.poster_image : undefined}
              />
            )}
          </div>
        </div>

        {/* Botões de Ação */}
        <div className="flex justify-end space-x-4 pt-6 border-t">
          <button
            type="button"
            onClick={onCancel}
            disabled={isLoading}
            className="px-6 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors disabled:opacity-50"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={isLoading}
            className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center"
          >
            {isLoading && (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
            )}
            {initialData?.id ? 'Atualizar Vídeo' : 'Adicionar Vídeo'}
          </button>
        </div>
      </form>
    </div>
  )
} 