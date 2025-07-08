'use client';

import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import Card, { CardHeader, CardBody } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { useToast } from '@/components/ToastManager';
import { notificationService } from '@/services/notificationService';
import EmailSender from '@/components/notifications/EmailSender';
import {
  Send,
  Mail,
  Bell
} from 'lucide-react';
import {
  NotificationType,
  NotificationCategory,
  NotificationPriority,
} from '@/types/notification';

export default function SendNotificationPage() {
  const { showSuccess, showError } = useToast();
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'email' | 'push'>('email');

  // Função para enviar email
  const handleSendEmail = async (emailData: any) => {
    setIsLoading(true);
    try {
      if (!user?.id) {
        showError('Sessão inválida. Por favor, faça login novamente.');
        setIsLoading(false);
        return;
      }

      const result = await notificationService.sendEmail({
        title: emailData.subject,
        subject: emailData.subject,
        message: emailData.message,
        html: emailData.html,
        recipients: emailData.recipients,
        sent_by_id: user.id.toString(),
      });

      showSuccess(`Email enviado com sucesso para ${
        emailData.recipients.emails.length + 
        (emailData.recipients.users?.length || 0) + 
        (emailData.recipients.roles?.length || 0)
      } destinatário(s)!`);
      
    } catch (error) {
      console.error('Erro ao enviar email:', error);
      showError('Erro ao enviar email. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  // Função para enviar notificação push
  const handleSendPushNotification = async (data: any) => {
    setIsLoading(true);
    try {
      if (!user?.id) {
        showError('Sessão inválida. Por favor, faça login novamente.');
        setIsLoading(false);
        return;
      }

      const result = await notificationService.createNotification({
        title: data.title,
        message: data.message,
        type: data.type || NotificationType.INFO,
        category: data.category || NotificationCategory.SYSTEM,
        priority: data.priority || NotificationPriority.MEDIUM,
        recipients: data.recipients,
        sent_by_id: user.id.toString(),
      });

      showSuccess(`Notificação enviada com sucesso para ${
        (data.recipients.specific?.length || 0) + 
        (data.recipients.roles?.length || 0)
      } destinatário(s)!`);
      
    } catch (error) {
      console.error('Erro ao enviar notificação:', error);
      showError('Erro ao enviar notificação. Tente novamente.');
    } finally {
      setIsLoading(false);
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

      {/* Conteúdo da tab ativa */}
      {activeTab === 'email' ? (
        <EmailSender 
          onSend={handleSendEmail}
          loading={isLoading}
        />
      ) : (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">Notificação Push</h2>
              <Badge className="bg-yellow-100 text-yellow-800">Em breve</Badge>
            </div>
          </CardHeader>
          <CardBody className="text-center py-12">
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
          </CardBody>
        </Card>
      )}
    </div>
  );
}