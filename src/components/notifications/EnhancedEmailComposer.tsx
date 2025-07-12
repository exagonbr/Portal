'use client'

import React, { useState, useEffect } from 'react'
import { EmailTemplate, EmailSendData, EmailSendResult } from '@/types/email'
import { enhancedEmailService } from '@/services/enhancedEmailService'
import { emailTemplateService } from '@/services/emailTemplateService'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import Card, { CardHeader, CardBody } from '@/components/ui/Card'
import Input from '@/components/ui/Input'
import Textarea from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useToast } from '@/components/ToastManager'
import EmailTemplateSelector from './EmailTemplateSelector'
import { 
  Send, 
  Save, 
  Eye, 
  Mail, 
  AlertTriangle, 
  CheckCircle, 
  RefreshCw, 
  X,
  Plus,
  Users,
  AtSign,
  Shield
} from 'lucide-react'

interface Recipient {
  type: 'email' | 'user' | 'role'
  value: string
  label: string
}

interface EnhancedEmailComposerProps {
  onSend?: (result: EmailSendResult) => void
  onSave?: (data: EmailSendData) => void
  className?: string
  initialData?: Partial<EmailSendData>
}

export default function EnhancedEmailComposer({
  onSend,
  onSave,
  className = '',
  initialData
}: EnhancedEmailComposerProps) {
  const { showSuccess, showError, showInfo } = useToast()
  
  // Estado do formulário
  const [formData, setFormData] = useState<EmailSendData>({
    title: '',
    subject: '',
    message: '',
    html: false,
    htmlContent: '',
    recipients: { emails: [], users: [], roles: [] },
    priority: 'medium'
  })
  
  // Estado da interface
  const [selectedTemplate, setSelectedTemplate] = useState<EmailTemplate | null>(null)
  const [recipients, setRecipients] = useState<Recipient[]>([])
  const [newRecipient, setNewRecipient] = useState({ type: 'email' as const, value: '' })
  const [isLoading, setSending] = useState(false)
  const [sendResult, setSendResult] = useState<EmailSendResult | null>(null)
  const [activeTab, setActiveTab] = useState<'compose' | 'preview'>('compose')
  const [formErrors, setFormErrors] = useState<Record<string, string>>({})
  const [showAdvanced, setShowAdvanced] = useState(false)

  // Carregar dados iniciais
  useEffect(() => {
    if (initialData) {
      setFormData(prev => ({ ...prev, ...initialData }))
      // Carregar recipients
      const allRecipients: Recipient[] = [
        ...(initialData.recipients?.emails || []).map(email => ({
          type: 'email' as const,
          value: email,
          label: email
        })),
        ...(initialData.recipients?.users || []).map(user => ({
          type: 'user' as const,
          value: user,
          label: `Usuário ${user}`
        })),
        ...(initialData.recipients?.roles || []).map(role => ({
          type: 'role' as const,
          value: role,
          label: `Função ${role}`
        }))
      ]
      setRecipients(allRecipients)
    }
  }, [initialData])

  // Atualizar recipients no formData quando a lista muda
  useEffect(() => {
    const emails = recipients.filter(r => r.type === 'email').map(r => r.value)
    const users = recipients.filter(r => r.type === 'user').map(r => r.value)
    const roles = recipients.filter(r => r.type === 'role').map(r => r.value)
    
    setFormData(prev => ({
      ...prev,
      recipients: { emails, users, roles }
    }))
  }, [recipients])

  const handleTemplateSelect = (template: EmailTemplate | null) => {
    setSelectedTemplate(template)
    if (template) {
      setFormData(prev => ({
        ...prev,
        subject: template.subject,
        message: template.message,
        htmlContent: template.htmlContent || '',
        templateId: template.id
      }))
      showInfo(`Template "${template.name}" aplicado`)
    } else {
      setFormData(prev => ({
        ...prev,
        templateId: undefined
      }))
    }
  }

  const addRecipient = () => {
    if (!newRecipient.value.trim()) return

    // Validar email se for tipo email
    if (newRecipient.type === 'email') {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRegex.test(newRecipient.value)) {
        showError('Email inválido')
        return
      }
    }

    // Verificar se já existe
    const exists = recipients.some(r => 
      r.type === newRecipient.type && r.value === newRecipient.value
    )
    
    if (exists) {
      showError('Destinatário já adicionado')
      return
    }

    const newRec: Recipient = {
      type: newRecipient.type,
      value: newRecipient.value.trim(),
      label: newRecipient.type === 'email' 
        ? newRecipient.value.trim()
        : `${newRecipient.type === 'user' ? 'Usuário' : 'Função'} ${newRecipient.value.trim()}`
    }

    setRecipients(prev => [...prev, newRec])
    setNewRecipient(prev => ({ ...prev, value: '' }))
    
    // Limpar erro se existir
    if (formErrors.recipients) {
      setFormErrors(prev => ({ ...prev, recipients: '' }))
    }
  }

  const removeRecipient = (index: number) => {
    setRecipients(prev => prev.filter((_, i) => i !== index))
  }

  const handlePasteEmails = (text: string) => {
    const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g
    const emails = text.match(emailRegex) || []
    
    if (emails.length > 0) {
      const newRecipients = emails
        .filter(email => !recipients.some(r => r.value === email))
        .map(email => ({
          type: 'email' as const,
          value: email,
          label: email
        }))
      
      if (newRecipients.length > 0) {
        setRecipients(prev => [...prev, ...newRecipients])
        showSuccess(`${newRecipients.length} email(s) adicionado(s)`)
      }
    }
  }

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {}

    if (!formData.subject.trim()) {
      errors.subject = 'Assunto é obrigatório'
    }

    if (!formData.message.trim() && (!formData.html || !formData.htmlContent?.trim())) {
      errors.message = 'Mensagem é obrigatória'
    }

    if (recipients.length === 0) {
      errors.recipients = 'Adicione pelo menos um destinatário'
    }

    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleSend = async () => {
    if (!validateForm()) return

    setSending(true)
    setSendResult(null)

    try {
      const result = await enhancedEmailService.sendEmail({
        ...formData,
        title: formData.subject // title é o mesmo que subject
      })

      setSendResult(result)

      if (result.success) {
        showSuccess(result.message)
        onSend?.(result)
      } else {
        showError(result.message)
      }
    } catch (error: any) {
      const errorResult: EmailSendResult = {
        success: false,
        message: error.message || 'Erro ao enviar email',
        data: {
          sentCount: 0,
          failedCount: recipients.filter(r => r.type === 'email').length,
          sentEmails: [],
          failedEmails: recipients.filter(r => r.type === 'email').map(r => r.value),
          errors: [error.message]
        }
      }
      setSendResult(errorResult)
      showError(error.message || 'Erro ao enviar email')
    } finally {
      setSending(false)
    }
  }

  const handleSave = () => {
    if (onSave) {
      onSave(formData)
      showSuccess('Rascunho salvo')
    }
  }

  const handleRetryFailed = async () => {
    if (!sendResult?.data?.failedEmails?.length) return

    setSending(true)
    try {
      const result = await enhancedEmailService.sendToSpecificEmails(
        sendResult.data.failedEmails,
        formData.subject,
        formData.html && formData.htmlContent ? formData.htmlContent : formData.message,
        {
          html: formData.html,
          htmlContent: formData.htmlContent,
          templateId: formData.templateId
        }
      )

      if (result.success) {
        showSuccess(`Reenvio realizado: ${result.data?.sentCount || 0} sucesso(s)`)
        // Atualizar resultado
        setSendResult(prev => prev ? {
          ...prev,
          data: prev.data ? {
            ...prev.data,
            sentCount: (prev.data.sentCount || 0) + (result.data?.sentCount || 0),
            failedCount: result.data?.failedCount || 0,
            sentEmails: [...(prev.data.sentEmails || []), ...(result.data?.sentEmails || [])],
            failedEmails: result.data?.failedEmails || []
          } : undefined
        } : null)
      } else {
        showError(result.message)
      }
    } catch (error: any) {
      showError(error.message || 'Erro no reenvio')
    } finally {
      setSending(false)
    }
  }

  const getRecipientIcon = (type: string) => {
    switch (type) {
      case 'email': return <AtSign className="w-3 h-3" />
      case 'user': return <Users className="w-3 h-3" />
      case 'role': return <Shield className="w-3 h-3" />
      default: return <Mail className="w-3 h-3" />
    }
  }

  const getRecipientColor = (type: string) => {
    switch (type) {
      case 'email': return 'bg-blue-100 text-blue-800'
      case 'user': return 'bg-green-100 text-green-800'
      case 'role': return 'bg-purple-100 text-purple-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Seletor de Templates */}
      <EmailTemplateSelector
        selectedTemplate={selectedTemplate}
        onTemplateSelect={handleTemplateSelect}
        showCreateButton={false}
      />

      {/* Formulário Principal */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Composição do Email</h3>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                onClick={() => setShowAdvanced(!showAdvanced)}
                size="sm"
              >
                {showAdvanced ? 'Básico' : 'Avançado'}
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardBody>
          <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as any)}>
            <TabsList className="mb-6">
              <TabsTrigger value="compose" className="flex items-center gap-2">
                <Mail className="w-4 h-4" />
                Compor
              </TabsTrigger>
              <TabsTrigger value="preview" className="flex items-center gap-2">
                <Eye className="w-4 h-4" />
                Visualizar
              </TabsTrigger>
            </TabsList>

            <TabsContent value="compose" className="space-y-6">
              {/* Destinatários */}
              <div>
                <Label htmlFor="recipients">Destinatários *</Label>
                <div className="flex gap-2 mb-3">
                  <select
                    value={newRecipient.type}
                    onChange={(e) => setNewRecipient(prev => ({ 
                      ...prev, 
                      type: e.target.value as any,
                      value: '' 
                    }))}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="email">📧 Email</option>
                    <option value="user">👤 Usuário</option>
                    <option value="role">👥 Função</option>
                  </select>
                  <Input
                    value={newRecipient.value}
                    onChange={(e) => setNewRecipient(prev => ({ ...prev, value: e.target.value }))}
                    placeholder={
                      newRecipient.type === 'email' ? 'email@exemplo.com' :
                      newRecipient.type === 'user' ? 'ID do usuário' : 
                      'ID da função'
                    }
                    className="flex-1"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault()
                        addRecipient()
                      }
                    }}
                    onPaste={(e) => {
                      if (newRecipient.type === 'email') {
                        e.preventDefault()
                        const text = e.clipboardData.getData('text')
                        handlePasteEmails(text)
                      }
                    }}
                  />
                  <Button onClick={addRecipient} size="sm">
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>

                {/* Lista de destinatários */}
                {recipients.length > 0 && (
                  <div className="flex flex-wrap gap-2 p-3 bg-gray-50 rounded-lg mb-2">
                    {recipients.map((recipient, index) => (
                      <Badge
                        key={index}
                        className={`${getRecipientColor(recipient.type)} flex items-center gap-1`}
                      >
                        {getRecipientIcon(recipient.type)}
                        <span className="truncate max-w-32">{recipient.label}</span>
                        <button
                          onClick={() => removeRecipient(index)}
                          className="ml-1 hover:bg-black/10 rounded-full p-0.5"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                )}

                <div className="text-xs text-gray-500">
                  {recipients.length} destinatário(s) selecionado(s)
                  {newRecipient.type === 'email' && (
                    <span> • Cole múltiplos emails de uma vez</span>
                  )}
                </div>

                {formErrors.recipients && (
                  <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                    <AlertTriangle className="w-3 h-3" />
                    {formErrors.recipients}
                  </p>
                )}
              </div>

              {/* Assunto */}
              <div>
                <Label htmlFor="subject">Assunto *</Label>
                <Input
                  id="subject"
                  value={formData.subject}
                  onChange={(e) => {
                    setFormData(prev => ({ ...prev, subject: e.target.value }))
                    if (formErrors.subject) {
                      setFormErrors(prev => ({ ...prev, subject: '' }))
                    }
                  }}
                  placeholder="Digite o assunto do email"
                  className={formErrors.subject ? 'border-red-500' : ''}
                />
                {formErrors.subject && (
                  <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                    <AlertTriangle className="w-3 h-3" />
                    {formErrors.subject}
                  </p>
                )}
              </div>

              {/* Opções avançadas */}
              {showAdvanced && (
                <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
                  <h4 className="font-medium text-gray-900">Opções Avançadas</h4>
                  
                  <div className="flex items-center gap-4">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="html"
                        checked={formData.html}
                        onChange={(e) => setFormData(prev => ({ 
                          ...prev, 
                          html: (e.target as HTMLInputElement).checked 
                        }))}
                      />
                      <Label htmlFor="html">Usar formatação HTML</Label>
                    </div>

                    <div className="flex items-center gap-2">
                      <Label htmlFor="priority">Prioridade:</Label>
                      <select
                        id="priority"
                        value={formData.priority}
                        onChange={(e) => setFormData(prev => ({ 
                          ...prev, 
                          priority: e.target.value as any 
                        }))}
                        className="px-2 py-1 border border-gray-300 rounded text-sm"
                      >
                        <option value="low">Baixa</option>
                        <option value="medium">Média</option>
                        <option value="high">Alta</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}

              {/* Mensagem */}
              <div>
                <Label htmlFor="message">
                  Mensagem * 
                  {formData.html && (
                    <span className="text-blue-600 text-xs ml-2">(Modo HTML ativo)</span>
                  )}
                </Label>
                <Textarea
                  id="message"
                  value={formData.html ? formData.htmlContent : formData.message}
                  onChange={(e) => {
                    if (formData.html) {
                      setFormData(prev => ({ ...prev, htmlContent: e.target.value }))
                    } else {
                      setFormData(prev => ({ ...prev, message: e.target.value }))
                    }
                    if (formErrors.message) {
                      setFormErrors(prev => ({ ...prev, message: '' }))
                    }
                  }}
                  placeholder={formData.html ? 
                    "Digite o conteúdo HTML do email..." : 
                    "Digite o conteúdo do email..."
                  }
                  rows={12}
                  className={formErrors.message ? 'border-red-500' : ''}
                />
                {formErrors.message && (
                  <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                    <AlertTriangle className="w-3 h-3" />
                    {formErrors.message}
                  </p>
                )}
              </div>
            </TabsContent>

            <TabsContent value="preview">
              <div className="border rounded-lg p-6 bg-white">
                <div className="mb-4 pb-4 border-b">
                  <h4 className="font-semibold text-gray-900">Pré-visualização do Email</h4>
                  <div className="text-sm text-gray-600 mt-2 space-y-1">
                    <div><strong>Para:</strong> {recipients.map(r => r.label).join(', ') || 'Nenhum destinatário'}</div>
                    <div><strong>Assunto:</strong> {formData.subject || 'Sem assunto'}</div>
                  </div>
                </div>
                <div className="prose max-w-none">
                  {formData.html && formData.htmlContent ? (
                    <div dangerouslySetInnerHTML={{ __html: formData.htmlContent }} />
                  ) : (
                    <div className="whitespace-pre-wrap">{formData.message || 'Mensagem vazia'}</div>
                  )}
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </CardBody>
      </Card>

      {/* Resultado do envio */}
      {sendResult && (
        <Card className={sendResult.success ? 'border-green-200' : 'border-red-200'}>
          <CardBody>
            <div className={`flex items-start gap-3 ${sendResult.success ? 'text-green-800' : 'text-red-800'}`}>
              {sendResult.success ? (
                <CheckCircle className="w-5 h-5 mt-0.5 text-green-600" />
              ) : (
                <AlertTriangle className="w-5 h-5 mt-0.5 text-red-600" />
              )}
              <div className="flex-1">
                <h4 className="font-medium">{sendResult.message}</h4>
                {sendResult.data && (
                  <div className="mt-2 text-sm space-y-1">
                    {sendResult.data.sentCount > 0 && (
                      <div className="text-green-700">
                        ✅ {sendResult.data.sentCount} email(s) enviado(s) com sucesso
                      </div>
                    )}
                    {sendResult.data.failedCount > 0 && (
                      <div className="text-red-700">
                        ❌ {sendResult.data.failedCount} email(s) falharam
                        {sendResult.data.failedEmails?.length > 0 && (
                          <div className="mt-1">
                            <strong>Emails que falharam:</strong> {sendResult.data.failedEmails.join(', ')}
                          </div>
                        )}
                      </div>
                    )}
                    {sendResult.data.errors && sendResult.data.errors.length > 0 && (
                      <details className="mt-2">
                        <summary className="cursor-pointer text-xs text-gray-600">Detalhes dos erros</summary>
                        <div className="mt-1 text-xs space-y-1">
                          {sendResult.data.errors.map((error, index) => (
                            <div key={index} className="text-red-600">• {error}</div>
                          ))}
                        </div>
                      </details>
                    )}
                  </div>
                )}
              </div>
              {sendResult.data?.failedEmails?.length > 0 && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleRetryFailed}
                  disabled={isLoading}
                  className="flex items-center gap-1"
                >
                  <RefreshCw className="w-3 h-3" />
                  Reenviar falhas
                </Button>
              )}
            </div>
          </CardBody>
        </Card>
      )}

      {/* Botões de ação */}
      <div className="flex items-center justify-between">
        <div className="text-sm text-gray-500">
          {recipients.length} destinatário(s) • {formData.message.length} caracteres
        </div>
        <div className="flex items-center gap-3">
          {onSave && (
            <Button
              variant="outline"
              onClick={handleSave}
              className="flex items-center gap-2"
            >
              <Save className="w-4 h-4" />
              Salvar Rascunho
            </Button>
          )}
          <Button
            onClick={handleSend}
            disabled={isLoading || recipients.length === 0}
            className="flex items-center gap-2"
          >
            {isLoading ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
            {isLoading ? 'Enviando...' : 'Enviar Email'}
          </Button>
        </div>
      </div>
    </div>
  )
} 