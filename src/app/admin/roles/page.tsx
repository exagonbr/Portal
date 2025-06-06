'use client'

import React, { useState, useEffect } from 'react'
import { 
  Key, 
  Plus,
  Edit,
  Eye,
  Trash2,
  Check,
  X,
  Shield,
  Save,
  ChevronDown,
  ChevronRight
} from 'lucide-react'

export default function RolesPermissionsPage() {
  const [selectedRole, setSelectedRole] = useState<string | null>('admin')
  const [loading, setLoading] = useState(false)
  const [saved, setSaved] = useState(false)
  
  // Dados simulados - em um ambiente real, seriam carregados da API
  const roles = [
    { id: 'admin', name: 'Administrador do Sistema', description: 'Acesso completo ao sistema', userCount: 5 },
    { id: 'manager', name: 'Gestor Institucional', description: 'Gerencia uma instituição de ensino', userCount: 12 },
    { id: 'coordinator', name: 'Coordenador Acadêmico', description: 'Coordena departamentos acadêmicos', userCount: 24 },
    { id: 'teacher', name: 'Professor', description: 'Ministra aulas e avalia alunos', userCount: 145 },
    { id: 'student', name: 'Aluno', description: 'Participa de cursos e atividades', userCount: 2500 },
    { id: 'guardian', name: 'Responsável', description: 'Acompanha alunos sob sua responsabilidade', userCount: 1850 }
  ]
  
  // Grupos de permissões simulados
  const permissionGroups = [
    {
      id: 'system',
      name: 'Sistema',
      permissions: [
        { id: 'system.view', name: 'Visualizar Dashboard', description: 'Acesso ao dashboard do sistema' },
        { id: 'system.settings', name: 'Configurações do Sistema', description: 'Alterar configurações globais' },
        { id: 'system.maintenance', name: 'Manutenção', description: 'Executar tarefas de manutenção' },
        { id: 'system.logs', name: 'Logs do Sistema', description: 'Ver logs do sistema' }
      ]
    },
    {
      id: 'users',
      name: 'Usuários',
      permissions: [
        { id: 'users.view', name: 'Visualizar Usuários', description: 'Ver lista de usuários' },
        { id: 'users.create', name: 'Criar Usuários', description: 'Adicionar novos usuários' },
        { id: 'users.edit', name: 'Editar Usuários', description: 'Modificar dados de usuários' },
        { id: 'users.delete', name: 'Excluir Usuários', description: 'Remover usuários do sistema' }
      ]
    },
    {
      id: 'institutions',
      name: 'Instituições',
      permissions: [
        { id: 'institutions.view', name: 'Visualizar Instituições', description: 'Ver lista de instituições' },
        { id: 'institutions.create', name: 'Criar Instituições', description: 'Adicionar novas instituições' },
        { id: 'institutions.edit', name: 'Editar Instituições', description: 'Modificar dados de instituições' },
        { id: 'institutions.delete', name: 'Excluir Instituições', description: 'Remover instituições do sistema' }
      ]
    },
    {
      id: 'courses',
      name: 'Cursos',
      permissions: [
        { id: 'courses.view', name: 'Visualizar Cursos', description: 'Ver lista de cursos' },
        { id: 'courses.create', name: 'Criar Cursos', description: 'Adicionar novos cursos' },
        { id: 'courses.edit', name: 'Editar Cursos', description: 'Modificar dados de cursos' },
        { id: 'courses.delete', name: 'Excluir Cursos', description: 'Remover cursos do sistema' },
        { id: 'courses.enroll', name: 'Matricular Alunos', description: 'Matricular alunos em cursos' }
      ]
    },
    {
      id: 'content',
      name: 'Conteúdo',
      permissions: [
        { id: 'content.view', name: 'Visualizar Conteúdo', description: 'Ver conteúdo do sistema' },
        { id: 'content.create', name: 'Criar Conteúdo', description: 'Adicionar novo conteúdo' },
        { id: 'content.edit', name: 'Editar Conteúdo', description: 'Modificar conteúdo existente' },
        { id: 'content.delete', name: 'Excluir Conteúdo', description: 'Remover conteúdo do sistema' }
      ]
    },
    {
      id: 'reports',
      name: 'Relatórios',
      permissions: [
        { id: 'reports.view', name: 'Visualizar Relatórios', description: 'Acessar relatórios do sistema' },
        { id: 'reports.export', name: 'Exportar Relatórios', description: 'Exportar relatórios para outros formatos' },
        { id: 'reports.create', name: 'Criar Relatórios', description: 'Criar novos relatórios personalizados' }
      ]
    }
  ]

  // Estados para controlar quais grupos estão expandidos
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>(
    permissionGroups.reduce((acc, group) => ({ ...acc, [group.id]: true }), {})
  )

  // Estado para armazenar as permissões selecionadas para o papel atual
  const [selectedPermissions, setSelectedPermissions] = useState<Record<string, boolean>>({
    // Simulação - em um ambiente real, seriam carregadas da API
    'system.view': true,
    'system.settings': true,
    'system.maintenance': true,
    'system.logs': true,
    'users.view': true,
    'users.create': true,
    'users.edit': true,
    'users.delete': true,
    'institutions.view': true,
    'institutions.create': true,
    'institutions.edit': true,
    'institutions.delete': true,
    'courses.view': true,
    'courses.create': true,
    'courses.edit': true,
    'courses.delete': true,
    'courses.enroll': true,
    'content.view': true,
    'content.create': true,
    'content.edit': true,
    'content.delete': true,
    'reports.view': true,
    'reports.export': true,
    'reports.create': true
  })
  
  const toggleGroup = (groupId: string) => {
    setExpandedGroups(prev => ({
      ...prev,
      [groupId]: !prev[groupId]
    }))
  }
  
  const togglePermission = (permissionId: string) => {
    setSelectedPermissions(prev => ({
      ...prev,
      [permissionId]: !prev[permissionId]
    }))
  }
  
  const toggleAllInGroup = (groupId: string, value: boolean) => {
    const group = permissionGroups.find(g => g.id === groupId)
    if (!group) return
    
    const newPermissions = { ...selectedPermissions }
    group.permissions.forEach(permission => {
      newPermissions[permission.id] = value
    })
    
    setSelectedPermissions(newPermissions)
  }
  
  const handleSavePermissions = async () => {
    setLoading(true)
    
    // Simulação de salvamento
    try {
      // Em um ambiente real, faríamos uma chamada para a API aqui
      await new Promise(resolve => setTimeout(resolve, 1000))
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    } catch (error) {
      console.error('Erro ao salvar permissões:', error)
    } finally {
      setLoading(false)
    }
  }
  
  const isAllGroupSelected = (groupId: string) => {
    const group = permissionGroups.find(g => g.id === groupId)
    if (!group) return false
    
    return group.permissions.every(permission => selectedPermissions[permission.id])
  }
  
  const isAnyGroupSelected = (groupId: string) => {
    const group = permissionGroups.find(g => g.id === groupId)
    if (!group) return false
    
    return group.permissions.some(permission => selectedPermissions[permission.id])
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Cabeçalho */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-800 mb-2 flex items-center">
          <Key className="mr-2 h-8 w-8 text-indigo-600" />
          Gerenciar Permissões
        </h1>
        <p className="text-slate-600">
          Configure os papéis e permissões de acesso ao sistema.
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
                Permissões atualizadas com sucesso!
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Lista de Papéis */}
        <div className="lg:w-1/3">
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="p-4 border-b border-slate-200">
              <h2 className="text-lg font-medium text-slate-800 flex items-center">
                <Shield className="mr-2 h-5 w-5 text-indigo-600" />
                Papéis de Acesso
              </h2>
              <p className="mt-1 text-sm text-slate-600">
                Selecione um papel para configurar suas permissões
              </p>
            </div>
            
            <div className="p-2">
              <button 
                className="w-full flex justify-between items-center p-3 text-left rounded-md hover:bg-indigo-50 transition-colors"
              >
                <span className="font-medium text-indigo-600">+ Novo Papel</span>
              </button>
              
              <div className="mt-2 space-y-1">
                {roles.map(role => (
                  <button
                    key={role.id}
                    onClick={() => setSelectedRole(role.id)}
                    className={`w-full flex justify-between items-center p-3 text-left rounded-md ${
                      selectedRole === role.id ? 'bg-indigo-50 text-indigo-700' : 'hover:bg-slate-50'
                    }`}
                  >
                    <div>
                      <div className="font-medium">{role.name}</div>
                      <div className="text-xs text-slate-500">{role.description}</div>
                    </div>
                    <div className="text-xs text-slate-500 whitespace-nowrap">
                      {role.userCount} usuários
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
        
        {/* Configuração de Permissões */}
        <div className="lg:w-2/3">
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="p-4 border-b border-slate-200">
              <h2 className="text-lg font-medium text-slate-800">
                Permissões: {roles.find(r => r.id === selectedRole)?.name || 'Selecione um papel'}
              </h2>
              <p className="mt-1 text-sm text-slate-600">
                Configure quais ações esse papel pode realizar no sistema
              </p>
            </div>
            
            <div className="p-4">
              {permissionGroups.map(group => (
                <div key={group.id} className="mb-4 border border-slate-200 rounded-md overflow-hidden">
                  <div 
                    className="flex items-center justify-between p-3 bg-slate-50 cursor-pointer"
                    onClick={() => toggleGroup(group.id)}
                  >
                    <div className="flex items-center">
                      <button 
                        onClick={(e) => {
                          e.stopPropagation()
                          toggleAllInGroup(group.id, !isAllGroupSelected(group.id))
                        }}
                        className={`w-5 h-5 rounded border ${
                          isAllGroupSelected(group.id) 
                            ? 'bg-indigo-600 border-indigo-600 text-white' 
                            : isAnyGroupSelected(group.id)
                              ? 'bg-indigo-200 border-indigo-400'
                              : 'border-slate-300'
                        } flex items-center justify-center mr-3`}
                      >
                        {isAllGroupSelected(group.id) && <Check className="h-3 w-3" />}
                      </button>
                      <span className="font-medium">{group.name}</span>
                    </div>
                    {expandedGroups[group.id] ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                  </div>
                  
                  {expandedGroups[group.id] && (
                    <div className="p-3 border-t border-slate-200">
                      {group.permissions.map(permission => (
                        <div key={permission.id} className="flex items-center py-2">
                          <button 
                            onClick={() => togglePermission(permission.id)}
                            className={`w-5 h-5 rounded border ${
                              selectedPermissions[permission.id] 
                                ? 'bg-indigo-600 border-indigo-600 text-white' 
                                : 'border-slate-300'
                            } flex items-center justify-center mr-3`}
                          >
                            {selectedPermissions[permission.id] && <Check className="h-3 w-3" />}
                          </button>
                          <div>
                            <div className="text-sm font-medium">{permission.name}</div>
                            <div className="text-xs text-slate-500">{permission.description}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
              
              <div className="flex justify-end mt-6">
                <button
                  onClick={handleSavePermissions}
                  disabled={loading}
                  className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
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
          </div>
        </div>
      </div>
    </div>
  )
}
