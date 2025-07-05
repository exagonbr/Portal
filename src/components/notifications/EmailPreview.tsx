'use client'

interface EmailPreviewProps {
  subject: string
  message: string
  iconType: string
  recipients: string[]
  senderName?: string
  senderEmail?: string
}

export default function EmailPreview({
  subject,
  message,
  iconType,
  recipients,
  senderName = 'Portal Sabercon',
  senderEmail = 'noreply@sabercon.com.br'
}: EmailPreviewProps) {
  const getIconInfo = () => {
    const iconMap: Record<string, { icon: string; color: string }> = {
      announcement: { icon: 'campaign', color: 'text-blue-600' },
      event: { icon: 'event', color: 'text-purple-600' },
      assignment: { icon: 'assignment', color: 'text-green-600' },
      grade: { icon: 'grade', color: 'text-yellow-600' },
      schedule: { icon: 'schedule', color: 'text-orange-600' },
      info: { icon: 'info', color: 'text-cyan-600' },
      warning: { icon: 'warning', color: 'text-red-600' },
      celebration: { icon: 'celebration', color: 'text-pink-600' }
    }
    return iconMap[iconType] || { icon: 'mail', color: 'text-gray-600' }
  }

  const iconInfo = getIconInfo()

  return (
    <div className="bg-gray-50 rounded-lg p-6">
      <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
        <span className="material-symbols-outlined">preview</span>
        Preview do E-mail
      </h3>
      
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        {/* Header do email */}
        <div className="bg-gray-100 px-6 py-4 border-b border-gray-200">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm">
              <span className="font-medium text-gray-600">De:</span>
              <span className="text-gray-800">{senderName} &lt;{senderEmail}&gt;</span>
            </div>
            <div className="flex items-start gap-2 text-sm">
              <span className="font-medium text-gray-600">Para:</span>
              <div className="flex-1">
                {recipients.length > 0 ? (
                  <span className="text-gray-800">
                    {recipients.slice(0, 3).join(', ')}
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
                {subject || <span className="text-gray-400">Sem assunto</span>}
              </span>
            </div>
          </div>
        </div>

        {/* Corpo do email */}
        <div className="p-6">
          {/* Logo/Header */}
          <div className="text-center mb-6">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-3">
              <span className={`material-symbols-outlined text-3xl ${iconInfo.color}`}>
                {iconInfo.icon}
              </span>
            </div>
            <h2 className="text-xl font-bold text-gray-800">Portal Sabercon</h2>
          </div>

          {/* Mensagem */}
          <div className="prose max-w-none">
            {message ? (
              <div 
                className="text-gray-700 whitespace-pre-wrap"
                dangerouslySetInnerHTML={{ 
                  __html: message.replace(/\n/g, '<br />') 
                }}
              />
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
    </div>
  )
}
