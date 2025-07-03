'use client'

import { useState } from 'react'
import EmailComposer, { EmailData } from '@/components/communications/EmailComposer'
import { usePermissionCheck } from '@/hooks/usePermissionCheck'
import { useAvailableUsers } from '@/hooks/useAvailableUsers'
import { useEmailSender } from '@/hooks/useEmailSender'
import { useDraftManager } from '@/hooks/useDraftManager'
import PermissionDenied from '@/components/notifications/PermissionDenied'
import PageHeader from '@/components/notifications/PageHeader'
import AlertMessages from '@/components/notifications/AlertMessages'
import '@/styles/cards-standard.css'

export default function SendCommunicationPage() {
  const { user, hasPermission, isChecking } = usePermissionCheck({
    restrictedRoles: ['GUARDIAN', 'STUDENT'],
    redirectTo: '/notifications'
  })

  const { availableUsers } = useAvailableUsers(user?.role)
  const { sendEmail, loading, success, error, successMessage } = useEmailSender()
  const { saveDraft, saveTemplate } = useDraftManager()
  
  const [draftSuccess, setDraftSuccess] = useState(false)
  const [draftMessage, setDraftMessage] = useState('')

  const handleSaveDraft = (emailData: EmailData) => {
    saveDraft(emailData)
    setDraftMessage('Rascunho salvo com sucesso!')
    setDraftSuccess(true)
    setTimeout(() => {
      setDraftSuccess(false)
      setDraftMessage('')
    }, 3000)
  }

  const handleSaveTemplate = (template: any) => {
    saveTemplate({
      name: template.name || 'Novo Template',
      subject: template.subject,
      message: template.message,
      iconType: template.iconType
    })
    setDraftMessage('Template salvo com sucesso!')
    setDraftSuccess(true)
    setTimeout(() => {
      setDraftSuccess(false)
      setDraftMessage('')
    }, 3000)
  }

  // Se está verificando permissões, mostrar loading
  if (isChecking) {
    return (
      <div className="container-responsive spacing-y-responsive">
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Verificando permissões...</p>
          </div>
        </div>
      </div>
    )
  }

  // Se não tem permissão, mostrar componente de acesso negado
  if (!hasPermission) {
    return <PermissionDenied />
  }

  // Combinar mensagens de sucesso
  const showSuccess = success || draftSuccess
  const showMessage = successMessage || draftMessage

  return (
    <div className="container-responsive spacing-y-responsive">
      <PageHeader 
        title="Envio de mensagem de e-mail"
        subtitle="Envie mensagens personalizadas para usuários do sistema"
      />

      <AlertMessages 
        success={showSuccess}
        successMessage={showMessage}
        error={error}
      />

      <EmailComposer
        onSend={sendEmail}
        onSaveDraft={handleSaveDraft}
        onSaveTemplate={handleSaveTemplate}
        loading={loading}
        availableRecipients={availableUsers}
      />
    </div>
  )
}