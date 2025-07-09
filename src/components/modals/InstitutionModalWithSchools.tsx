'use client'

import { useState, useEffect } from 'react'
import { X, Building2, School, CheckCircle, XCircle, Save, Eye, Edit3, AlertCircle, Plus, Trash2, Search, Users, MapPin, Calendar } from 'lucide-react'
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

export function InstitutionModalWithSchools({ isOpen, onClose, onSave, institution, mode }: InstitutionModalProps) {
  const [activeTab, setActiveTab] = useState('basic')
  const [formData, setFormData] = useState({
    name: '',
    company_name: '',
    document: '',
    accountable_contact: '',
    accountable_name: '',
    code: '',
    description: '',
    email: '',
    phone: '',
    street: '',
    complement: '',
    district: '',
    city: '',
    state: '',
    postal_code: '',
    website: '',
    logo_url: '',
    contract_num: '',
    contract_invoice_num: '',
    contract_term_start: '',
    contract_term_end: '',
    contract_disabled: false,
    has_library_platform: false,
    has_principal_platform: false,
    has_student_platform: false,
    score: '',
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
        company_name: institution.company_name || '',
        document: institution.document || '',
        accountable_contact: institution.accountable_contact || '',
        accountable_name: institution.accountable_name || '',
        code: institution.code || '',
        description: institution.description || '',
        email: institution.email || '',
        phone: institution.phone || '',
        street: institution.street || '',
        complement: institution.complement || '',
        district: institution.district || '',
        city: institution.city || '',
        state: institution.state || '',
        postal_code: institution.postal_code || '',
        website: institution.website || '',
        logo_url: institution.logo_url || '',
        contract_num: institution.contract_num?.toString() || '',
        contract_invoice_num: institution.contract_invoice_num || '',
        contract_term_start: institution.contract_term_start ? new Date(institution.contract_term_start).toISOString().split('T')[0] : '',
        contract_term_end: institution.contract_term_end ? new Date(institution.contract_term_end).toISOString().split('T')[0] : '',
        contract_disabled: institution.contract_disabled ?? false,
        has_library_platform: institution.has_library_platform ?? false,
        has_principal_platform: institution.has_principal_platform ?? false,
        has_student_platform: institution.has_student_platform ?? false,
        score: institution.score?.toString() || '',
        type: institution.type || 'SCHOOL',
        is_active: institution.is_active ?? true
      })
      
      // Carregar escolas da instituição
      loadInstitutionSchools()
    } else if (mode === 'create') {
      setFormData({
        name: '',
        company_name: '',
        document: '',
        accountable_contact: '',
        accountable_name: '',
        code: '',
        description: '',
        email: '',
        phone: '',
        street: '',
        complement: '',
        district: '',
        city: '',
        state: '',
        postal_code: '',
        website: '',
        logo_url: '',
        contract_num: '',
        contract_invoice_num: '',
        contract_term_start: '',
        contract_term_end: '',
        contract_disabled: false,
        has_library_platform: false,
        has_principal_platform: false,
        has_student_platform: false,
        score: '',
        type: 'SCHOOL',
        is_active: true
      })
      setAssignedSchools([])
    }
    setErrors({})
    
    // Carregar escolas disponíveis para atribuição
    if (mode !== 'view') {
      loadAvailableSchools()
    }
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

    if (!formData.company_name.trim()) {
      newErrors.company_name = 'Nome da empresa é obrigatório'
    }

    if (!formData.document.trim()) {
      newErrors.document = 'CNPJ é obrigatório'
    }

    if (!formData.accountable_name.trim()) {
      newErrors.accountable_name = 'Nome do responsável é obrigatório'
    }

    if (!formData.accountable_contact.trim()) {
      newErrors.accountable_contact = 'Contato do responsável é obrigatório'
    }

    if (!formData.street.trim()) {
      newErrors.street = 'Rua é obrigatória'
    }

    if (!formData.district.trim()) {
      newErrors.district = 'Bairro é obrigatório'
    }

    if (!formData.city.trim()) {
      newErrors.city = 'Cidade é obrigatória'
    }

    if (!formData.state.trim()) {
      newErrors.state = 'Estado é obrigatório'
    }

    if (!formData.postal_code.trim()) {
      newErrors.postal_code = 'CEP é obrigatório'
    }

    if (!formData.contract_term_start.trim()) {
      newErrors.contract_term_start = 'Data de início do contrato é obrigatória'
    }

    if (!formData.contract_term_end.trim()) {
      newErrors.contract_term_end = 'Data de fim do contrato é obrigatória'
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
        // Incluir escolas atribuídas nos dados para criação
        const dataToSave = {
          ...formData,
          assignedSchools: mode === 'create' ? assignedSchools : undefined
        }
        await onSave(dataToSave)
      }
      onClose()
    } catch (error) {
      console.log('Erro ao salvar instituição:', error)
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

  if (!isOpen) return null

  const ModalIcon = getModalIcon()

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-hidden">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-6xl h-full max-h-[95vh] flex flex-col animate-in fade-in-0 zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-blue-100 flex-shrink-0">
          <div className="flex items-center space-x-3 min-w-0 flex-1">
            <div className="p-3 rounded-xl bg-white shadow-lg border-2 border-blue-200 flex-shrink-0">
              <ModalIcon className="w-6 h-6 text-blue-600" />
            </div>
            <div className="min-w-0 flex-1">
              <h2 className="text-xl font-bold text-gray-900 truncate">{getModalTitle()}</h2>
              <p className="text-sm text-gray-600">
                {mode === 'view' ? 'Visualize os detalhes da instituição' :
                 mode === 'create' ? 'Preencha os dados da nova instituição' :
                 'Edite os dados da instituição'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors flex-shrink-0 ml-2"
            aria-label="Fechar modal"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Tabs */}
        {(mode === 'create' || mode === 'edit') && (
          <div className="border-b border-gray-200 bg-gray-50 flex-shrink-0">
            <nav className="flex space-x-4 px-6" aria-label="Tabs">
              <button
                type="button"
                onClick={() => setActiveTab('basic')}
                className={`py-3 px-1 border-b-2 font-medium text-sm transition-colors ${
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
                className={`py-3 px-1 border-b-2 font-medium text-sm transition-colors ${
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

        {/* Content */}
        <div className="flex-1 overflow-y-auto min-h-0">
          <form onSubmit={handleSubmit} className="p-6">
            {/* Aba Informações Básicas */}
            {(activeTab === 'basic' || mode === 'view') && (
              <div className="space-y-6">
                {/* Informações Gerais */}
                <div className="bg-blue-50 p-4 rounded-xl border border-blue-200">
                  <h3 className="text-lg font-semibold text-blue-900 mb-4 flex items-center">
                    <Building2 className="w-5 h-5 mr-2" />
                    Informações Gerais
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Nome */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Nome da Instituição *
                      </label>
                      {mode === 'view' ? (
                        <div className="p-3 bg-gray-50 rounded-lg border border-gray-200 text-gray-900">
                          {formData.name}
                        </div>
                      ) : (
                        <input
                          type="text"
                          value={formData.name}
                          onChange={(e) => handleInputChange('name', e.target.value)}
                          className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                            errors.name ? 'border-red-500 bg-red-50' : 'border-gray-300'
                          }`}
                          placeholder="Ex: Universidade Federal de São Paulo"
                        />
                      )}
                      {errors.name && (
                        <div className="flex items-center mt-1 text-red-500 text-sm">
                          <AlertCircle className="w-4 h-4 mr-1" />
                          <span>{errors.name}</span>
                        </div>
                      )}
                    </div>

                    {/* Nome da Empresa */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Nome da Empresa *
                      </label>
                      {mode === 'view' ? (
                        <div className="p-3 bg-gray-50 rounded-lg border border-gray-200 text-gray-900">
                          {formData.company_name || 'Não informado'}
                        </div>
                      ) : (
                        <input
                          type="text"
                          value={formData.company_name}
                          onChange={(e) => handleInputChange('company_name', e.target.value)}
                          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="Razão social da empresa"
                        />
                      )}
                    </div>

                    {/* Documento */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        CNPJ *
                      </label>
                      {mode === 'view' ? (
                        <div className="p-3 bg-gray-50 rounded-lg border border-gray-200 text-gray-900 font-mono">
                          {formData.document || 'Não informado'}
                        </div>
                      ) : (
                        <input
                          type="text"
                          value={formData.document}
                          onChange={(e) => handleInputChange('document', e.target.value)}
                          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono"
                          placeholder="00.000.000/0000-00"
                        />
                      )}
                    </div>

                    {/* Código */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Código
                      </label>
                      {mode === 'view' ? (
                        <div className="p-3 bg-gray-50 rounded-lg border border-gray-200 text-gray-900 font-mono">
                          {formData.code || 'Não informado'}
                        </div>
                      ) : (
                        <input
                          type="text"
                          value={formData.code}
                          onChange={(e) => handleInputChange('code', e.target.value.toUpperCase())}
                          className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono transition-all ${
                            errors.code ? 'border-red-500 bg-red-50' : 'border-gray-300'
                          }`}
                          placeholder="Ex: UNIFESP"
                        />
                      )}
                      {errors.code && (
                        <div className="flex items-center mt-1 text-red-500 text-sm">
                          <AlertCircle className="w-4 h-4 mr-1" />
                          <span>{errors.code}</span>
                        </div>
                      )}
                    </div>

                    {/* Tipo */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Tipo de Instituição
                      </label>
                      {mode === 'view' ? (
                        <div className="p-3 bg-gray-50 rounded-lg border border-gray-200 text-gray-900">
                          {formData.type}
                        </div>
                      ) : (
                        <select
                          value={formData.type}
                          onChange={(e) => handleInputChange('type', e.target.value)}
                          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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

                    {/* Email */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Email
                      </label>
                      {mode === 'view' ? (
                        <div className="p-3 bg-gray-50 rounded-lg border border-gray-200 text-gray-900">
                          {formData.email || 'Não informado'}
                        </div>
                      ) : (
                        <input
                          type="email"
                          value={formData.email}
                          onChange={(e) => handleInputChange('email', e.target.value)}
                          className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                            errors.email ? 'border-red-500 bg-red-50' : 'border-gray-300'
                          }`}
                          placeholder="contato@instituicao.edu.br"
                        />
                      )}
                      {errors.email && (
                        <div className="flex items-center mt-1 text-red-500 text-sm">
                          <AlertCircle className="w-4 h-4 mr-1" />
                          <span>{errors.email}</span>
                        </div>
                      )}
                    </div>

                    {/* Telefone */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Telefone
                      </label>
                      {mode === 'view' ? (
                        <div className="p-3 bg-gray-50 rounded-lg border border-gray-200 text-gray-900">
                          {formData.phone || 'Não informado'}
                        </div>
                      ) : (
                        <input
                          type="tel"
                          value={formData.phone}
                          onChange={(e) => handleInputChange('phone', e.target.value)}
                          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="(11) 99999-9999"
                        />
                      )}
                    </div>

                    {/* Website */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Website
                      </label>
                      {mode === 'view' ? (
                        <div className="p-3 bg-gray-50 rounded-lg border border-gray-200 text-gray-900">
                          {formData.website || 'Não informado'}
                        </div>
                      ) : (
                        <input
                          type="url"
                          value={formData.website}
                          onChange={(e) => handleInputChange('website', e.target.value)}
                          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="https://www.instituicao.com"
                        />
                      )}
                    </div>
                  </div>

                  {/* Descrição */}
                  <div className="mt-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Descrição
                    </label>
                    {mode === 'view' ? (
                      <div className="p-3 bg-gray-50 rounded-lg border border-gray-200 text-gray-900 min-h-[80px]">
                        {formData.description || 'Não informado'}
                      </div>
                    ) : (
                      <textarea
                        value={formData.description}
                        onChange={(e) => handleInputChange('description', e.target.value)}
                        rows={3}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                        placeholder="Descreva a instituição..."
                      />
                    )}
                  </div>
                </div>

                {/* Responsável */}
                <div className="bg-purple-50 p-4 rounded-xl border border-purple-200">
                  <h3 className="text-lg font-semibold text-purple-900 mb-4 flex items-center">
                    <Users className="w-5 h-5 mr-2" />
                    Responsável
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Nome do Responsável */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Nome do Responsável *
                      </label>
                      {mode === 'view' ? (
                        <div className="p-3 bg-gray-50 rounded-lg border border-gray-200 text-gray-900">
                          {formData.accountable_name || 'Não informado'}
                        </div>
                      ) : (
                        <input
                          type="text"
                          value={formData.accountable_name}
                          onChange={(e) => handleInputChange('accountable_name', e.target.value)}
                          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                          placeholder="Nome completo do responsável"
                        />
                      )}
                    </div>

                    {/* Contato do Responsável */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Contato do Responsável *
                      </label>
                      {mode === 'view' ? (
                        <div className="p-3 bg-gray-50 rounded-lg border border-gray-200 text-gray-900">
                          {formData.accountable_contact || 'Não informado'}
                        </div>
                      ) : (
                        <input
                          type="text"
                          value={formData.accountable_contact}
                          onChange={(e) => handleInputChange('accountable_contact', e.target.value)}
                          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                          placeholder="Email ou telefone do responsável"
                        />
                      )}
                    </div>
                  </div>
                </div>

                {/* Endereço */}
                <div className="bg-green-50 p-4 rounded-xl border border-green-200">
                  <h3 className="text-lg font-semibold text-green-900 mb-4 flex items-center">
                    <MapPin className="w-5 h-5 mr-2" />
                    Endereço
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Rua */}
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Rua/Logradouro *
                      </label>
                      {mode === 'view' ? (
                        <div className="p-3 bg-gray-50 rounded-lg border border-gray-200 text-gray-900">
                          {formData.street || 'Não informado'}
                        </div>
                      ) : (
                        <input
                          type="text"
                          value={formData.street}
                          onChange={(e) => handleInputChange('street', e.target.value)}
                          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                          placeholder="Rua, Avenida, etc."
                        />
                      )}
                    </div>

                    {/* Complemento */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Complemento
                      </label>
                      {mode === 'view' ? (
                        <div className="p-3 bg-gray-50 rounded-lg border border-gray-200 text-gray-900">
                          {formData.complement || 'Não informado'}
                        </div>
                      ) : (
                        <input
                          type="text"
                          value={formData.complement}
                          onChange={(e) => handleInputChange('complement', e.target.value)}
                          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                          placeholder="Apartamento, sala, etc."
                        />
                      )}
                    </div>

                    {/* Bairro */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Bairro/Distrito *
                      </label>
                      {mode === 'view' ? (
                        <div className="p-3 bg-gray-50 rounded-lg border border-gray-200 text-gray-900">
                          {formData.district || 'Não informado'}
                        </div>
                      ) : (
                        <input
                          type="text"
                          value={formData.district}
                          onChange={(e) => handleInputChange('district', e.target.value)}
                          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                          placeholder="Nome do bairro"
                        />
                      )}
                    </div>

                    {/* Cidade */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Cidade *
                      </label>
                      {mode === 'view' ? (
                        <div className="p-3 bg-gray-50 rounded-lg border border-gray-200 text-gray-900">
                          {formData.city || 'Não informado'}
                        </div>
                      ) : (
                        <input
                          type="text"
                          value={formData.city}
                          onChange={(e) => handleInputChange('city', e.target.value)}
                          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                          placeholder="Nome da cidade"
                        />
                      )}
                    </div>

                    {/* Estado */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Estado *
                      </label>
                      {mode === 'view' ? (
                        <div className="p-3 bg-gray-50 rounded-lg border border-gray-200 text-gray-900">
                          {formData.state || 'Não informado'}
                        </div>
                      ) : (
                        <select
                          value={formData.state}
                          onChange={(e) => handleInputChange('state', e.target.value)}
                          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        >
                          <option value="">Selecione o estado</option>
                          <option value="AC">Acre</option>
                          <option value="AL">Alagoas</option>
                          <option value="AP">Amapá</option>
                          <option value="AM">Amazonas</option>
                          <option value="BA">Bahia</option>
                          <option value="CE">Ceará</option>
                          <option value="DF">Distrito Federal</option>
                          <option value="ES">Espírito Santo</option>
                          <option value="GO">Goiás</option>
                          <option value="MA">Maranhão</option>
                          <option value="MT">Mato Grosso</option>
                          <option value="MS">Mato Grosso do Sul</option>
                          <option value="MG">Minas Gerais</option>
                          <option value="PA">Pará</option>
                          <option value="PB">Paraíba</option>
                          <option value="PR">Paraná</option>
                          <option value="PE">Pernambuco</option>
                          <option value="PI">Piauí</option>
                          <option value="RJ">Rio de Janeiro</option>
                          <option value="RN">Rio Grande do Norte</option>
                          <option value="RS">Rio Grande do Sul</option>
                          <option value="RO">Rondônia</option>
                          <option value="RR">Roraima</option>
                          <option value="SC">Santa Catarina</option>
                          <option value="SP">São Paulo</option>
                          <option value="SE">Sergipe</option>
                          <option value="TO">Tocantins</option>
                        </select>
                      )}
                    </div>

                    {/* CEP */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        CEP *
                      </label>
                      {mode === 'view' ? (
                        <div className="p-3 bg-gray-50 rounded-lg border border-gray-200 text-gray-900 font-mono">
                          {formData.postal_code || 'Não informado'}
                        </div>
                      ) : (
                        <input
                          type="text"
                          value={formData.postal_code}
                          onChange={(e) => handleInputChange('postal_code', e.target.value)}
                          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent font-mono"
                          placeholder="00000-000"
                        />
                      )}
                    </div>
                  </div>
                </div>

                {/* Configurações de Contrato */}
                <div className="bg-orange-50 p-4 rounded-xl border border-orange-200">
                  <h3 className="text-lg font-semibold text-orange-900 mb-4 flex items-center">
                    <Calendar className="w-5 h-5 mr-2" />
                    Contrato
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Número do Contrato */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Número do Contrato
                      </label>
                      {mode === 'view' ? (
                        <div className="p-3 bg-gray-50 rounded-lg border border-gray-200 text-gray-900 font-mono">
                          {formData.contract_num || 'Não informado'}
                        </div>
                      ) : (
                        <input
                          type="number"
                          value={formData.contract_num}
                          onChange={(e) => handleInputChange('contract_num', e.target.value)}
                          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent font-mono"
                          placeholder="123456"
                        />
                      )}
                    </div>

                    {/* Número da Fatura */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Número da Fatura
                      </label>
                      {mode === 'view' ? (
                        <div className="p-3 bg-gray-50 rounded-lg border border-gray-200 text-gray-900 font-mono">
                          {formData.contract_invoice_num || 'Não informado'}
                        </div>
                      ) : (
                        <input
                          type="text"
                          value={formData.contract_invoice_num}
                          onChange={(e) => handleInputChange('contract_invoice_num', e.target.value)}
                          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent font-mono"
                          placeholder="FAT-2024-001"
                        />
                      )}
                    </div>

                    {/* Início do Contrato */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Início do Contrato *
                      </label>
                      {mode === 'view' ? (
                        <div className="p-3 bg-gray-50 rounded-lg border border-gray-200 text-gray-900">
                          {formData.contract_term_start ? new Date(formData.contract_term_start).toLocaleDateString('pt-BR') : 'Não informado'}
                        </div>
                      ) : (
                        <input
                          type="date"
                          value={formData.contract_term_start}
                          onChange={(e) => handleInputChange('contract_term_start', e.target.value)}
                          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                        />
                      )}
                    </div>

                    {/* Fim do Contrato */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Fim do Contrato *
                      </label>
                      {mode === 'view' ? (
                        <div className="p-3 bg-gray-50 rounded-lg border border-gray-200 text-gray-900">
                          {formData.contract_term_end ? new Date(formData.contract_term_end).toLocaleDateString('pt-BR') : 'Não informado'}
                        </div>
                      ) : (
                        <input
                          type="date"
                          value={formData.contract_term_end}
                          onChange={(e) => handleInputChange('contract_term_end', e.target.value)}
                          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                        />
                      )}
                    </div>

                    {/* Score */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Score
                      </label>
                      {mode === 'view' ? (
                        <div className="p-3 bg-gray-50 rounded-lg border border-gray-200 text-gray-900">
                          {formData.score || 'Não informado'}
                        </div>
                      ) : (
                        <input
                          type="number"
                          value={formData.score}
                          onChange={(e) => handleInputChange('score', e.target.value)}
                          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                          placeholder="0-100"
                          min="0"
                          max="100"
                        />
                      )}
                    </div>

                    {/* Contrato Desabilitado */}
                    <div className="flex items-center space-x-3 pt-8">
                      {mode === 'view' ? (
                        <div className="flex items-center space-x-2">
                          {formData.contract_disabled ? (
                            <XCircle className="w-5 h-5 text-red-500" />
                          ) : (
                            <CheckCircle className="w-5 h-5 text-green-500" />
                          )}
                          <span className="text-sm font-medium text-gray-700">
                            Contrato {formData.contract_disabled ? 'desabilitado' : 'ativo'}
                          </span>
                        </div>
                      ) : (
                        <>
                          <input
                            type="checkbox"
                            id="contract_disabled"
                            checked={formData.contract_disabled}
                            onChange={(e) => handleInputChange('contract_disabled', e.target.checked)}
                            className="w-4 h-4 text-orange-600 rounded focus:ring-orange-500"
                          />
                          <label htmlFor="contract_disabled" className="text-sm font-medium text-gray-700">
                            Contrato desabilitado
                          </label>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {/* Plataformas */}
                <div className="bg-indigo-50 p-4 rounded-xl border border-indigo-200">
                  <h3 className="text-lg font-semibold text-indigo-900 mb-4 flex items-center">
                    <School className="w-5 h-5 mr-2" />
                    Plataformas Disponíveis
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Plataforma da Biblioteca */}
                    <div className="flex items-center space-x-3 p-3 bg-white rounded-lg border border-indigo-200">
                      {mode === 'view' ? (
                        <>
                          {formData.has_library_platform ? (
                            <CheckCircle className="w-5 h-5 text-green-500" />
                          ) : (
                            <XCircle className="w-5 h-5 text-red-500" />
                          )}
                          <span className="text-sm font-medium text-gray-700">
                            Plataforma da Biblioteca
                          </span>
                        </>
                      ) : (
                        <>
                          <input
                            type="checkbox"
                            id="has_library_platform"
                            checked={formData.has_library_platform}
                            onChange={(e) => handleInputChange('has_library_platform', e.target.checked)}
                            className="w-4 h-4 text-indigo-600 rounded focus:ring-indigo-500"
                          />
                          <label htmlFor="has_library_platform" className="text-sm font-medium text-gray-700">
                            Plataforma da Biblioteca
                          </label>
                        </>
                      )}
                    </div>

                    {/* Plataforma do Diretor */}
                    <div className="flex items-center space-x-3 p-3 bg-white rounded-lg border border-indigo-200">
                      {mode === 'view' ? (
                        <>
                          {formData.has_principal_platform ? (
                            <CheckCircle className="w-5 h-5 text-green-500" />
                          ) : (
                            <XCircle className="w-5 h-5 text-red-500" />
                          )}
                          <span className="text-sm font-medium text-gray-700">
                            Plataforma do Diretor
                          </span>
                        </>
                      ) : (
                        <>
                          <input
                            type="checkbox"
                            id="has_principal_platform"
                            checked={formData.has_principal_platform}
                            onChange={(e) => handleInputChange('has_principal_platform', e.target.checked)}
                            className="w-4 h-4 text-indigo-600 rounded focus:ring-indigo-500"
                          />
                          <label htmlFor="has_principal_platform" className="text-sm font-medium text-gray-700">
                            Plataforma do Diretor
                          </label>
                        </>
                      )}
                    </div>

                    {/* Plataforma do Estudante */}
                    <div className="flex items-center space-x-3 p-3 bg-white rounded-lg border border-indigo-200">
                      {mode === 'view' ? (
                        <>
                          {formData.has_student_platform ? (
                            <CheckCircle className="w-5 h-5 text-green-500" />
                          ) : (
                            <XCircle className="w-5 h-5 text-red-500" />
                          )}
                          <span className="text-sm font-medium text-gray-700">
                            Plataforma do Estudante
                          </span>
                        </>
                      ) : (
                        <>
                          <input
                            type="checkbox"
                            id="has_student_platform"
                            checked={formData.has_student_platform}
                            onChange={(e) => handleInputChange('has_student_platform', e.target.checked)}
                            className="w-4 h-4 text-indigo-600 rounded focus:ring-indigo-500"
                          />
                          <label htmlFor="has_student_platform" className="text-sm font-medium text-gray-700">
                            Plataforma do Estudante
                          </label>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {/* Status */}
                {mode !== 'create' && (
                  <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">
                      Status da Instituição
                    </h3>
                    
                    <div className="flex items-center space-x-3">
                      {formData.is_active ? (
                        <div className="flex items-center text-green-600">
                          <CheckCircle className="w-5 h-5 mr-2" />
                          <span className="text-sm font-medium">Instituição Ativa</span>
                        </div>
                      ) : (
                        <div className="flex items-center text-red-600">
                          <XCircle className="w-5 h-5 mr-2" />
                          <span className="text-sm font-medium">Instituição Inativa</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Aba Escolas */}
            {activeTab === 'schools' && (mode === 'create' || mode === 'edit') && (
              <div className="space-y-6">
                {/* Escolas Atribuídas */}
                <div className="bg-green-50 p-6 rounded-xl border border-green-200">
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
                              <p className="text-sm text-gray-500">Código: {school.code}</p>
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
                <div className="bg-blue-50 p-6 rounded-xl border border-blue-200">
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
                              <p className="text-sm text-gray-500">Código: {school.code}</p>
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
        <div className="flex items-center justify-end space-x-3 p-6 border-t border-gray-200 bg-gray-50 flex-shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-6 py-2.5 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            {mode === 'view' ? 'Fechar' : 'Cancelar'}
          </button>
          
          {mode !== 'view' && (
            <button
              type="submit"
              onClick={handleSubmit}
              disabled={loading}
              className={`px-6 py-2.5 text-white rounded-lg transition-colors flex items-center space-x-2 ${
                mode === 'create' 
                  ? 'bg-green-600 hover:bg-green-700' 
                  : 'bg-orange-600 hover:bg-orange-700'
              } ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {loading ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              ) : (
                <Save className="w-4 h-4" />
              )}
              <span>{loading ? 'Salvando...' : mode === 'create' ? 'Criar Instituição' : 'Salvar Alterações'}</span>
            </button>
          )}
        </div>
      </div>
    </div>
  )
} 