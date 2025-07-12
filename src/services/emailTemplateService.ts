import { 
  EmailTemplate, 
  CreateEmailTemplateDto, 
  UpdateEmailTemplateDto, 
  EmailTemplateCategory 
} from '@/types/email'

const STORAGE_KEY = 'emailTemplates'
const DRAFTS_STORAGE_KEY = 'emailDrafts'

// Templates padrão do sistema
const DEFAULT_TEMPLATES: EmailTemplate[] = [
  {
    id: 'welcome',
    name: 'Boas-vindas',
    subject: 'Bem-vindo ao Portal Sabercon!',
    message: `Olá!

É com grande prazer que damos as boas-vindas ao Portal Sabercon.

Aqui você terá acesso a todas as informações acadêmicas, atividades e comunicados importantes.

Qualquer dúvida, estamos à disposição.

Atenciosamente,
Equipe Sabercon`,
    htmlContent: `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; border-radius: 10px 10px 0 0; text-align: center;">
    <h1 style="margin: 0; font-size: 28px;">Bem-vindo ao Portal Sabercon!</h1>
  </div>
  <div style="background: white; padding: 30px; border-radius: 0 0 10px 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
    <p style="font-size: 16px; line-height: 1.6; color: #333;">Olá!</p>
    <p style="font-size: 16px; line-height: 1.6; color: #333;">É com grande prazer que damos as boas-vindas ao Portal Sabercon.</p>
    <p style="font-size: 16px; line-height: 1.6; color: #333;">Aqui você terá acesso a todas as informações acadêmicas, atividades e comunicados importantes.</p>
    <p style="font-size: 16px; line-height: 1.6; color: #333;">Qualquer dúvida, estamos à disposição.</p>
    <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee;">
      <p style="font-size: 16px; color: #333; margin: 0;"><strong>Atenciosamente,<br>Equipe Sabercon</strong></p>
    </div>
  </div>
</div>`,
    category: EmailTemplateCategory.WELCOME,
    isActive: true,
    isBuiltIn: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    icon: '👋',
    description: 'Template de boas-vindas para novos usuários'
  },
  {
    id: 'reminder',
    name: 'Lembrete',
    subject: 'Lembrete Importante',
    message: `Olá!

Gostaríamos de lembrá-lo sobre:

[DESCREVA O LEMBRETE AQUI]

Não se esqueça de verificar os detalhes no portal.

Atenciosamente,
Equipe Sabercon`,
    htmlContent: `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); color: white; padding: 30px; border-radius: 10px 10px 0 0; text-align: center;">
    <h1 style="margin: 0; font-size: 28px;">🔔 Lembrete Importante</h1>
  </div>
  <div style="background: white; padding: 30px; border-radius: 0 0 10px 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
    <p style="font-size: 16px; line-height: 1.6; color: #333;">Olá!</p>
    <p style="font-size: 16px; line-height: 1.6; color: #333;">Gostaríamos de lembrá-lo sobre:</p>
    <div style="background: #fff3cd; border: 1px solid #ffeaa7; padding: 15px; border-radius: 5px; margin: 20px 0;">
      <p style="font-size: 16px; line-height: 1.6; color: #856404; margin: 0;"><em>[DESCREVA O LEMBRETE AQUI]</em></p>
    </div>
    <p style="font-size: 16px; line-height: 1.6; color: #333;">Não se esqueça de verificar os detalhes no portal.</p>
    <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee;">
      <p style="font-size: 16px; color: #333; margin: 0;"><strong>Atenciosamente,<br>Equipe Sabercon</strong></p>
    </div>
  </div>
</div>`,
    category: EmailTemplateCategory.REMINDER,
    isActive: true,
    isBuiltIn: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    icon: '⏰',
    description: 'Template para lembretes e avisos importantes'
  },
  {
    id: 'announcement',
    name: 'Comunicado',
    subject: 'Comunicado Importante',
    message: `Prezados,

Informamos que:

[INSIRA O COMUNICADO AQUI]

Para mais informações, acesse o portal.

Atenciosamente,
Equipe Sabercon`,
    htmlContent: `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%); color: white; padding: 30px; border-radius: 10px 10px 0 0; text-align: center;">
    <h1 style="margin: 0; font-size: 28px;">📢 Comunicado Importante</h1>
  </div>
  <div style="background: white; padding: 30px; border-radius: 0 0 10px 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
    <p style="font-size: 16px; line-height: 1.6; color: #333;">Prezados,</p>
    <p style="font-size: 16px; line-height: 1.6; color: #333;">Informamos que:</p>
    <div style="background: #e3f2fd; border-left: 4px solid #2196f3; padding: 20px; margin: 20px 0;">
      <p style="font-size: 16px; line-height: 1.6; color: #1565c0; margin: 0;"><em>[INSIRA O COMUNICADO AQUI]</em></p>
    </div>
    <p style="font-size: 16px; line-height: 1.6; color: #333;">Para mais informações, acesse o portal.</p>
    <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee;">
      <p style="font-size: 16px; color: #333; margin: 0;"><strong>Atenciosamente,<br>Equipe Sabercon</strong></p>
    </div>
  </div>
</div>`,
    category: EmailTemplateCategory.ANNOUNCEMENT,
    isActive: true,
    isBuiltIn: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    icon: '📢',
    description: 'Template para comunicados oficiais e anúncios'
  },
  {
    id: 'notification',
    name: 'Notificação',
    subject: 'Nova Notificação',
    message: `Olá!

Você tem uma nova notificação:

[CONTEÚDO DA NOTIFICAÇÃO]

Acesse o portal para mais detalhes.

Atenciosamente,
Equipe Sabercon`,
    htmlContent: `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background: linear-gradient(135deg, #a8edea 0%, #fed6e3 100%); color: #333; padding: 30px; border-radius: 10px 10px 0 0; text-align: center;">
    <h1 style="margin: 0; font-size: 28px;">🔔 Nova Notificação</h1>
  </div>
  <div style="background: white; padding: 30px; border-radius: 0 0 10px 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
    <p style="font-size: 16px; line-height: 1.6; color: #333;">Olá!</p>
    <p style="font-size: 16px; line-height: 1.6; color: #333;">Você tem uma nova notificação:</p>
    <div style="background: #f0f9ff; border: 1px solid #bfdbfe; padding: 20px; border-radius: 5px; margin: 20px 0;">
      <p style="font-size: 16px; line-height: 1.6; color: #1e40af; margin: 0;"><em>[CONTEÚDO DA NOTIFICAÇÃO]</em></p>
    </div>
    <p style="font-size: 16px; line-height: 1.6; color: #333;">Acesse o portal para mais detalhes.</p>
    <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee;">
      <p style="font-size: 16px; color: #333; margin: 0;"><strong>Atenciosamente,<br>Equipe Sabercon</strong></p>
    </div>
  </div>
</div>`,
    category: EmailTemplateCategory.NOTIFICATION,
    isActive: true,
    isBuiltIn: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    icon: '🔔',
    description: 'Template para notificações gerais do sistema'
  }
]

class EmailTemplateService {
  // Carregar todos os templates (padrão + customizados)
  getAllTemplates(): EmailTemplate[] {
    try {
      const customTemplates = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]')
      return [...DEFAULT_TEMPLATES, ...customTemplates]
    } catch (error) {
      console.error('Erro ao carregar templates:', error)
      return DEFAULT_TEMPLATES
    }
  }

  // Buscar template por ID
  getTemplateById(id: string): EmailTemplate | null {
    const templates = this.getAllTemplates()
    return templates.find(t => t.id === id) || null
  }

  // Buscar templates por categoria
  getTemplatesByCategory(category: EmailTemplateCategory): EmailTemplate[] {
    return this.getAllTemplates().filter(t => t.category === category && t.isActive)
  }

  // Criar novo template
  createTemplate(data: CreateEmailTemplateDto): EmailTemplate {
    const template: EmailTemplate = {
      id: `custom_${Date.now()}`,
      ...data,
      isActive: true,
      isBuiltIn: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }

    const customTemplates = this.getCustomTemplates()
    customTemplates.push(template)
    this.saveCustomTemplates(customTemplates)

    return template
  }

  // Atualizar template (apenas customizados)
  updateTemplate(id: string, data: UpdateEmailTemplateDto): EmailTemplate | null {
    const customTemplates = this.getCustomTemplates()
    const index = customTemplates.findIndex(t => t.id === id)
    
    if (index === -1) {
      throw new Error('Template não encontrado ou não pode ser editado')
    }

    const updatedTemplate = {
      ...customTemplates[index],
      ...data,
      updatedAt: new Date().toISOString()
    }

    customTemplates[index] = updatedTemplate
    this.saveCustomTemplates(customTemplates)

    return updatedTemplate
  }

  // Excluir template (apenas customizados)
  deleteTemplate(id: string): boolean {
    const customTemplates = this.getCustomTemplates()
    const index = customTemplates.findIndex(t => t.id === id)
    
    if (index === -1) {
      return false
    }

    customTemplates.splice(index, 1)
    this.saveCustomTemplates(customTemplates)
    return true
  }

  // Duplicar template
  duplicateTemplate(id: string, newName?: string): EmailTemplate | null {
    const template = this.getTemplateById(id)
    if (!template) return null

    return this.createTemplate({
      name: newName || `${template.name} (Cópia)`,
      subject: template.subject,
      message: template.message,
      htmlContent: template.htmlContent,
      category: template.category,
      description: template.description,
      icon: template.icon
    })
  }

  // Validar dados do template
  validateTemplate(data: CreateEmailTemplateDto | UpdateEmailTemplateDto): string[] {
    const errors: string[] = []

    if (!data.name?.trim()) {
      errors.push('Nome é obrigatório')
    }

    if (!data.subject?.trim()) {
      errors.push('Assunto é obrigatório')
    }

    if (!data.message?.trim()) {
      errors.push('Mensagem é obrigatória')
    }

    if (data.name && data.name.length > 100) {
      errors.push('Nome deve ter no máximo 100 caracteres')
    }

    if (data.subject && data.subject.length > 200) {
      errors.push('Assunto deve ter no máximo 200 caracteres')
    }

    return errors
  }

  // Buscar templates
  searchTemplates(query: string): EmailTemplate[] {
    const templates = this.getAllTemplates()
    const lowerQuery = query.toLowerCase()
    
    return templates.filter(t => 
      t.name.toLowerCase().includes(lowerQuery) ||
      t.subject.toLowerCase().includes(lowerQuery) ||
      t.description?.toLowerCase().includes(lowerQuery) ||
      t.category.toLowerCase().includes(lowerQuery)
    )
  }

  // Exportar templates customizados
  exportTemplates(): string {
    const customTemplates = this.getCustomTemplates()
    return JSON.stringify(customTemplates, null, 2)
  }

  // Importar templates
  importTemplates(jsonData: string): { success: number; errors: string[] } {
    try {
      const templates = JSON.parse(jsonData)
      const errors: string[] = []
      let success = 0

      if (!Array.isArray(templates)) {
        throw new Error('Formato inválido: esperado um array de templates')
      }

      templates.forEach((template, index) => {
        try {
          const validationErrors = this.validateTemplate(template)
          if (validationErrors.length > 0) {
            errors.push(`Template ${index + 1}: ${validationErrors.join(', ')}`)
            return
          }

          this.createTemplate({
            name: template.name,
            subject: template.subject,
            message: template.message,
            htmlContent: template.htmlContent,
            category: template.category || EmailTemplateCategory.CUSTOM,
            description: template.description,
            icon: template.icon
          })
          success++
        } catch (error: any) {
          errors.push(`Template ${index + 1}: ${error.message}`)
        }
      })

      return { success, errors }
    } catch (error: any) {
      return { success: 0, errors: [error.message] }
    }
  }

  // Obter estatísticas
  getStats() {
    const templates = this.getAllTemplates()
    const customTemplates = this.getCustomTemplates()
    
    const stats = {
      total: templates.length,
      builtIn: DEFAULT_TEMPLATES.length,
      custom: customTemplates.length,
      active: templates.filter(t => t.isActive).length,
      byCategory: {} as Record<string, number>
    }

    // Contar por categoria
    Object.values(EmailTemplateCategory).forEach(category => {
      stats.byCategory[category] = templates.filter(t => t.category === category).length
    })

    return stats
  }

  // Métodos privados
  private getCustomTemplates(): EmailTemplate[] {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]')
    } catch (error) {
      console.error('Erro ao carregar templates customizados:', error)
      return []
    }
  }

  private saveCustomTemplates(templates: EmailTemplate[]): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(templates))
    } catch (error) {
      console.error('Erro ao salvar templates:', error)
      throw new Error('Não foi possível salvar o template')
    }
  }
}

export const emailTemplateService = new EmailTemplateService() 