'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { useToast } from '@/components/ToastManager';
import { EmailSendResult, EmailSendData } from '@/types/email';
import { StatCard } from '@/components/ui/StandardCard';
import { UnifiedAuthService } from '@/services/unifiedAuthService';
import { validateStoredToken } from '@/utils/token-validator';
import { useRouter } from 'next/navigation';
import { emailTemplateService } from '@/services/emailTemplateService';
import { enhancedEmailService } from '@/services/enhancedEmailService';
import {
  Send,
  Mail,
  Users,
  FileText,
  Settings,
  CheckCircle,
  ArrowRight,
  ArrowLeft,
  Eye,
  AlertTriangle,
  RefreshCw,
  Plus,
  Search,
  TrendingUp,
  Upload,
  Download,
  Type,
  X,
  ChevronDown,
  ChevronUp,
  Wifi,
  WifiOff,
  Edit,
  Trash2,
  Save,
  Palette
} from 'lucide-react';

interface StepProps {
  currentStep: number;
  totalSteps: number;
  onNext: () => void;
  onPrev: () => void;
  onStepClick: (step: number) => void;
  canProceed: boolean;
}

interface EmailFormData {
  template: string | null;
  recipients: Array<{type: 'email' | 'user' | 'role', value: string, label: string}>;
  subject: string;
  message: string;
  htmlContent: string;
  html: boolean;
}

interface CustomTemplate {
  id: string
  name: string
  subject: string
  message: string
  html: boolean
  category: string
  is_public: boolean
  user_id: string
  created_by: string
  created_at: string
  updated_at: string
}

const STEPS = [
  { id: 1, title: 'Template', description: 'Escolha um template ou crie do zero' },
  { id: 2, title: 'Destinatários', description: 'Selecione quem receberá o email' },
  { id: 3, title: 'Conteúdo', description: 'Redija sua mensagem' },
  { id: 4, title: 'Revisão', description: 'Confira antes de enviar' }
];

export default function SendNotificationPage() {
  const { showSuccess, showError, showInfo } = useToast();
  const { user, refreshUser } = useAuth();
  const router = useRouter();
  
  // Estados principais
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [testingConnectivity, setTestingConnectivity] = useState(false)
  
  // Estados do formulário
  const [formData, setFormData] = useState<EmailFormData>({
    template: null,
    recipients: [],
    subject: '',
    message: '',
    htmlContent: '',
    html: false
  });
  
  // Estados das estatísticas
  const [stats, setStats] = useState({
    totalSent: 0,
    successRate: 95,
    templatesCount: 0,
    lastSent: null as string | null
  });

  // Estado para entrada manual de emails
  const [emailInput, setEmailInput] = useState('')
  const [showEmailOptions, setShowEmailOptions] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Definir templates disponíveis
  const availableTemplates = {
    'welcome': {
      id: 'welcome',
      name: 'Boas-vindas',
      subject: 'Bem-vindo(a) ao Portal Educacional!',
      message: `Olá!

Seja muito bem-vindo(a) ao nosso Portal Educacional!

Estamos muito felizes em tê-lo(a) conosco. Nossa plataforma foi desenvolvida para oferecer a melhor experiência educacional possível.

Aqui você encontrará:
• Acesso a todos os seus cursos e materiais
• Ferramentas de comunicação com professores e colegas
• Recursos educacionais exclusivos
• Suporte técnico sempre disponível

Para começar, acesse sua conta com as credenciais fornecidas e explore todas as funcionalidades disponíveis.

Se tiver qualquer dúvida, nossa equipe de suporte está sempre à disposição.

Sucesso em seus estudos!

Equipe Portal Educacional`,
      html: false
    },
    'comunicado': {
      id: 'comunicado',
      name: 'Comunicado',
      subject: 'Comunicado Importante - Portal Educacional',
      message: `Prezados(as),

Este é um comunicado importante da administração do Portal Educacional.

[CONTEÚDO DO COMUNICADO]

Pedimos que leiam com atenção e sigam as orientações descritas.

Em caso de dúvidas, entrem em contato através dos nossos canais de suporte.

Atenciosamente,
Equipe Portal Educacional`,
      html: false
    },
    'lembrete': {
      id: 'lembrete',
      name: 'Lembrete',
      subject: 'Lembrete: Não se esqueça!',
      message: `Olá!

Este é um lembrete amigável sobre:

[DESCRIÇÃO DO LEMBRETE]

📅 Data: [DATA]
⏰ Horário: [HORÁRIO]
📍 Local/Link: [LOCAL OU LINK]

Marque em sua agenda e não deixe passar!

Qualquer dúvida, estamos à disposição.

Equipe Portal Educacional`,
      html: false
    },
    'newsletter': {
      id: 'newsletter',
      name: 'Newsletter',
      subject: 'Newsletter Semanal - Portal Educacional',
      message: `📰 Newsletter Semanal

Olá! Confira as principais novidades desta semana:

🔸 DESTAQUES DA SEMANA
• [Novidade 1]
• [Novidade 2]
• [Novidade 3]

📚 NOVOS RECURSOS
• [Recurso 1]
• [Recurso 2]

📅 PRÓXIMOS EVENTOS
• [Evento 1]
• [Evento 2]

💡 DICA DA SEMANA
[Dica útil para os usuários]

Continue acompanhando nossas atualizações!

Equipe Portal Educacional`,
      html: false
    }
  }

  // Função para aplicar template
  const applyTemplate = (templateId: string | null) => {
    if (!templateId || !availableTemplates[templateId as keyof typeof availableTemplates]) {
      // Limpar campos se não houver template
      setFormData(prev => ({
        ...prev,
        template: templateId,
        subject: '',
        message: '',
        html: false
      }));
      return;
    }

    const template = availableTemplates[templateId as keyof typeof availableTemplates];
    
    setFormData(prev => ({
      ...prev,
      template: templateId,
      subject: template.subject,
      message: template.message,
      html: template.html
    }));

    showInfo(`Template "${template.name}" aplicado! Assunto e mensagem foram preenchidos automaticamente.`);
  };

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
  }, []);

  const loadStats = () => {
    try {
      const templates = emailTemplateService.getAllTemplates();
      setStats({
        totalSent: parseInt(localStorage.getItem('totalEmailsSent') || '0'),
        successRate: 95,
        templatesCount: templates.length,
        lastSent: localStorage.getItem('lastEmailSent')
      });
    } catch (error) {
      console.error('Erro ao carregar estatísticas:', error);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    loadStats();
    setTimeout(() => {
      setRefreshing(false);
      showSuccess("Dados atualizados com sucesso!");
    }, 1000);
  };

  // Navegação entre steps
  const handleNext = () => {
    if (currentStep < STEPS.length) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrev = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleStepClick = (step: number) => {
    setCurrentStep(step);
  };

  // Validação de cada step
  const canProceedFromStep = (step: number): boolean => {
    switch (step) {
      case 1:
        return true; // Template é opcional
      case 2:
        return formData.recipients.length > 0;
      case 3:
        // Se tem template aplicado, os campos já devem estar preenchidos
        return formData.subject.trim() !== '' && formData.message.trim() !== '';
      case 4:
        return true;
      default:
        return false;
    }
  };

  // Envio final
  const handleSend = async () => {
    setLoading(true);
    try {
      // Preparar dados para envio
      const emailCount = formData.recipients.filter(r => r.type === 'email').length;
      const groupCount = formData.recipients.filter(r => r.type === 'role').length;
      
      // Dados para a API de notificações
      const notificationData = {
        subject: formData.subject,
        message: formData.message,
        html: formData.html,
        htmlContent: formData.htmlContent,
        channel: 'EMAIL',
        type: 'info',
        category: 'administrative',
        priority: 'medium',
        templateId: formData.template,
        recipients: formData.recipients // Enviar array de objetos diretamente
      };

      console.log('🔍 Enviando dados:', JSON.stringify(notificationData, null, 2));

      // Verificar token
      const tokenValidation = validateStoredToken();
      if (!tokenValidation.isValid) {
        throw new Error('Sessão expirada. Faça login novamente.');
      }

      // Obter token do localStorage
      const token = localStorage.getItem('accessToken');
      if (!token) {
        throw new Error('Token de acesso não encontrado. Faça login novamente.');
      }

      // Enviar para a API
      const response = await fetch('/api/notifications/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(notificationData)
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || 'Erro ao enviar notificação');
      }

      // Atualizar estatísticas
      const newTotal = stats.totalSent + formData.recipients.length;
      localStorage.setItem('totalEmailsSent', newTotal.toString());
      localStorage.setItem('lastEmailSent', new Date().toISOString());
      
      showSuccess(
        `Email enviado com sucesso! ` +
        `${emailCount > 0 ? `${emailCount} email(s) direto(s)` : ''}` +
        `${emailCount > 0 && groupCount > 0 ? ' e ' : ''}` +
        `${groupCount > 0 ? `${groupCount} grupo(s)` : ''}`
      );
      
      // Reset form
      setFormData({
        template: null,
        recipients: [],
        subject: '',
        message: '',
        htmlContent: '',
        html: false
      });
      setCurrentStep(1);
      loadStats();
      
    } catch (error: any) {
      console.error('Erro ao enviar notificação:', error);
      showError(error.message || 'Erro ao enviar email. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  // Funções para gerenciamento de emails
  const addEmailManually = () => {
    const email = emailInput.trim()
    if (!email) return

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      showError('Por favor, digite um email válido')
      return
    }

    // Verificar se já existe
    const exists = formData.recipients.some(r => r.value === email)
    if (exists) {
      showError('Este email já foi adicionado')
      return
    }

    const newRecipient = {
      type: 'email' as const,
      value: email,
      label: email
    }

    setFormData(prev => ({
      ...prev,
      recipients: [...prev.recipients, newRecipient]
    }))

    setEmailInput('')
    showSuccess('Email adicionado com sucesso!')
  }

  const addMultipleEmails = (emailsText: string) => {
    const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g
    const emails = emailsText.match(emailRegex) || []
    
    if (emails.length === 0) {
      showError('Nenhum email válido encontrado no texto')
      return
    }

    const existingEmails = formData.recipients.map(r => r.value)
    const newEmails = emails.filter(email => !existingEmails.includes(email))
    
    if (newEmails.length === 0) {
      showError('Todos os emails já foram adicionados')
      return
    }

    const newRecipients = newEmails.map(email => ({
      type: 'email' as const,
      value: email,
      label: email
    }))

    setFormData(prev => ({
      ...prev,
      recipients: [...prev.recipients, ...newRecipients]
    }))

    showSuccess(`${newEmails.length} email(s) adicionado(s) com sucesso!`)
  }

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (e) => {
      const content = e.target?.result as string
      
      if (file.name.endsWith('.csv')) {
        // Processar CSV
        const lines = content.split('\n').filter(line => line.trim())
        const emails: string[] = []
        
        lines.forEach(line => {
          // Tentar encontrar emails em cada linha (pode estar em qualquer coluna)
          const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g
          const foundEmails = line.match(emailRegex)
          if (foundEmails) {
            emails.push(...foundEmails)
          }
        })
        
        if (emails.length > 0) {
          addMultipleEmails(emails.join(', '))
        } else {
          showError('Nenhum email encontrado no arquivo CSV')
        }
      } else {
        // Processar como texto simples
        addMultipleEmails(content)
      }
    }
    
    reader.onerror = () => {
      showError('Erro ao ler o arquivo')
    }
    
    reader.readAsText(file)
    
    // Limpar input
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const exportEmails = () => {
    const emails = formData.recipients
      .filter(r => r.type === 'email')
      .map(r => r.value)
      .join('\n')
    
    if (emails.length === 0) {
      showError('Nenhum email para exportar')
      return
    }

    const blob = new Blob([emails], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'emails_destinatarios.txt'
    a.click()
    URL.revokeObjectURL(url)
    
    showSuccess('Lista de emails exportada com sucesso!')
  }

  const handlePasteEmails = (e: React.ClipboardEvent) => {
    const pastedText = e.clipboardData.getData('text')
    if (pastedText.includes('@')) {
      e.preventDefault()
      addMultipleEmails(pastedText)
    }
  }

  // Função para testar conectividade do email
  const testEmailConnectivity = async () => {
    setTestingConnectivity(true)
    try {
      const response = await fetch('/api/notifications/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'test_connectivity',
          testEmail: 'noreply@sabercon.com.br'
        })
      })

      const result = await response.json()
      
      if (result.success) {
        showSuccess(`✅ ${result.message}`)
        console.log('📧 Configurações de email testadas:', result.data?.config)
      } else {
        showError(`❌ ${result.message}`)
        console.error('❌ Erro no teste:', result.data)
      }
    } catch (error) {
      console.error('❌ Erro ao testar conectividade:', error)
      showError('❌ Erro ao testar conectividade do email')
    } finally {
      setTestingConnectivity(false)
    }
  }

  const [customTemplates, setCustomTemplates] = useState<CustomTemplate[]>([])
  const [showTemplateModal, setShowTemplateModal] = useState(false)
  const [editingTemplate, setEditingTemplate] = useState<CustomTemplate | null>(null)
  const [templateForm, setTemplateForm] = useState({
    name: '',
    subject: '',
    message: '',
    html: false,
    category: 'custom',
    is_public: false
  })
  const [loadingTemplates, setLoadingTemplates] = useState(false)
  const [savingTemplate, setSavingTemplate] = useState(false)

  // Carregar templates personalizados
  const loadCustomTemplates = useCallback(async () => {
    setLoadingTemplates(true)
    try {
      const response = await fetch('/api/notifications/templates')
      const result = await response.json()
      
      if (result.success) {
        setCustomTemplates(result.data || [])
      } else {
        console.error('Erro ao carregar templates:', result.message)
      }
    } catch (error) {
      console.error('Erro ao carregar templates:', error)
    } finally {
      setLoadingTemplates(false)
    }
  }, [])

  // Salvar template (criar ou editar)
  const saveTemplate = async () => {
    if (!templateForm.name || !templateForm.subject || !templateForm.message) {
      showError('Nome, assunto e mensagem são obrigatórios')
      return
    }

    setSavingTemplate(true)
    try {
      const url = '/api/notifications/templates'
      const method = editingTemplate ? 'PUT' : 'POST'
      const body = editingTemplate 
        ? { ...templateForm, id: editingTemplate.id }
        : templateForm

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body)
      })

      const result = await response.json()
      
      if (result.success) {
        showSuccess(editingTemplate ? 'Template atualizado com sucesso!' : 'Template criado com sucesso!')
        setShowTemplateModal(false)
        setEditingTemplate(null)
        setTemplateForm({
          name: '',
          subject: '',
          message: '',
          html: false,
          category: 'custom',
          is_public: false
        })
        loadCustomTemplates()
      } else {
        showError(result.message || 'Erro ao salvar template')
      }
    } catch (error) {
      console.error('Erro ao salvar template:', error)
      showError('Erro ao salvar template')
    } finally {
      setSavingTemplate(false)
    }
  }

  // Excluir template
  const deleteTemplate = async (templateId: string) => {
    if (!confirm('Tem certeza que deseja excluir este template?')) {
      return
    }

    try {
      const response = await fetch(`/api/notifications/templates?id=${templateId}`, {
        method: 'DELETE'
      })

      const result = await response.json()
      
      if (result.success) {
        showSuccess('Template excluído com sucesso!')
        loadCustomTemplates()
      } else {
        showError(result.message || 'Erro ao excluir template')
      }
    } catch (error) {
      console.error('Erro ao excluir template:', error)
      showError('Erro ao excluir template')
    }
  }

  // Aplicar template personalizado
  const applyCustomTemplate = (template: CustomTemplate) => {
    setFormData(prev => ({
      ...prev,
      template: template.id,
      subject: template.subject,
      message: template.message,
      html: template.html
    }))
    showInfo(`Template "${template.name}" aplicado! Assunto e mensagem foram preenchidos automaticamente.`)
  }

  // Abrir modal para editar template
  const openEditTemplate = (template: CustomTemplate) => {
    setEditingTemplate(template)
    setTemplateForm({
      name: template.name,
      subject: template.subject,
      message: template.message,
      html: template.html,
      category: template.category,
      is_public: template.is_public
    })
    setShowTemplateModal(true)
  }

  // Abrir modal para criar template
  const openCreateTemplate = () => {
    setEditingTemplate(null)
    setTemplateForm({
      name: '',
      subject: '',
      message: '',
      html: false,
      category: 'custom',
      is_public: false
    })
    setShowTemplateModal(true)
  }

  // Carregar templates no início
  useEffect(() => {
    loadCustomTemplates()
  }, [loadCustomTemplates])

  return (
    <div className="container mx-auto px-2 sm:px-4 py-3 sm:py-6 max-w-6xl">
      <div className="bg-white rounded-lg sm:rounded-xl shadow-sm">
        
        {/* Header */}
        <div className="p-3 sm:p-6 border-b border-gray-200">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3 sm:gap-4 mb-4 sm:mb-6">
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Centro de Comunicação</h1>
              <p className="text-gray-600 mt-1 text-sm sm:text-base">Envie emails profissionais usando nosso sistema por etapas</p>
            </div>
            <div className="flex gap-2 sm:gap-3">
              <Button 
                onClick={testEmailConnectivity}
                variant="outline" 
                disabled={testingConnectivity}
                className="flex items-center gap-2 text-xs sm:text-sm border-green-300 text-green-700 hover:bg-green-50"
                size="sm"
              >
                {testingConnectivity ? (
                  <RefreshCw className="w-3 h-3 sm:w-4 sm:h-4 animate-spin" />
                ) : (
                  <Wifi className="w-3 h-3 sm:w-4 sm:h-4" />
                )}
                {testingConnectivity ? 'Testando...' : 'Testar Email'}
              </Button>
              <Button 
                onClick={handleRefresh} 
                variant="outline" 
                disabled={refreshing}
                className="flex items-center gap-2 text-xs sm:text-sm"
                size="sm"
              >
                <RefreshCw className={`w-3 h-3 sm:w-4 sm:h-4 ${refreshing ? 'animate-spin' : ''}`} />
                Atualizar
              </Button>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-4 mb-4 sm:mb-6">
            <div className="bg-blue-50 rounded-lg p-3 sm:p-4 border border-blue-100">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-lg sm:text-2xl font-bold text-blue-600">{stats.totalSent}</div>
                  <div className="text-xs sm:text-sm text-blue-700">Enviados</div>
                </div>
                <Send className="w-4 h-4 sm:w-5 sm:h-5 text-blue-500" />
              </div>
            </div>
            
            <div className="bg-green-50 rounded-lg p-3 sm:p-4 border border-green-100">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-lg sm:text-2xl font-bold text-green-600">{stats.successRate}%</div>
                  <div className="text-xs sm:text-sm text-green-700">Taxa</div>
                </div>
                <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-green-500" />
              </div>
            </div>
            
            <div className="bg-purple-50 rounded-lg p-3 sm:p-4 border border-purple-100">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-lg sm:text-2xl font-bold text-purple-600">{stats.templatesCount}</div>
                  <div className="text-xs sm:text-sm text-purple-700">Templates</div>
                </div>
                <FileText className="w-4 h-4 sm:w-5 sm:h-5 text-purple-500" />
              </div>
            </div>
            
            <div className="bg-amber-50 rounded-lg p-3 sm:p-4 border border-amber-100">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm sm:text-lg font-bold text-amber-600">
                    {stats.lastSent ? new Date(stats.lastSent).toLocaleDateString('pt-BR') : 'Nunca'}
                  </div>
                  <div className="text-xs sm:text-sm text-amber-700">Último</div>
                </div>
                <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5 text-amber-500" />
              </div>
            </div>
          </div>

          {/* Steps Navigator */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4">
            <div className="flex items-center space-x-2 sm:space-x-4 w-full sm:w-auto overflow-x-auto pb-2 sm:pb-0">
              {STEPS.map((step, index) => (
                <div key={step.id} className="flex items-center flex-shrink-0">
                  <button
                    onClick={() => handleStepClick(step.id)}
                    className={`w-7 h-7 sm:w-10 sm:h-10 rounded-full flex items-center justify-center text-xs sm:text-sm font-medium transition-colors ${
                      currentStep === step.id
                        ? 'bg-blue-600 text-white'
                        : currentStep > step.id
                        ? 'bg-green-600 text-white'
                        : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                    }`}
                  >
                    {currentStep > step.id ? (
                      <CheckCircle className="w-3 h-3 sm:w-5 sm:h-5" />
                    ) : (
                      step.id
                    )}
                  </button>
                  {index < STEPS.length - 1 && (
                    <div className={`w-6 sm:w-12 h-1 mx-1 sm:mx-2 transition-colors ${
                      currentStep > step.id ? 'bg-green-600' : 'bg-gray-200'
                    }`} />
                  )}
                </div>
              ))}
            </div>
            
            {/* Current Step Info */}
            <div className="text-left sm:text-right w-full sm:w-auto">
              <div className="text-sm font-medium text-gray-900">
                {STEPS[currentStep - 1]?.title}
              </div>
              <div className="text-xs text-gray-500">
                Etapa {currentStep} de {STEPS.length}
              </div>
            </div>
          </div>
        </div>

        {/* Step Content */}
        <div className="p-3 sm:p-6">
          <div className="mb-4 sm:mb-6">
            <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-1 sm:mb-2">
              {STEPS[currentStep - 1]?.title}
            </h2>
            <p className="text-gray-600 text-sm sm:text-base">
              {STEPS[currentStep - 1]?.description}
            </p>
          </div>

          {/* Step 1: Template Selection */}
          {currentStep === 1 && (
            <div className="space-y-4 sm:space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-6">
                {/* Template Rápido */}
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-4 sm:p-6 border border-blue-200">
                  <div className="flex items-center gap-3 mb-3 sm:mb-4">
                    <div className="w-8 h-8 sm:w-10 sm:h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                      <Mail className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 text-sm sm:text-base">Email Rápido</h3>
                      <p className="text-xs sm:text-sm text-gray-600">Começar do zero</p>
                    </div>
                  </div>
                  <Button 
                    onClick={() => {
                      applyTemplate(null);
                      handleNext();
                    }}
                    className="w-full text-sm"
                    size="sm"
                  >
                    Começar Agora
                  </Button>
                </div>

                {/* Template Predefinido */}
                <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-4 sm:p-6 border border-green-200">
                  <div className="flex items-center gap-3 mb-3 sm:mb-4">
                    <div className="w-8 h-8 sm:w-10 sm:h-10 bg-green-600 rounded-lg flex items-center justify-center">
                      <FileText className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 text-sm sm:text-base">Usar Template</h3>
                      <p className="text-xs sm:text-sm text-gray-600">Escolher modelo predefinido</p>
                    </div>
                  </div>
                  <Button 
                    variant="secondary"
                    onClick={() => {
                      applyTemplate('welcome');
                      handleNext();
                    }}
                    className="w-full border-green-300 text-green-700 hover:bg-green-50 text-sm"
                    size="sm"
                  >
                    Usar Template Boas-vindas
                  </Button>
                </div>
              </div>

              {/* Seus Templates */}
              <div className="bg-gray-50 rounded-lg p-4 sm:p-6">
                <div className="flex items-center justify-between mb-3 sm:mb-4">
                  <h4 className="font-medium text-gray-900 text-sm sm:text-base flex items-center gap-2">
                    <FileText className="w-4 h-4" />
                    Seus Templates
                  </h4>
                  <div className="flex gap-2">
                    <Button
                      onClick={openCreateTemplate}
                      variant="secondary"
                      size="sm"
                      className="flex items-center gap-2 text-xs sm:text-sm"
                    >
                      <Plus className="w-3 h-3 sm:w-4 sm:h-4" />
                      Simples
                    </Button>
                    <Button
                      onClick={() => router.push('/notifications/templates/editor')}
                      size="sm"
                      className="flex items-center gap-2 text-xs sm:text-sm"
                    >
                      <Palette className="w-3 h-3 sm:w-4 sm:h-4" />
                      Editor Visual
                    </Button>
                  </div>
                </div>
                
                {loadingTemplates ? (
                  <div className="flex items-center justify-center py-8">
                    <RefreshCw className="w-6 h-6 animate-spin text-gray-400" />
                    <span className="ml-2 text-gray-500">Carregando templates...</span>
                  </div>
                ) : customTemplates.length === 0 ? (
                  <div className="text-center py-8">
                    <FileText className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-500 text-sm">Nenhum template personalizado criado ainda</p>
                    <p className="text-gray-400 text-xs mt-1">Clique em "Criar Template" para começar</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-3">
                    {customTemplates.map((template) => (
                      <div
                        key={template.id}
                        className="p-3 bg-white rounded-lg border border-gray-200 hover:border-blue-300 hover:bg-blue-50 transition-colors group"
                      >
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex-1 min-w-0">
                            <div className="font-medium text-gray-900 text-sm truncate">{template.name}</div>
                            <div className="text-xs text-gray-500 truncate">{template.subject}</div>
                          </div>
                          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Button
                              onClick={() => openEditTemplate(template)}
                              size="sm"
                              variant="ghost"
                              className="h-6 w-6 p-0 text-gray-400 hover:text-blue-600"
                            >
                              <Edit className="w-3 h-3" />
                            </Button>
                            <Button
                              onClick={() => deleteTemplate(template.id)}
                              size="sm"
                              variant="ghost"
                              className="h-6 w-6 p-0 text-gray-400 hover:text-red-600"
                            >
                              <Trash2 className="w-3 h-3" />
                            </Button>
                          </div>
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            {template.html && (
                              <Badge variant="secondary" className="text-xs px-1 py-0">HTML</Badge>
                            )}
                            {template.is_public && (
                              <Badge variant="secondary" className="text-xs px-1 py-0">Público</Badge>
                            )}
                          </div>
                          <Button
                            onClick={() => {
                              applyCustomTemplate(template);
                              handleNext();
                            }}
                            size="sm"
                            className="text-xs"
                          >
                            Usar
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Templates Populares (antigos templates fixos) */}
              <div className="bg-gray-50 rounded-lg p-4 sm:p-6">
                <h4 className="font-medium text-gray-900 mb-3 sm:mb-4 flex items-center gap-2 text-sm sm:text-base">
                  <FileText className="w-4 h-4" />
                  Templates Populares
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3">
                  {Object.values(availableTemplates).map((template) => (
                    <button
                      key={template.name}
                      onClick={() => {
                        applyTemplate(template.name.toLowerCase().replace(/\s+/g, '_'));
                        handleNext();
                      }}
                      className="p-2 sm:p-3 bg-white rounded-lg border border-gray-200 hover:border-blue-300 hover:bg-blue-50 transition-colors text-left"
                    >
                      <div className="font-medium text-gray-900 text-xs sm:text-sm">{template.name}</div>
                      <div className="text-xs text-gray-500 mt-1 truncate">{template.subject}</div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Recipients */}
          {currentStep === 2 && (
            <div className="space-y-4 sm:space-y-6">
              {/* Barra de Ações */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3">
                {/* Adicionar Email Individual */}
                <div className="flex gap-2 col-span-1 sm:col-span-2 lg:col-span-1">
                  <input
                    type="email"
                    value={emailInput}
                    onChange={(e) => setEmailInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault()
                        addEmailManually()
                      }
                    }}
                    onPaste={handlePasteEmails}
                    placeholder="Digite um email..."
                    className="flex-1 px-2 sm:px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <Button
                    onClick={addEmailManually}
                    size="sm"
                    className="flex items-center gap-1 text-xs sm:text-sm"
                  >
                    <Plus className="w-3 h-3 sm:w-4 sm:h-4" />
                    <span className="hidden sm:inline">Adicionar</span>
                  </Button>
                </div>

                {/* Upload de Arquivo */}
                <Button
                  variant="outline"
                  onClick={() => fileInputRef.current?.click()}
                  className="flex items-center gap-2 text-xs sm:text-sm"
                  size="sm"
                >
                  <Upload className="w-3 h-3 sm:w-4 sm:h-4" />
                  <span className="hidden sm:inline">Importar</span>
                  <span className="sm:hidden">CSV</span>
                </Button>

                {/* Adicionar Grupo */}
                <Button
                  variant="outline"
                  onClick={() => {
                    const newRecipient = {
                      type: 'role' as const,
                      value: 'admin',
                      label: 'Administradores'
                    }
                    setFormData(prev => ({
                      ...prev,
                      recipients: [...prev.recipients, newRecipient]
                    }))
                  }}
                  className="flex items-center gap-2 text-xs sm:text-sm"
                  size="sm"
                >
                  <Users className="w-3 h-3 sm:w-4 sm:h-4" />
                  Grupo
                </Button>

                {/* Exportar Lista */}
                <Button
                  variant="outline"
                  onClick={exportEmails}
                  disabled={formData.recipients.filter(r => r.type === 'email').length === 0}
                  className="flex items-center gap-2 text-xs sm:text-sm"
                  size="sm"
                >
                  <Download className="w-3 h-3 sm:w-4 sm:h-4" />
                  Exportar
                </Button>
              </div>

              {/* Input de arquivo (oculto) */}
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv,.txt"
                onChange={handleFileUpload}
                className="hidden"
              />

              {/* Área para Múltiplos Emails */}
              <div className="border border-gray-200 rounded-lg p-3 sm:p-4">
                <button
                  onClick={() => setShowEmailOptions(!showEmailOptions)}
                  className="flex items-center justify-between w-full text-left"
                >
                  <div className="flex items-center gap-2">
                    <Type className="w-4 h-4 text-gray-500" />
                    <span className="font-medium text-gray-700 text-sm sm:text-base">Adicionar Múltiplos Emails</span>
                  </div>
                  {showEmailOptions ? (
                    <ChevronUp className="w-4 h-4 text-gray-400" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-gray-400" />
                  )}
                </button>
                
                {showEmailOptions && (
                  <div className="mt-3 sm:mt-4 space-y-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Cole ou digite múltiplos emails (separados por vírgulas, espaços ou linhas)
                      </label>
                      <textarea
                        placeholder="email1@exemplo.com, email2@exemplo.com&#10;email3@exemplo.com&#10;email4@exemplo.com"
                        rows={3}
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-y"
                        id="multipleEmailsInput"
                      />
                    </div>
                    <div className="flex gap-2">
                      <Button
                        onClick={() => {
                          const textarea = document.getElementById('multipleEmailsInput') as HTMLTextAreaElement
                          if (textarea?.value) {
                            addMultipleEmails(textarea.value)
                            textarea.value = ''
                          }
                        }}
                        size="sm"
                        className="flex items-center gap-2 text-xs sm:text-sm"
                      >
                        <Plus className="w-3 h-3 sm:w-4 sm:h-4" />
                        Adicionar Todos
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          const textarea = document.getElementById('multipleEmailsInput') as HTMLTextAreaElement
                          if (textarea) textarea.value = ''
                        }}
                        className="text-xs sm:text-sm"
                      >
                        Limpar
                      </Button>
                    </div>
                  </div>
                )}
              </div>

              {/* Lista de Destinatários */}
              <div className="bg-gray-50 rounded-lg p-4 sm:p-6">
                <h4 className="font-medium text-gray-900 mb-3 sm:mb-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                  <span className="flex items-center gap-2 text-sm sm:text-base">
                    <Users className="w-4 h-4" />
                    Destinatários Selecionados
                  </span>
                  <div className="flex items-center gap-1 sm:gap-2 flex-wrap">
                    <Badge className="bg-blue-100 text-blue-800 text-xs">
                      {formData.recipients.length} total
                    </Badge>
                    <Badge className="bg-green-100 text-green-800 text-xs">
                      {formData.recipients.filter(r => r.type === 'email').length} emails
                    </Badge>
                    <Badge className="bg-purple-100 text-purple-800 text-xs">
                      {formData.recipients.filter(r => r.type === 'role').length} grupos
                    </Badge>
                  </div>
                </h4>
                
                {formData.recipients.length === 0 ? (
                  <div className="text-center py-8 sm:py-12">
                    <Mail className="w-12 h-12 sm:w-16 sm:h-16 text-gray-300 mx-auto mb-3 sm:mb-4" />
                    <h3 className="text-base sm:text-lg font-medium text-gray-700 mb-2">Nenhum destinatário adicionado</h3>
                    <p className="text-gray-500 mb-3 sm:mb-4 text-sm sm:text-base">Adicione emails individuais, importe um arquivo CSV/TXT ou selecione grupos</p>
                    <div className="grid grid-cols-2 gap-1 sm:flex sm:flex-wrap sm:justify-center sm:gap-2 text-xs sm:text-sm text-gray-400">
                      <span>• Digite emails diretamente</span>
                      <span>• Cole múltiplos emails</span>
                      <span>• Importe arquivos CSV</span>
                      <span>• Selecione grupos predefinidos</span>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2 sm:space-y-3 max-h-48 sm:max-h-64 overflow-y-auto">
                    {formData.recipients.map((recipient, index) => (
                      <div key={index} className="flex items-center justify-between p-2 sm:p-3 bg-white rounded-lg border border-gray-200 hover:shadow-sm transition-shadow">
                        <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
                          <div className={`w-6 h-6 sm:w-8 sm:h-8 rounded-lg flex items-center justify-center ${
                            recipient.type === 'email' ? 'bg-blue-100' :
                            recipient.type === 'user' ? 'bg-green-100' : 'bg-purple-100'
                          }`}>
                            {recipient.type === 'email' ? (
                              <Mail className={`w-3 h-3 sm:w-4 sm:h-4 ${
                                recipient.type === 'email' ? 'text-blue-600' :
                                recipient.type === 'user' ? 'text-green-600' : 'text-purple-600'
                              }`} />
                            ) : (
                              <Users className={`w-3 h-3 sm:w-4 sm:h-4 ${
                                recipient.type === 'user' ? 'text-green-600' : 'text-purple-600'
                              }`} />
                            )}
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="font-medium text-gray-900 text-xs sm:text-sm truncate">{recipient.label}</div>
                            <div className="text-xs text-gray-500 capitalize flex items-center gap-1">
                              {recipient.type === 'email' && '📧'}
                              {recipient.type === 'user' && '👤'}
                              {recipient.type === 'role' && '👥'}
                              {recipient.type}
                            </div>
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setFormData(prev => ({
                              ...prev,
                              recipients: prev.recipients.filter((_, i) => i !== index)
                            }))
                            showSuccess('Destinatário removido')
                          }}
                          className="text-red-600 hover:text-red-800 hover:bg-red-50 shrink-0 p-1 sm:p-2"
                        >
                          <X className="w-3 h-3 sm:w-4 sm:h-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}

                {/* Ações em lote */}
                {formData.recipients.length > 0 && (
                  <div className="mt-3 sm:mt-4 pt-3 sm:pt-4 border-t border-gray-200">
                    <div className="flex items-center justify-between">
                      <div className="text-xs sm:text-sm text-gray-600">
                        Total: {formData.recipients.length} destinatário(s)
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setFormData(prev => ({ ...prev, recipients: [] }))
                          showSuccess('Todos os destinatários foram removidos')
                        }}
                        className="text-red-600 hover:text-red-800 hover:bg-red-50 text-xs sm:text-sm"
                      >
                        <X className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                        Limpar Todos
                      </Button>
                    </div>
                  </div>
                )}
              </div>

              {/* Dicas */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 sm:p-4">
                <h5 className="font-medium text-blue-900 mb-2 flex items-center gap-2 text-sm sm:text-base">
                  <FileText className="w-4 h-4" />
                  Dicas para Importação
                </h5>
                <ul className="text-xs sm:text-sm text-blue-800 space-y-1">
                  <li>• <strong>CSV:</strong> O sistema detecta emails automaticamente em qualquer coluna</li>
                  <li>• <strong>TXT:</strong> Cole emails separados por vírgulas, espaços ou linhas</li>
                  <li>• <strong>Colar:</strong> Ctrl+V funciona no campo de email individual</li>
                  <li>• <strong>Duplicatas:</strong> Emails duplicados são automaticamente ignorados</li>
                </ul>
              </div>
            </div>
          )}

          {/* Step 3: Content */}
          {currentStep === 3 && (
            <div className="space-y-4 sm:space-y-6">
              {/* Info do Template */}
              {formData.template && availableTemplates[formData.template as keyof typeof availableTemplates] && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 sm:p-4">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-0">
                    <div className="flex items-center gap-2">
                      <FileText className="w-4 h-4 text-blue-600" />
                      <span className="font-medium text-blue-900 text-sm sm:text-base">
                        Template "{availableTemplates[formData.template as keyof typeof availableTemplates].name}" aplicado
                      </span>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => applyTemplate(null)}
                      className="text-blue-700 border-blue-300 hover:bg-blue-100 text-xs sm:text-sm"
                    >
                      Remover Template
                    </Button>
                  </div>
                  <p className="text-xs sm:text-sm text-blue-700 mt-2">
                    O assunto e mensagem foram preenchidos automaticamente. Você pode editá-los abaixo se necessário.
                  </p>
                </div>
              )}

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Assunto do Email *
                    {formData.template && (
                      <span className="text-xs text-blue-600 ml-1">(preenchido pelo template)</span>
                    )}
                  </label>
                  <input
                    type="text"
                    value={formData.subject}
                    onChange={(e) => setFormData(prev => ({ ...prev, subject: e.target.value }))}
                    placeholder="Digite o assunto do email..."
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tipo de Conteúdo
                  </label>
                  <div className="flex gap-2">
                    <Button
                      variant={!formData.html ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setFormData(prev => ({ ...prev, html: false }))}
                      className="text-xs sm:text-sm"
                    >
                      Texto Simples
                    </Button>
                    <Button
                      variant={formData.html ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setFormData(prev => ({ ...prev, html: true }))}
                      className="text-xs sm:text-sm"
                    >
                      HTML
                    </Button>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Mensagem *
                  {formData.template && (
                    <span className="text-xs text-blue-600 ml-1">(preenchida pelo template)</span>
                  )}
                </label>
                <textarea
                  value={formData.message}
                  onChange={(e) => setFormData(prev => ({ ...prev, message: e.target.value }))}
                  placeholder={formData.template ? "Mensagem preenchida pelo template - você pode editá-la" : "Digite sua mensagem aqui..."}
                  rows={8}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-y"
                />
                <div className="mt-2 flex items-center justify-between">
                  <div className="text-xs sm:text-sm text-gray-500">
                    {formData.message.length} caracteres
                  </div>
                  {formData.template && (
                    <div className="text-xs text-blue-600">
                      ✨ Conteúdo do template aplicado
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Step 4: Review */}
          {currentStep === 4 && (
            <div className="space-y-4 sm:space-y-6">
              <div className="bg-blue-50 rounded-lg p-4 sm:p-6 border border-blue-200">
                <h4 className="font-medium text-blue-900 mb-3 sm:mb-4 flex items-center gap-2 text-sm sm:text-base">
                  <Eye className="w-4 h-4" />
                  Revisão Final
                </h4>
                <div className="space-y-3 sm:space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                    <div>
                      <div className="text-sm font-medium text-gray-700">Template</div>
                      <div className="text-xs sm:text-sm text-gray-600">
                        {formData.template && availableTemplates[formData.template as keyof typeof availableTemplates] 
                          ? `${availableTemplates[formData.template as keyof typeof availableTemplates].name}` 
                          : 'Email personalizado'}
                      </div>
                    </div>
                    <div>
                      <div className="text-sm font-medium text-gray-700">Destinatários</div>
                      <div className="text-xs sm:text-sm text-gray-600">
                        {formData.recipients.length} destinatário(s)
                      </div>
                    </div>
                    <div>
                      <div className="text-sm font-medium text-gray-700">Assunto</div>
                      <div className="text-xs sm:text-sm text-gray-600 truncate">{formData.subject || 'Sem assunto'}</div>
                    </div>
                    <div>
                      <div className="text-sm font-medium text-gray-700">Tipo</div>
                      <div className="text-xs sm:text-sm text-gray-600">{formData.html ? 'HTML' : 'Texto simples'}</div>
                    </div>
                  </div>
                  
                  <div>
                    <div className="text-sm font-medium text-gray-700 mb-2">Preview da Mensagem</div>
                    <div className="bg-white p-3 sm:p-4 rounded-lg border border-gray-200 max-h-32 sm:max-h-40 overflow-y-auto">
                      <div className="text-xs sm:text-sm text-gray-600 whitespace-pre-wrap">
                        {formData.message || 'Nenhuma mensagem definida'}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Sistema Status */}
              <div className="bg-green-50 rounded-lg p-4 sm:p-6 border border-green-200">
                <h4 className="font-medium text-green-900 mb-3 sm:mb-4 flex items-center gap-2 text-sm sm:text-base">
                  <Settings className="w-4 h-4" />
                  Status do Sistema
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3 text-xs sm:text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-700">Servidor de Email</span>
                    <Badge className="bg-green-100 text-green-800 text-xs">Ativo</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-700">API de Notificações</span>
                    <Badge className="bg-green-100 text-green-800 text-xs">Ativo</Badge>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer Navigation */}
        <div className="px-3 sm:px-6 py-3 sm:py-4 border-t border-gray-200 bg-gray-50">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              {currentStep > 1 && (
                <Button
                  variant="outline"
                  onClick={handlePrev}
                  className="flex items-center gap-2 text-xs sm:text-sm"
                  size="sm"
                >
                  <ArrowLeft className="w-3 h-3 sm:w-4 sm:h-4" />
                  Anterior
                </Button>
              )}
            </div>

            <div className="text-xs sm:text-sm text-gray-500 hidden sm:block">
              Etapa {currentStep} de {STEPS.length}
            </div>

            <div className="flex items-center space-x-2">
              {currentStep < STEPS.length ? (
                <Button
                  onClick={handleNext}
                  disabled={!canProceedFromStep(currentStep)}
                  className="flex items-center gap-2 text-xs sm:text-sm"
                  size="sm"
                >
                  Próximo
                  <ArrowRight className="w-3 h-3 sm:w-4 sm:h-4" />
                </Button>
              ) : (
                <Button
                  onClick={handleSend}
                  disabled={loading || !canProceedFromStep(currentStep)}
                  className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-xs sm:text-sm"
                  size="sm"
                >
                  {loading ? (
                    <RefreshCw className="w-3 h-3 sm:w-4 sm:h-4 animate-spin" />
                  ) : (
                    <Send className="w-3 h-3 sm:w-4 sm:h-4" />
                  )}
                  {loading ? 'Enviando...' : 'Enviar Email'}
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Modal para criar/editar template */}
      {showTemplateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold">
                  {editingTemplate ? 'Editar Template' : 'Criar Novo Template'}
                </h3>
                <Button
                  onClick={() => setShowTemplateModal(false)}
                  variant="ghost"
                  size="sm"
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nome do Template *
                  </label>
                  <input
                    type="text"
                    value={templateForm.name}
                    onChange={(e) => setTemplateForm(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Ex: Comunicado Importante"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Assunto *
                  </label>
                  <input
                    type="text"
                    value={templateForm.subject}
                    onChange={(e) => setTemplateForm(prev => ({ ...prev, subject: e.target.value }))}
                    placeholder="Ex: Comunicado importante do sistema"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Mensagem *
                  </label>
                  <textarea
                    value={templateForm.message}
                    onChange={(e) => setTemplateForm(prev => ({ ...prev, message: e.target.value }))}
                    placeholder="Digite a mensagem do template..."
                    rows={6}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-y"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Você pode usar variáveis como {'{{nome}}'}, {'{{data}}'}, etc.
                  </p>
                </div>

                <div className="flex items-center gap-4">
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={templateForm.html}
                      onChange={(e) => setTemplateForm(prev => ({ ...prev, html: e.target.checked }))}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-700">Usar HTML</span>
                  </label>

                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={templateForm.is_public}
                      onChange={(e) => setTemplateForm(prev => ({ ...prev, is_public: e.target.checked }))}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-700">Template público</span>
                  </label>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 mt-6 pt-4 border-t">
                <Button
                  onClick={() => setShowTemplateModal(false)}
                  variant="outline"
                  disabled={savingTemplate}
                >
                  Cancelar
                </Button>
                <Button
                  onClick={saveTemplate}
                  disabled={savingTemplate}
                  className="flex items-center gap-2"
                >
                  {savingTemplate ? (
                    <RefreshCw className="w-4 h-4 animate-spin" />
                  ) : (
                    <Save className="w-4 h-4" />
                  )}
                  {savingTemplate ? 'Salvando...' : 'Salvar Template'}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}