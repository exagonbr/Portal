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
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-700 dark:text-gray-800">Mensagens</h1>
            <p className="text-gray-600">Comunicação com a escola e professores</p>
          </div>
          <button 
            onClick={() => setShowCompose(true)}
            className="bg-primary text-white px-6 py-2 rounded-lg hover:bg-primary-dark flex items-center space-x-2 transition-colors"
          >
            <span className="material-symbols-outlined">add</span>
            <span>Nova Mensagem</span>
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="text-sm font-medium text-gray-500 mb-1">Total de Mensagens</div>
            <div className="text-3xl font-bold text-gray-700 dark:text-gray-800">{MOCK_MESSAGES.length}</div>
            <div className="text-sm text-gray-600 mt-1">Este mês</div>
          </div>
          
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="text-sm font-medium text-gray-500 mb-1">Não Lidas</div>
            <div className="text-2xl font-bold text-error">{unreadCount}</div>
            <div className="text-sm text-gray-600 mt-1">Requerem atenção</div>
          </div>
          
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="text-sm font-medium text-gray-500 mb-1">Alta Prioridade</div>
            <div className="text-2xl font-bold text-accent-orange">
              {MOCK_MESSAGES.filter(m => m.priority === 'high').length}
            </div>
            <div className="text-sm text-gray-600 mt-1">Urgentes</div>
          </div>
          
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="text-sm font-medium text-gray-500 mb-1">De Professores</div>
            <div className="text-3xl font-bold text-gray-700 dark:text-gray-800">
              {MOCK_MESSAGES.filter(m => m.fromRole.includes('Professor')).length}
            </div>
            <div className="text-sm text-gray-600 mt-1">Comunicações acadêmicas</div>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-4 mb-6">
          <select 
            value={filterRead}
            onChange={(e) => setFilterRead(e.target.value)}
            className="px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="all">Todas</option>
            <option value="unread">Não Lidas</option>
            <option value="read">Lidas</option>
          </select>
          
          <select 
            value={filterPriority}
            onChange={(e) => setFilterPriority(e.target.value)}
            className="px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="all">Todas as Prioridades</option>
            <option value="high">Alta Prioridade</option>
            <option value="normal">Prioridade Normal</option>
          </select>
          
          <select 
            value={filterChild}
            onChange={(e) => setFilterChild(e.target.value)}
            className="px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="all">Todos os Filhos</option>
            <option value="Geral">Mensagens Gerais</option>
            {children.map(child => (
              <option key={child} value={child}>{child}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Messages List */}
      <div className="space-y-4">
        {filteredMessages.map((message) => (
          <div 
            key={message.id} 
            className={`bg-white rounded-lg shadow-md p-6 cursor-pointer transition-all hover:shadow-lg ${
              !message.read ? 'border-l-4 border-primary' : ''
            }`}
            onClick={() => {
              setSelectedMessage(message)
              if (!message.read) markAsRead(message.id)
            }}
          >
            <div className="flex justify-between items-start mb-3">
              <div className="flex-1">
                <div className="flex items-center space-x-3 mb-1">
                  <h3 className={`text-lg font-semibold ${!message.read ? 'text-gray-700' : 'text-gray-700'}`}>
                    {message.subject}
                  </h3>
                  {!message.read && (
                    <span className="w-2 h-2 bg-primary rounded-full"></span>
                  )}
                </div>
                <div className="flex items-center space-x-4 text-sm text-gray-600">
                  <span className="font-medium">{message.from}</span>
                  <span>•</span>
                  <span>{message.fromRole}</span>
                  <span>•</span>
                  <span>{new Date(message.timestamp).toLocaleDateString('pt-BR')} às {new Date(message.timestamp).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</span>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                {message.priority === 'high' && (
                  <span className="px-2 py-1 bg-error/20 text-error rounded-full text-xs font-medium">
                    Alta Prioridade
                  </span>
                )}
                {message.attachments.length > 0 && (
                  <span className="material-symbols-outlined text-gray-400">attach_file</span>
                )}
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                  message.childName === 'Geral'
                    ? 'bg-accent-purple/20 text-accent-purple'
                    : 'bg-primary/20 text-primary'
                }`}>
                  {message.childName}
                </span>
              </div>
            </div>
            
            <p className={`text-gray-600 line-clamp-2 ${!message.read ? 'font-medium' : ''}`}>
              {message.message}
            </p>
          </div>
        ))}
      </div>

      {/* Message Details Modal */}
      {selectedMessage && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-semibold text-primary">Detalhes da Mensagem</h3>
              <button 
                onClick={() => setSelectedMessage(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            
            <div className="space-y-6">
              <div>
                <h4 className="text-lg font-semibold text-primary">{selectedMessage.subject}</h4>
                <div className="flex items-center space-x-4 text-sm text-gray-600 mt-2">
                  <span><strong>De:</strong> {selectedMessage.from}</span>
                  <span>•</span>
                  <span>{selectedMessage.fromRole}</span>
                  <span>•</span>
                  <span>{new Date(selectedMessage.timestamp).toLocaleDateString('pt-BR')} às {new Date(selectedMessage.timestamp).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</span>
                </div>
                <div className="flex items-center space-x-3 mt-2">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                    selectedMessage.childName === 'Geral'
                      ? 'bg-accent-purple/20 text-accent-purple'
                      : 'bg-primary/20 text-primary'
                  }`}>
                    {selectedMessage.childName}
                  </span>
                  {selectedMessage.priority === 'high' && (
                    <span className="px-2 py-1 bg-error/20 text-error rounded-full text-xs font-medium">
                      Alta Prioridade
                    </span>
                  )}
                </div>
              </div>

              <div className="border-t border-gray-200 pt-6">
                <p className="text-gray-700 leading-relaxed">{selectedMessage.message}</p>
              </div>

              {selectedMessage.attachments.length > 0 && (
                <div className="border-t border-gray-200 pt-6">
                  <h5 className="font-medium text-primary-dark mb-3">Anexos</h5>
                  <div className="space-y-2">
                    {selectedMessage.attachments.map((attachment: string, index: number) => (
                      <div key={index} className="flex items-center space-x-3 p-3 border border-gray-200 rounded-lg">
                        <span className="material-symbols-outlined text-primary">description</span>
                        <span className="text-gray-700">{attachment}</span>
                        <button className="ml-auto text-primary hover:text-primary-dark transition-colors">
                          <span className="material-symbols-outlined">download</span>
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
                <button className="px-4 py-2 text-primary border border-primary rounded-lg hover:bg-primary/10 transition-colors">
                  Responder
                </button>
                <button className="px-4 py-2 bg-accent-green text-white rounded-lg hover:bg-accent-green/80 transition-colors">
                  Marcar como Lida
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Compose Message Modal */}
      {showCompose && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-primary">Nova Mensagem</h3>
              <button 
                onClick={() => setShowCompose(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            
            <form className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-primary-dark mb-1">Para</label>
                <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary">
                  <option>Selecione o destinatário</option>
                  <option>Direção</option>
                  <option>Coordenação Pedagógica</option>
                  <option>Secretaria</option>
                  <option>Prof. João Silva - Matemática</option>
                  <option>Profa. Maria Santos - Português</option>
                  <option>Profa. Ana Costa - Polivalente</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-primary-dark mb-1">Referente ao aluno</label>
                <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary">
                  <option>Selecione o aluno</option>
                  {children.map(child => (
                    <option key={child} value={child}>{child}</option>
                  ))}
                  <option value="geral">Assunto Geral</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-primary-dark mb-1">Assunto</label>
                <input 
                  type="text" 
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="Digite o assunto da mensagem"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-primary-dark mb-1">Mensagem</label>
                <textarea 
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  rows={6}
                  placeholder="Digite sua mensagem aqui..."
                ></textarea>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-primary-dark mb-1">Prioridade</label>
                <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary">
                  <option value="normal">Normal</option>
                  <option value="high">Alta</option>
                </select>
              </div>
              
              <div className="flex justify-end space-x-3 pt-4">
                <button 
                  type="button"
                  onClick={() => setShowCompose(false)}
                  className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancelar
                </button>
                <button 
                  type="submit"
                  className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors"
                >
                  Enviar Mensagem
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}