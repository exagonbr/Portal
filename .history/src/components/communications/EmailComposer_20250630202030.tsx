'use client'

import { useState, useRef, useEffect } from 'react'
import IconSelector from '@/components/notifications/IconSelector'
import RecipientSelector from '@/components/notifications/RecipientSelector'
import EmailPreview from '@/components/communications/EmailPreview'
import dynamic from 'next/dynamic'

// Importar o editor de forma dinâmica para evitar problemas de SSR
const ReactQuill = dynamic(() => import('react-quill'), { 
  ssr: false,
  loading: () => <div className="h-64 bg-gray-50 animate-pulse rounded-lg" />
})
import 'react-quill/dist/quill.snow.css'
import '@/styles/quill-custom.css'

interface EmailTemplate {
  id: string
  name: string
  subject: string
  message: string
  icon: string
  htmlContent?: string
}

interface EmailComposerProps {
  onSend: (data: EmailData) => Promise<void>
  onSaveDraft?: (data: EmailData) => void
  onSaveTemplate?: (template: EmailTemplate) => void
  loading?: boolean
  availableRecipients?: any[]
}

export interface EmailData {
  recipients: string[]
  subject: string
  message: string
  htmlContent?: string
  iconType: string
  template?: string
  useHtml?: boolean
}

const emailTemplates: EmailTemplate[] = [
  {
    id: 'welcome',
    name: 'Boas-vindas',
    subject: 'Bem-vindo ao Portal Sabercon!',
    message: 'Olá!\n\nÉ com grande prazer que damos as boas-vindas ao Portal Sabercon.\n\nAqui você terá acesso a todas as informações acadêmicas, atividades e comunicados importantes.\n\nQualquer dúvida, estamos à disposição.\n\nAtenciosamente,\nEquipe Sabercon',
    htmlContent: '<h2>Bem-vindo ao Portal Sabercon!</h2><p>Olá!</p><p>É com grande prazer que damos as boas-vindas ao Portal Sabercon.</p><p>Aqui você terá acesso a todas as informações acadêmicas, atividades e comunicados importantes.</p><p>Qualquer dúvida, estamos à disposição.</p><p><strong>Atenciosamente,<br>Equipe Sabercon</strong></p>',
    icon: 'celebration'
  },
  {
    id: 'reminder',
    name: 'Lembrete',
    subject: 'Lembrete Importante',
    message: 'Olá!\n\nGostaríamos de lembrá-lo sobre:\n\n[DESCREVA O LEMBRETE AQUI]\n\nNão se esqueça de verificar os detalhes no portal.\n\nAtenciosamente,\nEquipe Sabercon',
    htmlContent: '<h2>Lembrete Importante</h2><p>Olá!</p><p>Gostaríamos de lembrá-lo sobre:</p><p><em>[DESCREVA O LEMBRETE AQUI]</em></p><p>Não se esqueça de verificar os detalhes no portal.</p><p><strong>Atenciosamente,<br>Equipe Sabercon</strong></p>',
    icon: 'schedule'
  },
  {
    id: 'announcement',
    name: 'Comunicado',
    subject: 'Comunicado Importante',
    message: 'Prezados,\n\nInformamos que:\n\n[INSIRA O COMUNICADO AQUI]\n\nPara mais informações, acesse o portal.\n\nAtenciosamente,\nEquipe Sabercon',
    htmlContent: '<h2>Comunicado Importante</h2><p>Prezados,</p><p>Informamos que:</p><p><em>[INSIRA O COMUNICADO AQUI]</em></p><p>Para mais informações, acesse o portal.</p><p><strong>Atenciosamente,<br>Equipe Sabercon</strong></p>',
    icon: 'announcement'
  },
  {
    id: 'event',
    name: 'Evento',
    subject: 'Convite para Evento',
    message: 'Prezados,\n\nTemos o prazer de convidá-los para:\n\n[NOME DO EVENTO]\nData: [DATA]\nHorário: [HORÁRIO]\nLocal: [LOCAL]\n\nContamos com sua presença!\n\nAtenciosamente,\nEquipe Sabercon',
    htmlContent: '<h2>Convite para Evento</h2><p>Prezados,</p><p>Temos o prazer de convidá-los para:</p><ul><li><strong>Evento:</strong> [NOME DO EVENTO]</li><li><strong>Data:</strong> [DATA]</li><li><strong>Horário:</strong> [HORÁRIO]</li><li><strong>Local:</strong> [LOCAL]</li></ul><p>Contamos com sua presença!</p><p><strong>Atenciosamente,<br>Equipe Sabercon</strong></p>',
    icon: 'event'
  }
]

// Módulos do Quill para a toolbar
const modules = {
  toolbar: [
    [{ 'header': [1, 2, 3, false] }],
    ['bold', 'italic', 'underline', 'strike'],
    ['blockquote', 'code-block'],
    [{ 'list': 'ordered'}, { 'list': 'bullet' }],
    [{ 'script': 'sub'}, { 'script': 'super' }],
    [{ 'indent': '-1'}, { 'indent': '+1' }],
    [{ 'direction': 'rtl' }],
    [{ 'size': ['small', false, 'large', 'huge'] }],
    [{ 'color': [] }, { 'background': [] }],
    [{ 'font': [] }],
    [{ 'align': [] }],
    ['link', 'image', 'video'],
    ['clean']
  ]
}

export default function EmailComposer({
  onSend,
  onSaveDraft,
  onSaveTemplate,
  loading = false,
  availableRecipients = []
}: EmailComposerProps) {
  const [activeTab, setActiveTab] = useState<'compose' | 'preview'>('compose')
  const [selectedIcon, setSelectedIcon] = useState('announcement')
  const [recipients, setRecipients] = useState<string[]>([])
  const [subject, setSubject] = useState('')
  const [message, setMessage] = useState('')
  const [htmlContent, setHtmlContent] = useState('')
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [editorMode, setEditorMode] = useState<'simple' | 'html'>('simple')
  const [showTemplateModal, setShowTemplateModal] = useState(false)
  const [newTemplateName, setNewTemplateName] = useState('')

  const handleTemplateSelect = (templateId: string) => {
    const template = emailTemplates.find(t => t.id === templateId)
    if (template) {
      setSubject(template.subject)
      setMessage(template.message)
      setHtmlContent(template.htmlContent || '')
      setSelectedIcon(template.icon)
      setSelectedTemplate(templateId)
      
      // Se o template tem HTML, mudar para modo HTML
      if (template.htmlContent) {
        setEditorMode('html')
      }
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

    if (editorMode === 'simple' && !message.trim()) {
      newErrors.message = 'A mensagem é obrigatória'
    }

    if (editorMode === 'html' && !htmlContent.trim()) {
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
      message: editorMode === 'simple' ? message : htmlContent,
      htmlContent: editorMode === 'html' ? htmlContent : undefined,
      iconType: selectedIcon,
      template: selectedTemplate || undefined,
      useHtml: editorMode === 'html'
    })
  }

  const handleSaveDraft = () => {
    if (onSaveDraft) {
      onSaveDraft({
        recipients,
        subject,
        message: editorMode === 'simple' ? message : htmlContent,
        htmlContent: editorMode === 'html' ? htmlContent : undefined,
        iconType: selectedIcon,
        template: selectedTemplate || undefined,
        useHtml: editorMode === 'html'
      })
    }
  }

  const handleSaveAsTemplate = () => {
    if (!newTemplateName.trim()) {
      alert('Digite um nome para o template')
      return
    }

    if (onSaveTemplate) {
      const newTemplate: EmailTemplate = {
        id: `custom-${Date.now()}`,
        name: newTemplateName,
        subject,
        message,
        htmlContent: editorMode === 'html' ? htmlContent : undefined,
        icon: selectedIcon
      }
      
      onSaveTemplate(newTemplate)
      setShowTemplateModal(false)
      setNewTemplateName('')
      
      // Adicionar o template à lista local também
      emailTemplates.push(newTemplate)
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
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-800">
                  Templates disponíveis
                </h3>
                <button
                  onClick={() => setShowTemplateModal(true)}
                  className="px-3 py-1.5 text-sm bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
                >
                  <span className="material-symbols-outlined text-sm">add</span>
                  Criar Template
                </button>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
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
                    <p className="text-sm text-gray-500 mt-1 line-clamp-2">{template.subject}</p>
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

              {/* Seletor de modo de edição */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Modo de edição
                </label>
                <div className="flex gap-4">
                  <button
                    onClick={() => setEditorMode('simple')}
                    className={`px-4 py-2 rounded-lg transition-colors flex items-center gap-2 ${
                      editorMode === 'simple'
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    <span className="material-symbols-outlined text-sm">text_fields</span>
                    Texto Simples
                  </button>
                  <button
                    onClick={() => setEditorMode('html')}
                    className={`px-4 py-2 rounded-lg transition-colors flex items-center gap-2 ${
                      editorMode === 'html'
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    <span className="material-symbols-outlined text-sm">code</span>
                    Editor HTML
                  </button>
                </div>
              </div>

              {/* Mensagem */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Mensagem *
                </label>
                {editorMode === 'simple' ? (
                  <textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    rows={10}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Digite sua mensagem aqui..."
                  />
                ) : (
                  <div className="border border-gray-300 rounded-lg overflow-hidden">
                    <ReactQuill
                      theme="snow"
                      value={htmlContent}
                      onChange={setHtmlContent}
                      modules={modules}
                      placeholder="Digite sua mensagem aqui..."
                      className="bg-white"
                      style={{ minHeight: '300px' }}
                    />
                  </div>
                )}
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
          message={editorMode === 'simple' ? message : htmlContent}
          iconType={selectedIcon}
          recipients={recipients}
          isHtml={editorMode === 'html'}
        />
      )}

      {/* Modal para criar template */}
      {showTemplateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              Salvar como Template
            </h3>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nome do Template
              </label>
              <input
                type="text"
                value={newTemplateName}
                onChange={(e) => setNewTemplateName(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Ex: Convite para Reunião"
              />
            </div>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => {
                  setShowTemplateModal(false)
                  setNewTemplateName('')
                }}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleSaveAsTemplate}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Salvar Template
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}