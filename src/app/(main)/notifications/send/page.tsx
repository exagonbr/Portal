'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import Card, { CardHeader, CardBody } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { useToast } from '@/components/ToastManager';
import { EmailSendResult, EmailSendData } from '@/types/email';
import EnhancedEmailComposer from '@/components/notifications/EnhancedEmailComposer';
import EmailTemplateSelector from '@/components/notifications/EmailTemplateSelector';
import {
  Send,
  Mail,
  Bell,
  Settings,
  FileText,
  History,
  TrendingUp
} from 'lucide-react';
import { ContentCard } from '@/components/ui/StandardCard';
import { UnifiedAuthService } from '@/services/unifiedAuthService';
import { useRouter } from 'next/navigation';
import { emailTemplateService } from '@/services/emailTemplateService';
import { enhancedEmailService } from '@/services/enhancedEmailService';

export default function SendNotificationPage() {
  const { showSuccess, showError, showInfo } = useToast();
  const { user, refreshUser } = useAuth();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'email' | 'templates' | 'stats'>('email');
  const [emailStats, setEmailStats] = useState({
    totalSent: 0,
    successRate: 0,
    lastSent: null as string | null
  });

  // Verificar autenticação ao carregar a página
  useEffect(() => {
    const checkAuth = async () => {
      const isAuthenticated = UnifiedAuthService.isAuthenticated();
      if (!isAuthenticated) {
        showError('Sua sessão expirou. Por favor, faça login novamente.');
        router.push('/auth/login?redirect=/notifications/send');
        return;
      }
      
      try {
        await refreshUser();
        loadStats();
      } catch (error) {
        console.error('Erro ao renovar dados do usuário:', error);
      }
    };
    
    checkAuth();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadStats = () => {
    try {
      const stats = emailTemplateService.getStats();
      setEmailStats({
        totalSent: 0, // Em produção, carregar do backend
        successRate: 95, // Em produção, carregar do backend
        lastSent: localStorage.getItem('lastEmailSent')
      });
    } catch (error) {
      console.error('Erro ao carregar estatísticas:', error);
    }
  };

  // Função para lidar com o envio de emails
  const handleEmailSend = async (result: EmailSendResult) => {
    if (result.success) {
      showSuccess(result.message);
      // Salvar timestamp do último envio
      localStorage.setItem('lastEmailSent', new Date().toISOString());
      loadStats();
    } else {
      showError(result.message);
    }
  };

  // Função para salvar rascunho
  const handleSaveDraft = (data: EmailSendData) => {
    try {
      const drafts = JSON.parse(localStorage.getItem('emailDrafts') || '[]');
      const newDraft = {
        id: `draft_${Date.now()}`,
        ...data,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      drafts.push(newDraft);
      localStorage.setItem('emailDrafts', JSON.stringify(drafts));
      showSuccess('Rascunho salvo com sucesso');
    } catch (error) {
      showError('Erro ao salvar rascunho');
    }
  };

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Centro de Comunicação</h1>
        <p className="text-gray-600">
          Envie emails profissionais usando templates ou crie mensagens personalizadas
        </p>
      </div>

      {/* Navegação por tabs */}
      <div className="flex gap-4 mb-6 flex-wrap">
        <Button
          variant={activeTab === 'email' ? 'default' : 'outline'}
          onClick={() => setActiveTab('email')}
          className="flex items-center gap-2"
        >
          <Mail className="w-4 h-4" />
          Enviar Email
        </Button>
        <Button
          variant={activeTab === 'templates' ? 'default' : 'outline'}
          onClick={() => setActiveTab('templates')}
          className="flex items-center gap-2"
        >
          <FileText className="w-4 h-4" />
          Gerenciar Templates
        </Button>
        <Button
          variant={activeTab === 'stats' ? 'default' : 'outline'}
          onClick={() => setActiveTab('stats')}
          className="flex items-center gap-2"
        >
          <TrendingUp className="w-4 h-4" />
          Estatísticas
        </Button>
      </div>

      {/* Conteúdo das tabs */}
      {activeTab === 'email' && (
        <ContentCard 
          title="Enviar Email"
          subtitle="Compose e envie emails com templates profissionais"
          icon={Mail}
          iconColor="bg-blue-500"
        >
          <EnhancedEmailComposer
            onSend={handleEmailSend}
            onSave={handleSaveDraft}
            className="mt-0"
          />
        </ContentCard>
      )}

      {activeTab === 'templates' && (
        <ContentCard
          title="Gerenciar Templates"
          subtitle="Crie, edite e organize seus templates de email"
          icon={FileText}
          iconColor="bg-green-500"
        >
          <EmailTemplateSelector
            onTemplateSelect={() => {}}
            showCreateButton={true}
            showManagement={true}
            className="border-0 shadow-none"
          />
        </ContentCard>
      )}

      {activeTab === 'stats' && (
        <ContentCard
          title="Estatísticas de Email"
          subtitle="Acompanhe o desempenho dos seus envios"
          icon={TrendingUp}
          iconColor="bg-purple-500"
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardBody className="text-center">
                <div className="text-3xl font-bold text-blue-600 mb-2">
                  {emailStats.totalSent}
                </div>
                <div className="text-sm text-gray-600">
                  Emails Enviados
                </div>
              </CardBody>
            </Card>
            
            <Card>
              <CardBody className="text-center">
                <div className="text-3xl font-bold text-green-600 mb-2">
                  {emailStats.successRate}%
                </div>
                <div className="text-sm text-gray-600">
                  Taxa de Sucesso
                </div>
              </CardBody>
            </Card>
            
            <Card>
              <CardBody className="text-center">
                <div className="text-lg font-semibold text-gray-700 mb-2">
                  {emailStats.lastSent ? new Date(emailStats.lastSent).toLocaleDateString('pt-BR') : 'Nunca'}
                </div>
                <div className="text-sm text-gray-600">
                  Último Envio
                </div>
              </CardBody>
            </Card>
          </div>

          <div className="mt-6 p-4 bg-blue-50 rounded-lg">
            <h4 className="font-medium text-blue-900 mb-2 flex items-center gap-2">
              <Settings className="w-4 h-4" />
              Status do Sistema
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
              {enhancedEmailService.getProviderStatus().map((provider, index) => (
                <div key={index} className="flex items-center justify-between">
                  <span className="text-gray-700">{provider.name}</span>
                  <Badge className={provider.available ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                    {provider.available ? 'Ativo' : 'Inativo'}
                  </Badge>
                </div>
              ))}
            </div>
          </div>
        </ContentCard>
      )}
    </div>
  );
}