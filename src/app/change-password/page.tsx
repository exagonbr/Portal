'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { 
  Eye, 
  EyeOff, 
  Lock, 
  CheckCircle, 
  AlertCircle,
  ArrowLeft,
  Shield
} from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { useTheme } from '@/contexts/ThemeContext'
import Link from 'next/link'

interface PasswordStrength {
  score: number
  feedback: string[]
  color: string
}

export default function ChangePasswordPage() {
  const router = useRouter()
  useAuth()
  const { theme } = useTheme()
  
  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  })
  
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false
  })
  
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)
  const [passwordStrength, setPasswordStrength] = useState<PasswordStrength>({
    score: 0,
    feedback: [],
    color: 'gray'
  })

  // Função para avaliar a força da senha
  const evaluatePasswordStrength = (password: string): PasswordStrength => {
    let score = 0
    const feedback: string[] = []
    
    if (password.length >= 8) {
      score += 1
    } else {
      feedback.push('Deve ter pelo menos 8 caracteres')
    }
    
    if (/[a-z]/.test(password)) {
      score += 1
    } else {
      feedback.push('Deve conter pelo menos uma letra minúscula')
    }
    
    if (/[A-Z]/.test(password)) {
      score += 1
    } else {
      feedback.push('Deve conter pelo menos uma letra maiúscula')
    }
    
    if (/\d/.test(password)) {
      score += 1
    } else {
      feedback.push('Deve conter pelo menos um número')
    }
    
    if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      score += 1
    } else {
      feedback.push('Deve conter pelo menos um caractere especial')
    }
    
    let color = 'gray'
    if (score >= 4) color = 'green'
    else if (score >= 3) color = 'yellow'
    else if (score >= 1) color = 'red'
    
    return { score, feedback, color }
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    
    if (field === 'newPassword') {
      setPasswordStrength(evaluatePasswordStrength(value))
    }
    
    // Limpar mensagens quando o usuário começar a digitar
    if (message) {
      setMessage(null)
    }
  }

  const togglePasswordVisibility = (field: 'current' | 'new' | 'confirm') => {
    setShowPasswords(prev => ({ ...prev, [field]: !prev[field] }))
  }

  const validateForm = (): string | null => {
    if (!formData.currentPassword) {
      return 'Por favor, digite sua senha atual'
    }
    
    if (!formData.newPassword) {
      return 'Por favor, digite uma nova senha'
    }
    
    if (passwordStrength.score < 3) {
      return 'A nova senha não atende aos critérios mínimos de segurança'
    }
    
    if (formData.newPassword !== formData.confirmPassword) {
      return 'As senhas não coincidem'
    }
    
    if (formData.currentPassword === formData.newPassword) {
      return 'A nova senha deve ser diferente da senha atual'
    }
    
    return null
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    const validationError = validateForm()
    if (validationError) {
      setMessage({ type: 'error', text: validationError })
      return
    }
    
    setIsLoading(true)
    setMessage(null)
    
    try {
      // Simular chamada para API
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      // Aqui você faria a chamada real para a API
      // await updatePassword(formData.currentPassword, formData.newPassword)
      
      setMessage({ 
        type: 'success', 
        text: 'Senha alterada com sucesso! Você será redirecionado em alguns segundos.' 
      })
      
      // Redirecionar após sucesso
      setTimeout(() => {
        router.push('/dashboard')
      }, 3000)
      
    } catch (error) {
      setMessage({ 
        type: 'error', 
        text: 'Erro ao alterar senha. Verifique se a senha atual está correta.' 
      })
    } finally {
      setIsLoading(false)
    }
  }

  const getStrengthBarColor = () => {
    switch (passwordStrength.color) {
      case 'green': return 'bg-green-500'
      case 'yellow': return 'bg-yellow-500'
      case 'red': return 'bg-red-500'
      default: return 'bg-gray-300'
    }
  }

  const getStrengthText = () => {
    switch (passwordStrength.color) {
      case 'green': return 'Forte'
      case 'yellow': return 'Média'
      case 'red': return 'Fraca'
      default: return 'Muito fraca'
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <div className="mx-auto h-16 w-16 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mb-4">
            <Shield className="h-8 w-8 text-blue-600" />
          </div>
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
            Alterar Senha
          </h2>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            Mantenha sua conta segura com uma senha forte
          </p>
        </div>

        {/* Voltar */}
        <div className="flex justify-start">
          <Link 
            href="/dashboard"
            className="inline-flex items-center text-sm text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300"
          >
            <ArrowLeft className="w-4 h-4 mr-1" />
            Voltar ao Dashboard
          </Link>
        </div>

        {/* Formulário */}
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            {/* Senha Atual */}
            <div>
              <label htmlFor="currentPassword" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Senha Atual
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="currentPassword"
                  name="currentPassword"
                  type={showPasswords.current ? 'text' : 'password'}
                  required
                  value={formData.currentPassword}
                  onChange={(e) => handleInputChange('currentPassword', e.target.value)}
                  className="block w-full pl-10 pr-10 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                  placeholder="Digite sua senha atual"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => togglePasswordVisibility('current')}
                >
                  {showPasswords.current ? (
                    <EyeOff className="h-5 w-5 text-gray-400" />
                  ) : (
                    <Eye className="h-5 w-5 text-gray-400" />
                  )}
                </button>
              </div>
            </div>

            {/* Nova Senha */}
            <div>
              <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Nova Senha
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="newPassword"
                  name="newPassword"
                  type={showPasswords.new ? 'text' : 'password'}
                  required
                  value={formData.newPassword}
                  onChange={(e) => handleInputChange('newPassword', e.target.value)}
                  className="block w-full pl-10 pr-10 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                  placeholder="Digite sua nova senha"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => togglePasswordVisibility('new')}
                >
                  {showPasswords.new ? (
                    <EyeOff className="h-5 w-5 text-gray-400" />
                  ) : (
                    <Eye className="h-5 w-5 text-gray-400" />
                  )}
                </button>
              </div>
              
              {/* Indicador de Força da Senha */}
              {formData.newPassword && (
                <div className="mt-2">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs text-gray-600 dark:text-gray-400">
                      Força da senha:
                    </span>
                    <span className={`text-xs font-medium ${
                      passwordStrength.color === 'green' ? 'text-green-600' :
                      passwordStrength.color === 'yellow' ? 'text-yellow-600' :
                      passwordStrength.color === 'red' ? 'text-red-600' : 'text-gray-600'
                    }`}>
                      {getStrengthText()}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full transition-all duration-300 ${getStrengthBarColor()}`}
                      style={{ width: `${(passwordStrength.score / 5) * 100}%` }}
                    ></div>
                  </div>
                  {passwordStrength.feedback.length > 0 && (
                    <ul className="mt-2 text-xs text-gray-600 dark:text-gray-400 space-y-1">
                      {passwordStrength.feedback.map((item, index) => (
                        <li key={index} className="flex items-center">
                          <span className="w-1 h-1 bg-gray-400 rounded-full mr-2"></span>
                          {item}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              )}
            </div>

            {/* Confirmar Nova Senha */}
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Confirmar Nova Senha
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showPasswords.confirm ? 'text' : 'password'}
                  required
                  value={formData.confirmPassword}
                  onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                  className="block w-full pl-10 pr-10 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                  placeholder="Confirme sua nova senha"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => togglePasswordVisibility('confirm')}
                >
                  {showPasswords.confirm ? (
                    <EyeOff className="h-5 w-5 text-gray-400" />
                  ) : (
                    <Eye className="h-5 w-5 text-gray-400" />
                  )}
                </button>
              </div>
              
              {/* Indicador de Confirmação */}
              {formData.confirmPassword && (
                <div className="mt-2 flex items-center">
                  {formData.newPassword === formData.confirmPassword ? (
                    <div className="flex items-center text-green-600">
                      <CheckCircle className="w-4 h-4 mr-1" />
                      <span className="text-xs">As senhas coincidem</span>
                    </div>
                  ) : (
                    <div className="flex items-center text-red-600">
                      <AlertCircle className="w-4 h-4 mr-1" />
                      <span className="text-xs">As senhas não coincidem</span>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Mensagem de Feedback */}
          {message && (
            <div className={`rounded-lg p-4 ${
              message.type === 'success' 
                ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800' 
                : 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800'
            }`}>
              <div className="flex items-center">
                {message.type === 'success' ? (
                  <CheckCircle className="w-5 h-5 text-green-600 mr-2" />
                ) : (
                  <AlertCircle className="w-5 h-5 text-red-600 mr-2" />
                )}
                <span className={`text-sm ${
                  message.type === 'success' 
                    ? 'text-green-800 dark:text-green-200' 
                    : 'text-red-800 dark:text-red-200'
                }`}>
                  {message.text}
                </span>
              </div>
            </div>
          )}

          {/* Botão de Submit */}
          <div>
            <button
              type="submit"
              disabled={isLoading || passwordStrength.score < 3}
              className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isLoading ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Alterando senha...
                </div>
              ) : (
                'Alterar Senha'
              )}
            </button>
          </div>
        </form>

        {/* Dicas de Segurança */}
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
          <h3 className="text-sm font-medium text-blue-800 dark:text-blue-200 mb-2">
            Dicas para uma senha segura:
          </h3>
          <ul className="text-xs text-blue-700 dark:text-blue-300 space-y-1">
            <li>• Use pelo menos 8 caracteres</li>
            <li>• Combine letras maiúsculas e minúsculas</li>
            <li>• Inclua números e símbolos</li>
            <li>• Evite informações pessoais óbvias</li>
            <li>• Use uma senha única para cada conta</li>
          </ul>
        </div>
      </div>
    </div>
  )
} 