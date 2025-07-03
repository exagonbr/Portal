'use client'

import React, { useState, useEffect } from 'react'
import { CollectionFormData, EducationCycle, TargetAudience } from '@/types/collections'
import ImageUpload from './ImageUpload'
import FileUpload from './FileUpload'

interface CollectionFormProps {
  initialData?: Partial<CollectionFormData>
  onSubmit: (data: CollectionFormData) => Promise<void>
  onCancel: () => void
  isLoading?: boolean
}

export default function CollectionForm({
  initialData,
  onSubmit,
  onCancel,
  isLoading = false
}: CollectionFormProps) {
  const [formData, setFormData] = useState<CollectionFormData>({
    name: '',
    synopsis: '',
    producer: '',
    release_date: '',
    contract_expiry_date: '',
    authors: [],
    target_audience: [],
    total_hours: '00:00:00',
    use_default_cover_for_videos: true,
    ...initialData
  })

  const [errors, setErrors] = useState<Record<string, string>>({})
  const [authorInput, setAuthorInput] = useState('')

  // Função para upload de arquivos para S3
  const uploadFile = async (file: File): Promise<string> => {
    const formData = new FormData()
    formData.append('file', file)
    formData.append('folder', 'collections')

    const response = await fetch('/api/aws/upload', {
      method: 'POST',
      body: formData
    })

    if (!response.ok) {
      throw new Error('Erro no upload do arquivo')
    }

    const result = await response.json()
    return result.url
  }

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (!formData.name.trim()) {
      newErrors.name = 'Nome da coleção é obrigatório'
    }

    if (!formData.synopsis.trim()) {
      newErrors.synopsis = 'Sinopse é obrigatória'
    }

    if (!formData.producer.trim()) {
      newErrors.producer = 'Produtora é obrigatória'
    }

    if (!formData.release_date) {
      newErrors.release_date = 'Data de lançamento é obrigatória'
    }

    if (!formData.contract_expiry_date) {
      newErrors.contract_expiry_date = 'Data de vigência do contrato é obrigatória'
    }

    if (formData.authors.length === 0) {
      newErrors.authors = 'Pelo menos um autor é obrigatório'
    }

    if (formData.target_audience.length === 0) {
      newErrors.target_audience = 'Pelo menos um público-alvo é obrigatório'
    }

    // Validar formato de tempo
    const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]:[0-5][0-9]$/
    if (!timeRegex.test(formData.total_hours)) {
      newErrors.total_hours = 'Formato de tempo inválido (HH:MM:SS)'
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
      await onSubmit(formData)
    } catch (error) {
      console.log('Erro ao salvar coleção:', error)
    }
  }

  const handleInputChange = (field: keyof CollectionFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    
    // Limpar erro do campo quando o usuário começar a digitar
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  const addAuthor = () => {
    if (authorInput.trim() && !formData.authors.includes(authorInput.trim())) {
      handleInputChange('authors', [...formData.authors, authorInput.trim()])
      setAuthorInput('')
    }
  }

  const removeAuthor = (author: string) => {
    handleInputChange('authors', formData.authors.filter(a => a !== author))
  }

  const handleTargetAudienceChange = (audience: string, checked: boolean) => {
    if (checked) {
      handleInputChange('target_audience', [...formData.target_audience, audience])
    } else {
      handleInputChange('target_audience', formData.target_audience.filter(a => a !== audience))
    }
  }

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white dark:bg-gray-800 rounded-lg shadow-lg">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
          {initialData?.id ? 'Editar Coleção' : 'Nova Coleção'}
        </h2>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          Preencha as informações da coleção de vídeos
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Informações Básicas */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Nome da Coleção *
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white ${
                errors.name ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Ex: Série Educativa Matemática"
            />
            {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Produtora *
            </label>
            <input
              type="text"
              value={formData.producer}
              onChange={(e) => handleInputChange('producer', e.target.value)}
              className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white ${
                errors.producer ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Ex: Editora Educacional LTDA"
            />
            {errors.producer && <p className="text-red-500 text-xs mt-1">{errors.producer}</p>}
          </div>
        </div>

        {/* Sinopse */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Sinopse *
          </label>
          <textarea
            value={formData.synopsis}
            onChange={(e) => handleInputChange('synopsis', e.target.value)}
            rows={4}
            className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white ${
              errors.synopsis ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="Descreva o conteúdo e objetivos da coleção..."
          />
          {errors.synopsis && <p className="text-red-500 text-xs mt-1">{errors.synopsis}</p>}
        </div>

        {/* Datas e Carga Horária */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Data de Lançamento *
            </label>
            <input
              type="date"
              value={formData.release_date}
              onChange={(e) => handleInputChange('release_date', e.target.value)}
              className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white ${
                errors.release_date ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {errors.release_date && <p className="text-red-500 text-xs mt-1">{errors.release_date}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Vigência do Contrato *
            </label>
            <input
              type="date"
              value={formData.contract_expiry_date}
              onChange={(e) => handleInputChange('contract_expiry_date', e.target.value)}
              className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white ${
                errors.contract_expiry_date ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {errors.contract_expiry_date && <p className="text-red-500 text-xs mt-1">{errors.contract_expiry_date}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Carga Horária Total *
            </label>
            <input
              type="text"
              value={formData.total_hours}
              onChange={(e) => handleInputChange('total_hours', e.target.value)}
              placeholder="00:00:00"
              pattern="[0-9]{2}:[0-9]{2}:[0-9]{2}"
              className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white ${
                errors.total_hours ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {errors.total_hours && <p className="text-red-500 text-xs mt-1">{errors.total_hours}</p>}
          </div>
        </div>

        {/* Autores */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Autores *
          </label>
          <div className="flex gap-2 mb-2">
            <input
              type="text"
              value={authorInput}
              onChange={(e) => setAuthorInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addAuthor())}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              placeholder="Digite o nome do autor e pressione Enter"
            />
            <button
              type="button"
              onClick={addAuthor}
              className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
            >
              Adicionar
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {formData.authors.map((author, index) => (
              <span
                key={index}
                className="inline-flex items-center px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-sm rounded-full"
              >
                {author}
                <button
                  type="button"
                  onClick={() => removeAuthor(author)}
                  className="ml-2 text-blue-600 hover:text-blue-800"
                >
                  ×
                </button>
              </span>
            ))}
          </div>
          {errors.authors && <p className="text-red-500 text-xs mt-1">{errors.authors}</p>}
        </div>

        {/* Público-Alvo */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Público-Alvo *
          </label>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
            {Object.values(TargetAudience).map((audience) => (
              <label key={audience} className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={formData.target_audience.includes(audience)}
                  onChange={(e) => handleTargetAudienceChange(audience, e.target.checked)}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700 dark:text-gray-300">{audience}</span>
              </label>
            ))}
          </div>
          {errors.target_audience && <p className="text-red-500 text-xs mt-1">{errors.target_audience}</p>}
        </div>

        {/* Upload de Imagens */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <ImageUpload
            label="Capa da Coleção"
            onUpload={uploadFile}
            currentImage={typeof formData.poster_image === 'string' ? formData.poster_image : undefined}
          />

          <ImageUpload
            label="Imagem do Carrossel"
            onUpload={uploadFile}
            currentImage={typeof formData.carousel_image === 'string' ? formData.carousel_image : undefined}
          />
        </div>

        {/* Upload de Material Complementar */}
        <FileUpload
          label="Material Complementar (E-book)"
          onUpload={uploadFile}
          currentFile={typeof formData.ebook_file === 'string' ? formData.ebook_file : undefined}
        />

        {/* Opções de Capa para Vídeos */}
        <div className="border-t pt-6">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
            Configurações de Vídeos
          </h3>
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={formData.use_default_cover_for_videos}
              onChange={(e) => handleInputChange('use_default_cover_for_videos', e.target.checked)}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <span className="text-sm text-gray-700 dark:text-gray-300">
              Usar capa da coleção como padrão para todos os vídeos
            </span>
          </label>
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
            {initialData?.id ? 'Atualizar Coleção' : 'Criar Coleção'}
          </button>
        </div>
      </form>
    </div>
  )
} 