'use client'

import React, { useState, useEffect } from 'react'
import { Certificate } from '@/types/certificate'
import { Button } from '@/components/ui/Button'
import { X, Award, User, BookOpen, Calendar } from 'lucide-react'

interface CertificateFormModalProps {
  isOpen: boolean
  certificate?: Certificate | null
  onClose: () => void
  onSave: (data: any) => void
  users: Array<{ id: number; name: string; email: string }>
  tvShows: Array<{ id: number; name: string }>
}

export function CertificateFormModal({
  isOpen,
  certificate,
  onClose,
  onSave,
  users,
  tvShows
}: CertificateFormModalProps) {
  const [formData, setFormData] = useState({
    document: '',
    license_code: '',
    score: '',
    tv_show_name: '',
    recreate: false,
    user_id: '',
    tv_show_id: ''
  })

  useEffect(() => {
    if (certificate) {
      setFormData({
        document: certificate.document || '',
        license_code: certificate.license_code || '',
        score: certificate.score?.toString() || '',
        tv_show_name: certificate.tv_show_name || '',
        recreate: certificate.recreate || false,
        user_id: certificate.user_id || '',
        tv_show_id: certificate.tv_show_id || ''
      })
    } else {
      setFormData({
        document: '',
        license_code: '',
        score: '',
        tv_show_name: '',
        recreate: false,
        user_id: '',
        tv_show_id: ''
      })
    }
  }, [certificate])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSave({
      ...formData,
      score: formData.score ? Number(formData.score) : undefined
    })
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl">
        <div className="bg-gradient-to-r from-purple-600 to-purple-700 text-white p-6 rounded-t-lg">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <Award className="h-6 w-6" />
              <h2 className="text-xl font-bold">
                {certificate ? 'Editar Certificado' : 'Novo Certificado'}
              </h2>
            </div>
            <button
              onClick={onClose}
              className="text-white hover:text-purple-200 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-medium text-slate-700">
                <Award className="h-4 w-4 text-purple-500" />
                Documento
              </label>
              <input
                type="text"
                value={formData.document}
                onChange={(e) => setFormData({ ...formData, document: e.target.value })}
                placeholder="Nome do documento"
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500"
              />
            </div>

            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-medium text-slate-700">
                <Award className="h-4 w-4 text-purple-500" />
                Código da Licença
              </label>
              <input
                type="text"
                value={formData.license_code}
                onChange={(e) => setFormData({ ...formData, license_code: e.target.value })}
                placeholder="Código da licença"
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500"
              />
            </div>

            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-medium text-slate-700">
                <User className="h-4 w-4 text-purple-500" />
                Usuário
              </label>
              <select
                value={formData.user_id}
                onChange={(e) => setFormData({ ...formData, user_id: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500"
              >
                <option value="">Selecione um usuário</option>
                {users.map((user) => (
                  <option key={user.id} value={user.id}>
                    {user.name} ({user.email})
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-medium text-slate-700">
                <BookOpen className="h-4 w-4 text-purple-500" />
                Programa de TV
              </label>
              <select
                value={formData.tv_show_id}
                onChange={(e) => setFormData({ ...formData, tv_show_id: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500"
              >
                <option value="">Selecione um programa</option>
                {tvShows.map((show) => (
                  <option key={show.id} value={show.id}>
                    {show.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-medium text-slate-700">
                <Calendar className="h-4 w-4 text-purple-500" />
                Pontuação
              </label>
              <input
                type="number"
                value={formData.score}
                onChange={(e) => setFormData({ ...formData, score: e.target.value })}
                placeholder="Pontuação"
                min="0"
                max="100"
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500"
              />
            </div>

            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-medium text-slate-700">
                <input
                  type="checkbox"
                  checked={formData.recreate}
                  onChange={(e) => setFormData({ ...formData, recreate: e.target.checked })}
                  className="rounded border-slate-300 text-purple-600 focus:ring-purple-500"
                />
                Permitir recriação
              </label>
            </div>
          </div>

          <div className="mt-6 flex justify-end gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              className="bg-purple-600 hover:bg-purple-700"
            >
              {certificate ? 'Atualizar' : 'Criar'} Certificado
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
