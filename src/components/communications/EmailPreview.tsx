'use client'

interface EmailPreviewProps {
  subject: string
  message: string
  iconType: string
  recipients: string[]
  senderName?: string
  senderEmail?: string
  isHtml?: boolean
}

export default function EmailPreview({
  subject,
  message,
  iconType,
  recipients,
  senderName = 'Portal Sabercon',
  senderEmail = 'noreply@sabercon.com.br',
  isHtml = false
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
              isHtml ? (
                <div 
                  className="text-gray-700 prose prose-sm max-w-none
                    prose-headings:text-gray-800 prose-headings:font-semibold
                    prose-p:text-gray-700 prose-p:leading-relaxed
                    prose-a:text-blue-600 prose-a:underline hover:prose-a:text-blue-800
                    prose-strong:text-gray-800 prose-strong:font-semibold
                    prose-ul:list-disc prose-ul:pl-5 prose-ul:text-gray-700
                    prose-ol:list-decimal prose-ol:pl-5 prose-ol:text-gray-700
                    prose-li:text-gray-700 prose-li:mb-1
                    prose-blockquote:border-l-4 prose-blockquote:border-gray-300 prose-blockquote:pl-4 prose-blockquote:italic prose-blockquote:text-gray-600
                    prose-code:bg-gray-100 prose-code:px-1 prose-code:py-0.5 prose-code:rounded prose-code:text-sm
                    prose-pre:bg-gray-100 prose-pre:p-4 prose-pre:rounded-lg prose-pre:overflow-x-auto
                    prose-img:rounded-lg prose-img:shadow-md prose-img:my-4
                    prose-table:border-collapse prose-table:w-full
                    prose-td:border prose-td:border-gray-300 prose-td:p-2
                    prose-th:border prose-th:border-gray-300 prose-th:p-2 prose-th:bg-gray-100 prose-th:font-semibold"
                  dangerouslySetInnerHTML={{ __html: message }}
                />
              ) : (
                <div 
                  className="text-gray-700 whitespace-pre-wrap"
                  dangerouslySetInnerHTML={{ 
                    __html: message.replace(/\n/g, '<br />') 
                  }}
                />
              )
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