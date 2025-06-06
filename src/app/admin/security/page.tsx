'use client'

import React, { useState, useEffect } from 'react'
import { 
  Shield, 
  Save,
  AlertTriangle,
  LockKeyhole,
  Users,
  UserCheck,
  FileKey,
  Clock,
  RefreshCw
} from 'lucide-react'

export default function SecurityPoliciesPage() {
  const [loading, setLoading] = useState(false)
  const [saved, setSaved] = useState(false)
  
  // Estados para as políticas de segurança
  const [passwordPolicy, setPasswordPolicy] = useState({
    minLength: 8,
    requireUppercase: true,
    requireLowercase: true,
    requireNumbers: true,
    requireSpecialChars: true,
    passwordExpiryDays: 90,
    preventReuse: 5
  })
  
  const [accountPolicy, setAccountPolicy] = useState({
    maxLoginAttempts: 5,
    lockoutDurationMinutes: 30,
    sessionTimeoutMinutes: 30,
    requireMfa: false,
    inactivityLockoutDays: 60
  })
  
  const [dataPolicy, setDataPolicy] = useState({
    dataRetentionMonths: 36,
    encryptSensitiveData: true,
    anonymizeDeletedUsers: true,
    enableAuditLogging: true
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    
    // Simulação de salvamento
    try {
      // Em um ambiente real, faríamos uma chamada para a API aqui
      await new Promise(resolve => setTimeout(resolve, 1000))
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    } catch (error) {
      console.error('Erro ao salvar configurações:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="p-6 max-w-6xl mx-auto">
      {/* Cabeçalho */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-800 mb-2 flex items-center">
          <Shield className="mr-2 h-8 w-8 text-indigo-600" />
          Políticas de Segurança
        </h1>
        <p className="text-slate-600">
          Configure as políticas de segurança que serão aplicadas em todo o sistema.
        </p>
      </div>

      {/* Feedback de salvamento */}
      {saved && (
        <div className="mb-6 bg-green-50 p-4 rounded-md border border-green-200">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-green-600" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-green-800">
                Configurações salvas com sucesso!
              </p>
            </div>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="space-y-8">
          {/* Política de Senhas */}
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="p-6 border-b border-slate-200">
              <h2 className="text-xl font-medium text-slate-800 flex items-center">
                <LockKeyhole className="mr-2 h-5 w-5 text-indigo-600" />
                Política de Senhas
              </h2>
              <p className="mt-1 text-sm text-slate-600">
                Configure os requisitos de senha para todos os usuários do sistema.
              </p>
            </div>
            
            <div className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="minLength" className="block text-sm font-medium text-slate-700">
                    Tamanho mínimo da senha
                  </label>
                  <div className="mt-1">
                    <input
                      type="number"
                      id="minLength"
                      min="6"
                      max="32"
                      value={passwordPolicy.minLength}
                      onChange={(e) => setPasswordPolicy({...passwordPolicy, minLength: parseInt(e.target.value)})}
                      className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-slate-300 rounded-md"
                    />
                  </div>
                </div>
                
                <div>
                  <label htmlFor="passwordExpiryDays" className="block text-sm font-medium text-slate-700">
                    Expiração de senha (dias)
                  </label>
                  <div className="mt-1">
                    <input
                      type="number"
                      id="passwordExpiryDays"
                      min="0"
                      max="365"
                      value={passwordPolicy.passwordExpiryDays}
                      onChange={(e) => setPasswordPolicy({...passwordPolicy, passwordExpiryDays: parseInt(e.target.value)})}
                      className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-slate-300 rounded-md"
                    />
                    <p className="mt-1 text-sm text-slate-500">
                      Use 0 para desativar a expiração de senha
                    </p>
                  </div>
                </div>
                
                <div>
                  <label htmlFor="preventReuse" className="block text-sm font-medium text-slate-700">
                    Impedir reuso das últimas senhas
                  </label>
                  <div className="mt-1">
                    <input
                      type="number"
                      id="preventReuse"
                      min="0"
                      max="24"
                      value={passwordPolicy.preventReuse}
                      onChange={(e) => setPasswordPolicy({...passwordPolicy, preventReuse: parseInt(e.target.value)})}
                      className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-slate-300 rounded-md"
                    />
                  </div>
                </div>
              </div>
              
              <div className="space-y-4">
                <div className="relative flex items-start">
                  <div className="flex items-center h-5">
                    <input
                      id="requireUppercase"
                      type="checkbox"
                      checked={passwordPolicy.requireUppercase}
                      onChange={(e) => setPasswordPolicy({...passwordPolicy, requireUppercase: e.target.checked})}
                      className="focus:ring-indigo-500 h-4 w-4 text-indigo-600 border-slate-300 rounded"
                    />
                  </div>
                  <div className="ml-3 text-sm">
                    <label htmlFor="requireUppercase" className="font-medium text-slate-700">
                      Exigir letra maiúscula
                    </label>
                  </div>
                </div>
                
                <div className="relative flex items-start">
                  <div className="flex items-center h-5">
                    <input
                      id="requireLowercase"
                      type="checkbox"
                      checked={passwordPolicy.requireLowercase}
                      onChange={(e) => setPasswordPolicy({...passwordPolicy, requireLowercase: e.target.checked})}
                      className="focus:ring-indigo-500 h-4 w-4 text-indigo-600 border-slate-300 rounded"
                    />
                  </div>
                  <div className="ml-3 text-sm">
                    <label htmlFor="requireLowercase" className="font-medium text-slate-700">
                      Exigir letra minúscula
                    </label>
                  </div>
                </div>
                
                <div className="relative flex items-start">
                  <div className="flex items-center h-5">
                    <input
                      id="requireNumbers"
                      type="checkbox"
                      checked={passwordPolicy.requireNumbers}
                      onChange={(e) => setPasswordPolicy({...passwordPolicy, requireNumbers: e.target.checked})}
                      className="focus:ring-indigo-500 h-4 w-4 text-indigo-600 border-slate-300 rounded"
                    />
                  </div>
                  <div className="ml-3 text-sm">
                    <label htmlFor="requireNumbers" className="font-medium text-slate-700">
                      Exigir números
                    </label>
                  </div>
                </div>
                
                <div className="relative flex items-start">
                  <div className="flex items-center h-5">
                    <input
                      id="requireSpecialChars"
                      type="checkbox"
                      checked={passwordPolicy.requireSpecialChars}
                      onChange={(e) => setPasswordPolicy({...passwordPolicy, requireSpecialChars: e.target.checked})}
                      className="focus:ring-indigo-500 h-4 w-4 text-indigo-600 border-slate-300 rounded"
                    />
                  </div>
                  <div className="ml-3 text-sm">
                    <label htmlFor="requireSpecialChars" className="font-medium text-slate-700">
                      Exigir caracteres especiais
                    </label>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Política de Contas */}
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="p-6 border-b border-slate-200">
              <h2 className="text-xl font-medium text-slate-800 flex items-center">
                <Users className="mr-2 h-5 w-5 text-indigo-600" />
                Política de Contas e Sessões
              </h2>
              <p className="mt-1 text-sm text-slate-600">
                Configure as políticas de autenticação e sessões de usuários.
              </p>
            </div>
            
            <div className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="maxLoginAttempts" className="block text-sm font-medium text-slate-700">
                    Máximo de tentativas de login
                  </label>
                  <div className="mt-1">
                    <input
                      type="number"
                      id="maxLoginAttempts"
                      min="1"
                      max="10"
                      value={accountPolicy.maxLoginAttempts}
                      onChange={(e) => setAccountPolicy({...accountPolicy, maxLoginAttempts: parseInt(e.target.value)})}
                      className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-slate-300 rounded-md"
                    />
                  </div>
                </div>
                
                <div>
                  <label htmlFor="lockoutDurationMinutes" className="block text-sm font-medium text-slate-700">
                    Duração do bloqueio (minutos)
                  </label>
                  <div className="mt-1">
                    <input
                      type="number"
                      id="lockoutDurationMinutes"
                      min="5"
                      max="1440"
                      value={accountPolicy.lockoutDurationMinutes}
                      onChange={(e) => setAccountPolicy({...accountPolicy, lockoutDurationMinutes: parseInt(e.target.value)})}
                      className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-slate-300 rounded-md"
                    />
                  </div>
                </div>
                
                <div>
                  <label htmlFor="sessionTimeoutMinutes" className="block text-sm font-medium text-slate-700">
                    Timeout de sessão (minutos)
                  </label>
                  <div className="mt-1">
                    <input
                      type="number"
                      id="sessionTimeoutMinutes"
                      min="5"
                      max="480"
                      value={accountPolicy.sessionTimeoutMinutes}
                      onChange={(e) => setAccountPolicy({...accountPolicy, sessionTimeoutMinutes: parseInt(e.target.value)})}
                      className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-slate-300 rounded-md"
                    />
                  </div>
                </div>
                
                <div>
                  <label htmlFor="inactivityLockoutDays" className="block text-sm font-medium text-slate-700">
                    Bloqueio por inatividade (dias)
                  </label>
                  <div className="mt-1">
                    <input
                      type="number"
                      id="inactivityLockoutDays"
                      min="0"
                      max="365"
                      value={accountPolicy.inactivityLockoutDays}
                      onChange={(e) => setAccountPolicy({...accountPolicy, inactivityLockoutDays: parseInt(e.target.value)})}
                      className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-slate-300 rounded-md"
                    />
                    <p className="mt-1 text-sm text-slate-500">
                      Use 0 para desativar o bloqueio por inatividade
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="relative flex items-start">
                <div className="flex items-center h-5">
                  <input
                    id="requireMfa"
                    type="checkbox"
                    checked={accountPolicy.requireMfa}
                    onChange={(e) => setAccountPolicy({...accountPolicy, requireMfa: e.target.checked})}
                    className="focus:ring-indigo-500 h-4 w-4 text-indigo-600 border-slate-300 rounded"
                  />
                </div>
                <div className="ml-3 text-sm">
                  <label htmlFor="requireMfa" className="font-medium text-slate-700">
                    Exigir autenticação de dois fatores (MFA)
                  </label>
                  <p className="text-slate-500">
                    Todos os usuários serão obrigados a configurar a autenticação de dois fatores
                  </p>
                </div>
              </div>
            </div>
          </div>
          
          {/* Política de Dados */}
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="p-6 border-b border-slate-200">
              <h2 className="text-xl font-medium text-slate-800 flex items-center">
                <FileKey className="mr-2 h-5 w-5 text-indigo-600" />
                Política de Dados e Privacidade
              </h2>
              <p className="mt-1 text-sm text-slate-600">
                Configure as políticas de retenção e proteção de dados pessoais.
              </p>
            </div>
            
            <div className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="dataRetentionMonths" className="block text-sm font-medium text-slate-700">
                    Retenção de dados (meses)
                  </label>
                  <div className="mt-1">
                    <input
                      type="number"
                      id="dataRetentionMonths"
                      min="1"
                      max="120"
                      value={dataPolicy.dataRetentionMonths}
                      onChange={(e) => setDataPolicy({...dataPolicy, dataRetentionMonths: parseInt(e.target.value)})}
                      className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-slate-300 rounded-md"
                    />
                    <p className="mt-1 text-sm text-slate-500">
                      Período máximo de retenção de dados pessoais
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="space-y-4">
                <div className="relative flex items-start">
                  <div className="flex items-center h-5">
                    <input
                      id="encryptSensitiveData"
                      type="checkbox"
                      checked={dataPolicy.encryptSensitiveData}
                      onChange={(e) => setDataPolicy({...dataPolicy, encryptSensitiveData: e.target.checked})}
                      className="focus:ring-indigo-500 h-4 w-4 text-indigo-600 border-slate-300 rounded"
                    />
                  </div>
                  <div className="ml-3 text-sm">
                    <label htmlFor="encryptSensitiveData" className="font-medium text-slate-700">
                      Criptografar dados sensíveis
                    </label>
                    <p className="text-slate-500">
                      Dados pessoais serão armazenados com criptografia
                    </p>
                  </div>
                </div>
                
                <div className="relative flex items-start">
                  <div className="flex items-center h-5">
                    <input
                      id="anonymizeDeletedUsers"
                      type="checkbox"
                      checked={dataPolicy.anonymizeDeletedUsers}
                      onChange={(e) => setDataPolicy({...dataPolicy, anonymizeDeletedUsers: e.target.checked})}
                      className="focus:ring-indigo-500 h-4 w-4 text-indigo-600 border-slate-300 rounded"
                    />
                  </div>
                  <div className="ml-3 text-sm">
                    <label htmlFor="anonymizeDeletedUsers" className="font-medium text-slate-700">
                      Anonimizar usuários excluídos
                    </label>
                    <p className="text-slate-500">
                      Dados pessoais de usuários excluídos serão anonimizados
                    </p>
                  </div>
                </div>
                
                <div className="relative flex items-start">
                  <div className="flex items-center h-5">
                    <input
                      id="enableAuditLogging"
                      type="checkbox"
                      checked={dataPolicy.enableAuditLogging}
                      onChange={(e) => setDataPolicy({...dataPolicy, enableAuditLogging: e.target.checked})}
                      className="focus:ring-indigo-500 h-4 w-4 text-indigo-600 border-slate-300 rounded"
                    />
                  </div>
                  <div className="ml-3 text-sm">
                    <label htmlFor="enableAuditLogging" className="font-medium text-slate-700">
                      Habilitar logs de auditoria
                    </label>
                    <p className="text-slate-500">
                      Registrar todas as ações de usuários no sistema
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="flex justify-end">
            <button
              type="button"
              className="mr-3 inline-flex items-center px-4 py-2 border border-slate-300 shadow-sm text-sm font-medium rounded-md text-slate-700 bg-white hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              <RefreshCw className="mr-2 h-4 w-4" />
              Restaurar Padrões
            </button>
            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              {loading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Salvando...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Salvar Alterações
                </>
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
  )
}