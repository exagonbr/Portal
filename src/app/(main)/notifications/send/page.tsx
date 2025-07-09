'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import Card, { CardHeader, CardBody } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { useToast } from '@/components/ToastManager';
import { notificationService } from '@/services/notificationService';
import { directEmailService } from '@/services/directEmailService';
import EmailSender from '@/components/notifications/EmailSender';
import {
  Send,
  Mail,
  Bell,
  AlertCircle,
  CheckCircle
} from 'lucide-react';
import {
  NotificationType,
  NotificationCategory,
  NotificationPriority,
} from '@/types/notification';
import { ContentCard } from '@/components/ui/StandardCard';
import { UnifiedAuthService } from '@/services/unifiedAuthService';
import { useRouter } from 'next/navigation';

export default function SendNotificationPage() {
  const { showSuccess, showError } = useToast();
  const { user, refreshUser } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'email' | 'push'>('email');
  const [sendingStatus, setSendingStatus] = useState<'idle' | 'sending' | 'success' | 'error'>('idle');
  const router = useRouter();
  const [emailsSent, setEmailsSent] = useState<string[]>([]);
  const [emailsFailed, setEmailsFailed] = useState<string[]>([]);

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
        // Tentar renovar os dados do usuário apenas uma vez ao carregar a página
        await refreshUser();
      } catch (error) {
        console.error('Erro ao renovar dados do usuário:', error);
      }
    };
    
    checkAuth();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Manter sem dependências, mas adicionar o comentário para desabilitar o linter

  // Função para verificar autenticação antes de enviar
  const verifyAuthBeforeSend = async (): Promise<boolean> => {
    const isAuthenticated = UnifiedAuthService.isAuthenticated();
    if (!isAuthenticated) {
      showError('Sua sessão expirou. Por favor, faça login novamente.');
      router.push('/auth/login?redirect=/notifications/send');
      return false;
    }
    
    // Verificar se temos o ID do usuário
    if (!user?.id) {
      try {
        await refreshUser();
        if (!user?.id) {
          showError('Não foi possível identificar o usuário. Por favor, faça login novamente.');
          router.push('/auth/login?redirect=/notifications/send');
          return false;
        }
      } catch (error) {
        showError('Erro ao verificar autenticação. Por favor, faça login novamente.');
        router.push('/auth/login?redirect=/notifications/send');
        return false;
      }
    }
    
    return true;
  };

  // Função para enviar email com garantia de entrega
  const handleSendEmail = async (emailData: any) => {
    // Verificar autenticação antes de enviar
    const isAuthValid = await verifyAuthBeforeSend();
    if (!isAuthValid) return;

    if (!user?.id) {
      showError('Sessão inválida. Por favor, faça login novamente.');
      return;
    }

    // Verificar token explicitamente
    const token = await UnifiedAuthService.getAccessToken();
    if (!token) {
      showError('Token de autenticação não encontrado. Por favor, faça login novamente.');
      setTimeout(() => {
        router.push('/auth/login?redirect=/notifications/send');
      }, 1500);
      return;
    }

    setIsLoading(true);
    setSendingStatus('sending');
    setEmailsSent([]);
    setEmailsFailed([]);
    
    try {
      // Validação adicional
      if (!emailData.recipients || 
          (!emailData.recipients.emails?.length && 
           !emailData.recipients.users?.length && 
           !emailData.recipients.roles?.length)) {
        throw new Error('Nenhum destinatário selecionado');
      }

      if (!emailData.subject?.trim()) {
        throw new Error('O assunto do email é obrigatório');
      }

      if (!emailData.message?.trim()) {
        throw new Error('O conteúdo do email é obrigatório');
      }

      // Extrair emails diretos
      const directEmails = emailData.recipients.emails || [];
      
      // Enviar para cada email diretamente para garantir entrega
      const sentEmails: string[] = [];
      const failedEmails: string[] = [];
      
      // Primeiro tentar enviar via API principal para todos os destinatários
      try {
        await notificationService.sendEmail({
          title: emailData.subject,
          subject: emailData.subject,
          message: emailData.message,
          html: emailData.html,
          recipients: emailData.recipients,
          sent_by_id: user.id.toString(),
          template: emailData.template
        });
        
        console.log('✅ Email enviado com sucesso via API principal');
        
        // Se chegou aqui, todos os emails foram enviados com sucesso
        if (directEmails.length > 0) {
          setEmailsSent(directEmails);
        }
      } catch (apiError) {
        console.error('❌ Erro ao enviar via API principal, tentando envio direto:', apiError);
        
        // Se a API principal falhar, tentar envio direto para cada email
        if (directEmails.length > 0) {
          for (const email of directEmails) {
            try {
              // Usar o serviço de envio direto para garantir entrega
              await directEmailService.sendEmail({
                subject: emailData.subject,
                message: emailData.message,
                html: emailData.html,
                recipients: {
                  emails: [email]
                }
              });
              
              sentEmails.push(email);
              console.log(`✅ Email enviado com sucesso para ${email} via envio direto`);
            } catch (directError) {
              console.error(`❌ Falha ao enviar email para ${email}:`, directError);
              failedEmails.push(email);
            }
          }
          
          setEmailsSent(sentEmails);
          setEmailsFailed(failedEmails);
        }
      }

      // Determinar status geral do envio
      if (failedEmails.length === 0) {
        showSuccess(`Email enviado com sucesso para ${sentEmails.length || directEmails.length} destinatário(s)!`);
        setSendingStatus('success');
      } else if (sentEmails.length > 0) {
        showSuccess(`Email enviado parcialmente: ${sentEmails.length} enviado(s), ${failedEmails.length} falha(s)`);
        setSendingStatus('success');
      } else {
        throw new Error('Não foi possível enviar o email para nenhum destinatário');
      }
    } catch (error: any) {
      console.error('Erro ao enviar email:', error);
      
      // Verificar se é um erro de autenticação
      if (error.message && (
          error.message.includes('não autorizado') || 
          error.message.includes('unauthorized') || 
          error.message.includes('Unauthorized') || 
          error.message.includes('401')
      )) {
        showError('Sua sessão expirou. Por favor, faça login novamente.');
        setTimeout(() => {
          router.push('/auth/login?redirect=/notifications/send');
        }, 1500);
      } else {
        showError(error.message || 'Erro ao enviar email. Tente novamente.');
      }
      
      setSendingStatus('error');
    } finally {
      setIsLoading(false);
      // Retorna ao estado 'idle' após 3 segundos se não houver falhas
      if (emailsFailed.length === 0) {
        setTimeout(() => setSendingStatus('idle'), 3000);
      }
    }
  };

  // Função para enviar notificação push
  const handleSendPushNotification = async (data: any) => {
    // Verificar autenticação antes de enviar
    const isAuthValid = await verifyAuthBeforeSend();
    if (!isAuthValid) return;

    if (!user?.id) {
      showError('Sessão inválida. Por favor, faça login novamente.');
      return;
    }

    setIsLoading(true);
    setSendingStatus('sending');
    
    try {
      const result = await notificationService.createNotification({
        title: data.title,
        message: data.message,
        type: data.type || NotificationType.INFO,
        category: data.category || NotificationCategory.SYSTEM,
        priority: data.priority || NotificationPriority.MEDIUM,
        recipients: data.recipients,
        sent_by_id: user.id.toString(),
      });

      const totalRecipients = 
        (data.recipients.specific?.length || 0) + 
        (data.recipients.roles?.length || 0);

      showSuccess(`Notificação enviada com sucesso para ${totalRecipients} destinatário(s)!`);
      setSendingStatus('success');
    } catch (error: any) {
      console.error('Erro ao enviar notificação:', error);
      
      // Verificar se é um erro de autenticação
      if (error.message && (
          error.message.includes('não autorizado') || 
          error.message.includes('unauthorized') || 
          error.message.includes('Unauthorized') || 
          error.message.includes('401')
      )) {
        showError('Sua sessão expirou. Por favor, faça login novamente.');
        setTimeout(() => {
          router.push('/auth/login?redirect=/notifications/send');
        }, 1500);
      } else {
        showError(error.message || 'Erro ao enviar notificação. Tente novamente.');
      }
      
      setSendingStatus('error');
    } finally {
      setIsLoading(false);
      // Retorna ao estado 'idle' após 3 segundos
      setTimeout(() => setSendingStatus('idle'), 3000);
    }
  };

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Enviar Notificação</h1>
        <p className="text-gray-600">
          Envie emails ou notificações push para usuários do sistema
        </p>
      </div>

      {/* Tabs para alternar entre email e notificação push */}
      <div className="flex gap-4 mb-6">
        <Button
          variant={activeTab === 'email' ? 'default' : 'outline'}
          onClick={() => setActiveTab('email')}
          className="flex items-center gap-2"
        >
          <Mail className="w-4 h-4" />
          Email
        </Button>
        <Button
          variant={activeTab === 'push' ? 'default' : 'outline'}
          onClick={() => setActiveTab('push')}
          className="flex items-center gap-2"
        >
          <Bell className="w-4 h-4" />
          Notificação Push
        </Button>
      </div>

      {/* Status de envio */}
      {sendingStatus === 'success' && (
        <div className="mb-6 bg-green-50 border border-green-200 text-green-800 rounded-lg p-4 flex items-center">
          <div className="bg-green-100 rounded-full p-1 mr-3">
            <Send className="w-5 h-5 text-green-600" />
          </div>
          <div className="flex-1">
            <p className="font-medium">Sua mensagem foi enviada com sucesso!</p>
            {emailsSent.length > 0 && (
              <p className="text-sm mt-1">
                {emailsSent.length} email(s) enviado(s) com sucesso.
              </p>
            )}
          </div>
        </div>
      )}

      {sendingStatus === 'error' && (
        <div className="mb-6 bg-red-50 border border-red-200 text-red-800 rounded-lg p-4 flex items-center">
          <div className="bg-red-100 rounded-full p-1 mr-3">
            <AlertCircle className="w-5 h-5 text-red-600" />
          </div>
          <div className="flex-1">
            <p className="font-medium">Ocorreu um erro ao enviar sua mensagem.</p>
            {emailsFailed.length > 0 && (
              <p className="text-sm mt-1">
                {emailsFailed.length} email(s) não puderam ser enviados.
              </p>
            )}
          </div>
        </div>
      )}

      {/* Detalhes de envio se houver emails enviados e falhos */}
      {emailsSent.length > 0 && emailsFailed.length > 0 && (
        <div className="mb-6 bg-blue-50 border border-blue-200 text-blue-800 rounded-lg p-4">
          <h3 className="font-medium mb-2">Detalhes do envio:</h3>
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-600" />
              <p className="text-sm">
                <span className="font-medium">Enviados ({emailsSent.length}):</span> {emailsSent.join(', ')}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-600" />
              <p className="text-sm">
                <span className="font-medium">Falhas ({emailsFailed.length}):</span> {emailsFailed.join(', ')}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Conteúdo da tab ativa */}
      {activeTab === 'email' ? (
        <ContentCard 
          title="Enviar Email"
          subtitle="Envie emails para usuários, grupos ou endereços específicos"
          icon={Mail}
          iconColor="bg-blue-500"
        >
          <EmailSender 
            onSend={handleSendEmail}
            loading={isLoading}
            sentEmails={emailsSent}
            failedEmails={emailsFailed}
          />
        </ContentCard>
      ) : (
        <ContentCard
          title="Notificação Push"
          subtitle="Envie notificações para usuários do sistema"
          icon={Bell}
          iconColor="bg-purple-500"
          status="inactive"
        >
          <div className="text-center py-12">
            <Bell className="w-16 h-16 mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-700 mb-2">
              Funcionalidade em desenvolvimento
            </h3>
            <p className="text-gray-500 max-w-md mx-auto">
              O envio de notificações push estará disponível em breve.
              Por enquanto, utilize o envio de emails para comunicação.
            </p>
            <Button
              onClick={() => setActiveTab('email')}
              className="mt-6"
              variant="outline"
            >
              <Mail className="w-4 h-4 mr-2" />
              Enviar Email
            </Button>
          </div>
        </ContentCard>
      )}
    </div>
  );
}