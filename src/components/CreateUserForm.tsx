'use client'

import React, { useState, useEffect } from 'react'
import { X, Users, Key, Shield, Plus, Eye, EyeOff, AlertTriangle } from 'lucide-react'
import { useToast } from '@/components/ToastManager'
import { userService } from '@/services/userService'
import { CreateUserDto } from '@/types/dto'
import { RoleResponseDto, InstitutionResponseDto } from '@/types/api'
import { useAuth } from '@/contexts/AuthContext'

interface CreateUserFormProps {
  onClose: () => void
  onSuccess: () => void
  roles: RoleResponseDto[]
  institutions: InstitutionResponseDto[]
}

// Função para validar CPF
const validateCPF = (cpf: string) => {
  // Remove formatação
  const cleanCPF = cpf.replace(/\D/g, '')
  
  // Verifica se tem 11 dígitos
  if (cleanCPF.length !== 11) return false
  
  // Verifica se todos os dígitos são iguais
  if (/^(\d)\1{10}$/.test(cleanCPF)) return false
  
  // Validação dos dígitos verificadores
  let sum = 0
  for (let i = 0; i < 9; i++) {
    sum += parseInt(cleanCPF.charAt(i)) * (10 - i)
  }
  let remainder = (sum * 10) % 11
  if (remainder === 10 || remainder === 11) remainder = 0
  if (remainder !== parseInt(cleanCPF.charAt(9))) return false
  
  sum = 0
  for (let i = 0; i < 10; i++) {
    sum += parseInt(cleanCPF.charAt(i)) * (11 - i)
  }
  remainder = (sum * 10) % 11
  if (remainder === 10 || remainder === 11) remainder = 0
  if (remainder !== parseInt(cleanCPF.charAt(10))) return false
  
  return true
}

// Função para calcular força da senha
const calculatePasswordStrength = (password: string) => {
  let score = 0
  let feedback = []

  if (password.length >= 8) {
    score += 1
  } else {
    feedback.push('Pelo menos 8 caracteres')
  }

  if (/[a-z]/.test(password)) {
    score += 1
  } else {
    feedback.push('Letras minúsculas')
  }

  if (/[A-Z]/.test(password)) {
    score += 1
  } else {
    feedback.push('Letras maiúsculas')
  }

  if (/[0-9]/.test(password)) {
    score += 1
  } else {
    feedback.push('Números')
  }

  if (/[^A-Za-z0-9]/.test(password)) {
    score += 1
  } else {
    feedback.push('Símbolos especiais')
  }

  const strength = score <= 1 ? 'weak' : score <= 3 ? 'medium' : 'strong'
  const strengthText = score <= 1 ? 'Fraca' : score <= 3 ? 'Média' : 'Forte'
  
  return { score, strength, strengthText, feedback }
}

// Componente do indicador de força da senha
const PasswordStrengthIndicator = ({ password }: { password: string }) => {
  const { score, strength, strengthText, feedback } = calculatePasswordStrength(password)

  const getStrengthColor = () => {
    switch (strength) {
      case 'weak': return 'bg-red-500'
      case 'medium': return 'bg-yellow-500'
      case 'strong': return 'bg-green-500'
      default: return 'bg-gray-300'
    }
  }

  const getTextColor = () => {
    switch (strength) {
      case 'weak': return 'text-red-600'
      case 'medium': return 'text-yellow-600'
      case 'strong': return 'text-green-600'
      default: return 'text-gray-500'
    }
  }

  if (!password) return null

  return (
    <div className="mt-2">
      {/* Barra de força */}
      <div className="flex gap-1 mb-2">
        {[1, 2, 3, 4, 5].map((level) => (
          <div
            key={level}
            className={`h-2 flex-1 rounded-full transition-colors duration-300 ${
              level <= score ? getStrengthColor() : 'bg-gray-200'
            }`}
          />
        ))}
      </div>
      
      {/* Texto da força */}
      <div className="flex justify-between items-center">
        <span className={`text-sm font-medium ${getTextColor()}`}>
          Força: {strengthText}
        </span>
        <span className="text-xs text-gray-500">
          {score}/5
        </span>
      </div>
      
      {/* Feedback */}
      {feedback.length > 0 && (
        <div className="mt-1">
          <p className="text-xs text-gray-600">Adicione: {feedback.join(', ')}</p>
        </div>
      )}
    </div>
  )
}

export default function CreateUserForm({ onClose, onSuccess, roles, institutions }: CreateUserFormProps) {
  const { showSuccess, showError } = useToast()
  const { user: authUser } = useAuth()
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  
  const [formData, setFormData] = useState<CreateUserDto>({
    name: '',
    email: '',
    password: '',
    role_id: '',
    institution_id: '',
    endereco: '',
    telefone: '',
    is_active: true
  })
  
  const [confirmPassword, setConfirmPassword] = useState('')
  const [errors, setErrors] = useState<Record<string, string>>({})

  // Verificar permissões do usuário
  useEffect(() => {
    if (authUser) {
      console.log('🔐 Verificando permissões do usuário:', {
        user: authUser,
        role: authUser.role,
        permissions: authUser.permissions,
        canCreateUsers: ['SYSTEM_ADMIN', 'INSTITUTION_MANAGER', 'COORDINATOR', 'admin'].includes(authUser.role?.toUpperCase() || '')
      })
    }
  }, [authUser])

  // Validação do formulário
  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.name.trim()) {
      newErrors.name = 'Nome é obrigatório'
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email é obrigatório'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Email deve ter um formato válido'
    }

    if (!formData.password) {
      newErrors.password = 'Senha é obrigatória'
    } else if (formData.password.length < 6) {
      newErrors.password = 'Senha deve ter pelo menos 6 caracteres'
    }

    if (formData.password !== confirmPassword) {
      newErrors.confirmPassword = 'Senhas não coincidem'
    }

    if (!formData.role_id) {
      newErrors.role_id = 'Função é obrigatória'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  // Envio do formulário
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) {
      showError('Por favor, corrija os erros no formulário')
      return
    }

    // Verificar permissões antes de enviar
    if (!authUser) {
      showError('Você precisa estar logado para criar usuários.')
      return
    }

    const allowedRoles = ['SYSTEM_ADMIN', 'INSTITUTION_MANAGER', 'COORDINATOR', 'admin']
    const userRole = authUser.role?.toUpperCase()
    
    if (!allowedRoles.includes(userRole || '')) {
      showError(`Você não tem permissão para criar usuários. Sua função atual é: ${authUser.role}. Entre em contato com o administrador.`)
      return
    }

    setIsLoading(true)
    
    try {
      // Debug: Verificar autenticação
      const token = localStorage.getItem('accessToken')
      const user = localStorage.getItem('user')
      
      console.log('🔐 Debug de autenticação:', {
        token: token ? `${token.substring(0, 20)}...` : 'Ausente',
        tokenLength: token?.length || 0,
        user: user ? JSON.parse(user) : 'Ausente',
        localStorage: Object.keys(localStorage),
        cookies: document.cookie
      })
      
      if (!token) {
        showError('Você não está autenticado. Por favor, faça login novamente.')
        setIsLoading(false)
        return
      }

      console.log('📤 Enviando dados para o backend:', {
        ...formData,
        password: '***', // Não loggar a senha
        endpoint: '/api/users',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token.substring(0, 20)}...`
        }
      })
      
      // Mapear dados do formulário para o formato esperado pelo serviço
      const createUserData = {
        email: formData.email,
        password: formData.password,
        full_name: formData.name,
        roleId: formData.role_id,
        institutionId: formData.institution_id ? parseInt(formData.institution_id) : 0,
        address: formData.endereco,
        phone: formData.telefone,
        enabled: formData.is_active
      }
      
      await userService.createUser(createUserData)
      
      showSuccess('Usuário criado com sucesso!')
      onSuccess()
      onClose()
    } catch (error: any) {
      console.log('❌ Erro ao criar usuário:', {
        error,
        status: error.response?.status || error.status,
        message: error.message,
        response: error.response,
        stack: error.stack,
        name: error.name,
        config: error.config
      })
      
      // Tratamento de erros específicos
      if (error.response?.status === 401 || error.status === 401) {
        showError('Você não está autenticado. Por favor, faça login novamente.')
      } else if (error.response?.status === 403 || error.status === 403) {
        const errorMessage = error.response?.data?.message || error.message || 'Você não tem permissão para criar usuários.'
        console.log('🚫 Erro 403 detalhado:', {
          errorMessage,
          responseData: error.response?.data,
          userRole: JSON.parse(localStorage.getItem('user') || '{}')?.role,
          token: localStorage.getItem('auth_token') ? 'Presente' : 'Ausente'
        })
        showError(`Erro de permissão: ${errorMessage} Entre em contato com o administrador.`)
      } else if (error.response?.status === 409 || error.status === 409) {
        showError('Este email já está em uso por outro usuário')
      } else if (error.response?.status === 400 || error.status === 400) {
        showError('Dados inválidos. Verifique as informações e tente novamente.')
      } else if (error.response?.status === 500 || error.status === 500) {
        showError('Erro interno do servidor. Tente novamente mais tarde.')
      } else {
        showError(error.message || 'Erro ao criar usuário. Tente novamente.')
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-6 rounded-t-lg">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold text-white">🆕 Novo Usuário</h2>
            <p className="text-blue-100 text-sm mt-1">Preencha os dados do novo usuário</p>
          </div>
          <button
            onClick={onClose}
            disabled={isLoading}
            className="text-white hover:text-blue-200 p-2 rounded-lg hover:bg-white/10 transition-colors disabled:opacity-50"
          >
            <X className="h-6 w-6" />
          </button>
        </div>
      </div>


      {/* Form */}
      <form onSubmit={handleSubmit} className="p-6 space-y-6">
        {/* Informações Básicas */}
        <div className="bg-slate-50 p-4 rounded-lg">
          <h3 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
            <Users className="h-5 w-5 text-blue-500" />
            Informações Básicas
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Nome Completo *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                  errors.name ? 'border-red-500' : 'border-slate-300'
                }`}
                placeholder="Digite o nome completo"
                disabled={isLoading}
              />
              {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Email *
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                  errors.email ? 'border-red-500' : 'border-slate-300'
                }`}
                placeholder="usuario@exemplo.com"
                disabled={isLoading}
              />
              {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
            </div>
          </div>
        </div>

        {/* Senha */}
        <div className="bg-slate-50 p-4 rounded-lg">
          <h3 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
            <Key className="h-5 w-5 text-green-500" />
            Senha de Acesso
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Senha *
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className={`w-full px-3 py-2 pr-10 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    errors.password ? 'border-red-500' : 'border-slate-300'
                  }`}
                  placeholder="Mínimo 6 caracteres"
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  disabled={isLoading}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password}</p>}
              <PasswordStrengthIndicator password={formData.password} />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Confirmar Senha *
              </label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className={`w-full px-3 py-2 pr-10 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    errors.confirmPassword ? 'border-red-500' : 'border-slate-300'
                  }`}
                  placeholder="Digite a senha novamente"
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  disabled={isLoading}
                >
                  {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {errors.confirmPassword && <p className="text-red-500 text-xs mt-1">{errors.confirmPassword}</p>}
              
              {/* Indicador de senhas coincidentes */}
              {confirmPassword && (
                <div className="mt-2">
                  {formData.password === confirmPassword ? (
                    <p className="text-green-600 text-xs flex items-center gap-1">
                      ✓ Senhas coincidem
                    </p>
                  ) : (
                    <p className="text-red-600 text-xs flex items-center gap-1">
                      ✗ Senhas não coincidem
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Função e Instituição */}
        <div className="bg-slate-50 p-4 rounded-lg">
          <h3 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
            <Shield className="h-5 w-5 text-purple-500" />
            Função e Instituição
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Função *
              </label>
              <select
                value={formData.role_id}
                onChange={(e) => setFormData({ ...formData, role_id: e.target.value })}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                  errors.role_id ? 'border-red-500' : 'border-slate-300'
                }`}
                disabled={isLoading}
              >
                <option value="">Selecione uma função</option>
                {roles.map((role) => (
                  <option key={role.id} value={role.id}>
                    {role.name}
                  </option>
                ))}
              </select>
              {errors.role_id && <p className="text-red-500 text-xs mt-1">{errors.role_id}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Instituição
              </label>
              <select 
                value={formData.institution_id || ''}
                onChange={(e) => setFormData({ ...formData, institution_id: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                disabled={isLoading}
              >
                <option value="">Selecione uma instituição</option>
                {institutions.map((institution) => (
                  <option key={institution.id} value={institution.id}>
                    {institution.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Informações Adicionais */}
        <div className="bg-slate-50 p-4 rounded-lg">
          <h3 className="text-lg font-semibold text-slate-800 mb-4">
            Informações Adicionais (Opcional)
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                CPF
              </label>
              <input
                type="text"
                value={(formData as any).cpf || ''}
                onChange={(e) => {
                  // Formatação automática do CPF
                  let value = e.target.value.replace(/\D/g, '')
                  if (value.length <= 11) {
                    value = value.replace(/(\d{3})(\d)/, '$1.$2')
                    value = value.replace(/(\d{3})(\d)/, '$1.$2')
                    value = value.replace(/(\d{3})(\d{1,2})$/, '$1-$2')
                  }
                  setFormData({ ...formData, cpf: value } as any)
                }}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="000.000.000-00"
                maxLength={14}
                disabled={isLoading}
              />
              {/* Validação visual do CPF */}
              {(formData as any).cpf && (formData as any).cpf.replace(/\D/g, '').length === 11 && (
                <div className="mt-1">
                  {validateCPF((formData as any).cpf) ? (
                    <p className="text-green-600 text-xs flex items-center gap-1">
                      ✓ CPF válido
                    </p>
                  ) : (
                    <p className="text-red-600 text-xs flex items-center gap-1">
                      ✗ CPF inválido
                    </p>
                  )}
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Data de Nascimento
              </label>
              <input
                type="date"
                                  value={(formData as any).birth_date || ''}
                  onChange={(e) => setFormData({ ...formData, birth_date: e.target.value } as any)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                disabled={isLoading}
                max={new Date().toISOString().split('T')[0]} // Não permite datas futuras
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Telefone
              </label>
              <input
                type="tel"
                value={formData.telefone || ''}
                onChange={(e) => {
                  // Formatação automática do telefone
                  let value = e.target.value.replace(/\D/g, '')
                  if (value.length <= 11) {
                    if (value.length <= 10) {
                      value = value.replace(/(\d{2})(\d)/, '($1) $2')
                      value = value.replace(/(\d{4})(\d)/, '$1-$2')
                    } else {
                      value = value.replace(/(\d{2})(\d)/, '($1) $2')
                      value = value.replace(/(\d{5})(\d)/, '$1-$2')
                    }
                  }
                  setFormData({ ...formData, telefone: value })
                }}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="(11) 99999-9999"
                maxLength={15}
                disabled={isLoading}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Endereço
              </label>
              <input
                type="text"
                value={formData.endereco || ''}
                onChange={(e) => setFormData({ ...formData, endereco: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Endereço completo"
                disabled={isLoading}
              />
            </div>
          </div>
        </div>

        {/* Status */}
        <div className="bg-slate-50 p-4 rounded-lg">
          <h3 className="text-lg font-semibold text-slate-800 mb-4">Status do Usuário</h3>
          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="is_active"
              checked={formData.is_active}
              onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              disabled={isLoading}
            />
            <label htmlFor="is_active" className="text-sm font-medium text-slate-700">
              Usuário ativo no sistema
            </label>
          </div>
        </div>

        {/* Verificação de Permissões */}
        {authUser && (
          <div className="bg-slate-50 p-4 rounded-lg">
            <h3 className="text-lg font-semibold text-slate-800 mb-4">Verificação de Permissões</h3>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="text-sm text-slate-600">Usuário logado:</span>
                <span className="text-sm font-medium text-slate-800">{authUser.name} ({authUser.email})</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-slate-600">Função atual:</span>
                <span className="text-sm font-medium text-slate-800">{authUser.role}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-slate-600">Pode criar usuários:</span>
                {['SYSTEM_ADMIN', 'INSTITUTION_MANAGER', 'COORDINATOR', 'admin'].includes(authUser.role?.toUpperCase() || '') ? (
                  <span className="text-sm font-medium text-green-600">✅ Sim</span>
                ) : (
                  <span className="text-sm font-medium text-red-600">❌ Não</span>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Botões */}
        <div className="flex justify-end gap-3 pt-4 border-t border-slate-200">
          <button
            type="button"
            onClick={onClose}
            disabled={isLoading}
            className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors disabled:opacity-50"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={isLoading || !authUser || !['SYSTEM_ADMIN', 'INSTITUTION_MANAGER', 'COORDINATOR', 'admin'].includes(authUser?.role?.toUpperCase() || '')}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <>
                <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full"></div>
                Criando...
              </>
            ) : (
              <>
                <Plus className="h-4 w-4" />
                Criar Usuário
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  )
}
