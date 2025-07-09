'use client';

import React, { useState, useEffect } from 'react';
import { googleEmailService, getGoogleEmailStatus, testGoogleEmailConfig } from '@/services/googleEmailService';
import { enhancedEmailService } from '@/services/enhancedEmailService';
import { useToast } from '@/hooks/useToast';

interface GoogleEmailStatus {
  configured: boolean;
  host?: string;
  port?: number;
  user?: string;
  source: 'system' | 'env' | 'default' | 'none';
}

export default function GoogleEmailDemo() {
  const { showSuccess, showError, showInfo } = useToast();
  const [status, setStatus] = useState<GoogleEmailStatus | null>(null);
  const [loading, setLoading] = useState(false);
  const [testLoading, setTestLoading] = useState(false);
  const [sendLoading, setSendLoading] = useState(false);
  
  // Estado do formulário de teste
  const [testEmail, setTestEmail] = useState('');
  const [testSubject, setTestSubject] = useState('Teste Google Email - Portal Sabercon');
  const [testMessage, setTestMessage] = useState(`
Olá! Este é um teste do novo serviço Google Email integrado ao Portal Sabercon.

✅ Características do serviço:
• Configuração automática via sistema/ENV
• Fallback inteligente entre múltiplos providers
• Retry automático em caso de falhas
• Logs detalhados para troubleshooting

🚀 O sistema agora suporta:
1. API Principal do Sistema
2. Google Email (NEW!)
3. Envio Direto
4. Fallback Local

Este email foi enviado usando o serviço Google Email desacoplado.

---
Portal Educacional Sabercon
${new Date().toLocaleString('pt-BR')}
  `.trim());

  // Carregar status inicial
  useEffect(() => {
    loadStatus();
  }, []);

  const loadStatus = async () => {
    setLoading(true);
    try {
      const emailStatus = await getGoogleEmailStatus();
      setStatus(emailStatus);
      console.log('📊 Status do Google Email:', emailStatus);
    } catch (error: any) {
      console.error('Erro ao carregar status:', error);
      showError('Erro ao carregar status do Google Email');
    } finally {
      setLoading(false);
    }
  };

  const handleTestConnection = async () => {
    setTestLoading(true);
    try {
      showInfo('Testando configuração do Google Email...');
      
      const result = await testGoogleEmailConfig();
      
      if (result.success) {
        showSuccess(result.message);
      } else {
        showError(result.message || 'Erro no teste de conexão');
      }
      
      // Recarregar status após o teste
      await loadStatus();
    } catch (error: any) {
      console.error('Erro no teste:', error);
      showError('Erro ao testar configuração: ' + error.message);
    } finally {
      setTestLoading(false);
    }
  };

  const handleReconfigure = async () => {
    setLoading(true);
    try {
      showInfo('Reconfigurando Google Email...');
      await googleEmailService.reconfigure();
      await loadStatus();
      showSuccess('Google Email reconfigurado com sucesso');
    } catch (error: any) {
      console.error('Erro na reconfiguração:', error);
      showError('Erro ao reconfigurar: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSendTestEmail = async () => {
    if (!testEmail.trim()) {
      showError('Digite um email de destino');
      return;
    }

    if (!testSubject.trim() || !testMessage.trim()) {
      showError('Assunto e mensagem são obrigatórios');
      return;
    }

    setSendLoading(true);
    try {
      showInfo('Enviando email de teste via sistema integrado...');
      
      // Usar o enhancedEmailService que agora inclui o Google Email
      const result = await enhancedEmailService.sendEmail({
        title: testSubject,
        subject: testSubject,
        message: testMessage,
        html: false,
        recipients: {
          emails: [testEmail],
          users: [],
          roles: []
        }
      });
      
      if (result.success) {
        showSuccess(result.message);
        console.log('📧 Resultado do envio:', result);
      } else {
        showError(result.message || 'Erro no envio do email');
        console.error('❌ Erro no envio:', result);
      }
    } catch (error: any) {
      console.error('Erro no envio:', error);
      showError('Erro ao enviar email: ' + error.message);
    } finally {
      setSendLoading(false);
    }
  };

  const getStatusColor = (configured: boolean, source: string) => {
    if (!configured) return 'text-red-600 bg-red-50';
    if (source === 'system') return 'text-green-600 bg-green-50';
    if (source === 'env') return 'text-blue-600 bg-blue-50';
    return 'text-yellow-600 bg-yellow-50';
  };

  const getSourceText = (source: string) => {
    switch (source) {
      case 'system': return 'Configurações do Sistema';
      case 'env': return 'Variáveis de Ambiente';
      case 'default': return 'Configuração Padrão';
      case 'none': return 'Não Configurado';
      default: return source;
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg p-6">
        <h1 className="text-2xl font-bold mb-2">
          📧 Google Email Service - Portal Sabercon
        </h1>
        <p className="opacity-90">
          Serviço desacoplado para envio de emails via Google/Gmail integrado ao sistema existente.
        </p>
      </div>

      {/* Status Card */}
      <div className="bg-white rounded-lg shadow-lg border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-800">
              Status da Configuração
            </h2>
            <button
              onClick={loadStatus}
              disabled={loading}
              className="flex items-center px-3 py-2 text-sm bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors disabled:opacity-50"
            >
              <span className="material-symbols-outlined text-sm mr-1">
                {loading ? 'hourglass_empty' : 'refresh'}
              </span>
              {loading ? 'Carregando...' : 'Atualizar'}
            </button>
          </div>
        </div>
        
        <div className="p-6">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-2 border-blue-500 border-t-transparent"></div>
              <span className="ml-2 text-gray-600">Carregando status...</span>
            </div>
          ) : status ? (
            <div className="space-y-4">
              {/* Status Principal */}
              <div className={`inline-flex items-center px-3 py-2 rounded-full text-sm font-medium ${getStatusColor(status.configured, status.source)}`}>
                <span className="material-symbols-outlined text-sm mr-2">
                  {status.configured ? 'check_circle' : 'error'}
                </span>
                {status.configured ? 'Configurado' : 'Não Configurado'}
              </div>

              {/* Detalhes */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-600 mb-1">Fonte</p>
                  <p className="font-medium">{getSourceText(status.source)}</p>
                </div>
                
                {status.host && (
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-600 mb-1">Host</p>
                    <p className="font-medium">{status.host}</p>
                  </div>
                )}
                
                {status.port && (
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-600 mb-1">Porta</p>
                    <p className="font-medium">{status.port}</p>
                  </div>
                )}
                
                {status.user && (
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-600 mb-1">Usuário</p>
                    <p className="font-medium">{status.user}</p>
                  </div>
                )}
              </div>

              {/* Ações */}
              <div className="flex flex-wrap gap-3 pt-4">
                <button
                  onClick={handleTestConnection}
                  disabled={testLoading || !status.configured}
                  className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <span className="material-symbols-outlined text-sm mr-2">
                    {testLoading ? 'hourglass_empty' : 'wifi_protected_setup'}
                  </span>
                  {testLoading ? 'Testando...' : 'Testar Conexão'}
                </button>

                <button
                  onClick={handleReconfigure}
                  disabled={loading}
                  className="flex items-center px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors disabled:opacity-50"
                >
                  <span className="material-symbols-outlined text-sm mr-2">
                    settings_backup_restore
                  </span>
                  Reconfigurar
                </button>
              </div>
            </div>
          ) : (
            <div className="text-center text-gray-500 py-8">
              Erro ao carregar status
            </div>
          )}
        </div>
      </div>

      {/* Test Email Card */}
      <div className="bg-white rounded-lg shadow-lg border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-800">
            Teste de Envio Integrado
          </h2>
          <p className="text-gray-600 mt-2">
            Envie um email de teste usando o sistema integrado com Google Email.
          </p>
        </div>
        
        <div className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email de Destino
            </label>
            <input
              type="email"
              value={testEmail}
              onChange={(e) => setTestEmail(e.target.value)}
              placeholder="seuemail@exemplo.com"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Assunto
            </label>
            <input
              type="text"
              value={testSubject}
              onChange={(e) => setTestSubject(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Mensagem
            </label>
            <textarea
              value={testMessage}
              onChange={(e) => setTestMessage(e.target.value)}
              rows={8}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <button
            onClick={handleSendTestEmail}
            disabled={sendLoading || !status?.configured}
            className="w-full flex items-center justify-center px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span className="material-symbols-outlined text-sm mr-2">
              {sendLoading ? 'hourglass_empty' : 'send'}
            </span>
            {sendLoading ? 'Enviando...' : 'Enviar Email de Teste'}
          </button>
          
          {!status?.configured && (
            <p className="text-sm text-amber-600 bg-amber-50 p-3 rounded-lg">
              ⚠️ Configure as credenciais do Google Email para usar esta funcionalidade.
            </p>
          )}
        </div>
      </div>

      {/* Info Card */}
      <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-3">
          📋 Como Funciona
        </h3>
        <div className="space-y-3 text-gray-700">
          <p>
            <strong>1. Configuração Automática:</strong> O serviço busca configurações do sistema primeiro, 
            depois fallback para variáveis de ambiente.
          </p>
          <p>
            <strong>2. Integração Inteligente:</strong> O Google Email é automaticamente incluído como 
            provider de alta prioridade no sistema de envio existente.
          </p>
          <p>
            <strong>3. Fallback Robusto:</strong> Se o Google Email falhar, o sistema tenta automaticamente 
            outros providers (Sistema Principal → Google Email → Envio Direto → Fallback Local).
          </p>
          <p>
            <strong>4. Zero Configuração:</strong> Uma vez configurado, funciona automaticamente em 
            todo o sistema "Enviar Email" existente.
          </p>
        </div>
      </div>
    </div>
  );
} 