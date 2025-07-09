'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/Button'
import { Label } from '@/components/ui/label'
import Input from '@/components/ui/Input'
import Textarea from '@/components/ui/textarea'
import { Select } from '@/components/ui/Select'
import { Checkbox } from '@/components/ui/checkbox'
import { Badge } from '@/components/ui/Badge'
import Card, { CardHeader, CardBody } from '@/components/ui/Card'
import { Mail, Send, X, Users, UserCheck, Shield, AlertTriangle, RefreshCw, CheckCircle } from 'lucide-react'
import { useToast } from '@/components/ToastManager'

interface Recipient {
  type: 'user' | 'email' | 'role'
  value: string
  label: string
}

interface EmailTemplate {
  id: string
  name: string
  subject: string
  message: string
  htmlContent?: string
}

interface EmailSenderProps {
  onSend?: (data: any) => Promise<void>
  loading?: boolean
  templates?: EmailTemplate[]
  availableRecipients?: any[]
  className?: string
  sentEmails?: string[]
  failedEmails?: string[]
}

export default function EmailSender({
  onSend,
  loading = false,
  templates = [],
  availableRecipients = [],
  className = '',
  sentEmails = [],
  failedEmails = []
}: EmailSenderProps) {
  const { showSuccess, showError } = useToast()
  const [emailData, setEmailData] = useState({
    subject: '',
    message: '',
    html: false
  })
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null)
  const [recipients, setRecipients] = useState<Recipient[]>([])
  const [newRecipient, setNewRecipient] = useState({
    type: 'email' as 'user' | 'email' | 'role',
    value: ''
  })
  const [formErrors, setFormErrors] = useState<{
    subject?: string;
    message?: string;
    recipients?: string;
  }>({})
  
  // Indicador de status para cada destinatário
  const [recipientStatus, setRecipientStatus] = useState<Record<string, 'pending' | 'success' | 'error'>>({})

  // Atualizar status dos destinatários quando sentEmails ou failedEmails mudarem
  useEffect(() => {
    const newStatus: Record<string, 'pending' | 'success' | 'error'> = {};
    
    // Marcar todos como pending primeiro
    recipients.forEach(recipient => {
      newStatus[recipient.value] = 'pending';
    });
    
    // Marcar os enviados como success
    sentEmails.forEach(email => {
      newStatus[email] = 'success';
    });
    
    // Marcar os falhos como error
    failedEmails.forEach(email => {
      newStatus[email] = 'error';
    });
    
    setRecipientStatus(newStatus);
  }, [sentEmails, failedEmails, recipients]);

  // Se não houver templates fornecidos, use estes templates padrão
  const defaultTemplates: EmailTemplate[] = [
    {
      id: 'welcome',
      name: 'Boas-vindas',
      subject: 'Bem-vindo ao Portal Sabercon!',
      message: 'Olá!\n\nÉ com grande prazer que damos as boas-vindas ao Portal Sabercon.\n\nAqui você terá acesso a todas as informações acadêmicas, atividades e comunicados importantes.\n\nQualquer dúvida, estamos à disposição.\n\nAtenciosamente,\nEquipe Sabercon',
      htmlContent: '<h2>Bem-vindo ao Portal Sabercon!</h2><p>Olá!</p><p>É com grande prazer que damos as boas-vindas ao Portal Sabercon.</p><p>Aqui você terá acesso a todas as informações acadêmicas, atividades e comunicados importantes.</p><p>Qualquer dúvida, estamos à disposição.</p><p><strong>Atenciosamente,<br>Equipe Sabercon</strong></p>'
    },
    {
      id: 'reminder',
      name: 'Lembrete',
      subject: 'Lembrete Importante',
      message: 'Olá!\n\nGostaríamos de lembrá-lo sobre:\n\n[DESCREVA O LEMBRETE AQUI]\n\nNão se esqueça de verificar os detalhes no portal.\n\nAtenciosamente,\nEquipe Sabercon',
      htmlContent: '<h2>Lembrete Importante</h2><p>Olá!</p><p>Gostaríamos de lembrá-lo sobre:</p><p><em>[DESCREVA O LEMBRETE AQUI]</em></p><p>Não se esqueça de verificar os detalhes no portal.</p><p><strong>Atenciosamente,<br>Equipe Sabercon</strong></p>'
    },
    {
      id: 'announcement',
      name: 'Comunicado',
      subject: 'Comunicado Importante',
      message: 'Prezados,\n\nInformamos que:\n\n[INSIRA O COMUNICADO AQUI]\n\nPara mais informações, acesse o portal.\n\nAtenciosamente,\nEquipe Sabercon',
      htmlContent: '<h2>Comunicado Importante</h2><p>Prezados,</p><p>Informamos que:</p><p><em>[INSIRA O COMUNICADO AQUI]</em></p><p>Para mais informações, acesse o portal.</p><p><strong>Atenciosamente,<br>Equipe Sabercon</strong></p>'
    }
  ]

  const emailTemplates = templates.length > 0 ? templates : defaultTemplates

  // Funções para manipulação de destinatários
  const addRecipient = () => {
    if (!newRecipient.value.trim()) return

    // Verificar se é um email válido quando o tipo é 'email'
    if (newRecipient.type === 'email') {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRegex.test(newRecipient.value)) {
        showError('Email inválido')
        return
      }
    }

    let label = newRecipient.value
    if (newRecipient.type === 'role') {
      // Aqui você pode buscar o nome do papel/função se necessário
      label = newRecipient.value
    }

    const recipient: Recipient = {
      type: newRecipient.type,
      value: newRecipient.value,
      label
    }

    if (!recipients.find(r => r.value === recipient.value && r.type === recipient.type)) {
      setRecipients(prev => [...prev, recipient])
    }

    setNewRecipient({ type: 'email', value: '' })
  }

  const removeRecipient = (index: number) => {
    setRecipients(prev => prev.filter((_, i) => i !== index))
  }

  const getRecipientIcon = (type: string) => {
    switch (type) {
      case 'user': return <UserCheck className="w-3 h-3" />
      case 'email': return <Mail className="w-3 h-3" />
      case 'role': return <Shield className="w-3 h-3" />
      default: return <Users className="w-3 h-3" />
    }
  }

  const getRecipientColor = (type: string) => {
    switch (type) {
      case 'user': return 'bg-blue-100 text-blue-800'
      case 'email': return 'bg-green-100 text-green-800'
      case 'role': return 'bg-purple-100 text-purple-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  // Manipulação de templates
  const handleTemplateSelect = (templateId: string) => {
    const template = emailTemplates.find(t => t.id === templateId)
    if (template) {
      setEmailData({
        subject: template.subject,
        message: template.htmlContent && emailData.html ? template.htmlContent : template.message,
        html: !!template.htmlContent && emailData.html
      })
      setSelectedTemplate(templateId)
    }
  }

  // Validação e envio
  const validateForm = () => {
    const errors: {
      subject?: string;
      message?: string;
      recipients?: string;
    } = {};
    
    let isValid = true;

    if (!emailData.subject.trim()) {
      errors.subject = 'Assunto é obrigatório';
      isValid = false;
    }
    
    if (!emailData.message.trim()) {
      errors.message = 'Mensagem é obrigatória';
      isValid = false;
    }
    
    if (recipients.length === 0) {
      errors.recipients = 'Adicione pelo menos um destinatário';
      isValid = false;
    }
    
    setFormErrors(errors);
    return isValid;
  }

  // Função para adicionar múltiplos emails de uma vez
  const addMultipleEmails = (emailsText: string) => {
    const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
    const emails = emailsText.match(emailRegex);
    
    if (emails && emails.length > 0) {
      const newRecipients = emails.map(email => ({
        type: 'email' as const,
        value: email,
        label: email
      }));
      
      // Filtrar emails já adicionados
      const uniqueRecipients = newRecipients.filter(
        nr => !recipients.some(r => r.value === nr.value)
      );
      
      if (uniqueRecipients.length > 0) {
        setRecipients(prev => [...prev, ...uniqueRecipients]);
        showSuccess(`${uniqueRecipients.length} email(s) adicionado(s)`);
        
        // Limpar erro de destinatários se houver
        if (formErrors.recipients) {
          setFormErrors(prev => ({ ...prev, recipients: undefined }));
        }
      }
    }
  };

  const handleSend = async () => {
    if (!validateForm() || !onSend) return;

    try {
      await onSend({
        title: emailData.subject,
        subject: emailData.subject,
        message: emailData.message,
        html: emailData.html,
        recipients: {
          emails: recipients.filter(r => r.type === 'email').map(r => r.value),
          users: recipients.filter(r => r.type === 'user').map(r => r.value),
          roles: recipients.filter(r => r.type === 'role').map(r => r.value)
        },
        template: selectedTemplate
      });
      
      // Não limpar o formulário automaticamente para permitir reenvio
      // em caso de falhas parciais
      setFormErrors({});
    } catch (error: any) {
      console.error('Erro ao enviar email:', error);
      showError(error.message || 'Erro ao enviar email. Tente novamente.');
    }
  };

  // Função para tentar reenviar emails que falharam
  const handleRetry = async () => {
    if (!onSend) return;
    
    // Filtrar apenas os destinatários que falharam
    const failedRecipients = recipients.filter(r => 
      r.type === 'email' && failedEmails.includes(r.value)
    );
    
    if (failedRecipients.length === 0) return;
    
    try {
      await onSend({
        title: emailData.subject,
        subject: emailData.subject,
        message: emailData.message,
        html: emailData.html,
        recipients: {
          emails: failedRecipients.map(r => r.value),
          users: [],
          roles: []
        },
        template: selectedTemplate
      });
    } catch (error: any) {
      console.error('Erro ao reenviar email:', error);
      showError(error.message || 'Erro ao reenviar email. Tente novamente.');
    }
  };

  // Efeito para processar colar múltiplos emails
  const handlePasteEmails = (e: React.ClipboardEvent) => {
    const pastedText = e.clipboardData.getData('text')
    if (!pastedText.includes('@')) return

    e.preventDefault()
    
    // Extrair emails do texto colado
    const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g
    const emails = pastedText.match(emailRegex)
    
    if (emails && emails.length > 0) {
      const newRecipients = emails.map(email => ({
        type: 'email' as const,
        value: email,
        label: email
      }))
      
      // Filtrar emails já adicionados
      const uniqueRecipients = newRecipients.filter(
        nr => !recipients.some(r => r.value === nr.value)
      )
      
      if (uniqueRecipients.length > 0) {
        setRecipients(prev => [...prev, ...uniqueRecipients])
        showSuccess(`${uniqueRecipients.length} email(s) adicionado(s)`)
      }
    }
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Templates */}
      <Card>
        <CardHeader>
          Templates de Email
        </CardHeader>
        <CardBody>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {emailTemplates.map((template) => (
              <button
                key={template.id}
                onClick={() => handleTemplateSelect(template.id)}
                className={`p-4 border rounded-lg text-left transition-all ${
                  selectedTemplate === template.id
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="font-medium text-gray-800">{template.name}</div>
                <p className="text-sm text-gray-500 mt-1">{template.subject}</p>
              </button>
            ))}
          </div>
        </CardBody>
      </Card>

      {/* Formulário de Email */}
      <Card>
        <CardHeader>
          Composição do Email
        </CardHeader>
        <CardBody className="space-y-6">
          {/* Destinatários */}
          <div>
            <Label htmlFor="recipients">Destinatários *</Label>
            <div className="flex gap-2 mb-2">
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
              <Input
                id="recipientValue"
                value={newRecipient.value}
                onChange={(e) => setNewRecipient(prev => ({ ...prev, value: e.target.value }))}
                placeholder={
                  newRecipient.type === 'email'
                    ? 'Digite o email'
                    : newRecipient.type === 'user'
                    ? 'Digite o ID do usuário'
                    : 'Digite o ID da função'
                }
                className={`flex-1 ${formErrors.recipients ? 'border-red-500' : ''}`}
                onPaste={newRecipient.type === 'email' ? handlePasteEmails : undefined}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && newRecipient.value) {
                    e.preventDefault()
                    addRecipient()
                  }
                }}
              />
              <Button onClick={addRecipient} size="sm">
                Adicionar
              </Button>
            </div>

            {/* Área para colar múltiplos emails */}
            {newRecipient.type === 'email' && (
              <div className="mt-2 mb-4">
                <Label htmlFor="multipleEmails" className="text-sm text-gray-600">
                  Ou cole múltiplos emails (separados por vírgulas, espaços ou linhas)
                </Label>
                <div className="flex gap-2 mt-1">
                  <Textarea
                    id="multipleEmails"
                    placeholder="email1@exemplo.com, email2@exemplo.com, email3@exemplo.com"
                    rows={2}
                    className="flex-1 text-sm"
                  />
                  <Button 
                    onClick={() => {
                      const textarea = document.getElementById('multipleEmails') as HTMLTextAreaElement;
                      if (textarea && textarea.value) {
                        addMultipleEmails(textarea.value);
                        textarea.value = '';
                      }
                    }} 
                    size="sm"
                    className="self-end"
                  >
                    Adicionar Todos
                  </Button>
                </div>
              </div>
            )}

            {recipients.length > 0 && (
              <div className="mt-2">
                <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto p-2 border rounded-md">
                  {recipients.map((recipient, index) => {
                    // Determinar cor com base no status (apenas para emails)
                    let badgeClass = getRecipientColor(recipient.type);
                    let icon = getRecipientIcon(recipient.type);
                    
                    // Adicionar ícone de status para emails
                    if (recipient.type === 'email') {
                      const status = recipientStatus[recipient.value];
                      if (status === 'success') {
                        badgeClass = 'bg-green-100 text-green-800';
                        icon = <CheckCircle className="w-3 h-3" />;
                      } else if (status === 'error') {
                        badgeClass = 'bg-red-100 text-red-800';
                        icon = <AlertTriangle className="w-3 h-3" />;
                      }
                    }
                    
                    return (
                      <Badge
                        key={index}
                        className={`${badgeClass} flex items-center gap-1`}
                      >
                        {icon}
                        {recipient.label}
                        <button
                          onClick={() => removeRecipient(index)}
                          className="ml-1 hover:bg-black/10 rounded-full p-0.5"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </Badge>
                    );
                  })}
                </div>
                <div className="flex justify-between items-center mt-1">
                  <p className="text-xs text-gray-500">
                    {recipients.length} destinatário(s) selecionado(s)
                  </p>
                  
                  {/* Botão de reenvio para emails que falharam */}
                  {failedEmails.length > 0 && (
                    <Button 
                      onClick={handleRetry}
                      size="sm"
                      variant="outline"
                      className="text-xs flex items-center gap-1"
                    >
                      <RefreshCw className="w-3 h-3" />
                      Reenviar para {failedEmails.length} falha(s)
                    </Button>
                  )}
                </div>
              </div>
            )}

            {formErrors.recipients && (
              <div className="mt-1 flex items-center text-red-600 text-sm">
                <AlertTriangle className="w-3 h-3 mr-1" />
                {formErrors.recipients}
              </div>
            )}
          </div>

          {/* Assunto */}
          <div>
            <Label htmlFor="subject">Assunto *</Label>
            <Input
              id="subject"
              value={emailData.subject}
              onChange={(e) => {
                setEmailData(prev => ({ ...prev, subject: e.target.value }))
                if (e.target.value.trim()) {
                  setFormErrors(prev => ({ ...prev, subject: undefined }))
                }
              }}
              placeholder="Digite o assunto do email"
              className={formErrors.subject ? 'border-red-500' : ''}
            />
            {formErrors.subject && (
              <div className="mt-1 flex items-center text-red-600 text-sm">
                <AlertTriangle className="w-3 h-3 mr-1" />
                {formErrors.subject}
              </div>
            )}
          </div>

          {/* Opção HTML */}
          <div className="flex items-center space-x-2">
            <Checkbox
              id="htmlOption"
              checked={emailData.html}
              onChange={(e) => {
                const useHtml = (e.target as HTMLInputElement).checked
                setEmailData(prev => ({ 
                  ...prev, 
                  html: useHtml,
                  // Se estiver selecionando HTML e tiver um template selecionado, use o conteúdo HTML
                  message: useHtml && selectedTemplate ? 
                    emailTemplates.find(t => t.id === selectedTemplate)?.htmlContent || prev.message : 
                    prev.message
                }))
              }}
            />
            <Label htmlFor="htmlOption">Usar formatação HTML</Label>
          </div>

          {/* Mensagem */}
          <div>
            <Label htmlFor="message">Mensagem *</Label>
            <Textarea
              id="message"
              value={emailData.message}
              onChange={(e) => {
                setEmailData(prev => ({ ...prev, message: e.target.value }))
                if (e.target.value.trim()) {
                  setFormErrors(prev => ({ ...prev, message: undefined }))
                }
              }}
              placeholder="Digite o conteúdo do email"
              rows={10}
              className={formErrors.message ? 'border-red-500' : ''}
            />
            {formErrors.message && (
              <div className="mt-1 flex items-center text-red-600 text-sm">
                <AlertTriangle className="w-3 h-3 mr-1" />
                {formErrors.message}
              </div>
            )}
          </div>

          {/* Botões de ação */}
          <div className="flex justify-end">
            <Button
              onClick={handleSend}
              disabled={loading}
              className="flex items-center gap-2"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                  Enviando...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  Enviar Email
                </>
              )}
            </Button>
          </div>
        </CardBody>
      </Card>

      {/* Preview */}
      <Card>
        <CardHeader>
          Preview do Email
        </CardHeader>
        <CardBody>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            {/* Header do email */}
            <div className="bg-gray-100 px-6 py-4 border-b border-gray-200">
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  <span className="font-medium text-gray-600">De:</span>
                  <span className="text-gray-800">Portal Sabercon &lt;noreply@sabercon.com.br&gt;</span>
                </div>
                <div className="flex items-start gap-2 text-sm">
                  <span className="font-medium text-gray-600">Para:</span>
                  <div className="flex-1">
                    {recipients.length > 0 ? (
                      <span className="text-gray-800">
                        {recipients.slice(0, 3).map(r => r.label).join(', ')}
                        {recipients.length > 3 && ` e mais ${recipients.length - 3}`}
                      </span>
                    ) : (
                      <span className="text-gray-400">Nenhum destinatário selecionado</span>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <span className="font-medium text-gray-600">Assunto:</span>
                  <span className="text-gray-800 font-medium">
                    {emailData.subject || <span className="text-gray-400">Sem assunto</span>}
                  </span>
                </div>
              </div>
            </div>

            {/* Corpo do email */}
            <div className="p-6">
              {/* Mensagem */}
              <div className="prose max-w-none">
                {emailData.message ? (
                  emailData.html ? (
                    <div 
                      className="text-gray-700"
                      dangerouslySetInnerHTML={{ __html: emailData.message }}
                    />
                  ) : (
                    <div 
                      className="text-gray-700 whitespace-pre-wrap"
                      dangerouslySetInnerHTML={{ 
                        __html: emailData.message.replace(/\n/g, '<br />') 
                      }}
                    />
                  )
                ) : (
                  <p className="text-gray-400 italic">Nenhuma mensagem digitada</p>
                )}
              </div>

              {/* Footer */}
              <div className="mt-8 pt-6 border-t border-gray-200">
                <p className="text-sm text-gray-500 text-center">
                  Este é um e-mail automático enviado pelo Portal Sabercon.
                  <br />
                  Por favor, não responda a este e-mail.
                </p>
              </div>
            </div>
          </div>
        </CardBody>
      </Card>
    </div>
  )
} 