'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useTheme } from '@/contexts/ThemeContext'
import { motion } from 'framer-motion'
import ProtectedRoute from '@/components/auth/ProtectedRoute'
import DashboardPageLayout from '@/components/dashboard/DashboardPageLayout'
import { User, UserRole } from '@/types/auth'
import { apiPut, ApiResponse, BaseApiService } from '@/services/api'

interface ProfileFormData {
  name: string
  email: string
  phone?: string
  address?: string
  educationUnit?: string
}

export default function ProfilePage() {
  const { user, refreshUser } = useAuth()
  const { theme } = useTheme()
  const [isEditing, setIsEditing] = useState(false)
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState<ProfileFormData>({
    name: '',
    email: '',
    phone: '',
    address: '',
    educationUnit: ''
  })
  const [originalData, setOriginalData] = useState<ProfileFormData>({
    name: '',
    email: '',
    phone: '',
    address: '',
    educationUnit: ''
  })

  // Inicializar dados do formulário quando o usuário for carregado
  useEffect(() => {
    if (user) {
      const userData = {
        name: user.name || '',
        email: user.email || '',
        phone: user.contact?.phone || user.telefone || '',
        address: user.contact?.address || user.endereco || '',
        educationUnit: user.contact?.educationUnit || user.unidadeEnsino || ''
      }
      setFormData(userData)
      setOriginalData(userData)
    }
  }, [user])

  const handleInputChange = (field: keyof ProfileFormData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleSave = async () => {
    if (!user) return

    try {
      setLoading(true)
      
      // Preparar dados para envio
      const updateData = {
        name: formData.name,
        email: formData.email,
        contact: {
          phone: formData.phone,
          address: formData.address,
          educationUnit: formData.educationUnit
        }
      }

      // Fazer requisição para atualizar perfil
      const response = await apiPut<ApiResponse>(`/users/${user.id}`, updateData)
      
      if (response.success) {
        // Atualizar dados originais
        setOriginalData(formData)
        setIsEditing(false)
        
        // Atualizar contexto do usuário
        await refreshUser()
        
        // Mostrar mensagem de sucesso (você pode implementar um toast aqui)
        console.log('Perfil atualizado com sucesso!')
      }
    } catch (error) {
      console.error('Erro ao atualizar perfil:', error)
      // Mostrar mensagem de erro (você pode implementar um toast aqui)
    } finally {
      setLoading(false)
    }
  }

  const handleCancel = () => {
    setFormData(originalData)
    setIsEditing(false)
  }

  const getRoleLabel = (role: string) => {
    const roleLabels: Record<string, string> = {
      'student': 'Estudante',
      'teacher': 'Professor',
      'admin': 'Administrador',
      'system_admin': 'Administrador do Sistema',
      'institution_manager': 'Gestor de Instituição',
      'academic_coordinator': 'Coordenador Acadêmico',
      'manager': 'Gestor',
      'guardian': 'Responsável'
    }
    return roleLabels[role] || role
  }

  if (!user) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="loading-spinner"></div>
      </div>
    )
  }

  return (
    <ProtectedRoute>
      <DashboardPageLayout
        title="Meu Perfil"
        subtitle="Gerencie suas informações pessoais"
        actions={
          <div className="flex gap-3">
            {isEditing ? (
              <>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleCancel}
                  className="px-4 py-2 rounded-lg border transition-colors"
                  style={{
                    borderColor: theme.colors.border.DEFAULT,
                    color: theme.colors.text.secondary,
                    backgroundColor: theme.colors.background.card
                  }}
                  disabled={loading}
                >
                  Cancelar
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleSave}
                  className="px-4 py-2 rounded-lg text-white transition-colors"
                  style={{
                    backgroundColor: theme.colors.primary.DEFAULT
                  }}
                  disabled={loading}
                >
                  {loading ? 'Salvando...' : 'Salvar'}
                </motion.button>
              </>
            ) : (
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setIsEditing(true)}
                className="px-4 py-2 rounded-lg text-white transition-colors"
                style={{
                  backgroundColor: theme.colors.primary.DEFAULT
                }}
              >
                Editar Perfil
              </motion.button>
            )}
          </div>
        }
      >
        <div className="max-w-4xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Informações Básicas */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="lg:col-span-2"
            >
              <div
                className="rounded-lg border p-6"
                style={{
                  backgroundColor: theme.colors.background.card,
                  borderColor: theme.colors.border.light
                }}
              >
                <h2
                  className="text-xl font-semibold mb-6"
                  style={{ color: theme.colors.text.primary }}
                >
                  Informações Pessoais
                </h2>

                <div className="space-y-4">
                  {/* Nome */}
                  <div>
                    <label
                      className="block text-sm font-medium mb-2"
                      style={{ color: theme.colors.text.secondary }}
                    >
                      Nome Completo
                    </label>
                    {isEditing ? (
                      <input
                        type="text"
                        value={formData.name}
                        onChange={(e) => handleInputChange('name', e.target.value)}
                        className="w-full px-3 py-2 rounded-lg border transition-colors"
                        style={{
                          backgroundColor: theme.colors.background.primary,
                          borderColor: theme.colors.border.DEFAULT,
                          color: theme.colors.text.primary
                        }}
                      />
                    ) : (
                      <p
                        className="px-3 py-2"
                        style={{ color: theme.colors.text.primary }}
                      >
                        {formData.name}
                      </p>
                    )}
                  </div>

                  {/* Email */}
                  <div>
                    <label
                      className="block text-sm font-medium mb-2"
                      style={{ color: theme.colors.text.secondary }}
                    >
                      Email
                    </label>
                    {isEditing ? (
                      <input
                        type="email"
                        value={formData.email}
                        onChange={(e) => handleInputChange('email', e.target.value)}
                        className="w-full px-3 py-2 rounded-lg border transition-colors"
                        style={{
                          backgroundColor: theme.colors.background.primary,
                          borderColor: theme.colors.border.DEFAULT,
                          color: theme.colors.text.primary
                        }}
                      />
                    ) : (
                      <p
                        className="px-3 py-2"
                        style={{ color: theme.colors.text.primary }}
                      >
                        {formData.email}
                      </p>
                    )}
                  </div>

                  {/* Telefone */}
                  <div>
                    <label
                      className="block text-sm font-medium mb-2"
                      style={{ color: theme.colors.text.secondary }}
                    >
                      Telefone
                    </label>
                    {isEditing ? (
                      <input
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => handleInputChange('phone', e.target.value)}
                        className="w-full px-3 py-2 rounded-lg border transition-colors"
                        style={{
                          backgroundColor: theme.colors.background.primary,
                          borderColor: theme.colors.border.DEFAULT,
                          color: theme.colors.text.primary
                        }}
                        placeholder="(00) 00000-0000"
                      />
                    ) : (
                      <p
                        className="px-3 py-2"
                        style={{ color: theme.colors.text.primary }}
                      >
                        {formData.phone || 'Não informado'}
                      </p>
                    )}
                  </div>

                  {/* Endereço */}
                  <div>
                    <label
                      className="block text-sm font-medium mb-2"
                      style={{ color: theme.colors.text.secondary }}
                    >
                      Endereço
                    </label>
                    {isEditing ? (
                      <textarea
                        value={formData.address}
                        onChange={(e) => handleInputChange('address', e.target.value)}
                        rows={3}
                        className="w-full px-3 py-2 rounded-lg border transition-colors resize-none"
                        style={{
                          backgroundColor: theme.colors.background.primary,
                          borderColor: theme.colors.border.DEFAULT,
                          color: theme.colors.text.primary
                        }}
                        placeholder="Rua, número, bairro, cidade, estado"
                      />
                    ) : (
                      <p
                        className="px-3 py-2"
                        style={{ color: theme.colors.text.primary }}
                      >
                        {formData.address || 'Não informado'}
                      </p>
                    )}
                  </div>

                  {/* Unidade de Ensino */}
                  <div>
                    <label
                      className="block text-sm font-medium mb-2"
                      style={{ color: theme.colors.text.secondary }}
                    >
                      Unidade de Ensino
                    </label>
                    {isEditing ? (
                      <input
                        type="text"
                        value={formData.educationUnit}
                        onChange={(e) => handleInputChange('educationUnit', e.target.value)}
                        className="w-full px-3 py-2 rounded-lg border transition-colors"
                        style={{
                          backgroundColor: theme.colors.background.primary,
                          borderColor: theme.colors.border.DEFAULT,
                          color: theme.colors.text.primary
                        }}
                        placeholder="Nome da unidade de ensino"
                      />
                    ) : (
                      <p
                        className="px-3 py-2"
                        style={{ color: theme.colors.text.primary }}
                      >
                        {formData.educationUnit || 'Não informado'}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Sidebar com informações do sistema */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="space-y-6"
            >
              {/* Avatar e Role */}
              <div
                className="rounded-lg border p-6 text-center"
                style={{
                  backgroundColor: theme.colors.background.card,
                  borderColor: theme.colors.border.light
                }}
              >
                <div
                  className="w-24 h-24 rounded-full mx-auto mb-4 flex items-center justify-center text-2xl font-bold"
                  style={{
                    backgroundColor: theme.colors.primary.light,
                    color: theme.colors.primary.dark
                  }}
                >
                  {user.name.charAt(0).toUpperCase()}
                </div>
                <h3
                  className="font-semibold text-lg"
                  style={{ color: theme.colors.text.primary }}
                >
                  {user.name}
                </h3>
                <p
                  className="text-sm mt-1"
                  style={{ color: theme.colors.text.secondary }}
                >
                  {getRoleLabel(user.role)}
                </p>
              </div>

              {/* Informações da Conta */}
              <div
                className="rounded-lg border p-6"
                style={{
                  backgroundColor: theme.colors.background.card,
                  borderColor: theme.colors.border.light
                }}
              >
                <h3
                  className="font-semibold mb-4"
                  style={{ color: theme.colors.text.primary }}
                >
                  Informações da Conta
                </h3>
                <div className="space-y-3">
                  <div>
                    <p
                      className="text-sm font-medium"
                      style={{ color: theme.colors.text.secondary }}
                    >
                      ID do Usuário
                    </p>
                    <p
                      className="text-sm font-mono"
                      style={{ color: theme.colors.text.primary }}
                    >
                      {user.id}
                    </p>
                  </div>
                  {user.institution_name && (
                    <div>
                      <p
                        className="text-sm font-medium"
                        style={{ color: theme.colors.text.secondary }}
                      >
                        Instituição
                      </p>
                      <p
                        className="text-sm"
                        style={{ color: theme.colors.text.primary }}
                      >
                        {user.institution_name}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Ações Rápidas */}
              <div
                className="rounded-lg border p-6"
                style={{
                  backgroundColor: theme.colors.background.card,
                  borderColor: theme.colors.border.light
                }}
              >
                <h3
                  className="font-semibold mb-4"
                  style={{ color: theme.colors.text.primary }}
                >
                  Ações Rápidas
                </h3>
                <div className="space-y-2">
                  <button
                    className="w-full text-left px-3 py-2 rounded-lg transition-colors text-sm"
                    style={{
                      color: theme.colors.text.secondary,
                      backgroundColor: 'transparent'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = theme.colors.background.hover
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = 'transparent'
                    }}
                  >
                    Alterar Senha
                  </button>
                  <button
                    className="w-full text-left px-3 py-2 rounded-lg transition-colors text-sm"
                    style={{
                      color: theme.colors.text.secondary,
                      backgroundColor: 'transparent'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = theme.colors.background.hover
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = 'transparent'
                    }}
                  >
                    Configurações de Privacidade
                  </button>
                  <button
                    className="w-full text-left px-3 py-2 rounded-lg transition-colors text-sm"
                    style={{
                      color: theme.colors.text.secondary,
                      backgroundColor: 'transparent'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = theme.colors.background.hover
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = 'transparent'
                    }}
                  >
                    Histórico de Atividades
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </DashboardPageLayout>
    </ProtectedRoute>
  )
} 