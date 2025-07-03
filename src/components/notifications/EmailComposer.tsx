'use client'

import { useState } from 'react'
import IconSelector from './IconSelector'
import RecipientSelector from './RecipientSelector'
import EmailPreview from './EmailPreview'

interface EmailTemplate {
  id: string
  name: string
  subject: string
  message: string
  icon: string
}

interface EmailComposerProps {
  onSend: (data: EmailData) => Promise<void>
  onSaveDraft?: (data: EmailData) => void
  loading?: boolean
  availableRecipients?: any[]
}

export interface EmailData {
  recipients: string[]
  subject: string
  message: string
  iconType: string
  template?: string
}

const emailTemplates: EmailTemplate[] = [
  {
    id: 'welcome',
    name: 'Boas-vindas',
    subject: 'Bem-vindo ao Portal Sabercon!',
    message: 'Olá!\n\nÉ com grande prazer que damos as boas-vindas ao Portal Sabercon.\n\nAqui você terá acesso a todas as informações acadêmicas, atividades e comunicados importantes.\n\nQualquer dúvida, estamos à disposição.\n\nAtenciosamente,\nEquipe Sabercon',
    icon: 'celebration'
  },
  {
    id: 'reminder',
    name: 'Lembrete',
    subject: 'Lembrete Importante',
    message: 'Olá!\n\nGostaríamos de lembrá-lo sobre:\n\n[DESCREVA O LEMBRETE AQUI]\n\nNão se esqueça de verificar os detalhes no portal.\n\nAtenciosamente,\nEquipe Sabercon',
    icon: 'schedule'
  },
  {
    id: 'announcement',
    name: 'Comunicado',
    subject: 'Comunicado Importante',
    message: 'Prezados,\n\nInformamos que:\n\n[INSIRA O COMUNICADO AQUI]\n\nPara mais informações, acesse o portal.\n\nAtenciosamente,\nEquipe Sabercon',
    icon: 'announcement'
  }
]

export default function EmailComposer({
  onSend,
  onSaveDraft,
  loading = false,
  availableRecipients = []
}: EmailComposerProps) {
  const [activeTab, setActiveTab] = useState<'compose' | 'preview'>('compose')
  const [selectedIcon, setSelectedIcon] = useState('announcement')
  const [recipients, setRecipients] = useState<string[]>([])
  const [subject, setSubject] = useState('')
  const [message, setMessage] = useState('')
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const handleTemplateSelect = (templateId: string) => {
    const template = emailTemplates.find(t => t.id === templateId)
    if (template) {
      setSubject(template.subject)
      setMessage(template.message)
      setSelectedIcon(template.icon)
      setSelectedTemplate(templateId)
    }
  }

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (recipients.length === 0) {
      newErrors.recipients = 'Selecione pelo menos um destinatário'
    }

    if (!subject.trim()) {
      newErrors.subject = 'O assunto é obrigatório'
    }

    if (!message.trim()) {
      newErrors.message = 'A mensagem é obrigatória'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSend = async () => {
    if (!validateForm()) return

    await onSend({
      recipients,
      subject,
      message,
      iconType: selectedIcon,
      template: selectedTemplate || undefined
    })
  }

  const handleSaveDraft = () => {
    if (onSaveDraft) {
      onSaveDraft({
        recipients,
        subject,
        message,
        iconType: selectedIcon,
        template: selectedTemplate || undefined
      })
    }
  }

  // Mock de destinatários disponíveis
  const mockRecipients = availableRecipients.length > 0 ? availableRecipients : [
    { id: '1', name: 'João Silva', email: 'joao.silva@escola.com', type: 'user' },
    { id: '2', name: 'Maria Santos', email: 'maria.santos@escola.com', type: 'user' },
    { id: '3', name: 'Turma 9º Ano A', email: 'turma9a@escola.com', type: 'group' },
    { id: '4', name: 'Professores', email: 'professores@escola.com', type: 'group' },
    { id: '5', name: 'Coordenação', email: 'coordenacao@escola.com', type: 'role' }
  ]

  return (
    <div className="max-w-6xl mx-auto">
      {/* Tabs */}
      <div className="mb-6 border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('compose')}
            className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
              activeTab === 'compose'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <span className="flex items-center gap-2">
              <span className="material-symbols-outlined text-sm">edit</span>
              Compor
            </span>
          </button>
          <button
            onClick={() => setActiveTab('preview')}
            className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
              activeTab === 'preview'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <span className="flex items-center gap-2">
              <span className="material-symbols-outlined text-sm">preview</span>
              Visualizar
            </span>
          </button>
        </nav>
      </div>

      {activeTab === 'compose' ? (
        <div className="space-y-6">
          {/* Seleção de ícone */}
          <div className="card">
            <div className="card-body">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">
                Selecione o tipo de mensagem
              </h3>
              <IconSelector selected={selectedIcon} onSelect={setSelectedIcon} />
            </div>
          </div>

          {/* Templates */}
          <div className="card">
            <div className="card-body">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">
                Templates disponíveis
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
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
                    <h4 className="font-medium text-gray-800">{template.name}</h4>
                    <p className="text-sm text-gray-500 mt-1">{template.subject}</p>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Formulário */}
          <div className="card">
            <div className="card-body space-y-6">
              {/* Destinatários */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Destinatários *
                </label>
                <RecipientSelector
                  recipients={recipients}
                  onRecipientsChange={setRecipients}
                  availableRecipients={mockRecipients}
                />
                {errors.recipients && (
                  <p className="mt-1 text-sm text-red-600">{errors.recipients}</p>
                )}
              </div>

              {/* Assunto */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Assunto *
                </label>
                <input
                  type="text"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Digite o assunto do e-mail"
                />
                {errors.subject && (
                  <p className="mt-1 text-sm text-red-600">{errors.subject}</p>
                )}
              </div>

              {/* Mensagem */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Mensagem *
                </label>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  rows={10}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Digite sua mensagem aqui..."
                />
                {errors.message && (
                  <p className="mt-1 text-sm text-red-600">{errors.message}</p>
                )}
              </div>

              {/* Botões de ação */}
              <div className="flex items-center justify-between pt-4 border-t">
                <div className="flex items-center gap-3">
                  <button
                    onClick={handleSaveDraft}
                    disabled={loading}
                    className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50"
                  >
                    Salvar como rascunho
                  </button>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setActiveTab('preview')}
                    className="px-4 py-2 text-blue-600 hover:text-blue-700"
                  >
                    Visualizar
                  </button>
                  <button
                    onClick={handleSend}
                    disabled={loading}
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center gap-2"
                  >
                    {loading ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                        Enviando...
                      </>
                    ) : (
                      <>
                        <span className="material-symbols-outlined text-sm">send</span>
                        Enviar agora
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <EmailPreview
          subject={subject}
          message={message}
          iconType={selectedIcon}
          recipients={recipients}
        />
      )}
    </div>
  )
}
