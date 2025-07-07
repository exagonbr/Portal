'use client'

import { useState } from 'react'
import EmailComposer, { EmailData } from '@/components/communications/EmailComposer'
import { useEmailSender } from '@/hooks/useEmailSender'

export default function EmailSendDemo() {
  const { sendEmail, loading, success, error, successMessage } = useEmailSender()
  
  // Dados mock para demonstração
  const mockRecipients = [
    { id: '1', name: 'João Silva', email: 'joao.silva@exemplo.com', type: 'user' as const },
    { id: '2', name: 'Maria Santos', email: 'maria.santos@exemplo.com', type: 'user' as const },
    { id: '3', name: 'Pedro Costa', email: 'pedro.costa@exemplo.com', type: 'user' as const },
    { id: '4', name: 'Ana Oliveira', email: 'ana.oliveira@exemplo.com', type: 'user' as const },
    { id: '5', name: 'Professores', email: 'professores@exemplo.com', type: 'group' as const }
  ]

  const handleSend = async (emailData: EmailData) => {
    console.log('🚀 [Demo] Enviando email com dados:', emailData)
    await sendEmail(emailData)
  }

  const handleSaveDraft = (emailData: EmailData) => {
    console.log('💾 [Demo] Salvando rascunho:', emailData)
    alert('Rascunho salvo com sucesso!')
  }

  const handleSaveTemplate = (template: any) => {
    console.log('📝 [Demo] Salvando template:', template)
    alert('Template salvo com sucesso!')
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4 sm:py-6">
      <div className="mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-1 sm:mb-2">
          Demonstração: Botão &quot;Enviar Agora&quot;
        </h1>
        <p className="text-sm sm:text-base text-gray-600">
          Esta demonstração mostra como funciona o botão &quot;Enviar Agora&quot; no sistema de emails.
        </p>
      </div>

      {/* Status do envio */}
      {success && (
        <div className="mb-4 sm:mb-6 p-3 sm:p-4 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-green-600">check_circle</span>
            <p className="text-sm text-green-800 font-medium">{successMessage}</p>
          </div>
        </div>
      )}

      {error && (
        <div className="mb-4 sm:mb-6 p-3 sm:p-4 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-red-600">error</span>
            <p className="text-sm text-red-800 font-medium">{error}</p>
          </div>
        </div>
      )}

      {/* Estado de carregamento */}
      {loading && (
        <div className="mb-4 sm:mb-6 p-3 sm:p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-center gap-2">
            <div className="animate-spin rounded-full h-4 w-4 sm:h-5 sm:w-5 border-2 border-blue-600 border-t-transparent"></div>
            <p className="text-sm text-blue-800 font-medium">Enviando email...</p>
          </div>
        </div>
      )}

      {/* Instruções */}
      <div className="mb-6 sm:mb-8 p-4 sm:p-6 bg-gray-50 rounded-lg">
        <h2 className="text-base sm:text-lg font-semibold text-gray-900 mb-2 sm:mb-3">Como testar:</h2>
        <ol className="list-decimal list-inside space-y-1.5 sm:space-y-2 text-sm sm:text-base text-gray-700">
          <li>Preencha o campo &quot;Destinatários&quot; selecionando ou digitando emails</li>
          <li>Digite um assunto para o email</li>
          <li>Escreva uma mensagem</li>
          <li>Clique no botão <strong>&quot;Enviar Agora&quot;</strong></li>
          <li>Observe o estado de carregamento e a mensagem de sucesso/erro</li>
        </ol>
        
        <div className="mt-3 sm:mt-4 p-2.5 sm:p-3 bg-yellow-50 border border-yellow-200 rounded">
          <p className="text-xs sm:text-sm text-yellow-800">
            <strong>Nota:</strong> Esta é uma demonstração. Os emails não são enviados realmente, 
            mas o sistema simula o processo completo de envio.
          </p>
        </div>
      </div>

      {/* Componente EmailComposer */}
      <EmailComposer
        onSend={handleSend}
        onSaveDraft={handleSaveDraft}
        onSaveTemplate={handleSaveTemplate}
        loading={loading}
        availableRecipients={mockRecipients}
      />

      {/* Informações técnicas */}
      <div className="mt-6 sm:mt-8 p-4 sm:p-6 bg-gray-50 rounded-lg">
        <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-2 sm:mb-3">Informações Técnicas:</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4 text-xs sm:text-sm">
          <div>
            <h4 className="font-medium text-gray-800 mb-1.5 sm:mb-2">Componentes:</h4>
            <ul className="space-y-0.5 sm:space-y-1 text-gray-600">
              <li>• EmailComposer (principal)</li>
              <li>• RecipientSelector (destinatários)</li>
              <li>• useEmailSender (hook de envio)</li>
            </ul>
          </div>
          <div>
            <h4 className="font-medium text-gray-800 mb-1.5 sm:mb-2">API:</h4>
            <ul className="space-y-0.5 sm:space-y-1 text-gray-600">
              <li>• Endpoint: /api/notifications/send</li>
              <li>• Método: POST</li>
              <li>• Autenticação: Required</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
} 