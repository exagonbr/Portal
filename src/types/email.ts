export interface EmailTemplate {
  id: string
  name: string
  subject: string
  message: string
  htmlContent?: string
  category: EmailTemplateCategory
  isActive: boolean
  isBuiltIn: boolean
  createdAt: string
  updatedAt: string
  icon?: string
  description?: string
}

export interface CreateEmailTemplateDto {
  name: string
  subject: string
  message: string
  htmlContent?: string
  category: EmailTemplateCategory
  description?: string
  icon?: string
}

export interface UpdateEmailTemplateDto extends Partial<CreateEmailTemplateDto> {
  isActive?: boolean
}

export enum EmailTemplateCategory {
  WELCOME = 'welcome',
  REMINDER = 'reminder',
  ANNOUNCEMENT = 'announcement',
  NOTIFICATION = 'notification',
  MARKETING = 'marketing',
  SYSTEM = 'system',
  CUSTOM = 'custom'
}

export interface EmailRecipients {
  emails?: string[]
  users?: string[]
  roles?: string[]
}

export interface EmailSendData {
  title: string
  subject: string
  message: string
  html?: boolean
  htmlContent?: string
  recipients: EmailRecipients
  templateId?: string
  scheduledFor?: string
  priority?: 'low' | 'medium' | 'high'
}

export interface EmailSendResult {
  success: boolean
  message: string
  data?: {
    sentCount: number
    failedCount: number
    sentEmails: string[]
    failedEmails: string[]
    errors?: string[]
  }
}

export interface EmailValidationError {
  field: string
  message: string
}

export interface EmailDraft {
  id: string
  subject: string
  message: string
  htmlContent?: string
  recipients: EmailRecipients
  templateId?: string
  createdAt: string
  updatedAt: string
} 