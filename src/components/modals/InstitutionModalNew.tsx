'use client'

import { useState, useEffect } from 'react'
import { X, Building2, Mail, Phone, MapPin, Calendar, Users, School, CheckCircle, XCircle, Save, Eye, Edit3, AlertCircle, Plus, Trash2, Search } from 'lucide-react'
import { InstitutionDto } from '@/types/institution'
import { SchoolDto } from '@/types/school'
import { schoolService } from '@/services/schoolService'

interface InstitutionModalProps {
  isOpen: boolean
  onClose: () => void
  onSave?: (data: any) => Promise<void>
  institution?: InstitutionDto | null
  mode: 'view' | 'create' | 'edit'
}

export function InstitutionModalNew({ isOpen, onClose, onSave, institution, mode }: InstitutionModalProps) {
  const [activeTab, setActiveTab] = useState('basic')
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    description: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    zip_code: '',
    website: '',
    logo_url: '',
    type: 'SCHOOL' as 'SCHOOL' | 'COLLEGE' | 'UNIVERSITY' | 'TECH_CENTER' | 'PUBLIC' | 'PRIVATE' | 'MIXED',
    is_active: true
  })
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  
  // Estados para a aba de escolas
  const [assignedSchools, setAssignedSchools] = useState<SchoolDto[]>([])
  const [availableSchools, setAvailableSchools] = useState<SchoolDto[]>([])
  const [schoolSearchTerm, setSchoolSearchTerm] = useState('')
  const [loadingSchools, setLoadingSchools] = useState(false)

  useEffect(() => {
    if (institution && (mode === 'edit' || mode === 'view')) {
      setFormData({
        name: institution.name || '',
        code: institution.code || '',
        description: institution.description || '',
        email: institution.email || '',
        phone: institution.phone || '',
        address: institution.address || '',
        city: institution.city || '',
        state: institution.state || '',
        zip_code: institution.zip_code || '',
        website: institution.website || '',
        logo_url: institution.logo_url || '',
        type: institution.type || 'SCHOOL',
        is_active: institution.is_active ?? true
      })
      
      // Carregar escolas da instituição
      if (mode === 'edit' || mode === 'view') {
        loadInstitutionSchools()
      }
    } else if (mode === 'create') {
      setFormData({
        name: '',
        code: '',
        description: '',
        email: '',
        phone: '',
        address: '',
        city: '',
        state: '',
        zip_code: '',
        website: '',
        logo_url: '',
        type: 'SCHOOL',
        is_active: true
      })
      setAssignedSchools([])
    }
    setErrors({}) // Limpar erros ao abrir modal
    
    // Carregar escolas disponíveis para atribuição
    loadAvailableSchools()
  }, [institution, mode, isOpen])

  const loadInstitutionSchools = async () => {
    if (!institution?.id) return
    
    setLoadingSchools(true)
    try {
      const response = await schoolService.getSchools({
        institution_id: institution.id,
        page: 1,
        limit: 1000
      })
      setAssignedSchools(response.items)
    } catch (error) {
      console.error('Erro ao carregar escolas da instituição:', error)
    } finally {
      setLoadingSchools(false)
    }
  }

  const loadAvailableSchools = async () => {
    try {
      const response = await schoolService.getSchools({
        page: 1,
        limit: 1000
      })
      
      // Se estivermos editando, filtrar escolas já atribuídas a outras instituições
      if (mode === 'edit' && institution?.id) {
        const unassignedSchools = response.items.filter(school => 
          !school.institution_id || school.institution_id === institution.id
        )
        setAvailableSchools(unassignedSchools)
      } else {
        // Para criação, mostrar apenas escolas sem instituição
        const unassignedSchools = response.items.filter(school => !school.institution_id)
        setAvailableSchools(unassignedSchools)
      }
    } catch (error) {
      console.error('Erro ao carregar escolas disponíveis:', error)
    }
  }

  const handleAssignSchool = async (school: SchoolDto) => {
    if (mode === 'view') return
    
    // Se estivermos no modo de criação, apenas adicionar à lista local
    if (mode === 'create') {
      setAssignedSchools(prev => [...prev, school])
      setAvailableSchools(prev => prev.filter(s => s.id !== school.id))
      return
    }

    // Se estivermos editando, fazer a atribuição via API
    try {
      await schoolService.updateSchool(Number(school.id), {
        ...school,
        institution_id: institution?.id || ''
      })
      
      setAssignedSchools(prev => [...prev, { ...school, institution_id: institution?.id || '' }])
      setAvailableSchools(prev => prev.filter(s => s.id !== school.id))
    } catch (error) {
      console.error('Erro ao atribuir escola:', error)
    }
  }

  const handleUnassignSchool = async (school: SchoolDto) => {
    if (mode === 'view') return
    
    // Se estivermos no modo de criação, apenas remover da lista local
    if (mode === 'create') {
      setAssignedSchools(prev => prev.filter(s => s.id !== school.id))
      setAvailableSchools(prev => [...prev, { ...school, institution_id: '' }])
      return
    }

    // Se estivermos editando, remover a atribuição via API
    try {
      await schoolService.updateSchool(Number(school.id), {
        ...school,
        institution_id: ''
      })
      
      setAssignedSchools(prev => prev.filter(s => s.id !== school.id))
      setAvailableSchools(prev => [...prev, { ...school, institution_id: '' }])
    } catch (error) {
      console.error('Erro ao desatribuir escola:', error)
    }
  }

  const filteredAvailableSchools = availableSchools.filter(school =>
    school.name.toLowerCase().includes(schoolSearchTerm.toLowerCase()) &&
    !assignedSchools.some(assigned => assigned.id === school.id)
  )

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (!formData.name.trim()) {
      newErrors.name = 'Nome é obrigatório'
    } else if (formData.name.length < 3) {
      newErrors.name = 'Nome deve ter pelo menos 3 caracteres'
    }

    if (!formData.code.trim()) {
      newErrors.code = 'Código é obrigatório'
    } else if (formData.code.length < 2) {
      newErrors.code = 'Código deve ter pelo menos 2 caracteres'
    }

    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Email inválido'
    }

    if (formData.phone && formData.phone.trim()) {
      const phoneRegex = /^\(\d{2}\)\s\d{4,5}-\d{4}$/;
      if (!phoneRegex.test(formData.phone)) {
        newErrors.phone = 'Telefone deve estar no formato (11) 99999-9999'
      }
    }

    if (formData.website && formData.website.trim()) {
      if (!/^https?:\/\/.+\..+/.test(formData.website)) {
        newErrors.website = 'Website deve ser uma URL válida (https://exemplo.com)'
      }
    }

    if (formData.zip_code && formData.zip_code.trim()) {
      if (!/^\d{5}-?\d{3}$/.test(formData.zip_code)) {
        newErrors.zip_code = 'CEP deve estar no formato 00000-000'
      }
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
        // Incluir escolas atribuídas nos dados para criação
        const dataToSave = {
          ...formData,
          assignedSchools: mode === 'create' ? assignedSchools : undefined
        }
        await onSave(dataToSave)
        
        // Se for criação e temos escolas para atribuir, fazer isso após a criação
        if (mode === 'create' && assignedSchools.length > 0) {
          // Note: Isso seria feito no componente pai após a criação da instituição
          console.log('Escolas a serem atribuídas após criação:', assignedSchools)
        }
      }
      onClose()
    } catch (error) {
      console.log('Erro ao salvar instituição:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (field: string, value: string | boolean) => {
    if (field === 'phone' && typeof value === 'string') {
      // Formatação automática do telefone
      let formattedPhone = value.replace(/\D/g, '');
      if (formattedPhone.length <= 11) {
        if (formattedPhone.length <= 10) {
          formattedPhone = formattedPhone.replace(/(\d{2})(\d)/, '($1) $2');
          formattedPhone = formattedPhone.replace(/(\d{4})(\d)/, '$1-$2');
        } else {
          formattedPhone = formattedPhone.replace(/(\d{2})(\d)/, '($1) $2');
          formattedPhone = formattedPhone.replace(/(\d{5})(\d)/, '$1-$2');
        }
      }
      
      setFormData(prev => ({
        ...prev,
        [field]: formattedPhone
      }));
    } else if (field === 'zip_code' && typeof value === 'string') {
      // Formatação automática do CEP
      let formattedZip = value.replace(/\D/g, '');
      if (formattedZip.length <= 8) {
        formattedZip = formattedZip.replace(/(\d{5})(\d)/, '$1-$2');
      }
      
      setFormData(prev => ({
        ...prev,
        [field]: formattedZip
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [field]: value
      }));
    }
    
    // Limpar erro do campo se existir
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
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
      case 'view': return 'text-blue-600'
      case 'create': return 'text-green-600'
      case 'edit': return 'text-orange-600'
      default: return 'text-blue-600'
    }
  }

  const getModalGradient = () => {
    switch (mode) {
      case 'view': return 'from-blue-50 to-blue-100 border-blue-200'
      case 'create': return 'from-green-50 to-green-100 border-green-200'
      case 'edit': return 'from-orange-50 to-orange-100 border-orange-200'
      default: return 'from-blue-50 to-blue-100 border-blue-200'
    }
  }

  const getInstitutionTypeLabel = (type: string) => {
    switch (type) {
      case 'SCHOOL': return 'Escola'
      case 'COLLEGE': return 'Faculdade'
      case 'UNIVERSITY': return 'Universidade'
      case 'TECH_CENTER': return 'Centro Técnico'
      case 'PUBLIC': return 'Pública'
      case 'PRIVATE': return 'Privada'
      case 'MIXED': return 'Mista'
      default: return type
    }
  }

  if (!isOpen) return null

  const ModalIcon = getModalIcon()

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-1 sm:p-2 md:p-4 overflow-hidden">
      <div className="bg-white rounded-xl sm:rounded-2xl shadow-2xl w-full max-w-6xl h-full max-h-[98vh] sm:max-h-[95vh] flex flex-col animate-in fade-in-0 zoom-in-95 duration-200">
        {/* Header */}
        <div className={`flex items-center justify-between p-3 sm:p-4 md:p-6 border-b border-gray-200 bg-gradient-to-r ${getModalGradient()} flex-shrink-0`}>
          <div className="flex items-center space-x-2 sm:space-x-3 min-w-0 flex-1">
            <div className={`p-2 sm:p-3 rounded-lg sm:rounded-xl bg-white shadow-lg border-2 ${mode === 'view' ? 'border-blue-200' : mode === 'create' ? 'border-green-200' : 'border-orange-200'} flex-shrink-0`}>
              <ModalIcon className={`w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 ${getModalColor()}`} />
            </div>
            <div className="min-w-0 flex-1">
              <h2 className="text-base sm:text-lg md:text-xl font-bold text-gray-900 truncate">{getModalTitle()}</h2>
              <p className="text-xs sm:text-sm text-gray-600 hidden md:block">
                {mode === 'view' ? 'Visualize os detalhes da instituição' :
                 mode === 'create' ? 'Preencha os dados da nova instituição' :
                 'Edite os dados da instituição'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 sm:p-2 hover:bg-gray-100 rounded-lg transition-colors flex-shrink-0 ml-2"
            aria-label="Fechar modal"
          >
            <X className="w-4 h-4 sm:w-5 sm:h-5 text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto min-h-0">
          {/* Tabs */}
          {(mode === 'create' || mode === 'edit') && (
            <div className="border-b border-gray-200 bg-gray-50">
              <nav className="flex space-x-4 px-3 sm:px-4 md:px-6" aria-label="Tabs">
                <button
                  type="button"
                  onClick={() => setActiveTab('basic')}
                  className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === 'basic'
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Building2 className="w-4 h-4 mr-2 inline" />
                  Informações Básicas
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('schools')}
                  className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === 'schools'
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <School className="w-4 h-4 mr-2 inline" />
                  Escolas ({assignedSchools.length})
                </button>
              </nav>
            </div>
          )}

          <form onSubmit={handleSubmit} className="p-3 sm:p-4 md:p-6">
            {/* Aba Informações Básicas */}
            {(activeTab === 'basic' || mode === 'view') && (
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-3 sm:gap-4 md:gap-6">
                {/* Informações Básicas */}
                <div className="space-y-3 sm:space-y-4 md:space-y-6">
                  <div className="bg-blue-50 p-2.5 sm:p-3 md:p-4 rounded-lg sm:rounded-xl border border-blue-200">
                    <h3 className="text-sm sm:text-base md:text-lg font-semibold text-blue-900 mb-2.5 sm:mb-3 md:mb-4 flex items-center">
                      <Building2 className="w-4 h-4 sm:w-5 sm:h-5 mr-2 flex-shrink-0" />
                      <span className="truncate">Informações Básicas</span>
                    </h3>
                  
                  <div className="space-y-2.5 sm:space-y-3 md:space-y-4">
                    {/* Nome */}
                    <div>
                      <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5 sm:mb-2">
                        Nome da Instituição *
                      </label>
                      {mode === 'view' ? (
                        <div className="p-2.5 sm:p-3 bg-white rounded-lg border border-gray-200 text-gray-900 text-sm sm:text-base">
                          {formData.name || 'Não informado'}
                        </div>
                      ) : (
                        <input
                          type="text"
                          value={formData.name}
                          onChange={(e) => handleInputChange('name', e.target.value)}
                          className={`w-full p-2.5 sm:p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-sm sm:text-base ${
                            errors.name ? 'border-red-500 bg-red-50' : 'border-gray-300'
                          }`}
                          placeholder="Ex: Universidade Federal de São Paulo"
                        />
                      )}
                      {errors.name && (
                        <div className="flex items-center mt-1 text-red-500 text-xs sm:text-sm">
                          <AlertCircle className="w-3 h-3 sm:w-4 sm:h-4 mr-1 flex-shrink-0" />
                          <span className="break-words">{errors.name}</span>
                        </div>
                      )}
                    </div>

                    {/* Código */}
                    <div>
                      <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5 sm:mb-2">
                        Código da Instituição *
                      </label>
                      {mode === 'view' ? (
                        <div className="p-2.5 sm:p-3 bg-white rounded-lg border border-gray-200 text-gray-900 font-mono text-sm sm:text-base">
                          {formData.code || 'Não informado'}
                        </div>
                      ) : (
                        <input
                          type="text"
                          value={formData.code}
                          onChange={(e) => handleInputChange('code', e.target.value.toUpperCase())}
                          className={`w-full p-2.5 sm:p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono transition-all text-sm sm:text-base ${
                            errors.code ? 'border-red-500 bg-red-50' : 'border-gray-300'
                          }`}
                          placeholder="Ex: UNIFESP"
                        />
                      )}
                      {errors.code && (
                        <div className="flex items-center mt-1 text-red-500 text-xs sm:text-sm">
                          <AlertCircle className="w-3 h-3 sm:w-4 sm:h-4 mr-1 flex-shrink-0" />
                          <span className="break-words">{errors.code}</span>
                        </div>
                      )}
                    </div>

                    {/* Tipo */}
                    <div>
                      <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5 sm:mb-2">
                        Tipo de Instituição
                      </label>
                      {mode === 'view' ? (
                        <div className="p-2.5 sm:p-3 bg-white rounded-lg border border-gray-200 text-gray-900 text-sm sm:text-base">
                          {getInstitutionTypeLabel(formData.type)}
                        </div>
                      ) : (
                        <select
                          value={formData.type}
                          onChange={(e) => handleInputChange('type', e.target.value)}
                          className="w-full p-2.5 sm:p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
                        >
                          <option value="SCHOOL">Escola</option>
                          <option value="COLLEGE">Faculdade</option>
                          <option value="UNIVERSITY">Universidade</option>
                          <option value="TECH_CENTER">Centro Técnico</option>
                          <option value="PUBLIC">Pública</option>
                          <option value="PRIVATE">Privada</option>
                          <option value="MIXED">Mista</option>
                        </select>
                      )}
                    </div>

                    {/* Descrição */}
                    <div>
                      <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5 sm:mb-2">
                        Descrição
                      </label>
                      {mode === 'view' ? (
                        <div className="p-2.5 sm:p-3 bg-white rounded-lg border border-gray-200 text-gray-900 min-h-[60px] sm:min-h-[80px] text-sm sm:text-base">
                          {formData.description || 'Não informado'}
                        </div>
                      ) : (
                        <textarea
                          value={formData.description}
                          onChange={(e) => handleInputChange('description', e.target.value)}
                          rows={2}
                          className="w-full p-2.5 sm:p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none text-sm sm:text-base"
                          placeholder="Descreva a instituição..."
                        />
                      )}
                    </div>

                    {/* Status */}
                    <div>
                      <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5 sm:mb-2">
                        Status
                      </label>
                      {mode === 'view' ? (
                        <div className="flex items-center space-x-2">
                          {formData.is_active ? (
                            <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-green-600 flex-shrink-0" />
                          ) : (
                            <XCircle className="w-4 h-4 sm:w-5 sm:h-5 text-red-600 flex-shrink-0" />
                          )}
                          <span className={`font-medium text-sm sm:text-base ${formData.is_active ? 'text-green-600' : 'text-red-600'}`}>
                            {formData.is_active ? 'Ativa' : 'Inativa'}
                          </span>
                        </div>
                      ) : (
                        <div className="flex items-center space-x-3">
                          <label className="flex items-center cursor-pointer">
                            <input
                              type="checkbox"
                              checked={formData.is_active}
                              onChange={(e) => handleInputChange('is_active', e.target.checked)}
                              className="sr-only"
                            />
                            <div className={`relative w-10 h-5 sm:w-12 sm:h-6 rounded-full transition-colors ${
                              formData.is_active ? 'bg-green-500' : 'bg-gray-300'
                            }`}>
                              <div className={`absolute top-0.5 left-0.5 sm:top-1 sm:left-1 w-4 h-4 bg-white rounded-full transition-transform ${
                                formData.is_active ? 'translate-x-5 sm:translate-x-6' : 'translate-x-0'
                              }`} />
                            </div>
                            <span className="ml-3 text-xs sm:text-sm font-medium text-gray-700">
                              {formData.is_active ? 'Ativa' : 'Inativa'}
                            </span>
                          </label>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Contato e Localização */}
                <div className="space-y-3 sm:space-y-4 md:space-y-6">
                <div className="bg-green-50 p-2.5 sm:p-3 md:p-4 rounded-lg sm:rounded-xl border border-green-200">
                  <h3 className="text-sm sm:text-base md:text-lg font-semibold text-green-900 mb-2.5 sm:mb-3 md:mb-4 flex items-center">
                    <Phone className="w-4 h-4 sm:w-5 sm:h-5 mr-2 flex-shrink-0" />
                    <span className="truncate">Contato e Localização</span>
                  </h3>
                  
                  <div className="space-y-2.5 sm:space-y-3 md:space-y-4">
                    {/* Email */}
                    <div>
                      <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5 sm:mb-2">
                        Email
                      </label>
                      {mode === 'view' ? (
                        <div className="p-2.5 sm:p-3 bg-white rounded-lg border border-gray-200 text-gray-900 break-all text-sm sm:text-base">
                          {formData.email || 'Não informado'}
                        </div>
                      ) : (
                        <input
                          type="email"
                          value={formData.email}
                          onChange={(e) => handleInputChange('email', e.target.value)}
                          className={`w-full p-2.5 sm:p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-sm sm:text-base ${
                            errors.email ? 'border-red-500 bg-red-50' : 'border-gray-300'
                          }`}
                          placeholder="contato@instituicao.edu.br"
                        />
                      )}
                      {errors.email && (
                        <div className="flex items-center mt-1 text-red-500 text-xs sm:text-sm">
                          <AlertCircle className="w-3 h-3 sm:w-4 sm:h-4 mr-1 flex-shrink-0" />
                          <span className="break-words">{errors.email}</span>
                        </div>
                      )}
                    </div>

                    {/* Telefone */}
                    <div>
                      <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5 sm:mb-2">
                        Telefone
                      </label>
                      {mode === 'view' ? (
                        <div className="p-2.5 sm:p-3 bg-white rounded-lg border border-gray-200 text-gray-900 text-sm sm:text-base">
                          {formData.phone || 'Não informado'}
                        </div>
                      ) : (
                        <input
                          type="tel"
                          value={formData.phone}
                          onChange={(e) => handleInputChange('phone', e.target.value)}
                          className={`w-full p-2.5 sm:p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-sm sm:text-base ${
                            errors.phone ? 'border-red-500 bg-red-50' : 'border-gray-300'
                          }`}
                          placeholder="(11) 99999-9999"
                        />
                      )}
                      {errors.phone && (
                        <div className="flex items-center mt-1 text-red-500 text-xs sm:text-sm">
                          <AlertCircle className="w-3 h-3 sm:w-4 sm:h-4 mr-1 flex-shrink-0" />
                          <span className="break-words">{errors.phone}</span>
                        </div>
                      )}
                    </div>

                    {/* Website */}
                    <div>
                      <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5 sm:mb-2">
                        Website
                      </label>
                      {mode === 'view' ? (
                        <div className="p-2.5 sm:p-3 bg-white rounded-lg border border-gray-200 text-gray-900 break-all text-sm sm:text-base">
                          {formData.website ? (
                            <a href={formData.website} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800 underline">
                              {formData.website}
                            </a>
                          ) : (
                            'Não informado'
                          )}
                        </div>
                      ) : (
                        <input
                          type="url"
                          value={formData.website}
                          onChange={(e) => handleInputChange('website', e.target.value)}
                          className={`w-full p-2.5 sm:p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-sm sm:text-base ${
                            errors.website ? 'border-red-500 bg-red-50' : 'border-gray-300'
                          }`}
                          placeholder="https://www.instituicao.edu.br"
                        />
                      )}
                      {errors.website && (
                        <div className="flex items-center mt-1 text-red-500 text-xs sm:text-sm">
                          <AlertCircle className="w-3 h-3 sm:w-4 sm:h-4 mr-1 flex-shrink-0" />
                          <span className="break-words">{errors.website}</span>
                        </div>
                      )}
                    </div>

                    {/* Endereço */}
                    <div>
                      <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5 sm:mb-2">
                        Endereço
                      </label>
                      {mode === 'view' ? (
                        <div className="p-2.5 sm:p-3 bg-white rounded-lg border border-gray-200 text-gray-900 text-sm sm:text-base">
                          {formData.address || 'Não informado'}
                        </div>
                      ) : (
                        <input
                          type="text"
                          value={formData.address}
                          onChange={(e) => handleInputChange('address', e.target.value)}
                          className="w-full p-2.5 sm:p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
                          placeholder="Rua, número, complemento"
                        />
                      )}
                    </div>

                    {/* Cidade e Estado */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3 md:gap-4">
                      <div>
                        <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5 sm:mb-2">
                          Cidade
                        </label>
                        {mode === 'view' ? (
                          <div className="p-2.5 sm:p-3 bg-white rounded-lg border border-gray-200 text-gray-900 text-sm sm:text-base">
                            {formData.city || 'Não informado'}
                          </div>
                        ) : (
                          <input
                            type="text"
                            value={formData.city}
                            onChange={(e) => handleInputChange('city', e.target.value)}
                            className="w-full p-2.5 sm:p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
                            placeholder="São Paulo"
                          />
                        )}
                      </div>

                      <div>
                        <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5 sm:mb-2">
                          Estado
                        </label>
                        {mode === 'view' ? (
                          <div className="p-2.5 sm:p-3 bg-white rounded-lg border border-gray-200 text-gray-900 text-sm sm:text-base">
                            {formData.state || 'Não informado'}
                          </div>
                        ) : (
                          <input
                            type="text"
                            value={formData.state}
                            onChange={(e) => handleInputChange('state', e.target.value.toUpperCase())}
                            className="w-full p-2.5 sm:p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
                            placeholder="SP"
                            maxLength={2}
                          />
                        )}
                      </div>
                    </div>

                    {/* CEP */}
                    <div>
                      <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5 sm:mb-2">
                        CEP
                      </label>
                      {mode === 'view' ? (
                        <div className="p-2.5 sm:p-3 bg-white rounded-lg border border-gray-200 text-gray-900 font-mono text-sm sm:text-base">
                          {formData.zip_code || 'Não informado'}
                        </div>
                      ) : (
                        <input
                          type="text"
                          value={formData.zip_code}
                          onChange={(e) => handleInputChange('zip_code', e.target.value)}
                          className={`w-full p-2.5 sm:p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono transition-all text-sm sm:text-base ${
                            errors.zip_code ? 'border-red-500 bg-red-50' : 'border-gray-300'
                          }`}
                          placeholder="00000-000"
                          maxLength={9}
                        />
                      )}
                      {errors.zip_code && (
                        <div className="flex items-center mt-1 text-red-500 text-xs sm:text-sm">
                          <AlertCircle className="w-3 h-3 sm:w-4 sm:h-4 mr-1 flex-shrink-0" />
                          <span className="break-words">{errors.zip_code}</span>
                        </div>
                      )}
                    </div>

                    {/* Logo URL */}
                    <div>
                      <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5 sm:mb-2">
                        URL do Logo
                      </label>
                      {mode === 'view' ? (
                        <div className="p-2.5 sm:p-3 bg-white rounded-lg border border-gray-200 text-gray-900 break-all text-sm sm:text-base">
                          {formData.logo_url ? (
                            <a href={formData.logo_url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800 underline">
                              {formData.logo_url}
                            </a>
                          ) : (
                            'Não informado'
                          )}
                        </div>
                      ) : (
                        <input
                          type="url"
                          value={formData.logo_url}
                          onChange={(e) => handleInputChange('logo_url', e.target.value)}
                          className="w-full p-2.5 sm:p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
                          placeholder="https://exemplo.com/logo.png"
                        />
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
            )}

            {/* Aba Escolas */}
            {activeTab === 'schools' && (mode === 'create' || mode === 'edit') && (
              <div className="space-y-6">
                {/* Escolas Atribuídas */}
                <div className="bg-green-50 p-4 rounded-xl border border-green-200">
                  <h3 className="text-lg font-semibold text-green-900 mb-4 flex items-center">
                    <School className="w-5 h-5 mr-2" />
                    Escolas Atribuídas ({assignedSchools.length})
                  </h3>
                  
                  {loadingSchools ? (
                    <div className="flex items-center justify-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
                    </div>
                  ) : assignedSchools.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {assignedSchools.map((school) => (
                        <div
                          key={school.id}
                          className="bg-white rounded-lg p-4 border border-green-200 shadow-sm"
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex-1">
                              <h4 className="font-medium text-gray-900">{school.name}</h4>
                              <p className="text-sm text-gray-500">ID: {school.id}</p>
                              {school.students_count !== undefined && (
                                <p className="text-xs text-gray-400">
                                  {school.students_count} estudantes • {school.teachers_count} professores
                                </p>
                              )}
                            </div>
                            <button
                              type="button"
                              onClick={() => handleUnassignSchool(school)}
                              className="ml-3 p-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg transition-colors"
                              title="Remover escola"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <School className="mx-auto h-12 w-12 text-gray-400" />
                      <h4 className="mt-2 text-sm font-medium text-gray-900">Nenhuma escola atribuída</h4>
                      <p className="mt-1 text-sm text-gray-500">
                        Selecione escolas da lista abaixo para atribuir a esta instituição.
                      </p>
                    </div>
                  )}
                </div>

                {/* Escolas Disponíveis */}
                <div className="bg-blue-50 p-4 rounded-xl border border-blue-200">
                  <h3 className="text-lg font-semibold text-blue-900 mb-4 flex items-center">
                    <Plus className="w-5 h-5 mr-2" />
                    Escolas Disponíveis
                  </h3>
                  
                  {/* Busca */}
                  <div className="mb-4">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                      <input
                        type="text"
                        placeholder="Buscar escolas..."
                        value={schoolSearchTerm}
                        onChange={(e) => setSchoolSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                  </div>

                  {/* Lista de Escolas Disponíveis */}
                  {filteredAvailableSchools.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-96 overflow-y-auto">
                      {filteredAvailableSchools.map((school) => (
                        <div
                          key={school.id}
                          className="bg-white rounded-lg p-4 border border-blue-200 shadow-sm hover:shadow-md transition-shadow"
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex-1">
                              <h4 className="font-medium text-gray-900">{school.name}</h4>
                              <p className="text-sm text-gray-500">ID: {school.id}</p>
                              {school.students_count !== undefined && (
                                <p className="text-xs text-gray-400">
                                  {school.students_count} estudantes • {school.teachers_count} professores
                                </p>
                              )}
                            </div>
                            <button
                              type="button"
                              onClick={() => handleAssignSchool(school)}
                              className="ml-3 p-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition-colors"
                              title="Atribuir escola"
                            >
                              <Plus className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <Search className="mx-auto h-12 w-12 text-gray-400" />
                      <h4 className="mt-2 text-sm font-medium text-gray-900">
                        {schoolSearchTerm ? 'Nenhuma escola encontrada' : 'Nenhuma escola disponível'}
                      </h4>
                      <p className="mt-1 text-sm text-gray-500">
                        {schoolSearchTerm 
                          ? 'Tente ajustar os termos de busca.' 
                          : 'Todas as escolas já estão atribuídas a instituições.'}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </form>
        </div>

        {/* Footer */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-end space-y-2 sm:space-y-0 sm:space-x-3 p-3 sm:p-4 md:p-6 border-t border-gray-200 bg-gray-50 flex-shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="w-full sm:w-auto px-4 sm:px-6 py-2 sm:py-2.5 text-sm sm:text-base text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            {mode === 'view' ? 'Fechar' : 'Cancelar'}
          </button>
          
          {mode !== 'view' && (
            <button
              type="submit"
              onClick={handleSubmit}
              disabled={loading}
              className={`w-full sm:w-auto px-4 sm:px-6 py-2 sm:py-2.5 text-sm sm:text-base text-white rounded-lg transition-colors flex items-center justify-center space-x-2 ${
                mode === 'create' 
                  ? 'bg-green-600 hover:bg-green-700' 
                  : 'bg-orange-600 hover:bg-orange-700'
              } ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {loading ? (
                <div className="animate-spin rounded-full h-3 w-3 sm:h-4 sm:w-4 border-b-2 border-white"></div>
              ) : (
                <Save className="w-3 h-3 sm:w-4 sm:h-4" />
              )}
              <span className="truncate">{loading ? 'Salvando...' : mode === 'create' ? 'Criar Instituição' : 'Salvar Alterações'}</span>
            </button>
          )}
        </div>
      </div>
    </div>
  )
} 