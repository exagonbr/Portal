'use client'

import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/Button'
import { Select } from '@/components/ui/Select'
import Textarea from '@/components/ui/textarea'
import { Switch } from '@/components/ui/Switch'
import { useTheme } from '@/contexts/ThemeContext'
import { apiClient } from '@/lib/api-client'
import { BaseApiService } from '@/services/base-api-service'
import { useToast } from '@/components/ToastManager'
import Input from '@/components/ui/Input'

const moduleSchema = z.object({
  name: z.string().min(3, 'Nome deve ter pelo menos 3 caracteres'),
  description: z.string().min(10, 'Descrição deve ter pelo menos 10 caracteres'),
  course_id: z.string().min(1, 'Curso é obrigatório'),
  order: z.number().min(1, 'Ordem deve ser maior que 0'),
  duration_minutes: z.number().min(1, 'Duração deve ser maior que 0'),
  type: z.enum(['video', 'text', 'quiz', 'assignment'], {
    required_error: 'Tipo é obrigatório'
  }),
  content_url: z.string().url('URL inválida').optional().or(z.literal('')),
  active: z.boolean()
})

type ModuleFormData = z.infer<typeof moduleSchema>

interface ModuleFormProps {
  module?: any
  mode: 'create' | 'edit' | 'view'
  onSubmit: (data: ModuleFormData) => Promise<void>
  onCancel: () => void
}

interface Course {
  id: string
  name: string
}

const courseService = new BaseApiService<Course>('/courses')

export default function ModuleForm({ module, mode, onSubmit, onCancel }: ModuleFormProps) {
  const { theme } = useTheme()
  const { showError } = useToast()
  const [loading, setLoading] = useState(false)
  const [courses, setCourses] = useState<Course[]>([])
  const isViewMode = mode === 'view'

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch
  } = useForm<ModuleFormData>({
    resolver: zodResolver(moduleSchema),
    defaultValues: {
      name: module?.name || '',
      description: module?.description || '',
      course_id: module?.course_id || '',
      order: module?.order || 1,
      duration_minutes: module?.duration_minutes || 30,
      type: module?.type || 'video',
      content_url: module?.content_url || '',
      active: module?.active ?? true
    }
  })

  useEffect(() => {
    fetchCourses()
  }, [])

  const fetchCourses = async () => {
    try {
      const response = await courseService.getAll()
      setCourses(response || [])
    } catch (error) {
      showError('Erro ao carregar cursos', 'Não foi possível carregar a lista de cursos')
    }
  }

  const handleFormSubmit = async (data: ModuleFormData) => {
    setLoading(true)
    try {
      await onSubmit(data)
    } catch (error) {
      showError("Erro ao salvar módulo", "Não foi possível salvar o módulo")
    } finally {
      setLoading(false)
    }
  }

  const moduleTypes = [
    { value: 'video', label: 'Vídeo', icon: 'play_circle' },
    { value: 'text', label: 'Texto', icon: 'article' },
    { value: 'quiz', label: 'Quiz', icon: 'quiz' },
    { value: 'assignment', label: 'Atividade', icon: 'assignment' }
  ]

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Input
          label="Nome do Módulo"
          {...register('name')}
          error={errors.name?.message}
          disabled={isViewMode}
          required
        />

        <option value="">Selecione um curso</option>
        {courses.map((course) => (
            <option key={course.id} value={course.id}>
              {course.name}
            </option>
        ))}

        {moduleTypes.map((type) => (
            <option key={type.value} value={type.value}>
              {type.label}
            </option>
        ))}

        <Input
          label="Ordem"
          type="number"
          {...register('order', { valueAsNumber: true })}
          error={errors.order?.message}
          disabled={isViewMode}
          required
        />

        <Input
          label="Duração (minutos)"
          type="number"
          {...register('duration_minutes', { valueAsNumber: true })}
          error={errors.duration_minutes?.message}
          disabled={isViewMode}
          required
        />

        <Input
          label="URL do Conteúdo"
          type="url"
          {...register('content_url')}
          error={errors.content_url?.message}
          disabled={isViewMode}
          placeholder="https://..."
        />
      </div>

      <Textarea
        label="Descrição"
        {...register('description')}
        error={errors.description?.message}
        disabled={isViewMode}
        rows={4}
        required
      />

      <div className="flex items-center gap-4">
        <Switch
          label="Módulo Ativo"
          checked={watch('active')}
          onChange={(checked) => setValue('active', checked)}
          disabled={isViewMode}
        />
      </div>

      {!isViewMode && (
        <div className="flex justify-end gap-4 pt-4">
          <Button
            type="button"
            variant="ghost"
            onClick={onCancel}
            disabled={loading}
          >
            Cancelar
          </Button>
          <Button
            type="submit"
          >
            {mode === 'create' ? 'Criar Módulo' : 'Salvar Alterações'}
          </Button>
        </div>
      )}

      {isViewMode && (
        <div className="flex justify-end pt-4">
          <Button
            type="button"
            variant="ghost"
            onClick={onCancel}
          >
            Fechar
          </Button>
        </div>
      )}
    </form>
  )
} 