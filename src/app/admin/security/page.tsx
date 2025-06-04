'use client'

import { useAuth } from '@/contexts/AuthContext'
import { useState } from 'react'

const SECURITY_DATA = {
  overview: {
    threatLevel: 'Baixo',
    activeThreats: 2,
    blockedAttempts: 156,
    securityScore: 92
  },
  recentEvents: [
    {
      id: 1,
      type: 'login_attempt',
      severity: 'high',
      message: 'Múltiplas tentativas de login falharam para admin@escola.com',
      ip: '192.168.1.100',
      timestamp: '2024-03-20 11:45:00',
      status: 'blocked'
    },
    {
      id: 2,
      type: 'suspicious_activity',
      severity: 'medium',
      message: 'Acesso de localização incomum detectado',
      ip: '203.45.67.89',
      timestamp: '2024-03-20 10:30:00',
      status: 'monitoring'
    },
    {
      id: 3,
      type: 'password_change',
      severity: 'low',
      message: 'Senha alterada com sucesso para user@escola.com',
      ip: '192.168.1.50',
      timestamp: '2024-03-20 09:15:00',
      status: 'success'
    }
  ],
  policies: [
    {
      id: 1,
      name: 'Política de Senhas',
      description: 'Requisitos mínimos para senhas de usuários',
      status: 'active',
      lastUpdated: '2024-03-01',
      rules: [
        'Mínimo 8 caracteres',
        'Pelo menos 1 letra maiúscula',
        'Pelo menos 1 número',
        'Pelo menos 1 caractere especial'
      ]
    },
    {
      id: 2,
      name: 'Bloqueio de Conta',
      description: 'Política de bloqueio após tentativas falhadas',
      status: 'active',
      lastUpdated: '2024-02-15',
      rules: [
        'Bloqueio após 5 tentativas falhadas',
        'Duração do bloqueio: 30 minutos',
        'Notificação por email'
      ]
    },
    {
      id: 3,
      name: 'Sessões',
      description: 'Gerenciamento de sessões de usuário',
      status: 'active',
      lastUpdated: '2024-03-10',
      rules: [
        'Timeout de sessão: 2 horas',
        'Máximo 3 sessões simultâneas',
        'Logout automático em inatividade'
      ]
    }
  ],
  vulnerabilities: [
    {
      id: 1,
      title: 'Certificado SSL próximo ao vencimento',
      severity: 'medium',
      description: 'Certificado SSL expira em 15 dias',
      recommendation: 'Renovar certificado SSL',
      status: 'open'
    },
    {
      id: 2,
      title: 'Versão desatualizada do framework',
      severity: 'low',
      description: 'Framework React em versão anterior',
      recommendation: 'Atualizar para versão mais recente',
      status: 'open'
    }
  ]
}

export default function AdminSecurityPage() {
  const { user } = useAuth()
  const [selectedTab, setSelectedTab] = useState('overview')
  const [showPolicyModal, setShowPolicyModal] = useState(false)

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h1 className="text-2xl font-bold text-primary">Segurança</h1>
            <p className="text-gray-600">Monitoramento e configuração de segurança</p>
          </div>
          <div className="flex space-x-4">
            <button
              onClick={() => setShowPolicyModal(true)}
              className="bg-primary text-white px-6 py-2 rounded-lg hover:bg-primary-dark flex items-center space-x-2 transition-colors"
            >
              <span className="material-symbols-outlined">add</span>
              <span>Nova Política</span>
            </button>
            <button className="bg-error text-white px-6 py-2 rounded-lg hover:bg-error/80 flex items-center space-x-2 transition-colors">
              <span className="material-symbols-outlined">security</span>
              <span>Scan de Segurança</span>
            </button>
          </div>
        </div>

        {/* Security Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between mb-2">
              <div className="text-sm font-medium text-gray-500">Nível de Ameaça</div>
              <div className={`w-3 h-3 rounded-full ${
                SECURITY_DATA.overview.threatLevel === 'Baixo' ? 'bg-accent-green' :
                SECURITY_DATA.overview.threatLevel === 'Médio' ? 'bg-accent-yellow' : 'bg-error'
              }`}></div>
            </div>
            <div className="text-2xl font-bold text-primary">{SECURITY_DATA.overview.threatLevel}</div>
            <div className="text-sm text-gray-600 mt-1">Sistema seguro</div>
          </div>
          
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="text-sm font-medium text-gray-500 mb-1">Ameaças Ativas</div>
            <div className="text-2xl font-bold text-gray-600">{SECURITY_DATA.overview.activeThreats}</div>
            <div className="mt-2 flex items-center">
              <span className="text-error text-sm">↑ 1</span>
              <span className="text-gray-500 text-sm ml-2">última hora</span>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="text-sm font-medium text-gray-500 mb-1">Tentativas Bloqueadas</div>
            <div className="text-2xl font-bold text-gray-600">{SECURITY_DATA.overview.blockedAttempts}</div>
            <div className="mt-2 flex items-center">
              <span className="text-accent-green text-sm">↓ 12</span>
              <span className="text-gray-500 text-sm ml-2">hoje</span>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="text-sm font-medium text-gray-500 mb-1">Score de Segurança</div>
            <div className="text-2xl font-bold text-gray-600">{SECURITY_DATA.overview.securityScore}%</div>
            <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
              <div 
                className="bg-accent-green h-2 rounded-full"
                style={{ width: `${SECURITY_DATA.overview.securityScore}%` }}
              ></div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200 mb-6">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setSelectedTab('overview')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                selectedTab === 'overview'
                  ? 'border-primary text-primary'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Visão Geral
            </button>
            <button
              onClick={() => setSelectedTab('events')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                selectedTab === 'events'
                  ? 'border-primary text-primary'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Eventos de Segurança
            </button>
            <button
              onClick={() => setSelectedTab('policies')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                selectedTab === 'policies'
                  ? 'border-primary text-primary'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Políticas
            </button>
            <button
              onClick={() => setSelectedTab('vulnerabilities')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                selectedTab === 'vulnerabilities'
                  ? 'border-primary text-primary'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Vulnerabilidades
            </button>
          </nav>
        </div>
      </div>

      {/* Overview Tab */}
      {selectedTab === 'overview' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Recent Security Events */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold text-primary mb-4">Eventos Recentes</h3>
              <div className="space-y-3">
                {SECURITY_DATA.recentEvents.slice(0, 3).map((event) => (
                  <div key={event.id} className="flex items-start space-x-3 p-3 border border-gray-200 rounded-lg">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      event.severity === 'high' ? 'bg-error/10' :
                      event.severity === 'medium' ? 'bg-accent-yellow/10' : 'bg-accent-green/10'
                    }`}>
                      <span className={`material-symbols-outlined text-xs ${
                        event.severity === 'high' ? 'text-error' :
                        event.severity === 'medium' ? 'text-accent-yellow' : 'text-accent-green'
                      }`}>
                        {event.type === 'login_attempt' ? 'login' :
                         event.type === 'suspicious_activity' ? 'warning' : 'check'}
                      </span>
                    </div>
                    <div className="flex-1">
                      <p className="text-sm text-gray-600">{event.message}</p>
                      <p className="text-xs text-gray-500 mt-1">{event.timestamp}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Security Score Breakdown */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold text-primary mb-4">Análise de Segurança</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Autenticação</span>
                  <div className="flex items-center space-x-2">
                    <div className="w-20 bg-gray-200 rounded-full h-2">
                      <div className="bg-accent-green h-2 rounded-full" style={{ width: '95%' }}></div>
                    </div>
                    <span className="text-sm font-medium">95%</span>
                  </div>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Criptografia</span>
                  <div className="flex items-center space-x-2">
                    <div className="w-20 bg-gray-200 rounded-full h-2">
                      <div className="bg-accent-green h-2 rounded-full" style={{ width: '98%' }}></div>
                    </div>
                    <span className="text-sm font-medium">98%</span>
                  </div>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Controle de Acesso</span>
                  <div className="flex items-center space-x-2">
                    <div className="w-20 bg-gray-200 rounded-full h-2">
                      <div className="bg-accent-yellow h-2 rounded-full" style={{ width: '85%' }}></div>
                    </div>
                    <span className="text-sm font-medium">85%</span>
                  </div>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Monitoramento</span>
                  <div className="flex items-center space-x-2">
                    <div className="w-20 bg-gray-200 rounded-full h-2">
                      <div className="bg-accent-green h-2 rounded-full" style={{ width: '92%' }}></div>
                    </div>
                    <span className="text-sm font-medium">92%</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Events Tab */}
      {selectedTab === 'events' && (
        <div className="space-y-4">
          {SECURITY_DATA.recentEvents.map((event) => (
            <div key={event.id} className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-4">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    event.severity === 'high' ? 'bg-error/10' :
                    event.severity === 'medium' ? 'bg-accent-yellow/10' : 'bg-accent-green/10'
                  }`}>
                    <span className={`material-symbols-outlined text-sm ${
                      event.severity === 'high' ? 'text-error' :
                      event.severity === 'medium' ? 'text-accent-yellow' : 'text-accent-green'
                    }`}>
                      {event.type === 'login_attempt' ? 'login' :
                       event.type === 'suspicious_activity' ? 'warning' : 'check'}
                    </span>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-600">{event.message}</h4>
                    <div className="flex items-center space-x-4 text-sm text-gray-600 mt-1">
                      <span>IP: {event.ip}</span>
                      <span>•</span>
                      <span>{event.timestamp}</span>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                    event.severity === 'high' ? 'bg-error/20 text-error' :
                    event.severity === 'medium' ? 'bg-accent-yellow/20 text-accent-yellow' : 'bg-accent-green/20 text-accent-green'
                  }`}>
                    {event.severity === 'high' ? 'Alta' :
                     event.severity === 'medium' ? 'Média' : 'Baixa'}
                  </span>
                  
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                    event.status === 'blocked' ? 'bg-error/20 text-error' :
                    event.status === 'monitoring' ? 'bg-accent-yellow/20 text-accent-yellow' : 'bg-accent-green/20 text-accent-green'
                  }`}>
                    {event.status === 'blocked' ? 'Bloqueado' :
                     event.status === 'monitoring' ? 'Monitorando' : 'Sucesso'}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Policies Tab */}
      {selectedTab === 'policies' && (
        <div className="space-y-6">
          {SECURITY_DATA.policies.map((policy) => (
            <div key={policy.id} className="bg-white rounded-lg shadow-md p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-primary">{policy.name}</h3>
                  <p className="text-gray-600 mt-1">{policy.description}</p>
                  <p className="text-sm text-gray-500 mt-2">
                    Última atualização: {new Date(policy.lastUpdated).toLocaleDateString('pt-BR')}
                  </p>
                </div>
                <div className="flex items-center space-x-3">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                    policy.status === 'active' ? 'bg-accent-green/20 text-accent-green' : 'bg-gray-100 text-gray-600'
                  }`}>
                    {policy.status === 'active' ? 'Ativa' : 'Inativa'}
                  </span>
                  <button className="text-primary hover:text-primary-dark transition-colors">
                    <span className="material-symbols-outlined text-sm">edit</span>
                  </button>
                </div>
              </div>
              
              <div>
                <h4 className="font-medium text-gray-700 mb-2">Regras:</h4>
                <ul className="space-y-1">
                  {policy.rules.map((rule, index) => (
                    <li key={index} className="flex items-center space-x-2 text-sm text-gray-600">
                      <span className="material-symbols-outlined text-xs text-accent-green">check</span>
                      <span>{rule}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Vulnerabilities Tab */}
      {selectedTab === 'vulnerabilities' && (
        <div className="space-y-4">
          {SECURITY_DATA.vulnerabilities.map((vuln) => (
            <div key={vuln.id} className="bg-white rounded-lg shadow-md p-6">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-lg font-semibold text-primary">{vuln.title}</h3>
                  <p className="text-gray-600 mt-1">{vuln.description}</p>
                  <p className="text-sm text-primary mt-2">
                    <strong>Recomendação:</strong> {vuln.recommendation}
                  </p>
                </div>
                
                <div className="flex items-center space-x-3">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                    vuln.severity === 'high' ? 'bg-error/20 text-error' :
                    vuln.severity === 'medium' ? 'bg-accent-yellow/20 text-accent-yellow' : 'bg-accent-green/20 text-accent-green'
                  }`}>
                    {vuln.severity === 'high' ? 'Alta' :
                     vuln.severity === 'medium' ? 'Média' : 'Baixa'}
                  </span>
                  
                  <button className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary-dark text-sm transition-colors">
                    Resolver
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Policy Modal */}
      {showPolicyModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-primary">Nova Política de Segurança</h3>
              <button 
                onClick={() => setShowPolicyModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            
            <form className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nome da Política</label>
                <input 
                  type="text" 
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="Ex: Política de Backup"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Descrição</label>
                <textarea 
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  rows={3}
                  placeholder="Descreva a política de segurança"
                ></textarea>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Regras</label>
                <textarea 
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  rows={4}
                  placeholder="Digite as regras, uma por linha"
                ></textarea>
              </div>
              
              <div className="flex justify-end space-x-3 pt-4">
                <button 
                  type="button"
                  onClick={() => setShowPolicyModal(false)}
                  className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancelar
                </button>
                <button 
                  type="submit"
                  className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors"
                >
                  Criar Política
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}