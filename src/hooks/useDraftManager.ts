import { useState } from 'react'
import { EmailData } from '@/components/communications/EmailComposer'

interface Draft extends EmailData {
  id: string
  createdAt: string
}

interface Template {
  id: string
  name: string
  subject: string
  message: string
  iconType?: string
  createdAt: string
}

interface UseDraftManagerReturn {
  saveDraft: (emailData: EmailData) => void
  saveTemplate: (template: Omit<Template, 'id' | 'createdAt'>) => void
  drafts: Draft[]
  templates: Template[]
  deleteDraft: (id: string) => void
  deleteTemplate: (id: string) => void
  loadDraft: (id: string) => Draft | undefined
  loadTemplate: (id: string) => Template | undefined
}

export function useDraftManager(): UseDraftManagerReturn {
  const [successMessage, setSuccessMessage] = useState('')

  const saveDraft = (emailData: EmailData) => {
    console.log('💾 [useDraftManager] Salvando rascunho:', emailData)
    
    const drafts = JSON.parse(localStorage.getItem('emailDrafts') || '[]')
    const newDraft: Draft = {
      ...emailData,
      id: Date.now().toString(),
      createdAt: new Date().toISOString()
    }
    
    drafts.push(newDraft)
    localStorage.setItem('emailDrafts', JSON.stringify(drafts))
    
    setSuccessMessage('Rascunho salvo com sucesso!')
    setTimeout(() => setSuccessMessage(''), 3000)
  }

  const saveTemplate = (template: Omit<Template, 'id' | 'createdAt'>) => {
    console.log('💾 [useDraftManager] Salvando template:', template)
    
    const templates = JSON.parse(localStorage.getItem('emailTemplates') || '[]')
    const newTemplate: Template = {
      ...template,
      id: Date.now().toString(),
      createdAt: new Date().toISOString()
    }
    
    templates.push(newTemplate)
    localStorage.setItem('emailTemplates', JSON.stringify(templates))
    
    setSuccessMessage('Template salvo com sucesso!')
    setTimeout(() => setSuccessMessage(''), 3000)
  }

  const getDrafts = (): Draft[] => {
    try {
      return JSON.parse(localStorage.getItem('emailDrafts') || '[]')
    } catch {
      return []
    }
  }

  const getTemplates = (): Template[] => {
    try {
      return JSON.parse(localStorage.getItem('emailTemplates') || '[]')
    } catch {
      return []
    }
  }

  const deleteDraft = (id: string) => {
    const drafts = getDrafts().filter(draft => draft.id !== id)
    localStorage.setItem('emailDrafts', JSON.stringify(drafts))
  }

  const deleteTemplate = (id: string) => {
    const templates = getTemplates().filter(template => template.id !== id)
    localStorage.setItem('emailTemplates', JSON.stringify(templates))
  }

  const loadDraft = (id: string): Draft | undefined => {
    return getDrafts().find(draft => draft.id === id)
  }

  const loadTemplate = (id: string): Template | undefined => {
    return getTemplates().find(template => template.id === id)
  }

  return {
    saveDraft,
    saveTemplate,
    drafts: getDrafts(),
    templates: getTemplates(),
    deleteDraft,
    deleteTemplate,
    loadDraft,
    loadTemplate
  }
}