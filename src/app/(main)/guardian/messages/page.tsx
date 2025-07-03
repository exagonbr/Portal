'use client'

import { useAuth } from '@/contexts/AuthContext'
import { useState } from 'react'

const MOCK_MESSAGES = [
  {
    id: 1,
    from: 'Prof. João Silva',
    fromRole: 'Professor de Matemática',
    subject: 'Desempenho da Ana em Matemática',
    message: 'Gostaria de parabenizar a Ana pelo excelente desempenho na última prova de matemática. Ela demonstrou grande evolução na resolução de equações do 2º grau.',
    timestamp: '2024-03-20 14:30:00',
    read: false,
    priority: 'normal',
    childName: 'Ana Silva Santos',
    attachments: []
  },
  {
    id: 2,
    from: 'Coord. Maria Santos',
    fromRole: 'Coordenadora Pedagógica',
    subject: 'Reunião de Pais - 8º Ano B',
    message: 'Informamos que a reunião de pais do 8º Ano B está marcada para o dia 02/04/2024 às 19h00 no auditório da escola. Contamos com sua presença para discutirmos o desenvolvimento acadêmico dos alunos.',
    timestamp: '2024-03-19 16:45:00',
    read: true,
    priority: 'high',
    childName: 'Ana Silva Santos',
    attachments: ['cronograma_reuniao.pdf']
  },
  {
    id: 3,
    from: 'Profa. Ana Costa',
    fromRole: 'Professora Polivalente',
    subject: 'Projeto Sistema Solar - Pedro',
    message: 'O Pedro está desenvolvendo um excelente trabalho no projeto do sistema solar. Gostaria de sugerir que ele apresente o projeto na feira de ciências da escola.',
    timestamp: '2024-03-18 10:20:00',
    read: true,
    priority: 'normal',
    childName: 'Pedro Silva Santos',
    attachments: []
  },
  {
    id: 4,
    from: 'Secretaria Escolar',
    fromRole: 'Secretaria',
    subject: 'Documentação Pendente',
    message: 'Informamos que há documentação pendente para regularização da matrícula. Por favor, compareça à secretaria com os documentos solicitados até o dia 25/03/2024.',
    timestamp: '2024-03-17 09:15:00',
    read: false,
    priority: 'high',
    childName: 'Geral',
    attachments: ['lista_documentos.pdf']
  },
  {
    id: 5,
    from: 'Direção',
    fromRole: 'Diretor',
    subject: 'Comunicado - Recesso Escolar',
    message: 'Comunicamos que haverá recesso escolar nos dias 28 e 29 de março devido ao feriado prolongado. As aulas retornam normalmente no dia 01 de abril.',
    timestamp: '2024-03-15 12:00:00',
    read: true,
    priority: 'normal',
    childName: 'Geral',
    attachments: []
  }
]

export default function GuardianMessagesPage() {
  const { user } = useAuth()
  const [selectedMessage, setSelectedMessage] = useState<any>(null)
  const [showCompose, setShowCompose] = useState(false)
  const [filterRead, setFilterRead] = useState('all')
  const [filterPriority, setFilterPriority] = useState('all')
  const [filterChild, setFilterChild] = useState('all')

  const children = ['Ana Silva Santos', 'Pedro Silva Santos']

  const filteredMessages = MOCK_MESSAGES.filter(message => {
    const matchesRead = filterRead === 'all' || 
                       (filterRead === 'unread' && !message.read) ||
                       (filterRead === 'read' && message.read)
    const matchesPriority = filterPriority === 'all' || message.priority === filterPriority
    const matchesChild = filterChild === 'all' || message.childName === filterChild || message.childName === 'Geral'
    
    return matchesRead && matchesPriority && matchesChild
  })

  const unreadCount = MOCK_MESSAGES.filter(m => !m.read).length

  const markAsRead = (messageId: number) => {
    // Simular marcar como lida
    console.log('Marking message as read:', messageId)
  }

  return (
    <div className="container mx-auto px-3 sm:px-4 lg:px-6 py-4 sm:py-6 lg:py-8">
      {/* Header */}
      <div className="mb-6 sm:mb-8">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4 mb-4 sm:mb-6">
          <div className="min-w-0 flex-1">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-700 dark:text-gray-800 truncate">Mensagens</h1>
            <p className="text-sm sm:text-base text-gray-600 mt-1">Comunicação com a escola e professores</p>
          </div>
          <button 
            onClick={() => setShowCompose(true)}
            className="bg-primary text-white px-4 sm:px-6 py-2 sm:py-3 rounded-lg hover:bg-primary-dark flex items-center justify-center space-x-2 transition-colors text-sm sm:text-base w-full sm:w-auto"
          >
            <span className="material-symbols-outlined text-lg sm:text-xl">add</span>
            <span className="hidden sm:inline">Nova Mensagem</span>
            <span className="sm:hidden">Nova</span>
          </button>
        </div>

        {/* Stats Cards - Grid responsivo */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6 mb-6">
          <div className="bg-white rounded-lg shadow-md p-3 sm:p-4 lg:p-6">
            <div className="text-xs sm:text-sm font-medium text-gray-500 mb-1">Total de Mensagens</div>
            <div className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-700 dark:text-gray-800">{MOCK_MESSAGES.length}</div>
            <div className="text-xs sm:text-sm text-gray-600 mt-1">Este mês</div>
          </div>
          
          <div className="bg-white rounded-lg shadow-md p-3 sm:p-4 lg:p-6">
            <div className="text-xs sm:text-sm font-medium text-gray-500 mb-1">Não Lidas</div>
            <div className="text-xl sm:text-2xl font-bold text-error">{unreadCount}</div>
            <div className="text-xs sm:text-sm text-gray-600 mt-1">Requerem atenção</div>
          </div>
          
          <div className="bg-white rounded-lg shadow-md p-3 sm:p-4 lg:p-6">
            <div className="text-xs sm:text-sm font-medium text-gray-500 mb-1">Alta Prioridade</div>
            <div className="text-xl sm:text-2xl font-bold text-accent-orange">
              {MOCK_MESSAGES.filter(m => m.priority === 'high').length}
            </div>
            <div className="text-xs sm:text-sm text-gray-600 mt-1">Urgentes</div>
          </div>
          
          <div className="bg-white rounded-lg shadow-md p-3 sm:p-4 lg:p-6 col-span-2 lg:col-span-1">
            <div className="text-xs sm:text-sm font-medium text-gray-500 mb-1">De Professores</div>
            <div className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-700 dark:text-gray-800">
              {MOCK_MESSAGES.filter(m => m.fromRole.includes('Professor')).length}
            </div>
            <div className="text-xs sm:text-sm text-gray-600 mt-1">Comunicações acadêmicas</div>
          </div>
        </div>

        {/* Filters - Responsivo */}
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mb-6">
          <select 
            value={filterRead}
            onChange={(e) => setFilterRead(e.target.value)}
            className="px-3 sm:px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary text-sm sm:text-base"
          >
            <option value="all">Todas</option>
            <option value="unread">Não Lidas</option>
            <option value="read">Lidas</option>
          </select>
          
          <select 
            value={filterPriority}
            onChange={(e) => setFilterPriority(e.target.value)}
            className="px-3 sm:px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary text-sm sm:text-base"
          >
            <option value="all">Todas as Prioridades</option>
            <option value="high">Alta Prioridade</option>
            <option value="normal">Prioridade Normal</option>
          </select>
          
          <select 
            value={filterChild}
            onChange={(e) => setFilterChild(e.target.value)}
            className="px-3 sm:px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary text-sm sm:text-base"
          >
            <option value="all">Todos os Filhos</option>
            <option value="Geral">Mensagens Gerais</option>
            {children.map(child => (
              <option key={child} value={child}>{child}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Messages List - Responsivo */}
      <div className="space-y-3 sm:space-y-4">
        {filteredMessages.map((message) => (
          <div 
            key={message.id} 
            className={`bg-white rounded-lg shadow-md p-4 sm:p-6 cursor-pointer transition-all hover:shadow-lg ${
              !message.read ? 'border-l-4 border-primary' : ''
            }`}
            onClick={() => {
              setSelectedMessage(message)
              if (!message.read) markAsRead(message.id)
            }}
          >
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3 mb-3">
              <div className="flex-1 min-w-0">
                <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 mb-1">
                  <h3 className={`text-base sm:text-lg font-semibold truncate ${!message.read ? 'text-gray-700' : 'text-gray-700'}`}>
                    {message.subject}
                  </h3>
                  {!message.read && (
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-primary/20 text-primary flex-shrink-0 w-fit">
                      Nova
                    </span>
                  )}
                </div>
                <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3 text-xs sm:text-sm text-gray-600">
                  <span className="font-medium">{message.from}</span>
                  <span className="hidden sm:inline">•</span>
                  <span>{message.fromRole}</span>
                  <span className="hidden sm:inline">•</span>
                  <span>{message.childName}</span>
                </div>
              </div>
              <div className="flex flex-col sm:flex-row sm:items-center gap-2 flex-shrink-0">
                {message.priority === 'high' && (
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-error/20 text-error w-fit">
                    Alta Prioridade
                  </span>
                )}
                <span className="text-xs sm:text-sm text-gray-500">
                  {new Date(message.timestamp).toLocaleDateString('pt-BR')}
                </span>
              </div>
            </div>

            <p className="text-sm text-gray-600 line-clamp-2 mb-3">{message.message}</p>

            {message.attachments.length > 0 && (
              <div className="flex items-center space-x-2 text-xs sm:text-sm text-gray-500">
                <span className="material-symbols-outlined text-sm">attach_file</span>
                <span>{message.attachments.length} anexo(s)</span>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Message Details Modal - Responsivo */}
      {selectedMessage && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-4 sm:p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg sm:text-xl font-semibold text-primary truncate pr-4">{selectedMessage.subject}</h3>
                <button
                  onClick={() => setSelectedMessage(null)}
                  className="text-gray-400 hover:text-gray-600 p-1 flex-shrink-0"
                >
                  <span className="material-symbols-outlined">close</span>
                </button>
              </div>

              <div className="space-y-4 sm:space-y-6">
                {/* Message Header */}
                <div className="border-b border-gray-200 pb-4">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-3">
                    <div>
                      <div className="font-medium text-gray-700">{selectedMessage.from}</div>
                      <div className="text-sm text-gray-600">{selectedMessage.fromRole}</div>
                    </div>
                    <div className="text-sm text-gray-500">
                      {new Date(selectedMessage.timestamp).toLocaleString('pt-BR')}
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
                      Para: {selectedMessage.childName}
                    </span>
                    {selectedMessage.priority === 'high' && (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-error/20 text-error">
                        Alta Prioridade
                      </span>
                    )}
                  </div>
                </div>

                {/* Message Content */}
                <div>
                  <p className="text-gray-700 leading-relaxed">{selectedMessage.message}</p>
                </div>

                {/* Attachments */}
                {selectedMessage.attachments.length > 0 && (
                  <div>
                    <h4 className="font-medium text-gray-700 mb-2">Anexos</h4>
                    <div className="space-y-2">
                      {selectedMessage.attachments.map((attachment: string, index: number) => (
                        <div key={index} className="flex items-center space-x-2 p-2 bg-gray-50 rounded-lg">
                          <span className="material-symbols-outlined text-gray-500">attach_file</span>
                          <span className="text-sm text-gray-700 flex-1 truncate">{attachment}</span>
                          <button className="text-primary hover:text-primary-dark text-sm">
                            Baixar
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Actions */}
                <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-gray-200">
                  <button className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors text-sm sm:text-base">
                    Responder
                  </button>
                  <button className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm sm:text-base">
                    Encaminhar
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Compose Modal - Responsivo */}
      {showCompose && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-4 sm:p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg sm:text-xl font-semibold text-primary">Nova Mensagem</h3>
                <button
                  onClick={() => setShowCompose(false)}
                  className="text-gray-400 hover:text-gray-600 p-1"
                >
                  <span className="material-symbols-outlined">close</span>
                </button>
              </div>

              <form className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Para</label>
                  <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-sm sm:text-base">
                    <option>Selecione o destinatário</option>
                    <option>Coordenação Pedagógica</option>
                    <option>Secretaria</option>
                    <option>Prof. João Silva - Matemática</option>
                    <option>Profa. Maria Santos - Português</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Assunto</label>
                  <input 
                    type="text" 
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-sm sm:text-base"
                    placeholder="Digite o assunto da mensagem"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Mensagem</label>
                  <textarea 
                    rows={6}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-sm sm:text-base resize-none"
                    placeholder="Digite sua mensagem aqui..."
                  ></textarea>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 pt-4">
                  <button 
                    type="submit"
                    className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors text-sm sm:text-base"
                  >
                    Enviar Mensagem
                  </button>
                  <button 
                    type="button"
                    onClick={() => setShowCompose(false)}
                    className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm sm:text-base"
                  >
                    Cancelar
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}