'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Select } from '@/components/ui/Select';
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
  Shield
} from 'lucide-react';
import { notificationApiService } from '@/services/notificationApiService';

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
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const notificationTypes = [
    { value: 'info', label: 'Informação' },
    { value: 'success', label: 'Sucesso' },
    { value: 'warning', label: 'Aviso' },
    { value: 'error', label: 'Erro' }
  ];

  const categories = [
    { value: 'academic', label: 'Acadêmico' },
    { value: 'system', label: 'Sistema' },
    { value: 'social', label: 'Social' },
    { value: 'administrative', label: 'Administrativo' }
  ];

  const priorities = [
    { value: 'low', label: 'Baixa' },
    { value: 'medium', label: 'Média' },
    { value: 'high', label: 'Alta' }
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

  const validateForm = () => {
    if (!formData.title.trim()) {
      setMessage({ type: 'error', text: 'Título é obrigatório' });
      return false;
    }
    if (!formData.message.trim()) {
      setMessage({ type: 'error', text: 'Mensagem é obrigatória' });
      return false;
    }
    if (!formData.sendPush && !formData.sendEmail) {
      setMessage({ type: 'error', text: 'Selecione pelo menos um método de envio' });
      return false;
    }
    if (formData.sendEmail && recipients.filter(r => r.type === 'email').length === 0) {
      setMessage({ type: 'error', text: 'Para envio por email, adicione pelo menos um destinatário de email' });
      return false;
    }
    return true;
  };

  const handleSend = async () => {
    if (!validateForm()) return;

    setIsLoading(true);
    setMessage(null);
    
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

      setMessage({ 
        type: 'success', 
        text: `Notificação enviada com sucesso para ${result.recipientCount} destinatário(s)!` 
      });
      
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
      setMessage({ type: 'error', text: 'Erro ao enviar notificação. Tente novamente.' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Enviar Notificação</h1>
        <p className="text-gray-600">
          Crie e envie notificações para usuários específicos ou grupos
        </p>
      </div>

      {message && (
        <div className={`mb-6 p-4 rounded-lg ${
          message.type === 'success' 
            ? 'bg-green-100 text-green-800 border border-green-200' 
            : 'bg-red-100 text-red-800 border border-red-200'
        }`}>
          <div className="flex items-center gap-2">
            {message.type === 'success' ? (
              <CheckCircle className="w-5 h-5" />
            ) : (
              <AlertCircle className="w-5 h-5" />
            )}
            {message.text}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Formulário Principal */}
        <div className="lg:col-span-2 space-y-6">
          {/* Conteúdo da Notificação */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <Send className="w-5 h-5" />
              Conteúdo da Notificação
            </h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Título *
                </label>
                <Input
                  value={formData.title}
                  onChange={(e: any) => handleInputChange('title', e.target.value)}
                  placeholder="Digite o título da notificação"
                  maxLength={100}
                />
                <p className="text-sm text-gray-500 mt-1">
                  {formData.title.length}/100 caracteres
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Mensagem *
                </label>
                <Textarea
                  value={formData.message}
                  onChange={(e: any) => handleInputChange('message', e.target.value)}
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
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Tipo
                  </label>
                  <Select
                    value={formData.type}
                    onChange={(value: any) => handleInputChange('type', value)}
                    options={notificationTypes}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Categoria
                  </label>
                  <Select
                    value={formData.category}
                    onChange={(value: any) => handleInputChange('category', value)}
                    options={categories}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Prioridade
                  </label>
                  <Select
                    value={formData.priority}
                    onChange={(value: any) => handleInputChange('priority', value)}
                    options={priorities}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Destinatários */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <Users className="w-5 h-5" />
              Destinatários
            </h2>
            
            <div className="space-y-4">
              <div className="flex gap-2">
                <Select
                  value={newRecipient.type}
                  onChange={(value: any) => setNewRecipient(prev => ({ ...prev, type: value, value: '' }))}
                  options={[
                    { value: 'email', label: 'Email' },
                    { value: 'user', label: 'Usuário' },
                    { value: 'role', label: 'Função' }
                  ]}
                  className="w-32"
                />

                {newRecipient.type === 'role' ? (
                  <Select
                    value={newRecipient.value}
                    onChange={(value: any) => setNewRecipient(prev => ({ ...prev, value }))}
                    options={roles}
                    placeholder="Selecione uma função"
                    className="flex-1"
                  />
                ) : (
                  <Input
                    value={newRecipient.value}
                    onChange={(e: any) => setNewRecipient(prev => ({ ...prev, value: e.target.value }))}
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
                  <label className="block text-sm font-medium text-gray-700">
                    Destinatários Selecionados ({recipients.length})
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {recipients.map((recipient, index) => (
                      <span 
                        key={index} 
                        className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-800 rounded-md text-sm"
                      >
                        {recipient.type === 'user' && <UserCheck className="w-3 h-3" />}
                        {recipient.type === 'email' && <Mail className="w-3 h-3" />}
                        {recipient.type === 'role' && <Shield className="w-3 h-3" />}
                        {recipient.label}
                        <button
                          onClick={() => removeRecipient(index)}
                          className="ml-1 hover:bg-black/10 rounded-full p-0.5"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Métodos de Envio */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <Bell className="w-5 h-5" />
              Métodos de Envio
            </h2>
            
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="sendPush"
                  checked={formData.sendPush}
                  onChange={(e) => handleInputChange('sendPush', e.target.checked)}
                  className="rounded border-gray-300"
                />
                <label htmlFor="sendPush" className="flex items-center gap-2 text-sm font-medium text-gray-700">
                  <Bell className="w-4 h-4" />
                  Notificação Push
                </label>
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="sendEmail"
                  checked={formData.sendEmail}
                  onChange={(e) => handleInputChange('sendEmail', e.target.checked)}
                  className="rounded border-gray-300"
                />
                <label htmlFor="sendEmail" className="flex items-center gap-2 text-sm font-medium text-gray-700">
                  <Mail className="w-4 h-4" />
                  Email
                </label>
              </div>

              {formData.sendEmail && recipients.filter(r => r.type === 'email').length === 0 && (
                <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-md">
                  <div className="flex items-center gap-2 text-yellow-800">
                    <AlertCircle className="h-4 w-4" />
                    Para envio por email, adicione pelo menos um destinatário de email.
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Preview */}
        <div className="space-y-6">
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <CheckCircle className="w-5 h-5" />
              Preview
            </h2>
            
            <div className="space-y-4">
              {formData.title || formData.message ? (
                <div className="border rounded-lg p-4 bg-gray-50">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs">
                      {notificationTypes.find(t => t.value === formData.type)?.label}
                    </span>
                    <span className="px-2 py-1 bg-gray-100 text-gray-800 rounded text-xs">
                      {priorities.find(p => p.value === formData.priority)?.label}
                    </span>
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
                    <span className="text-xs text-gray-500">
                      {categories.find(c => c.value === formData.category)?.label}
                    </span>
                  </div>
                </div>
              ) : (
                <div className="text-center text-gray-500 py-8">
                  <Bell className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p>Preview aparecerá aqui</p>
                </div>
              )}

              <hr className="border-gray-200" />

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
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}