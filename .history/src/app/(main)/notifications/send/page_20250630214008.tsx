'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
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
  Globe
} from 'lucide-react';
import { notificationApiService } from '@/services/notificationApiService';
import { toast } from 'sonner';

interface Recipient {
  type: 'user' | 'email' | 'role';
  value: string;
  label: string;
}

export default function SendNotificationPage() {
  const [formData, setFormData] = useState({
    title: '',
    message: '',
    type: 'info',
    category: 'system',
    priority: 'medium',
    sendPush: true,
    sendEmail: false
  });

  const [recipients, setRecipients] = useState<Recipient[]>([]);
  const [newRecipient, setNewRecipient] = useState({
    type: 'email' as 'user' | 'email' | 'role',
    value: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [previewMode, setPreviewMode] = useState(false);

  const notificationTypes = [
    { value: 'info', label: 'Informação', color: 'bg-blue-100 text-blue-800' },
    { value: 'success', label: 'Sucesso', color: 'bg-green-100 text-green-800' },
    { value: 'warning', label: 'Aviso', color: 'bg-yellow-100 text-yellow-800' },
    { value: 'error', label: 'Erro', color: 'bg-red-100 text-red-800' }
  ];

  const categories = [
    { value: 'academic', label: 'Acadêmico', icon: '📚' },
    { value: 'system', label: 'Sistema', icon: '⚙️' },
    { value: 'social', label: 'Social', icon: '👥' },
    { value: 'administrative', label: 'Administrativo', icon: '📋' }
  ];

  const priorities = [
    { value: 'low', label: 'Baixa', color: 'bg-gray-100 text-gray-800' },
    { value: 'medium', label: 'Média', color: 'bg-blue-100 text-blue-800' },
    { value: 'high', label: 'Alta', color: 'bg-red-100 text-red-800' }
  ];

  const roles = [
    { value: 'student', label: 'Estudantes' },
    { value: 'teacher', label: 'Professores' },
    { value: 'coordinator', label: 'Coordenadores' },
    { value: 'admin', label: 'Administradores' }
  ];

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
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
      toast.error('Título é obrigatório');
      return false;
    }
    if (!formData.message.trim()) {
      toast.error('Mensagem é obrigatória');
      return false;
    }
    if (!formData.sendPush && !formData.sendEmail) {
      toast.error('Selecione pelo menos um método de envio');
      return false;
    }
    if (formData.sendEmail && recipients.filter(r => r.type === 'email').length === 0) {
      toast.error('Para envio por email, adicione pelo menos um destinatário de email');
      return false;
    }
    return true;
  };

  const handleSend = async () => {
    if (!validateForm()) return;

    setIsLoading(true);
    try {
      const recipientData = {
        userIds: recipients.filter(r => r.type === 'user').map(r => r.value),
        emails: recipients.filter(r => r.type === 'email').map(r => r.value),
        roles: recipients.filter(r => r.type === 'role').map(r => r.value)
      };

      const result = await notificationApiService.sendNotification({
        title: formData.title,
        message: formData.message,
        type: formData.type,
        category: formData.category,
        priority: formData.priority,
        sendPush: formData.sendPush,
        sendEmail: formData.sendEmail,
        recipients: recipientData
      });

      toast.success(`Notificação enviada com sucesso para ${result.recipientCount} destinatário(s)!`);
      
      // Reset form
      setFormData({
        title: '',
        message: '',
        type: 'info',
        category: 'system',
        priority: 'medium',
        sendPush: true,
        sendEmail: false
      });
      setRecipients([]);

    } catch (error) {
      console.error('Erro ao enviar notificação:', error);
      toast.error('Erro ao enviar notificação. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  const selectedType = notificationTypes.find(t => t.value === formData.type);
  const selectedCategory = categories.find(c => c.value === formData.category);
  const selectedPriority = priorities.find(p => p.value === formData.priority);

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Enviar Notificação</h1>
        <p className="text-gray-600">
          Crie e envie notificações para usuários específicos ou grupos
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Formulário Principal */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Send className="w-5 h-5" />
                Conteúdo da Notificação
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="title">Título *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => handleInputChange('title', e.target.value)}
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
                  onChange={(e) => handleInputChange('message', e.target.value)}
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
                  <Select value={formData.type} onValueChange={(value) => handleInputChange('type', value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {notificationTypes.map(type => (
                        <SelectItem key={type.value} value={type.value}>
                          <div className="flex items-center gap-2">
                            <Badge className={type.color}>{type.label}</Badge>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Categoria</Label>
                  <Select value={formData.category} onValueChange={(value) => handleInputChange('category', value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map(category => (
                        <SelectItem key={category.value} value={category.value}>
                          <div className="flex items-center gap-2">
                            <span>{category.icon}</span>
                            {category.label}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Prioridade</Label>
                  <Select value={formData.priority} onValueChange={(value) => handleInputChange('priority', value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {priorities.map(priority => (
                        <SelectItem key={priority.value} value={priority.value}>
                          <Badge className={priority.color}>{priority.label}</Badge>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Destinatários */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5" />
                Destinatários
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <Select 
                  value={newRecipient.type} 
                  onValueChange={(value: 'user' | 'email' | 'role') => 
                    setNewRecipient(prev => ({ ...prev, type: value, value: '' }))
                  }
                >
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="email">Email</SelectItem>
                    <SelectItem value="user">Usuário</SelectItem>
                    <SelectItem value="role">Função</SelectItem>
                  </SelectContent>
                </Select>

                {newRecipient.type === 'role' ? (
                  <Select 
                    value={newRecipient.value} 
                    onValueChange={(value) => setNewRecipient(prev => ({ ...prev, value }))}
                  >
                    <SelectTrigger className="flex-1">
                      <SelectValue placeholder="Selecione uma função" />
                    </SelectTrigger>
                    <SelectContent>
                      {roles.map(role => (
                        <SelectItem key={role.value} value={role.value}>
                          {role.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ) : (
                  <Input
                    value={newRecipient.value}
                    onChange={(e) => setNewRecipient(prev => ({ ...prev, value: e.target.value }))}
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
                  <div className="flex flex-wrap gap-2">
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

          {/* Métodos de Envio */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="w-5 h-5" />
                Métodos de Envio
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="sendPush"
                  checked={formData.sendPush}
                  onCheckedChange={(checked) => handleInputChange('sendPush', checked)}
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
                  onCheckedChange={(checked) => handleInputChange('sendEmail', checked)}
                />
                <Label htmlFor="sendEmail" className="flex items-center gap-2">
                  <Mail className="w-4 h-4" />
                  Email
                </Label>
              </div>

              {formData.sendEmail && recipients.filter(r => r.type === 'email').length === 0 && (
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    Para envio por email, adicione pelo menos um destinatário de email.
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Preview */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5" />
                Preview
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {formData.title || formData.message ? (
                <div className="border rounded-lg p-4 bg-gray-50">
                  <div className="flex items-center gap-2 mb-2">
                    {selectedType && (
                      <Badge className={selectedType.color}>
                        {selectedType.label}
                      </Badge>
                    )}
                    {selectedPriority && (
                      <Badge className={selectedPriority.color}>
                        {selectedPriority.label}
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
              ) : (
                <div className="text-center text-gray-500 py-8">
                  <Bell className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p>Preview aparecerá aqui</p>
                </div>
              )}

              <Separator />

              <div className="space-y-2">
                <h4 className="font-medium text-sm">Resumo do Envio</h4>
                <div className="text-sm text-gray-600 space-y-1">
                  <p>• Destinatários: {recipients.length || 'Nenhum'}</p>
                  <p>• Push: {formData.sendPush ? 'Sim' : 'Não'}</p>
                  <p>• Email: {formData.sendEmail ? 'Sim' : 'Não'}</p>
                </div>
              </div>

              <Button 
                onClick={handleSend}
                disabled={isLoading || !formData.title || !formData.message}
                className="w-full"
              >
                {isLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                    Enviando...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4 mr-2" />
                    Enviar Notificação
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}