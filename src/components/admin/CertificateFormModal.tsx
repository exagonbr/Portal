'use client'

import React, { useState, useEffect } from 'react'
import { X, Save, AlertCircle, User, FileText, Hash, Trophy, Tv, RotateCcw } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Certificate, CertificateCreateRequest, CertificateUpdateRequest } from '@/types/certificate'

interface CertificateFormModalProps {
  certificate?: Certificate | null
  isOpen: boolean
  onClose: () => void
  onSave: (data: CertificateCreateRequest | CertificateUpdateRequest) => Promise<void>
  users: Array<{ id: number; name: string; email: string }>
  tvShows?: Array<{ id: number; name: string }>
}

export const CertificateFormModal: React.FC<CertificateFormModalProps> = ({
  certificate,
  isOpen,
  onClose,
  onSave,
  users,
  tvShows = []
}) => {
  const [formData, setFormData] = useState({
    user_id: '',
    tv_show_id: '',
    path: '',
    score: '',
    document: '',
    license_code: '',
    tv_show_name: '',
    recreate: true
  })
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  // Resetar formulário quando o modal abrir/fechar ou certificado mudar
  useEffect(() => {
    if (isOpen) {
      if (certificate) {
        // Modo edição
        setFormData({
          user_id: certificate.user_id?.toString() || '',
          tv_show_id: certificate.tv_show_id?.toString() || '',
          path: certificate.path || '',
          score: certificate.score?.toString() || '',
          document: certificate.document || '',
          license_code: certificate.license_code || '',
          tv_show_name: certificate.tv_show_name || '',
          recreate: certificate.recreate ?? true
        })
      } else {
        // Modo criação
        setFormData({
          user_id: '',
          tv_show_id: '',
          path: '',
          score: '',
          document: '',
          license_code: '',
          tv_show_name: '',
          recreate: true
        })
      }
      setErrors({})
    }
  }, [isOpen, certificate])

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    // Limpar erro do campo quando o usuário começar a digitar
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    // Validações básicas
    if (!formData.user_id && !certificate) {
      newErrors.user_id = 'Usuário é obrigatório para novos certificados'
    }

    if (formData.score && (isNaN(Number(formData.score)) || Number(formData.score) < 0)) {
      newErrors.score = 'Pontuação deve ser um número válido'
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
      const submitData: any = {
        path: formData.path || null,
        score: formData.score ? Number(formData.score) : null,
        document: formData.document || null,
        license_code: formData.license_code || null,
        tv_show_name: formData.tv_show_name || null,
        recreate: formData.recreate
      }

      // Para criação, incluir campos obrigatórios
      if (!certificate) {
        submitData.user_id = formData.user_id ? Number(formData.user_id) : null
        submitData.tv_show_id = formData.tv_show_id ? Number(formData.tv_show_id) : null
      } else {
        // Para edição, incluir tv_show_id se foi alterado
        if (formData.tv_show_id) {
          submitData.tv_show_id = Number(formData.tv_show_id)
        }
      }

      await onSave(submitData)
      onClose()
    } catch (error) {
      console.log('Erro ao salvar certificado:', error)
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) return null

  const isEditing = !!certificate
  const title = isEditing ? 'Editar Certificado' : 'Novo Certificado'

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-hidden">
        <div className="bg-gradient-to-r from-purple-600 to-purple-700 text-white p-6">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-white/20 flex items-center justify-center">
                <Trophy className="h-5 w-5 text-white" />
              </div>
              <h2 className="text-xl font-bold">{title}</h2>
            </div>
            <button
              onClick={onClose}
              className="text-white hover:text-purple-200 transition-colors"
              disabled={loading}
            >
              <X className="h-6 w-6" />
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Usuário */}
            <div className="md:col-span-2">
              <label className="flex items-center gap-2 text-sm font-semibold text-slate-700 mb-2">
                <User className="h-4 w-4 text-purple-500" />
                Usuário {!isEditing && <span className="text-red-500">*</span>}
              </label>
              <select
                value={formData.user_id}
                onChange={(e) => handleInputChange('user_id', e.target.value)}
                disabled={isEditing || loading}
                className={`w-full rounded-lg border px-4 py-2.5 text-sm focus:ring-2 focus:ring-purple-500/20 transition-all ${
                  errors.user_id ? 'border-red-300 focus:border-red-500' : 'border-slate-200 focus:border-purple-500'
                } ${isEditing ? 'bg-slate-50 cursor-not-allowed' : 'bg-white'}`}
              >
                <option value="">Selecione um usuário</option>
                {users.map((user) => (
                  <option key={user.id} value={user.id}>
                    {user.name} ({user.email})
                  </option>
                ))}
              </select>
              {errors.user_id && (
                <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  {errors.user_id}
                </p>
              )}
            </div>

            {/* TV Show */}
            <div>
              <label className="flex items-center gap-2 text-sm font-semibold text-slate-700 mb-2">
                <Tv className="h-4 w-4 text-purple-500" />
                TV Show
              </label>
              <select
                value={formData.tv_show_id}
                onChange={(e) => handleInputChange('tv_show_id', e.target.value)}
                disabled={loading}
                className="w-full rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all"
              >
                <option value="">Selecione um TV Show</option>
                {tvShows.map((show) => (
                  <option key={show.id} value={show.id}>
                    {show.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Nome do TV Show */}
            <div>
              <label className="flex items-center gap-2 text-sm font-semibold text-slate-700 mb-2">
                <Tv className="h-4 w-4 text-purple-500" />
                Nome do TV Show
              </label>
              <input
                type="text"
                value={formData.tv_show_name}
                onChange={(e) => handleInputChange('tv_show_name', e.target.value)}
                disabled={loading}
                placeholder="Nome do programa de TV"
                className="w-full rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all"
              />
            </div>

            {/* Caminho */}
            <div>
              <label className="flex items-center gap-2 text-sm font-semibold text-slate-700 mb-2">
                <FileText className="h-4 w-4 text-purple-500" />
                Caminho do Arquivo
              </label>
              <input
                type="text"
                value={formData.path}
                onChange={(e) => handleInputChange('path', e.target.value)}
                disabled={loading}
                placeholder="Caminho para o arquivo do certificado"
                className="w-full rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all"
              />
            </div>

            {/* Pontuação */}
            <div>
              <label className="flex items-center gap-2 text-sm font-semibold text-slate-700 mb-2">
                <Trophy className="h-4 w-4 text-purple-500" />
                Pontuação
              </label>
              <input
                type="number"
                value={formData.score}
                onChange={(e) => handleInputChange('score', e.target.value)}
                disabled={loading}
                placeholder="Pontuação obtida"
                min="0"
                className={`w-full rounded-lg border px-4 py-2.5 text-sm focus:ring-2 focus:ring-purple-500/20 transition-all ${
                  errors.score ? 'border-red-300 focus:border-red-500' : 'border-slate-200 focus:border-purple-500'
                }`}
              />
              {errors.score && (
                <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  {errors.score}
                </p>
              )}
            </div>

            {/* Documento */}
            <div>
              <label className="flex items-center gap-2 text-sm font-semibold text-slate-700 mb-2">
                <FileText className="h-4 w-4 text-purple-500" />
                Documento
              </label>
              <input
                type="text"
                value={formData.document}
                onChange={(e) => handleInputChange('document', e.target.value)}
                disabled={loading}
                placeholder="Número ou identificação do documento"
                className="w-full rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all"
              />
            </div>

            {/* Código de Licença */}
            <div>
              <label className="flex items-center gap-2 text-sm font-semibold text-slate-700 mb-2">
                <Hash className="h-4 w-4 text-purple-500" />
                Código de Licença
              </label>
              <input
                type="text"
                value={formData.license_code}
                onChange={(e) => handleInputChange('license_code', e.target.value)}
                disabled={loading}
                placeholder="Código de licença do certificado"
                className="w-full rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all"
              />
            </div>

            {/* Recriar */}
            <div className="md:col-span-2">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.recreate}
                  onChange={(e) => handleInputChange('recreate', e.target.checked)}
                  disabled={loading}
                  className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-slate-300 rounded"
                />
                <div className="flex items-center gap-2">
                  <RotateCcw className="h-4 w-4 text-purple-500" />
                  <span className="text-sm font-semibold text-slate-700">
                    Permitir Recriação
                  </span>
                </div>
              </label>
              <p className="mt-1 text-xs text-slate-500 ml-7">
                Marque esta opção se o certificado pode ser recriado automaticamente
              </p>
            </div>
          </div>
        </form>

        <div className="border-t border-slate-200 px-6 py-4 bg-slate-50">
          <div className="flex justify-end gap-3">
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
              onClick={handleSubmit}
              disabled={loading}
              className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700"
            >
              {loading ? (
                <>
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  Salvando...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  {isEditing ? 'Atualizar' : 'Criar'} Certificado
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
