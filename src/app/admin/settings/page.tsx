'use client'

import { useAuth } from '@/contexts/AuthContext'

export default function AdminSettingsPage() {
  const { user } = useAuth()

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Configurações do Sistema</h1>
          <p className="text-gray-600">Gerencie as configurações globais da plataforma</p>
        </div>
        <div className="space-x-4">
          <button className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200">
            Restaurar Padrões
          </button>
          <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
            Salvar Alterações
          </button>
        </div>
      </div>

      {/* Settings Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Settings */}
        <div className="lg:col-span-2 space-y-6">
          {/* General Settings */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Configurações Gerais</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nome da Plataforma
                </label>
                <input
                  type="text"
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  defaultValue="Portal Educacional"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  URL do Sistema
                </label>
                <input
                  type="text"
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  defaultValue="https://portal.educacional.com"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email de Suporte
                </label>
                <input
                  type="email"
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  defaultValue="suporte@portal.educacional.com"
                />
              </div>
            </div>
          </div>

          {/* Security Settings */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Segurança</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Política de Senha
                </label>
                <div className="space-y-2">
                  <div className="flex items-center">
                    <input type="checkbox" className="h-4 w-4 text-blue-600" defaultChecked />
                    <span className="ml-2 text-sm text-gray-600">Mínimo 8 caracteres</span>
                  </div>
                  <div className="flex items-center">
                    <input type="checkbox" className="h-4 w-4 text-blue-600" defaultChecked />
                    <span className="ml-2 text-sm text-gray-600">Exigir caracteres especiais</span>
                  </div>
                  <div className="flex items-center">
                    <input type="checkbox" className="h-4 w-4 text-blue-600" defaultChecked />
                    <span className="ml-2 text-sm text-gray-600">Exigir números</span>
                  </div>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Autenticação em Duas Etapas
                </label>
                <select className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500">
                  <option value="optional">Opcional</option>
                  <option value="required">Obrigatório</option>
                  <option value="disabled">Desativado</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tempo de Sessão (minutos)
                </label>
                <input
                  type="number"
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  defaultValue="30"
                />
              </div>
            </div>
          </div>

          {/* Email Settings */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Configurações de Email</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Servidor SMTP
                </label>
                <input
                  type="text"
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="smtp.servidor.com"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Porta
                  </label>
                  <input
                    type="number"
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="587"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Criptografia
                  </label>
                  <select className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500">
                    <option value="tls">TLS</option>
                    <option value="ssl">SSL</option>
                    <option value="none">Nenhuma</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email de Envio
                </label>
                <input
                  type="email"
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="noreply@portal.educacional.com"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar Settings */}
        <div className="space-y-6">
          {/* System Info */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Informações do Sistema</h2>
            <div className="space-y-3">
              <div>
                <span className="text-sm text-gray-600">Versão</span>
                <p className="text-sm font-medium text-gray-800">2.1.0</p>
              </div>
              <div>
                <span className="text-sm text-gray-600">Última Atualização</span>
                <p className="text-sm font-medium text-gray-800">01/01/2024</p>
              </div>
              <div>
                <span className="text-sm text-gray-600">Status</span>
                <p className="text-sm font-medium text-green-600">Operacional</p>
              </div>
            </div>
          </div>

          {/* Storage Settings */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Armazenamento</h2>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-600">Uso do Espaço</span>
                  <span className="text-gray-800">75%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-blue-600 h-2 rounded-full" style={{ width: '75%' }}></div>
                </div>
                <p className="text-xs text-gray-500 mt-1">750GB de 1TB usado</p>
              </div>
              <button className="w-full bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200">
                Gerenciar Armazenamento
              </button>
            </div>
          </div>

          {/* Maintenance Mode */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Modo de Manutenção</h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Status</span>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" className="sr-only peer" />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Mensagem de Manutenção
                </label>
                <textarea
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={3}
                  placeholder="Sistema em manutenção..."
                ></textarea>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
