'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'

export default function AdminSettingsPage() {
  const { user } = useAuth()
  
  // Estados para as configurações da AWS
  const [awsSettings, setAwsSettings] = useState({
    accessKeyId: '',
    secretAccessKey: '',
    region: 'us-east-1',
    s3BucketName: '',
    cloudWatchNamespace: 'Portal/Metrics',
    updateInterval: 30,
    enableRealTimeUpdates: true
  })

  // Estado para o plano de fundo do login
  const [backgroundSettings, setBackgroundSettings] = useState({
    type: 'video', // 'video', 'url', 'color'
    videoFile: '/back_video1.mp4',
    customUrl: '',
    solidColor: '#1e3a8a'
  })

  // Lista de vídeos disponíveis na pasta public
  const availableVideos = [
    '/back_video.mp4',
    '/back_video1.mp4', 
    '/back_video2.mp4',
    '/back_video3.mp4',
    '/back_video4.mp4'
  ]

  const handleAwsSettingsChange = (field: string, value: string | number | boolean) => {
    setAwsSettings(prev => ({ ...prev, [field]: value }))
  }

  const handleBackgroundSettingsChange = (field: string, value: string) => {
    setBackgroundSettings(prev => ({ ...prev, [field]: value }))
  }

  const saveSettings = () => {
    // Aqui você salvaria as configurações no backend
    localStorage.setItem('awsSettings', JSON.stringify(awsSettings))
    localStorage.setItem('backgroundSettings', JSON.stringify(backgroundSettings))
    alert('Configurações salvas com sucesso!')
  }

  const restoreDefaults = () => {
    setAwsSettings({
      accessKeyId: '',
      secretAccessKey: '',
      region: 'us-east-1',
      s3BucketName: '',
      cloudWatchNamespace: 'Portal/Metrics',
      updateInterval: 30,
      enableRealTimeUpdates: true
    })
    setBackgroundSettings({
      type: 'video',
      videoFile: '/back_video1.mp4',
      customUrl: '',
      solidColor: '#1e3a8a'
    })
  }

  useEffect(() => {
    // Carregar configurações salvas
    const saved = localStorage.getItem('awsSettings')
    if (saved) {
      setAwsSettings(JSON.parse(saved))
    }
    
    const savedBackground = localStorage.getItem('backgroundSettings')
    if (savedBackground) {
      setBackgroundSettings(JSON.parse(savedBackground))
    }
  }, [])

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Configurações do Sistema</h1>
          <p className="text-gray-600">Gerencie as configurações globais da plataforma</p>
        </div>
        <div className="space-x-4">
          <button 
            onClick={restoreDefaults}
            className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200"
          >
            Restaurar Padrões
          </button>
          <button 
            onClick={saveSettings}
            className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary-dark transition-colors duration-200"
          >
            Salvar Alterações
          </button>
        </div>
      </div>

      {/* Settings Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Settings */}
        <div className="lg:col-span-2 space-y-6">
          {/* AWS Configuration */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Configurações da AWS</h2>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Access Key ID
                  </label>
                  <input
                    type="password"
                    value={awsSettings.accessKeyId}
                    onChange={(e) => handleAwsSettingsChange('accessKeyId', e.target.value)}
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-accent-blue"
                    placeholder="AKIA..."
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Secret Access Key
                  </label>
                  <input
                    type="password"
                    value={awsSettings.secretAccessKey}
                    onChange={(e) => handleAwsSettingsChange('secretAccessKey', e.target.value)}
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-accent-blue"
                    placeholder="*****"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Região
                  </label>
                  <select 
                    value={awsSettings.region}
                    onChange={(e) => handleAwsSettingsChange('region', e.target.value)}
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-accent-blue"
                  >
                    <option value="us-east-1">US East (N. Virginia)</option>
                    <option value="us-west-2">US West (Oregon)</option>
                    <option value="eu-west-1">Europe (Ireland)</option>
                    <option value="ap-southeast-1">Asia Pacific (Singapore)</option>
                    <option value="sa-east-1">South America (São Paulo)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Intervalo de Atualização (segundos)
                  </label>
                  <input
                    type="number"
                    min="10"
                    max="300"
                    value={awsSettings.updateInterval}
                    onChange={(e) => handleAwsSettingsChange('updateInterval', parseInt(e.target.value))}
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-accent-blue"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  CloudWatch Namespace
                </label>
                <input
                  type="text"
                  value={awsSettings.cloudWatchNamespace}
                  onChange={(e) => handleAwsSettingsChange('cloudWatchNamespace', e.target.value)}
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-accent-blue"
                  placeholder="Portal/Metrics"
                />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">Atualizações em Tempo Real</span>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input 
                    type="checkbox" 
                    className="sr-only peer" 
                    checked={awsSettings.enableRealTimeUpdates}
                    onChange={(e) => handleAwsSettingsChange('enableRealTimeUpdates', e.target.checked)}
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-accent-blue/30 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                </label>
              </div>
            </div>
          </div>

          {/* S3 Storage Configuration */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Configurações do S3</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nome do Bucket S3
                </label>
                <input
                  type="text"
                  value={awsSettings.s3BucketName}
                  onChange={(e) => handleAwsSettingsChange('s3BucketName', e.target.value)}
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-accent-blue"
                  placeholder="portal-educacional-storage"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Classe de Armazenamento
                  </label>
                  <select className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-accent-blue">
                    <option value="STANDARD">Standard</option>
                    <option value="REDUCED_REDUNDANCY">Reduced Redundancy</option>
                    <option value="STANDARD_IA">Standard-IA</option>
                    <option value="GLACIER">Glacier</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Criptografia
                  </label>
                  <select className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-accent-blue">
                    <option value="AES256">AES-256</option>
                    <option value="aws:kms">AWS KMS</option>
                    <option value="none">Nenhuma</option>
                  </select>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <button className="bg-accent-blue text-white px-4 py-2 rounded-lg hover:bg-accent-blue/80">
                  Testar Conexão S3
                </button>
                <button className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200">
                  Visualizar Buckets
                </button>
              </div>
            </div>
          </div>

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
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-accent-blue"
                  defaultValue="Portal Educacional"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  URL do Sistema
                </label>
                <input
                  type="text"
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-accent-blue"
                  defaultValue="https://portal.educacional.com"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email de Suporte
                </label>
                <input
                  type="email"
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-accent-blue"
                  defaultValue="suporte@portal.educacional.com"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Plano de Fundo do Login
                </label>
                <div className="space-y-4">
                  {/* Tipo de plano de fundo */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Tipo de Plano de Fundo
                    </label>
                    <div className="flex space-x-4">
                      <label className="flex items-center">
                        <input
                          type="radio"
                          name="backgroundType"
                          value="video"
                          checked={backgroundSettings.type === 'video'}
                          onChange={(e) => handleBackgroundSettingsChange('type', e.target.value)}
                          className="h-4 w-4 text-primary focus:ring-primary border-gray-300"
                        />
                        <span className="ml-2 text-sm text-gray-600">Vídeo</span>
                      </label>
                      <label className="flex items-center">
                        <input
                          type="radio"
                          name="backgroundType"
                          value="url"
                          checked={backgroundSettings.type === 'url'}
                          onChange={(e) => handleBackgroundSettingsChange('type', e.target.value)}
                          className="h-4 w-4 text-primary focus:ring-primary border-gray-300"
                        />
                        <span className="ml-2 text-sm text-gray-600">URL</span>
                      </label>
                      <label className="flex items-center">
                        <input
                          type="radio"
                          name="backgroundType"
                          value="color"
                          checked={backgroundSettings.type === 'color'}
                          onChange={(e) => handleBackgroundSettingsChange('type', e.target.value)}
                          className="h-4 w-4 text-primary focus:ring-primary border-gray-300"
                        />
                        <span className="ml-2 text-sm text-gray-600">Cor Sólida</span>
                      </label>
                    </div>
                  </div>

                  {/* Opções condicionais baseadas no tipo */}
                  {backgroundSettings.type === 'video' && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Selecionar Vídeo
                      </label>
                      <select
                        value={backgroundSettings.videoFile}
                        onChange={(e) => handleBackgroundSettingsChange('videoFile', e.target.value)}
                        className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-accent-blue"
                      >
                        {availableVideos.map((video) => (
                          <option key={video} value={video}>
                            {video.replace('/', '').replace('.mp4', '')}
                          </option>
                        ))}
                      </select>
                      <p className="text-xs text-gray-500 mt-1">
                        Vídeos disponíveis na pasta public/
                      </p>
                    </div>
                  )}

                  {backgroundSettings.type === 'url' && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        URL do Arquivo
                      </label>
                      <input
                        type="url"
                        value={backgroundSettings.customUrl}
                        onChange={(e) => handleBackgroundSettingsChange('customUrl', e.target.value)}
                        className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-accent-blue"
                        placeholder="https://exemplo.com/video.mp4"
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        URL para vídeo ou imagem externa
                      </p>
                    </div>
                  )}

                  {backgroundSettings.type === 'color' && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Cor de Fundo
                      </label>
                      <div className="flex space-x-2">
                        <input
                          type="color"
                          value={backgroundSettings.solidColor}
                          onChange={(e) => handleBackgroundSettingsChange('solidColor', e.target.value)}
                          className="h-10 w-20 rounded border border-gray-300"
                        />
                        <input
                          type="text"
                          value={backgroundSettings.solidColor}
                          onChange={(e) => handleBackgroundSettingsChange('solidColor', e.target.value)}
                          className="flex-1 px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-accent-blue"
                          placeholder="#1e3a8a"
                        />
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        Escolha uma cor sólida para o fundo
                      </p>
                    </div>
                  )}

                  {/* Preview */}
                  <div className="border rounded-lg p-4 bg-gray-50">
                    <p className="text-sm font-medium text-gray-700 mb-2">Preview:</p>
                    <div className="h-24 rounded border-2 border-dashed border-gray-300 flex items-center justify-center text-sm text-gray-600">
                      {backgroundSettings.type === 'video' && (
                        <span>Vídeo: {backgroundSettings.videoFile.replace('/', '').replace('.mp4', '')}</span>
                      )}
                      {backgroundSettings.type === 'url' && (
                        <span>URL: {backgroundSettings.customUrl || 'Nenhuma URL definida'}</span>
                      )}
                      {backgroundSettings.type === 'color' && (
                        <div className="flex items-center space-x-2">
                          <div 
                            className="w-6 h-6 rounded border"
                            style={{ backgroundColor: backgroundSettings.solidColor }}
                          />
                          <span>Cor: {backgroundSettings.solidColor}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
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
                    <input type="checkbox" className="h-4 w-4 text-primary" defaultChecked />
                    <span className="ml-2 text-sm text-gray-600">Mínimo 8 caracteres</span>
                  </div>
                  <div className="flex items-center">
                    <input type="checkbox" className="h-4 w-4 text-primary" defaultChecked />
                    <span className="ml-2 text-sm text-gray-600">Exigir caracteres especiais</span>
                  </div>
                  <div className="flex items-center">
                    <input type="checkbox" className="h-4 w-4 text-primary" defaultChecked />
                    <span className="ml-2 text-sm text-gray-600">Exigir números</span>
                  </div>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Autenticação em Duas Etapas
                </label>
                <select className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-accent-blue">
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
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-accent-blue"
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
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-accent-blue"
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
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-accent-blue"
                    placeholder="587"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Criptografia
                  </label>
                  <select className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-accent-blue">
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
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-accent-blue"
                  placeholder="noreply@portal.educacional.com"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar Settings */}
        <div className="space-y-6">
          {/* AWS Status */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Status da AWS</h2>
            <div className="space-y-3">
              <div>
                <span className="text-sm text-gray-600">Conexão</span>
                <p className="text-sm font-medium text-accent-green">Conectado</p>
              </div>
              <div>
                <span className="text-sm text-gray-600">Região Ativa</span>
                <p className="text-sm font-medium text-gray-800">{awsSettings.region}</p>
              </div>
              <div>
                <span className="text-sm text-gray-600">CloudWatch</span>
                <p className="text-sm font-medium text-accent-green">Ativo</p>
              </div>
              <div>
                <span className="text-sm text-gray-600">Última Sincronização</span>
                <p className="text-sm font-medium text-gray-800">Há 2 minutos</p>
              </div>
            </div>
          </div>

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
                <p className="text-sm font-medium text-accent-green">Operacional</p>
              </div>
            </div>
          </div>

          {/* AWS S3 Storage */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Armazenamento S3</h2>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-600">Uso do Bucket</span>
                  <span className="text-gray-800">2.3 GB</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-primary h-2 rounded-full" style={{ width: '23%' }}></div>
                </div>
                <p className="text-xs text-gray-500 mt-1">2.3GB de 10GB usado</p>
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="text-center">
                  <p className="text-gray-600">Arquivos</p>
                  <p className="font-medium">1,234</p>
                </div>
                <div className="text-center">
                  <p className="text-gray-600">Custo/Mês</p>
                  <p className="font-medium">$12.45</p>
                </div>
              </div>
              <button className="w-full bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 text-sm">
                Gerenciar S3
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
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-accent-blue/30 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                </label>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Mensagem de Manutenção
                </label>
                <textarea
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-accent-blue"
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
