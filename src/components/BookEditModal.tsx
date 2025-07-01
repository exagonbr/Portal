'use client'

import { useState, useEffect } from 'react'
import Modal from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import { Textarea } from '@/components/ui/Textarea'
import { Select } from '@/components/ui/Select'

// Tipos específicos para livros
interface BookResponseDto {
  id: string;
  title: string;
  subtitle?: string;
  author: string;
  category: string;
  pages: number;
  description?: string;
  cover_url?: string;
  status?: string;
}

interface BookUpdateDto {
  title?: string;
  subtitle?: string;
  author?: string;
  category?: string;
  pages?: number;
  description?: string;
  cover_url?: string;
  status?: string;
}

interface BookEditModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (data: BookUpdateDto) => Promise<void>
  book: BookResponseDto
  title: string
}

export function BookEditModal({ isOpen, onClose, onSave, book, title }: BookEditModalProps) {
  const [formData, setFormData] = useState<BookUpdateDto>({
    title: '',
    subtitle: '',
    author: '',
    category: '',
    description: '',
    pages: 0,
    cover_url: '',
    status: 'draft'
  })
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    if (book) {
      setFormData({
        title: book.title,
        subtitle: book.subtitle || '',
        author: book.author,
        category: book.category,
        description: book.description || '',
        pages: book.pages,
        cover_url: book.cover_url || '',
        status: book.status
      })
    }
  }, [book])

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (!formData.title?.trim()) {
      newErrors.title = 'Título é obrigatório'
    }

    if (!formData.author?.trim()) {
      newErrors.author = 'Autor é obrigatório'
    }

    if (!formData.category?.trim()) {
      newErrors.category = 'Categoria é obrigatória'
    }

    if (!formData.pages || formData.pages <= 0) {
      newErrors.pages = 'Número de páginas deve ser maior que zero'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }

    setLoading(true)
    try {
      await onSave(formData)
      onClose()
    } catch (error) {
      console.log('Erro ao salvar livro:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (field: keyof BookUpdateDto, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
    
    // Limpar erro do campo quando o usuário começar a digitar
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }))
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Input
              label="Título *"
              value={formData.title || ''}
              onChange={(e) => handleInputChange('title', e.target.value)}
              error={errors.title}
              placeholder="Título do livro"
            />
          </div>
          
          <div>
            <Input
              label="Subtítulo"
              value={formData.subtitle || ''}
              onChange={(e) => handleInputChange('subtitle', e.target.value)}
              placeholder="Subtítulo do livro"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Input
              label="Autor *"
              value={formData.author || ''}
              onChange={(e) => handleInputChange('author', e.target.value)}
              error={errors.author}
              placeholder="Nome do autor"
            />
          </div>
          
          <div>
            <Input
              label="Categoria *"
              value={formData.category || ''}
              onChange={(e) => handleInputChange('category', e.target.value)}
              error={errors.category}
              placeholder="Categoria do livro"
            />
          </div>
        </div>

        <div>
          <Textarea
            label="Descrição"
            value={formData.description || ''}
            onChange={(e) => handleInputChange('description', e.target.value)}
            placeholder="Descrição do livro"
            rows={3}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Input
              label="Número de Páginas *"
              type="number"
              value={(formData.pages || 0).toString()}
              onChange={(e) => handleInputChange('pages', parseInt(e.target.value) || 0)}
              error={errors.pages}
              placeholder="0"
              min="1"
            />
          </div>
          
          <div>
            <Select
              label="Status"
              value={formData.status}
              onChange={(value) => handleInputChange('status', Array.isArray(value) ? value[0] : value)}
              options={[
                { value: 'draft', label: 'Rascunho' },
                { value: 'published', label: 'Publicado' },
                { value: 'archived', label: 'Arquivado' }
              ]}
            />
          </div>
        </div>

        <div>
          <Input
            label="URL da Capa"
            value={formData.cover_url || ''}
            onChange={(e) => handleInputChange('cover_url', e.target.value)}
            placeholder="https://exemplo.com/capa.jpg"
          />
        </div>

        <div className="flex justify-end space-x-2 pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={loading}
          >
            Cancelar
          </Button>
          <Button
            type="submit"
            loading={loading}
          >
            Atualizar Livro
          </Button>
        </div>
      </form>
    </Modal>
  )
} 