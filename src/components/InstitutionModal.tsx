'use client'

import { useState, useEffect } from 'react'
import { X, Building2, Mail, Phone, MapPin, Calendar, Users, School, CheckCircle, XCircle, Save, Eye, Edit3 } from 'lucide-react'
import { InstitutionResponseDto } from '@/types/api'

interface InstitutionModalProps {
  isOpen: boolean
  onClose: () => void
  onSave?: (data: any) => Promise<void>
  institution?: InstitutionResponseDto | null
  mode: 'view' | 'create' | 'edit'
}

export function InstitutionModal({ isOpen, onClose, onSave, institution, mode }: InstitutionModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    description: '',
    email: '',
    phone: '',
    address: '',
    active: true
  })
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    if (institution && (mode === 'edit' || mode === 'view')) {
      setFormData({
        name: institution.name || '',
        code: institution.code || '',
        description: institution.description || '',
        email: institution.email || '',
        phone: institution.phone || '',
        address: typeof institution.address === 'string' ? institution.address : '',
        active: institution.active ?? true
      })
    } else if (mode === 'create') {
      setFormData({
        name: '',
        code: '',
        description: '',
        email: '',
        phone: '',
        address: '',
        active: true
      })
    }
  }, [institution, mode])

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (!formData.name.trim()) {
      newErrors.name = 'Nome é obrigatório'
    }

    if (!formData.code.trim()) {
      newErrors.code = 'Código é obrigatório'
    }

    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Email inválido'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (mode === 'view') return
    
    if (!validateForm()) {
      return
    }

    setLoading(true)
    try {
      if (onSave) {
        await onSave(formData)
      }
      onClose()
    } catch (error) {
      console.error('Erro ao salvar instituição:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
    
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }))
    }
  }

  const getModalTitle = () => {
    switch (mode) {
      case 'view': return 'Visualizar Instituição'
      case 'create': return 'Nova Instituição'
      case 'edit': return 'Editar Instituição'
      default: return 'Instituição'
    }
  }

  const getModalIcon = () => {
    switch (mode) {
      case 'view': return Eye
      case 'create': return Building2
      case 'edit': return Edit3
      default: return Building2
    }
  }

  const getModalColor = () => {
    switch (mode) {
      case 'view': return 'from-blue-500 to-blue-600'
      case 'create': return 'from-green-500 to-green-600'
      case 'edit': return 'from-orange-500 to-orange-600'
      default: return 'from-blue-500 to-blue-600'
    }
  }

  if (!isOpen) return null

  const ModalIcon = getModalIcon()

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className={`bg-gradient-to-r ${getModalColor()} text-white p-6`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="bg-white/20 rounded-xl p-3">
                <ModalIcon className="w-8 h-8" />
              </div>
              <div>
                <h2 className="text-2xl font-bold">{getModalTitle()}</h2>
                <p className="text-white/80">
                  {mode === 'view' && institution ? `Código: ${institution.code}` : 
                   mode === 'create' ? 'Criar nova instituição no sistema' :
                   mode === 'edit' && institution ? `Editando: ${institution.name}` : ''}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-white/80 hover:text-white hover:bg-white/20 rounded-lg p-2 transition-all"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
          {mode === 'view' && institution ? (
            // View Mode
            <div className="space-y-6">
              {/* Institution Info Card */}
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-6 border border-blue-200">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-blue-900 flex items-center">
                    <Building2 className="w-5 h-5 mr-2" />
                    Informações Básicas
                  </h3>
                  <div className="flex items-center">
                    {institution.active ? (
                      <div className="flex items-center text-green-600">
                        <CheckCircle className="w-5 h-5 mr-1" />
                        <span className="text-sm font-medium">Ativa</span>
                      </div>
                    ) : (
                      <div className="flex items-center text-red-600">
                        <XCircle className="w-5 h-5 mr-1" />
                        <span className="text-sm font-medium">Inativa</span>
                      </div>
                    )}
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-blue-700">Nome</label>
                    <p className="text-blue-900 font-semibold">{institution.name}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-blue-700">Código</label>
                    <p className="text-blue-900 font-semibold">{institution.code}</p>
                  </div>
                </div>
                {institution.description && (
                  <div className="mt-4">
                    <label className="text-sm font-medium text-blue-700">Descrição</label>
                    <p className="text-blue-900">{institution.description}</p>
                  </div>
                )}
              </div>

              {/* Contact Info */}
              {(institution.email || institution.phone || institution.address) && (
                <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-6 border border-green-200">
                  <h3 className="text-lg font-semibold text-green-900 mb-4 flex items-center">
                    <Mail className="w-5 h-5 mr-2" />
                    Informações de Contato
                  </h3>
                  <div className="space-y-3">
                    {institution.email && (
                      <div className="flex items-center">
                        <Mail className="w-4 h-4 text-green-600 mr-3" />
                        <span className="text-green-900">{institution.email}</span>
                      </div>
                    )}
                    {institution.phone && (
                      <div className="flex items-center">
                        <Phone className="w-4 h-4 text-green-600 mr-3" />
                        <span className="text-green-900">{institution.phone}</span>
                      </div>
                    )}
                    {institution.address && (
                      <div className="flex items-center">
                        <MapPin className="w-4 h-4 text-green-600 mr-3" />
                        <span className="text-green-900">{typeof institution.address === 'string' ? institution.address : 'Endereço não disponível'}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Statistics */}
              <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-6 border border-purple-200">
                <h3 className="text-lg font-semibold text-purple-900 mb-4 flex items-center">
                  <Users className="w-5 h-5 mr-2" />
                  Estatísticas
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center">
                    <div className="bg-white rounded-lg p-4 shadow-sm">
                      <School className="w-8 h-8 text-purple-600 mx-auto mb-2" />
                      <p className="text-2xl font-bold text-purple-900">{Math.floor(Math.random() * 10) + 1}</p>
                      <p className="text-sm text-purple-600">Escolas</p>
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="bg-white rounded-lg p-4 shadow-sm">
                      <Users className="w-8 h-8 text-purple-600 mx-auto mb-2" />
                      <p className="text-2xl font-bold text-purple-900">{institution.users_count || 0}</p>
                      <p className="text-sm text-purple-600">Usuários</p>
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="bg-white rounded-lg p-4 shadow-sm">
                      <Calendar className="w-8 h-8 text-purple-600 mx-auto mb-2" />
                      <p className="text-2xl font-bold text-purple-900">{institution.courses_count || 0}</p>
                      <p className="text-sm text-purple-600">Cursos</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Timestamps */}
              <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
                  <div>
                    <span className="font-medium">Criado em:</span> {new Date(institution.created_at).toLocaleDateString('pt-BR')}
                  </div>
                  <div>
                    <span className="font-medium">Atualizado em:</span> {new Date(institution.updated_at).toLocaleDateString('pt-BR')}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            // Create/Edit Mode
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Basic Information */}
              <div className="bg-gray-50 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <Building2 className="w-5 h-5 mr-2" />
                  Informações Básicas
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Nome da Instituição *
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => handleInputChange('name', e.target.value)}
                      className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                        errors.name ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="Ex: Universidade Federal de São Paulo"
                    />
                    {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Código *
                    </label>
                    <input
                      type="text"
                      value={formData.code}
                      onChange={(e) => handleInputChange('code', e.target.value)}
                      className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                        errors.code ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="Ex: UNIFESP"
                    />
                    {errors.code && <p className="text-red-500 text-sm mt-1">{errors.code}</p>}
                  </div>
                </div>

                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Descrição
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    rows={3}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    placeholder="Descrição da instituição..."
                  />
                </div>
              </div>

              {/* Contact Information */}
              <div className="bg-gray-50 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <Mail className="w-5 h-5 mr-2" />
                  Informações de Contato
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email
                    </label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                        errors.email ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="email@instituicao.com"
                    />
                    {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Telefone
                    </label>
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => handleInputChange('phone', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                      placeholder="(11) 99999-9999"
                    />
                  </div>
                </div>

                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Endereço
                  </label>
                  <textarea
                    value={formData.address}
                    onChange={(e) => handleInputChange('address', e.target.value)}
                    rows={2}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    placeholder="Endereço completo da instituição..."
                  />
                </div>
              </div>

              {/* Status */}
              <div className="bg-gray-50 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Status</h3>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="active"
                    checked={formData.active}
                    onChange={(e) => handleInputChange('active', e.target.checked)}
                    className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <label htmlFor="active" className="ml-2 text-sm font-medium text-gray-700">
                    Instituição ativa
                  </label>
                </div>
              </div>
            </form>
          )}
        </div>

        {/* Footer */}
        <div className="bg-gray-50 px-6 py-4 border-t border-gray-200">
          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              {mode === 'view' ? 'Fechar' : 'Cancelar'}
            </button>
            {mode !== 'view' && (
              <button
                type="submit"
                onClick={handleSubmit}
                disabled={loading}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Salvando...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    {mode === 'create' ? 'Criar Instituição' : 'Salvar Alterações'}
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
} 