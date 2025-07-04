'use client';

import React, { useState } from 'react';
import { useSession } from 'next-auth/react';
import Card, { CardHeader, CardBody as CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/Textarea';
import { Select } from '@/components/ui/Select';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/Badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/components/ToastManager';
import {
  Send,
  Users,
  Mail,
  Bell,
  AlertCircle,
  CheckCircle,
  X,
  Plus,
  UserCheck,
  Shield,
  Eye,
  Settings,
  Edit3,
  Calendar,
  Clock,
  Target,
  Zap,
  Heart,
  Megaphone,
  Award,
  TrendingUp,
  Lightbulb,
  Smartphone,
  Monitor
} from 'lucide-react';
import { notificationService } from '@/services/notificationService';
import {
  NotificationType,
  NotificationCategory,
  NotificationPriority,
} from '@/types/notification';

interface Recipient {
  type: 'user' | 'email' | 'role';
  value: string;
  label: string;
}

interface Template {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  category: string;
  preview: {
    title: string;
    message: string;
    type: string;
    priority: string;
  };
  color: string;
}

export default function SendNotificationPage() {
  const { showSuccess, showError } = useToast();
  const { data: session } = useSession();
  
  const [activeTab, setActiveTab] = useState<'templates' | 'content' | 'recipients' | 'preview'>('templates');
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);
  
  const [formData, setFormData] = useState({
    title: '',
    message: '',
    type: NotificationType.INFO,
    category: NotificationCategory.SYSTEM,
    priority: NotificationPriority.MEDIUM,
    sendPush: true,
    sendEmail: false,
    scheduledDate: '',
    scheduledTime: '',
    isScheduled: false
  });

  const [recipients, setRecipients] = useState<Recipient[]>([]);
  const [newRecipient, setNewRecipient] = useState({
    type: 'email' as 'user' | 'email' | 'role',
    value: ''
  });
  const [isLoading, setIsLoading] = useState(false);

  const templates: Template[] = [
    {
      id: 'welcome',
      name: 'Boas-vindas',
      description: 'Mensagem de boas-vindas para novos usuários',
      icon: <Heart className="w-6 h-6" />,
      category: 'Engajamento',
      preview: {
        title: 'Bem-vindo(a) ao Portal!',
        message: 'Estamos felizes em tê-lo(a) conosco. Explore todas as funcionalidades disponíveis.',
        type: 'success',
        priority: 'medium'
      },
      color: 'bg-green-100 text-green-800'
    },
    {
      id: 'announcement',
      name: 'Anúncio Importante',
      description: 'Para comunicados e anúncios gerais',
      icon: <Megaphone className="w-6 h-6" />,
      category: 'Comunicação',
      preview: {
        title: 'Anúncio Importante',
        message: 'Temos uma novidade importante para compartilhar com você.',
        type: 'info',
        priority: 'high'
      },
      color: 'bg-blue-100 text-blue-800'
    },
    {
      id: 'reminder',
      name: 'Lembrete',
      description: 'Para lembretes e prazos importantes',
      icon: <Clock className="w-6 h-6" />,
      category: 'Produtividade',
      preview: {
        title: 'Lembrete Importante',
        message: 'Não se esqueça de completar sua tarefa até o prazo estabelecido.',
        type: 'warning',
        priority: 'medium'
      },
      color: 'bg-yellow-100 text-yellow-800'
    },
    {
      id: 'achievement',
      name: 'Conquista',
      description: 'Para parabenizar por conquistas e marcos',
      icon: <Award className="w-6 h-6" />,
      category: 'Reconhecimento',
      preview: {
        title: 'Parabéns pela sua conquista!',
        message: 'Você alcançou um marco importante. Continue assim!',
        type: 'success',
        priority: 'medium'
      },
      color: 'bg-purple-100 text-purple-800'
    },
    {
      id: 'update',
      name: 'Atualização do Sistema',
      description: 'Para informar sobre atualizações e melhorias',
      icon: <TrendingUp className="w-6 h-6" />,
      category: 'Sistema',
      preview: {
        title: 'Nova Atualização Disponível',
        message: 'Implementamos melhorias importantes no sistema. Confira as novidades!',
        type: 'info',
        priority: 'low'
      },
      color: 'bg-indigo-100 text-indigo-800'
    },
    {
      id: 'urgent',
      name: 'Urgente',
      description: 'Para mensagens que requerem ação imediata',
      icon: <Zap className="w-6 h-6" />,
      category: 'Urgente',
      preview: {
        title: 'Ação Necessária - Urgente',
        message: 'Esta mensagem requer sua atenção imediata. Por favor, tome as medidas necessárias.',
        type: 'error',
        priority: 'high'
      },
      color: 'bg-red-100 text-red-800'
    },
    {
      id: 'event',
      name: 'Evento',
      description: 'Para divulgar eventos e atividades',
      icon: <Calendar className="w-6 h-6" />,
      category: 'Eventos',
      preview: {
        title: 'Novo Evento Disponível',
        message: 'Não perca nosso próximo evento! Inscreva-se agora e garante sua vaga.',
        type: 'info',
        priority: 'medium'
      },
      color: 'bg-teal-100 text-teal-800'
    },
    {
      id: 'tip',
      name: 'Dica Útil',
      description: 'Para compartilhar dicas e sugestões',
      icon: <Lightbulb className="w-6 h-6" />,
      category: 'Educacional',
      preview: {
        title: 'Dica do Dia',
        message: 'Aqui está uma dica útil para melhorar sua experiência na plataforma.',
        type: 'info',
        priority: 'low'
      },
      color: 'bg-amber-100 text-amber-800'
    }
  ];

  const notificationTypes = [
    { value: NotificationType.INFO, label: 'Informação', color: 'bg-blue-100 text-blue-800', icon: '💡' },
    { value: NotificationType.SUCCESS, label: 'Sucesso', color: 'bg-green-100 text-green-800', icon: '✅' },
    { value: NotificationType.WARNING, label: 'Aviso', color: 'bg-yellow-100 text-yellow-800', icon: '⚠️' },
    { value: NotificationType.ERROR, label: 'Erro', color: 'bg-red-100 text-red-800', icon: '❌' }
  ];

  const categories = [
    { value: NotificationCategory.ACADEMIC, label: 'Acadêmico', icon: '📚' },
    { value: NotificationCategory.SYSTEM, label: 'Sistema', icon: '⚙️' },
    { value: NotificationCategory.SOCIAL, label: 'Social', icon: '👥' },
    { value: NotificationCategory.ADMINISTRATIVE, label: 'Administrativo', icon: '📋' },
    { value: 'marketing', label: 'Marketing', icon: '📢' },
    { value: 'support', label: 'Suporte', icon: '🛠️' }
  ];

  const priorities = [
    { value: NotificationPriority.LOW, label: 'Baixa', color: 'bg-gray-100 text-gray-800', icon: '⬇️' },
    { value: NotificationPriority.MEDIUM, label: 'Média', color: 'bg-blue-100 text-blue-800', icon: '➡️' },
    { value: NotificationPriority.HIGH, label: 'Alta', color: 'bg-red-100 text-red-800', icon: '⬆️' }
  ];

  const roles = [
    { value: 'student', label: 'Estudantes', icon: '🎓' },
    { value: 'teacher', label: 'Professores', icon: '👨‍🏫' },
    { value: 'coordinator', label: 'Coordenadores', icon: '👨‍💼' },
    { value: 'admin', label: 'Administradores', icon: '👨‍💻' },
    { value: 'parent', label: 'Responsáveis', icon: '👨‍👩‍👧‍👦' }
  ];

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const selectTemplate = (template: Template) => {
    setSelectedTemplate(template);
    setFormData(prev => ({
      ...prev,
      title: template.preview.title,
      message: template.preview.message,
      type: template.preview.type as NotificationType,
      priority: template.preview.priority as NotificationPriority
    }));
    setActiveTab('content');
  };

  const addRecipient = () => {
    if (!newRecipient.value.trim()) return;

    let label = newRecipient.value;
    if (newRecipient.type === 'role') {
      const role = roles.find(r => r.value === newRecipient.value);
      label = role ? role.label : newRecipient.value;
    }

    const recipient: Recipient = {
      type: newRecipient.type,
      value: newRecipient.value,
      label
    };

    if (!recipients.find(r => r.value === recipient.value && r.type === recipient.type)) {
      setRecipients(prev => [...prev, recipient]);
    }

    setNewRecipient({ type: 'email', value: '' });
  };

  const addRoleGroup = (role: any) => {
    const recipient: Recipient = {
      type: 'role',
      value: role.value,
      label: role.label
    };

    if (!recipients.find(r => r.value === recipient.value && r.type === recipient.type)) {
      setRecipients(prev => [...prev, recipient]);
    }
  };

  const removeRecipient = (index: number) => {
    setRecipients(prev => prev.filter((_, i) => i !== index));
  };

  const getRecipientIcon = (type: string) => {
    switch (type) {
      case 'user': return <UserCheck className="w-3 h-3" />;
      case 'email': return <Mail className="w-3 h-3" />;
      case 'role': return <Shield className="w-3 h-3" />;
      default: return <Users className="w-3 h-3" />;
    }
  };

  const getRecipientColor = (type: string) => {
    switch (type) {
      case 'user': return 'bg-blue-100 text-blue-800';
      case 'email': return 'bg-green-100 text-green-800';
      case 'role': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const validateForm = () => {
    if (!formData.title.trim()) {
      showError('Título é obrigatório');
      return false;
    }
    if (!formData.message.trim()) {
      showError('Mensagem é obrigatória');
      return false;
    }
    if (!formData.sendPush && !formData.sendEmail) {
      showError('Selecione pelo menos um método de envio');
      return false;
    }
    if (recipients.length === 0) {
      showError('Adicione pelo menos um destinatário');
      return false;
    }
    return true;
  };

  const handleSend = async () => {
    if (!validateForm()) return;

    setIsLoading(true);
    try {
      if (!session?.user?.id) {
        showError('Sessão inválida. Por favor, faça login novamente.');
        setIsLoading(false);
        return;
      }

      const recipientData = {
        specific: recipients.filter(r => r.type === 'user').map(r => r.value),
        roles: recipients.filter(r => r.type === 'role').map(r => r.value)
      };

      const result = await notificationService.createNotification({
        title: formData.title,
        message: formData.message,
        type: formData.type,
        category: formData.category,
        priority: formData.priority,
        recipients: recipientData,
        sent_by_id: session.user.id,
      });

      showSuccess(`Notificação ${formData.isScheduled ? 'agendada' : 'enviada'} com sucesso para ${recipients.length} destinatário(s)!`);
      
      // Reset form
      setFormData({
        title: '',
        message: '',
        type: NotificationType.INFO,
        category: NotificationCategory.SYSTEM,
        priority: NotificationPriority.MEDIUM,
        sendPush: true,
        sendEmail: false,
        scheduledDate: '',
        scheduledTime: '',
        isScheduled: false
      });
      setRecipients([]);
      setSelectedTemplate(null);
      setActiveTab('templates');

    } catch (error) {
      console.log('Erro ao enviar notificação:', error);
      showError('Erro ao enviar notificação. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  const selectedType = notificationTypes.find(t => t.value === formData.type);
  const selectedCategory = categories.find(c => c.value === formData.category);
  const selectedPriority = priorities.find(p => p.value === formData.priority);

  const renderTabButton = (tab: string, icon: React.ReactNode, label: string) => (
    <button
      onClick={() => setActiveTab(tab as any)}
      className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
        activeTab === tab
          ? 'bg-blue-600 text-white shadow-md'
          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
      }`}
    >
      {icon}
      {label}
    </button>
  );

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Enviar Notificação</h1>
        <p className="text-gray-600">
          Crie e envie notificações personalizadas usando templates ou criando do zero
        </p>
      </div>

      {/* Navigation Tabs */}
      <div className="flex flex-wrap gap-2 mb-6 p-1 bg-gray-50 rounded-lg">
        {renderTabButton('templates', <Heart className="w-4 h-4" />, 'Templates')}
        {renderTabButton('content', <Edit3 className="w-4 h-4" />, 'Conteúdo')}
        {renderTabButton('recipients', <Users className="w-4 h-4" />, 'Destinatários')}
        {renderTabButton('preview', <Eye className="w-4 h-4" />, 'Preview & Envio')}
      </div>

      {/* Tab Content */}
      {activeTab === 'templates' && (
        <div className="space-y-6">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Escolha um Template</h2>
            <p className="text-gray-600">Selecione um template pré-definido para começar rapidamente</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {templates.map((template) => (
              <Card
                key={template.id}
                className={`cursor-pointer transition-all duration-200 hover:shadow-lg ${
                  selectedTemplate?.id === template.id ? 'ring-2 ring-blue-500' : ''
                }`}
                onClick={() => selectTemplate(template)}
              >
                <CardContent className="p-4 text-center">
                  <div className={`w-12 h-12 mx-auto mb-3 rounded-lg flex items-center justify-center ${template.color}`}>
                    {template.icon}
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-1">{template.name}</h3>
                  <p className="text-sm text-gray-600 mb-2">{template.description}</p>
                  <Badge className="text-xs">{template.category}</Badge>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="text-center">
            <Button
              variant="outline"
              onClick={() => setActiveTab('content')}
              className="flex items-center gap-2"
            >
              <Edit3 className="w-4 h-4" />
              Criar do Zero
            </Button>
          </div>
        </div>
      )}

      {activeTab === 'content' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Edit3 className="w-5 h-5" />
                  Conteúdo da Notificação
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {selectedTemplate && (
                  <div className="bg-blue-50 p-3 rounded-lg mb-4">
                    <div className="flex items-center gap-2 mb-2">
                      {selectedTemplate.icon}
                      <span className="font-medium">Template: {selectedTemplate.name}</span>
                    </div>
                    <p className="text-sm text-gray-600">{selectedTemplate.description}</p>
                  </div>
                )}

                <div>
                  <Label htmlFor="title">Título *</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange('title', e.target.value)}
                    placeholder="Digite o título da notificação"
                    maxLength={100}
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    {formData.title.length}/100 caracteres
                  </p>
                </div>

                <div>
                  <Label htmlFor="message">Mensagem *</Label>
                  <Textarea
                    id="message"
                    value={formData.message}
                    onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => handleInputChange('message', e.target.value)}
                    placeholder="Digite a mensagem da notificação"
                    rows={4}
                    maxLength={500}
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    {formData.message.length}/500 caracteres
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label>Tipo</Label>
                    <Select 
                      value={formData.type} 
                      onChange={(value: string | string[]) => handleInputChange('type', value)}
                      options={notificationTypes.map(type => ({
                        value: type.value,
                        label: `${type.icon} ${type.label}`
                      }))}
                    />
                  </div>

                  <div>
                    <Label>Categoria</Label>
                    <Select 
                      value={formData.category} 
                      onChange={(value: string | string[]) => handleInputChange('category', value)}
                      options={categories.map(category => ({
                        value: category.value,
                        label: `${category.icon} ${category.label}`
                      }))}
                    />
                  </div>

                  <div>
                    <Label>Prioridade</Label>
                    <Select 
                      value={formData.priority} 
                      onChange={(value: string | string[]) => handleInputChange('priority', value)}
                      options={priorities.map(priority => ({
                        value: priority.value,
                        label: `${priority.icon} ${priority.label}`
                      }))}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Settings className="w-5 h-5" />
                  Configurações de Envio
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="sendPush"
                      checked={formData.sendPush}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange('sendPush', e.target.checked)}
                    />
                    <Label htmlFor="sendPush" className="flex items-center gap-2">
                      <Bell className="w-4 h-4" />
                      Notificação Push
                    </Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="sendEmail"
                      checked={formData.sendEmail}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange('sendEmail', e.target.checked)}
                    />
                    <Label htmlFor="sendEmail" className="flex items-center gap-2">
                      <Mail className="w-4 h-4" />
                      Email
                    </Label>
                  </div>
                </div>

                <div className="border-t pt-4">
                  <div className="flex items-center space-x-2 mb-4">
                    <Checkbox
                      id="isScheduled"
                      checked={formData.isScheduled}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange('isScheduled', e.target.checked)}
                    />
                    <Label htmlFor="isScheduled" className="flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      Agendar Envio
                    </Label>
                  </div>

                  {formData.isScheduled && (
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="scheduledDate">Data</Label>
                        <Input
                          id="scheduledDate"
                          type="date"
                          value={formData.scheduledDate}
                          onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange('scheduledDate', e.target.value)}
                        />
                      </div>
                      <div>
                        <Label htmlFor="scheduledTime">Horário</Label>
                        <Input
                          id="scheduledTime"
                          type="time"
                          value={formData.scheduledTime}
                          onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange('scheduledTime', e.target.value)}
                        />
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Preview em tempo real */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Eye className="w-5 h-5" />
                  Preview em Tempo Real
                </div>
              </CardHeader>
              <CardContent>
                {formData.title || formData.message ? (
                  <div className="space-y-4">
                    {/* Preview Mobile */}
                    <div>
                      <h4 className="font-medium mb-2 flex items-center gap-2">
                        <Smartphone className="w-4 h-4" />
                        Mobile
                      </h4>
                      <div className="bg-gray-900 rounded-lg p-4 max-w-sm">
                        <div className="bg-white rounded-lg p-3 shadow-lg">
                          <div className="flex items-center gap-2 mb-2">
                            {selectedType && (
                              <Badge className={selectedType.color}>
                                {selectedType.icon} {selectedType.label}
                              </Badge>
                            )}
                            {selectedPriority && (
                              <Badge className={selectedPriority.color}>
                                {selectedPriority.icon}
                              </Badge>
                            )}
                          </div>
                          {formData.title && (
                            <h3 className="font-semibold text-gray-900 mb-1 text-sm">
                              {formData.title}
                            </h3>
                          )}
                          {formData.message && (
                            <p className="text-gray-700 text-xs">
                              {formData.message}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Preview Desktop */}
                    <div>
                      <h4 className="font-medium mb-2 flex items-center gap-2">
                        <Monitor className="w-4 h-4" />
                        Desktop
                      </h4>
                      <div className="border rounded-lg p-4 bg-gray-50">
                        <div className="flex items-center gap-2 mb-2">
                          {selectedType && (
                            <Badge className={selectedType.color}>
                              {selectedType.icon} {selectedType.label}
                            </Badge>
                          )}
                          {selectedPriority && (
                            <Badge className={selectedPriority.color}>
                              {selectedPriority.icon} {selectedPriority.label}
                            </Badge>
                          )}
                        </div>
                        {formData.title && (
                          <h3 className="font-semibold text-gray-900 mb-2">
                            {formData.title}
                          </h3>
                        )}
                        {formData.message && (
                          <p className="text-gray-700 text-sm whitespace-pre-wrap">
                            {formData.message}
                          </p>
                        )}
                        <div className="flex items-center gap-2 mt-3 pt-3 border-t">
                          {selectedCategory && (
                            <span className="text-xs text-gray-500 flex items-center gap-1">
                              {selectedCategory.icon} {selectedCategory.label}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center text-gray-500 py-8">
                    <Eye className="w-12 h-12 mx-auto mb-2 opacity-50" />
                    <p>Preview aparecerá aqui conforme você digita</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {activeTab === 'recipients' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5" />
                Adicionar Destinatários
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <div className="w-32">
                  <Select 
                    value={newRecipient.type} 
                    onChange={(value: string | string[]) => 
                      setNewRecipient(prev => ({ ...prev, type: value as 'user' | 'email' | 'role', value: '' }))
                    }
                    options={[
                      { value: 'email', label: '📧 Email' },
                      { value: 'user', label: '👤 Usuário' },
                      { value: 'role', label: '👥 Função' }
                    ]}
                  />
                </div>

                {newRecipient.type === 'role' ? (
                  <div className="flex-1">
                    <Select 
                      value={newRecipient.value} 
                      onChange={(value: string | string[]) => setNewRecipient(prev => ({ ...prev, value: value as string }))}
                      placeholder="Selecione uma função"
                      options={roles.map(role => ({
                        value: role.value,
                        label: `${role.icon} ${role.label}`
                      }))}
                    />
                  </div>
                ) : (
                  <Input
                    value={newRecipient.value}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewRecipient(prev => ({ ...prev, value: e.target.value }))}
                    placeholder={
                      newRecipient.type === 'email' 
                        ? 'Digite o email' 
                        : 'Digite o ID do usuário'
                    }
                    className="flex-1"
                  />
                )}

                <Button onClick={addRecipient} size="sm">
                  <Plus className="w-4 h-4" />
                </Button>
              </div>

              {recipients.length > 0 && (
                <div className="space-y-2">
                  <Label>Destinatários Selecionados ({recipients.length})</Label>
                  <div className="flex flex-wrap gap-2 max-h-40 overflow-y-auto">
                    {recipients.map((recipient, index) => (
                      <Badge
                        key={index}
                        className={`${getRecipientColor(recipient.type)} flex items-center gap-1`}
                      >
                        {getRecipientIcon(recipient.type)}
                        {recipient.label}
                        <button
                          onClick={() => removeRecipient(index)}
                          className="ml-1 hover:bg-black/10 rounded-full p-0.5"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Target className="w-5 h-5" />
                Grupos Rápidos
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-sm text-gray-600 mb-4">Adicione grupos inteiros com um clique</p>
              
              {roles.map((role) => (
                <Button
                  key={role.value}
                  variant="outline"
                  size="sm"
                  className="w-full justify-start"
                  onClick={() => addRoleGroup(role)}
                >
                  <span className="mr-2">{role.icon}</span>
                  {role.label}
                </Button>
              ))}
            </CardContent>
          </Card>
        </div>
      )}

      {activeTab === 'preview' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Resumo da Notificação */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5" />
                  Resumo da Notificação
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium text-gray-500">Título</Label>
                    <p className="text-gray-900">{formData.title || 'Não definido'}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-500">Tipo</Label>
                    <div className="flex items-center gap-2">
                      {selectedType && (
                        <Badge className={selectedType.color}>
                          {selectedType.icon} {selectedType.label}
                        </Badge>
                      )}
                    </div>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-500">Categoria</Label>
                    <div className="flex items-center gap-2">
                      {selectedCategory && (
                        <span className="text-sm flex items-center gap-1">
                          {selectedCategory.icon} {selectedCategory.label}
                        </span>
                      )}
                    </div>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-500">Prioridade</Label>
                    <div className="flex items-center gap-2">
                      {selectedPriority && (
                        <Badge className={selectedPriority.color}>
                          {selectedPriority.icon} {selectedPriority.label}
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>

                <div>
                  <Label className="text-sm font-medium text-gray-500">Mensagem</Label>
                  <p className="text-gray-900 whitespace-pre-wrap">{formData.message || 'Não definida'}</p>
                </div>

                <div>
                  <Label className="text-sm font-medium text-gray-500">Métodos de Envio</Label>
                  <div className="flex gap-2">
                    {formData.sendPush && (
                      <Badge className="bg-blue-100 text-blue-800">
                        <Bell className="w-3 h-3 mr-1" />
                        Push
                      </Badge>
                    )}
                    {formData.sendEmail && (
                      <Badge className="bg-green-100 text-green-800">
                        <Mail className="w-3 h-3 mr-1" />
                        Email
                      </Badge>
                    )}
                  </div>
                </div>

                <div>
                  <Label className="text-sm font-medium text-gray-500">Destinatários ({recipients.length})</Label>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {recipients.map((recipient, index) => (
                      <Badge
                        key={index}
                        className={getRecipientColor(recipient.type)}
                      >
                        {getRecipientIcon(recipient.type)}
                        {recipient.label}
                      </Badge>
                    ))}
                  </div>
                </div>

                {formData.isScheduled && (
                  <div>
                    <Label className="text-sm font-medium text-gray-500">Agendamento</Label>
                    <p className="text-gray-900">
                      {formData.scheduledDate} às {formData.scheduledTime}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Preview Final */}
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Eye className="w-5 h-5" />
                  Preview Final
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Mobile Preview */}
                  <div>
                    <h4 className="font-medium mb-3 flex items-center gap-2">
                      <Smartphone className="w-4 h-4" />
                      Visualização Mobile
                    </h4>
                    <div className="bg-gray-900 rounded-lg p-4">
                      <div className="bg-white rounded-lg p-3 shadow-lg">
                        <div className="flex items-center gap-2 mb-2">
                          {selectedType && (
                            <Badge className={selectedType.color}>
                              {selectedType.icon}
                            </Badge>
                          )}
                          {selectedPriority && (
                            <Badge className={selectedPriority.color}>
                              {selectedPriority.icon}
                            </Badge>
                          )}
                        </div>
                        <h3 className="font-semibold text-gray-900 mb-1 text-sm">
                          {formData.title}
                        </h3>
                        <p className="text-gray-700 text-xs">
                          {formData.message}
                        </p>
                        <div className="flex items-center justify-between mt-2 pt-2 border-t">
                          <span className="text-xs text-gray-500">Agora</span>
                          <div className="flex gap-1">
                            {formData.sendPush && <Bell className="w-3 h-3 text-blue-500" />}
                            {formData.sendEmail && <Mail className="w-3 h-3 text-green-500" />}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Desktop Preview */}
                  <div>
                    <h4 className="font-medium mb-3 flex items-center gap-2">
                      <Monitor className="w-4 h-4" />
                      Visualização Desktop
                    </h4>
                    <div className="border rounded-lg p-4 bg-gray-50">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          {selectedType && (
                            <Badge className={selectedType.color}>
                              {selectedType.icon} {selectedType.label}
                            </Badge>
                          )}
                          {selectedPriority && (
                            <Badge className={selectedPriority.color}>
                              {selectedPriority.icon} {selectedPriority.label}
                            </Badge>
                          )}
                        </div>
                        <span className="text-xs text-gray-500">Agora</span>
                      </div>
                      <h3 className="font-semibold text-gray-900 mb-2">
                        {formData.title}
                      </h3>
                      <p className="text-gray-700 text-sm mb-3">
                        {formData.message}
                      </p>
                      <div className="flex items-center justify-between pt-2 border-t">
                        <div className="flex items-center gap-2">
                          {selectedCategory && (
                            <span className="text-xs text-gray-500 flex items-center gap-1">
                              {selectedCategory.icon} {selectedCategory.label}
                            </span>
                          )}
                        </div>
                        <div className="flex gap-2">
                          {formData.sendPush && (
                            <Badge className="bg-blue-100 text-blue-800 text-xs">
                              <Bell className="w-3 h-3" />
                            </Badge>
                          )}
                          {formData.sendEmail && (
                            <Badge className="bg-green-100 text-green-800 text-xs">
                              <Mail className="w-3 h-3" />
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Painel de Envio */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Send className="w-5 h-5" />
                  Enviar Notificação
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h4 className="font-medium text-blue-900 mb-2">Pronto para enviar!</h4>
                  <p className="text-sm text-blue-700">
                    Sua notificação será enviada para {recipients.length} destinatário(s)
                    {formData.isScheduled ? ` em ${formData.scheduledDate} às ${formData.scheduledTime}` : ' imediatamente'}.
                  </p>
                </div>

                {!validateForm() && (
                  <Alert>
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      Verifique se todos os campos obrigatórios estão preenchidos:
                      <ul className="list-disc list-inside mt-2 text-sm">
                        {!formData.title && <li>Título é obrigatório</li>}
                        {!formData.message && <li>Mensagem é obrigatória</li>}
                        {!formData.sendPush && !formData.sendEmail && <li>Selecione um método de envio</li>}
                        {recipients.length === 0 && <li>Adicione pelo menos um destinatário</li>}
                      </ul>
                    </AlertDescription>
                  </Alert>
                )}

                <div className="space-y-2">
                  <Button
                    onClick={handleSend}
                    disabled={isLoading || !validateForm()}
                    className="w-full"
                    size="lg"
                  >
                    {isLoading ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                        {formData.isScheduled ? 'Agendando...' : 'Enviando...'}
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4 mr-2" />
                        {formData.isScheduled ? 'Agendar Notificação' : 'Enviar Notificação'}
                      </>
                    )}
                  </Button>

                  <Button
                    variant="outline"
                    onClick={() => setActiveTab('content')}
                    className="w-full"
                  >
                    <Edit3 className="w-4 h-4 mr-2" />
                    Editar Conteúdo
                  </Button>

                  <Button
                    variant="outline"
                    onClick={() => setActiveTab('recipients')}
                    className="w-full"
                  >
                    <Users className="w-4 h-4 mr-2" />
                    Editar Destinatários
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Estatísticas */}
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Target className="w-5 h-5" />
                  Estatísticas do Envio
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Total de destinatários:</span>
                  <Badge>{recipients.length}</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Emails:</span>
                  <Badge className="bg-green-100 text-green-800">
                    {recipients.filter(r => r.type === 'email').length}
                  </Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Usuários:</span>
                  <Badge className="bg-blue-100 text-blue-800">
                    {recipients.filter(r => r.type === 'user').length}
                  </Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Grupos:</span>
                  <Badge className="bg-purple-100 text-purple-800">
                    {recipients.filter(r => r.type === 'role').length}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}