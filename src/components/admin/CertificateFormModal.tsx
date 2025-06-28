'use client'

import React, { useState, useEffect } from 'react'
import { X, Save, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Certificate, CertificateType, CERTIFICATE_TYPE_LABELS } from '@/types/certificate'

interface CertificateFormModalProps {
  certificate?: Certificate | null
  isOpen: boolean
  onClose: () => void
  onSave: (data: any) => Promise<void>
  users?: Array<{ id: string; name: string; email: string }>
  courses?: Array<{ id: string; title: string }>
}

export const CertificateFormModal: React.FC<CertificateFormModalProps> = ({
  certificate,
  isOpen,
  onClose,
  onSave,
  users = [],
  courses = []
}) => {
  const [formData, setFormData] = useState({
    user_id: '',
    course_id: '',
    title: '',
    description: '',
    certificate_type: 'COURSE_COMPLETION' as CertificateType,
    expiry_date: '',
    certificate_url: '',
    is_active: true
  })
  
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    if (certificate) {
      setFormData({
        user_id: certificate.user_id,
        course_id: certificate.course_id || '',
        title: certificate.title,
        description: certificate.description || '',
        certificate_type: certificate.certificate_type,
        expiry_date: certificate.expiry_date ? certificate.expiry_date.split('T')[0] : '',
        certificate_url: certificate.certificate_url || '',
        is_active: certificate.is_active
      })
    } else {
      setFormData({
        user_id: '',
        course_id: '',
        title: '',
        description: '',
        certificate_type: 'COURSE_COMPLETION',
        expiry_date: '',
        certificate_url: '',
        is_active: true
      })
    }
    setErrors({})
  }, [certificate, isOpen])

  const validateForm = () => {
    const newErrors: Record<string, string> = {}
    
    if (!formData.user_id) newErrors.user_id = 'Usuário é obrigatório'
    if (!formData.title) newErrors.title = 'Título é obrigatório'
    if (!formData.certificate_type) newErrors.certificate_type = 'Tipo é obrigatório'
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) return
    
    setLoading(true)
    try {
      await onSave(formData)
      onClose()
    } catch (error) {
      console.error('Erro ao salvar certificado:', error)
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-hidden">
        <div className="bg-gradient-to-r from-purple-600 to-purple-700 text-white p-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold">
              {certificate ? 'Editar Certificado' : 'Novo Certificado'}
            </h2>
            <button
              onClick={onClose}
              className="text-white hover:text-purple-200 transition-colors"
            >
              <X className="h-6 w-6" />
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Usuário */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Usuário *
              </label>
              <select
                value={formData.user_id}
                onChange={(e) => setFormData({ ...formData, user_id: e.target.value })}
                className={`w-full rounded-lg border px-3 py-2 focus:ring-2 focus:ring-purple-500 ${
                  errors.user_id ? 'border-red-500' : 'border-gray-300'
                }`}
                disabled={!!certificate}
              >
                <option value="">Selecione um usuário</option>
                {users.map(user => (
                  <option key={user.id} value={user.id}>
                    {user.name} ({user.email})
                  </option>
                ))}
              </select>
              {errors.user_id && (
                <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  {errors.user_id}
                </p>
              )}
            </div>

            {/* Curso */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Curso (Opcional)
              </label>
              <select
                value={formData.course_id}
                onChange={(e) => setFormData({ ...formData, course_id: e.target.value })}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-purple-500"
              >
                <option value="">Nenhum curso específico</option>
                {courses.map(course => (
                  <option key={course.id} value={course.id}>
                    {course.title}
                  </option>
                ))}
              </select>
            </div>

            {/* Título */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Título *
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className={`w-full rounded-lg border px-3 py-2 focus:ring-2 focus:ring-purple-500 ${
                  errors.title ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Ex: Certificado de Conclusão do Curso de React"
              />
              {errors.title && (
                <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  {errors.title}
                </p>
              )}
            </div>

            {/* Tipo */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tipo *
              </label>
              <select
                value={formData.certificate_type}
                onChange={(e) => setFormData({ ...formData, certificate_type: e.target.value as CertificateType })}
                className={`w-full rounded-lg border px-3 py-2 focus:ring-2 focus:ring-purple-500 ${
                  errors.certificate_type ? 'border-red-500' : 'border-gray-300'
                }`}
              >
                {Object.entries(CERTIFICATE_TYPE_LABELS).map(([key, label]) => (
                  <option key={key} value={key}>
                    {label}
                  </option>
                ))}
              </select>
              {errors.certificate_type && (
                <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  {errors.certificate_type}
                </p>
              )}
            </div>

            {/* Data de Expiração */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Data de Expiração (Opcional)
              </label>
              <input
                type="date"
                value={formData.expiry_date}
                onChange={(e) => setFormData({ ...formData, expiry_date: e.target.value })}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-purple-500"
              />
            </div>

            {/* Descrição */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Descrição
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={3}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-purple-500"
                placeholder="Descrição detalhada do certificado..."
              />
            </div>

            {/* URL do Certificado */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                URL do Arquivo PDF (Opcional)
              </label>
              <input
                type="url"
                value={formData.certificate_url}
                onChange={(e) => setFormData({ ...formData, certificate_url: e.target.value })}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-purple-500"
                placeholder="https://exemplo.com/certificado.pdf"
              />
            </div>

            {/* Status */}
            <div className="md:col-span-2">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={formData.is_active}
                  onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                  className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                />
                <span className="text-sm font-medium text-gray-700">
                  Certificado ativo
                </span>
              </label>
            </div>
          </div>

          <div className="flex justify-end gap-3 mt-6 pt-6 border-t border-gray-200">
            <Button
              type="button"
              variant="secondary"
              onClick={onClose}
              disabled={loading}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="flex items-center gap-2"
            >
              <Save className="h-4 w-4" />
              {loading ? 'Salvando...' : 'Salvar'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
