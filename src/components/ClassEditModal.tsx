'use client'

import React, { useState, useEffect } from 'react'
import { toast } from 'react-hot-toast'
import Modal from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { Textarea } from '@/components/ui/Textarea'
import { Switch } from '@/components/ui/Switch'
import { courseService } from '@/services/courseService'
import { userService } from '@/services/userService'

interface ClassEditModalProps {
  classData?: any
  onSave: (data: any) => Promise<void>
  onClose: () => void
}

export function ClassEditModal({ classData, onSave, onClose }: ClassEditModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    course_id: '',
    teacher_id: '',
    max_students: 30,
    start_date: '',
    end_date: '',
    schedule: '',
    active: true
  })
  const [loading, setLoading] = useState(false)
  const [courses, setCourses] = useState<any[]>([])
  const [teachers, setTeachers] = useState<any[]>([])

  useEffect(() => {
    if (classData) {
      setFormData({
        name: classData.name || '',
        description: classData.description || '',
        course_id: classData.course_id || '',
        teacher_id: classData.teacher_id || '',
        max_students: classData.max_students || 30,
        start_date: classData.start_date || '',
        end_date: classData.end_date || '',
        schedule: classData.schedule || '',
        active: classData.active ?? true
      })
    }
  }, [classData])

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      const [coursesResponse, teachersResponse] = await Promise.all([
        courseService.list(),
        userService.list({ role: 'TEACHER' })
      ])
      setCourses(coursesResponse)
      setTeachers(teachersResponse.data)
    } catch (error) {
      toast.error('Erro ao carregar dados')
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      await onSave(formData)
      onClose()
    } catch (error) {
      // Error is handled by parent component
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  return (
    <Modal isOpen={true} onClose={onClose} title={classData ? 'Editar Turma' : 'Nova Turma'}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Nome da Turma
          </label>
          <Input
            type="text"
            value={formData.name}
            onChange={(e) => handleChange('name', e.target.value)}
            placeholder="Digite o nome da turma"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Descrição
          </label>
          <Textarea
            value={formData.description}
            onChange={(e) => handleChange('description', e.target.value)}
            placeholder="Digite a descrição da turma"
            rows={3}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Curso
            </label>
            <Select
              value={formData.course_id}
              onChange={(e) => handleChange('course_id', e.target.value)}
              required
            >
              <option value="">Selecione um curso</option>
              {courses.map((course) => (
                <option key={course.id} value={course.id}>
                  {course.name}
                </option>
              ))}
            </Select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Professor
            </label>
            <Select
              value={formData.teacher_id}
              onChange={(e) => handleChange('teacher_id', e.target.value)}
              required
            >
              <option value="">Selecione um professor</option>
              {teachers.map((teacher) => (
                <option key={teacher.id} value={teacher.id}>
                  {teacher.name}
                </option>
              ))}
            </Select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Máximo de Alunos
            </label>
            <Input
              type="number"
              value={formData.max_students}
              onChange={(e) => handleChange('max_students', parseInt(e.target.value))}
              min="1"
              max="100"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Data de Início
            </label>
            <Input
              type="date"
              value={formData.start_date}
              onChange={(e) => handleChange('start_date', e.target.value)}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Data de Fim
            </label>
            <Input
              type="date"
              value={formData.end_date}
              onChange={(e) => handleChange('end_date', e.target.value)}
              required
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Horário
          </label>
          <Input
            type="text"
            value={formData.schedule}
            onChange={(e) => handleChange('schedule', e.target.value)}
            placeholder="Ex: Segunda a Sexta, 08:00 - 12:00"
          />
        </div>

        <div className="flex items-center space-x-2">
          <Switch
            checked={formData.active}
            onChange={(checked) => handleChange('active', checked)}
          />
          <label className="text-sm font-medium text-gray-700">
            Turma ativa
          </label>
        </div>

        <div className="flex justify-end space-x-3 pt-4">
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
            disabled={loading}
          >
            {loading ? 'Salvando...' : 'Salvar'}
          </Button>
        </div>
      </form>
    </Modal>
  )
}