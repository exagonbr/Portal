'use client'

import { useAuth } from '@/contexts/AuthContext'
import { useState } from 'react'

const MOCK_MEETINGS = [
  {
    id: 1,
    title: 'Reunião Pedagógica - Matemática',
    type: 'Pedagógica',
    date: '2024-03-25',
    time: '14:00',
    duration: '2h',
    location: 'Sala de Reuniões A',
    organizer: 'Coord. Maria Silva',
    participants: [
      'Prof. João Santos',
      'Profa. Ana Costa',
      'Prof. Carlos Lima'
    ],
    status: 'Agendada',
    agenda: [
      'Análise do desempenho dos alunos',
      'Planejamento do próximo bimestre',
      'Discussão sobre metodologias'
    ],
    priority: 'Alta'
  },
  {
    id: 2,
    title: 'Conselho de Classe - 8º Ano',
    type: 'Conselho',
    date: '2024-03-28',
    time: '09:00',
    duration: '3h',
    location: 'Auditório',
    organizer: 'Coord. João Santos',
    participants: [
      'Todos os professores do 8º ano',
      'Direção',
      'Orientação Educacional'
    ],
    status: 'Confirmada',
    agenda: [
      'Avaliação individual dos alunos',
      'Casos especiais',
      'Estratégias de recuperação'
    ],
    priority: 'Alta'
  },
  {
    id: 3,
    title: 'Reunião de Pais - 6º Ano',
    type: 'Pais',
    date: '2024-04-02',
    time: '19:00',
    duration: '1h30',
    location: 'Sala Multimídia',
    organizer: 'Coord. Ana Costa',
    participants: [
      'Pais dos alunos do 6º ano',
      'Professores regentes',
      'Coordenação'
    ],
    status: 'Agendada',
    agenda: [
      'Apresentação do desempenho da turma',
      'Orientações para o próximo bimestre',
      'Esclarecimento de dúvidas'
    ],
    priority: 'Média'
  },
  {
    id: 4,
    title: 'Planejamento Interdisciplinar',
    type: 'Planejamento',
    date: '2024-04-05',
    time: '15:30',
    duration: '2h30',
    location: 'Sala de Coordenação',
    organizer: 'Coord. Pedro Lima',
    participants: [
      'Coord. Maria Silva',
      'Coord. Ana Costa',
      'Prof. Responsáveis por área'
    ],
    status: 'Rascunho',
    agenda: [
      'Projeto Meio Ambiente',
      'Cronograma de atividades',
      'Distribuição de responsabilidades'
    ],
    priority: 'Média'
  }
]

const MEETING_TYPES = ['Pedagógica', 'Conselho', 'Pais', 'Planejamento', 'Administrativa']
const MEETING_STATUS = ['Rascunho', 'Agendada', 'Confirmada', 'Em andamento', 'Concluída', 'Cancelada']

export default function CoordinatorMeetingsPage() {
  const { user } = useAuth()
  const [selectedTab, setSelectedTab] = useState('upcoming')
  const [statusFilter, setStatusFilter] = useState('all')
  const [typeFilter, setTypeFilter] = useState('all')
  const [showModal, setShowModal] = useState(false)
  const [selectedMeeting, setSelectedMeeting] = useState<any>(null)

  const filteredMeetings = MOCK_MEETINGS.filter(meeting => {
    const matchesStatus = statusFilter === 'all' || meeting.status === statusFilter
    const matchesType = typeFilter === 'all' || meeting.type === typeFilter
    
    if (selectedTab === 'upcoming') {
      return new Date(meeting.date) >= new Date() && matchesStatus && matchesType
    } else if (selectedTab === 'past') {
      return new Date(meeting.date) < new Date() && matchesStatus && matchesType
    }
    
    return matchesStatus && matchesType
  })

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header Section */}
      <div className="mb-8">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Gestão de Reuniões</h1>
            <p className="text-gray-600">Organize e acompanhe as reuniões pedagógicas</p>
          </div>
          <button 
            onClick={() => setShowModal(true)}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 flex items-center space-x-2"
          >
            <span className="material-symbols-outlined">add</span>
            <span>Nova Reunião</span>
          </button>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="text-sm font-medium text-gray-500 mb-1">Total de Reuniões</div>
            <div className="text-2xl font-bold text-gray-800">{MOCK_MEETINGS.length}</div>
            <div className="mt-4 flex items-center">
              <span className="text-green-500 text-sm">↑ 2</span>
              <span className="text-gray-500 text-sm ml-2">este mês</span>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="text-sm font-medium text-gray-500 mb-1">Próximas</div>
            <div className="text-2xl font-bold text-gray-800">
              {MOCK_MEETINGS.filter(m => new Date(m.date) >= new Date()).length}
            </div>
            <div className="mt-4 flex items-center">
              <span className="text-blue-500 text-sm">→ 0</span>
              <span className="text-gray-500 text-sm ml-2">esta semana</span>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="text-sm font-medium text-gray-500 mb-1">Confirmadas</div>
            <div className="text-2xl font-bold text-gray-800">
              {MOCK_MEETINGS.filter(m => m.status === 'Confirmada').length}
            </div>
            <div className="mt-4 flex items-center">
              <span className="text-green-500 text-sm">↑ 1</span>
              <span className="text-gray-500 text-sm ml-2">esta semana</span>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="text-sm font-medium text-gray-500 mb-1">Taxa de Participação</div>
            <div className="text-2xl font-bold text-gray-800">94%</div>
            <div className="mt-4 flex items-center">
              <span className="text-green-500 text-sm">↑ 3%</span>
              <span className="text-gray-500 text-sm ml-2">este mês</span>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200 mb-6">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setSelectedTab('upcoming')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                selectedTab === 'upcoming'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Próximas Reuniões
            </button>
            <button
              onClick={() => setSelectedTab('past')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                selectedTab === 'past'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Reuniões Anteriores
            </button>
            <button
              onClick={() => setSelectedTab('all')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                selectedTab === 'all'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Todas
            </button>
          </nav>
        </div>

        {/* Filters */}
        <div className="flex space-x-4 mb-6">
          <select 
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">Todos os Status</option>
            {MEETING_STATUS.map(status => (
              <option key={status} value={status}>{status}</option>
            ))}
          </select>
          
          <select 
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">Todos os Tipos</option>
            {MEETING_TYPES.map(type => (
              <option key={type} value={type}>{type}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Meetings List */}
      <div className="space-y-6">
        {filteredMeetings.map((meeting) => (
          <div key={meeting.id} className="bg-white rounded-lg shadow-md p-6">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-800">{meeting.title}</h3>
                <div className="flex items-center space-x-4 text-sm text-gray-600 mt-1">
                  <span>{new Date(meeting.date).toLocaleDateString('pt-BR')} às {meeting.time}</span>
                  <span>•</span>
                  <span>{meeting.duration}</span>
                  <span>•</span>
                  <span>{meeting.location}</span>
                  <span>•</span>
                  <span>Organizada por: {meeting.organizer}</span>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                  meeting.priority === 'Alta' 
                    ? 'bg-red-100 text-red-800'
                    : meeting.priority === 'Média'
                    ? 'bg-yellow-100 text-yellow-800'
                    : 'bg-green-100 text-green-800'
                }`}>
                  {meeting.priority}
                </span>
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                  meeting.status === 'Confirmada' 
                    ? 'bg-green-100 text-green-800'
                    : meeting.status === 'Agendada'
                    ? 'bg-blue-100 text-blue-800'
                    : meeting.status === 'Em andamento'
                    ? 'bg-purple-100 text-purple-800'
                    : meeting.status === 'Concluída'
                    ? 'bg-gray-100 text-gray-800'
                    : meeting.status === 'Cancelada'
                    ? 'bg-red-100 text-red-800'
                    : 'bg-yellow-100 text-yellow-800'
                }`}>
                  {meeting.status}
                </span>
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                  meeting.type === 'Pedagógica' 
                    ? 'bg-blue-100 text-blue-800'
                    : meeting.type === 'Conselho'
                    ? 'bg-purple-100 text-purple-800'
                    : meeting.type === 'Pais'
                    ? 'bg-orange-100 text-orange-800'
                    : meeting.type === 'Planejamento'
                    ? 'bg-green-100 text-green-800'
                    : 'bg-gray-100 text-gray-800'
                }`}>
                  {meeting.type}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-2">Participantes</h4>
                <div className="space-y-1">
                  {meeting.participants.slice(0, 3).map((participant, index) => (
                    <div key={index} className="text-sm text-gray-600">{participant}</div>
                  ))}
                  {meeting.participants.length > 3 && (
                    <div className="text-sm text-gray-500">
                      +{meeting.participants.length - 3} outros participantes
                    </div>
                  )}
                </div>
              </div>
              
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-2">Pauta</h4>
                <div className="space-y-1">
                  {meeting.agenda.map((item, index) => (
                    <div key={index} className="text-sm text-gray-600">• {item}</div>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex justify-end space-x-3">
              <button 
                onClick={() => setSelectedMeeting(meeting)}
                className="text-blue-600 hover:text-blue-800 flex items-center space-x-1"
              >
                <span className="material-symbols-outlined text-sm">visibility</span>
                <span>Ver Detalhes</span>
              </button>
              {meeting.status !== 'Concluída' && meeting.status !== 'Cancelada' && (
                <>
                  <button className="text-green-600 hover:text-green-800 flex items-center space-x-1">
                    <span className="material-symbols-outlined text-sm">edit</span>
                    <span>Editar</span>
                  </button>
                  <button className="text-purple-600 hover:text-purple-800 flex items-center space-x-1">
                    <span className="material-symbols-outlined text-sm">video_call</span>
                    <span>Iniciar</span>
                  </button>
                </>
              )}
              {meeting.status === 'Concluída' && (
                <button className="text-orange-600 hover:text-orange-800 flex items-center space-x-1">
                  <span className="material-symbols-outlined text-sm">description</span>
                  <span>Ata</span>
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Meeting Details Modal */}
      {selectedMeeting && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-semibold">Detalhes da Reunião</h3>
              <button 
                onClick={() => setSelectedMeeting(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            
            <div className="space-y-6">
              <div>
                <h4 className="text-lg font-semibold text-gray-800">{selectedMeeting.title}</h4>
                <p className="text-gray-600">{selectedMeeting.type}</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h5 className="font-medium text-gray-700 mb-2">Informações da Reunião</h5>
                  <div className="space-y-2 text-sm">
                    <div><span className="font-medium">Data:</span> {new Date(selectedMeeting.date).toLocaleDateString('pt-BR')}</div>
                    <div><span className="font-medium">Horário:</span> {selectedMeeting.time}</div>
                    <div><span className="font-medium">Duração:</span> {selectedMeeting.duration}</div>
                    <div><span className="font-medium">Local:</span> {selectedMeeting.location}</div>
                    <div><span className="font-medium">Organizador:</span> {selectedMeeting.organizer}</div>
                    <div><span className="font-medium">Status:</span> {selectedMeeting.status}</div>
                    <div><span className="font-medium">Prioridade:</span> {selectedMeeting.priority}</div>
                  </div>
                </div>

                <div>
                  <h5 className="font-medium text-gray-700 mb-2">Participantes</h5>
                  <div className="space-y-1 text-sm">
                    {selectedMeeting.participants.map((participant: string, index: number) => (
                      <div key={index} className="flex items-center space-x-2">
                        <span className="material-symbols-outlined text-gray-400 text-sm">person</span>
                        <span>{participant}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div>
                <h5 className="font-medium text-gray-700 mb-2">Pauta da Reunião</h5>
                <div className="space-y-2">
                  {selectedMeeting.agenda.map((item: string, index: number) => (
                    <div key={index} className="flex items-start space-x-2 text-sm">
                      <span className="text-blue-600 font-medium">{index + 1}.</span>
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
                {selectedMeeting.status !== 'Concluída' && selectedMeeting.status !== 'Cancelada' && (
                  <>
                    <button className="px-4 py-2 text-blue-600 border border-blue-600 rounded-lg hover:bg-blue-50">
                      Editar Reunião
                    </button>
                    <button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">
                      Iniciar Reunião
                    </button>
                  </>
                )}
                {selectedMeeting.status === 'Concluída' && (
                  <button className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700">
                    Ver Ata
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* New Meeting Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Nova Reunião</h3>
              <button 
                onClick={() => setShowModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            
            <form className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Título da Reunião</label>
                <input 
                  type="text" 
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Ex: Reunião Pedagógica - Matemática"
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tipo</label>
                  <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                    {MEETING_TYPES.map(type => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Prioridade</label>
                  <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                    <option value="Baixa">Baixa</option>
                    <option value="Média">Média</option>
                    <option value="Alta">Alta</option>
                  </select>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Data</label>
                  <input 
                    type="date" 
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Horário</label>
                  <input 
                    type="time" 
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Duração</label>
                  <input 
                    type="text" 
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Ex: 2h"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Local</label>
                <input 
                  type="text" 
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Ex: Sala de Reuniões A"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Participantes</label>
                <textarea 
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={3}
                  placeholder="Digite os participantes separados por vírgula"
                ></textarea>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Pauta</label>
                <textarea 
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={4}
                  placeholder="Digite os itens da pauta separados por linha"
                ></textarea>
              </div>
              
              <div className="flex justify-end space-x-3 pt-4">
                <button 
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancelar
                </button>
                <button 
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Agendar Reunião
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}