'use client'

import { useAuth } from '@/contexts/AuthContext'
import { useState } from 'react'

const MOCK_EVENTS = [
  {
    id: 1,
    title: 'Início do Ano Letivo',
    date: '2024-02-05',
    type: 'academic',
    description: 'Primeiro dia de aulas do ano letivo 2024'
  },
  {
    id: 2,
    title: 'Reunião de Pais - 1º Bimestre',
    date: '2024-04-15',
    type: 'meeting',
    description: 'Reunião para apresentação dos resultados do primeiro bimestre'
  },
  {
    id: 3,
    title: 'Festa Junina',
    date: '2024-06-22',
    type: 'event',
    description: 'Festa tradicional junina da escola'
  },
  {
    id: 4,
    title: 'Recesso Escolar',
    date: '2024-07-15',
    type: 'holiday',
    description: 'Início do recesso escolar de inverno'
  },
  {
    id: 5,
    title: 'Feira de Ciências',
    date: '2024-09-10',
    type: 'event',
    description: 'Apresentação dos projetos científicos dos alunos'
  }
]

export default function InstitutionCalendarPage() {
  const { user } = useAuth()
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth())
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear())
  const [showEventModal, setShowEventModal] = useState(false)

  const months = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ]

  const getEventTypeColor = (type: string) => {
    switch (type) {
      case 'academic':
        return 'bg-blue-100 text-blue-800'
      case 'meeting':
        return 'bg-green-100 text-green-800'
      case 'event':
        return 'bg-purple-100 text-purple-800'
      case 'holiday':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-600'
    }
  }

  const getEventTypeText = (type: string) => {
    switch (type) {
      case 'academic':
        return 'Acadêmico'
      case 'meeting':
        return 'Reunião'
      case 'event':
        return 'Evento'
      case 'holiday':
        return 'Feriado'
      default:
        return 'Outro'
    }
  }

  const filteredEvents = MOCK_EVENTS.filter(event => {
    const eventDate = new Date(event.date)
    return eventDate.getMonth() === selectedMonth && eventDate.getFullYear() === selectedYear
  })

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-600">Calendário Escolar</h1>
            <p className="text-gray-600">Gestão do calendário acadêmico e eventos</p>
          </div>
          <button 
            onClick={() => setShowEventModal(true)}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 flex items-center space-x-2"
          >
            <span className="material-symbols-outlined">add</span>
            <span>Novo Evento</span>
          </button>
        </div>

        <div className="flex space-x-4 mb-6">
          <select 
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
            className="px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {months.map((month, index) => (
              <option key={index} value={index}>{month}</option>
            ))}
          </select>
          
          <select 
            value={selectedYear}
            onChange={(e) => setSelectedYear(parseInt(e.target.value))}
            className="px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value={2024}>2024</option>
            <option value={2025}>2025</option>
          </select>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="text-sm font-medium text-gray-500 mb-1">Eventos este Mês</div>
            <div className="text-2xl font-bold text-gray-600">{filteredEvents.length}</div>
          </div>
          
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="text-sm font-medium text-gray-500 mb-1">Reuniões</div>
            <div className="text-2xl font-bold text-green-600">
              {filteredEvents.filter(e => e.type === 'meeting').length}
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="text-sm font-medium text-gray-500 mb-1">Eventos Especiais</div>
            <div className="text-2xl font-bold text-purple-600">
              {filteredEvents.filter(e => e.type === 'event').length}
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="text-sm font-medium text-gray-500 mb-1">Feriados</div>
            <div className="text-2xl font-bold text-red-600">
              {filteredEvents.filter(e => e.type === 'holiday').length}
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-600 mb-4">
          Eventos - {months[selectedMonth]} {selectedYear}
        </h3>
        
        {filteredEvents.length > 0 ? (
          <div className="space-y-4">
            {filteredEvents.map((event) => (
              <div key={event.id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex justify-between items-start mb-2">
                  <h4 className="text-lg font-semibold text-gray-600">{event.title}</h4>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${getEventTypeColor(event.type)}`}>
                    {getEventTypeText(event.type)}
                  </span>
                </div>
                <div className="flex items-center space-x-4 text-sm text-gray-600 mb-2">
                  <span className="flex items-center space-x-1">
                    <span className="material-symbols-outlined text-sm">calendar_today</span>
                    <span>{new Date(event.date).toLocaleDateString('pt-BR')}</span>
                  </span>
                </div>
                <p className="text-gray-600">{event.description}</p>
                <div className="flex justify-end space-x-2 mt-3">
                  <button className="text-blue-600 hover:text-blue-800 text-sm">
                    Editar
                  </button>
                  <button className="text-red-600 hover:text-red-800 text-sm">
                    Excluir
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            <span className="material-symbols-outlined text-4xl mb-2">event_busy</span>
            <p>Nenhum evento encontrado para este mês</p>
          </div>
        )}
      </div>

      {/* Event Modal */}
      {showEventModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Novo Evento</h3>
              <button 
                onClick={() => setShowEventModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            
            <form className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Título</label>
                <input 
                  type="text" 
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Nome do evento"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Data</label>
                <input 
                  type="date" 
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tipo</label>
                <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                  <option value="academic">Acadêmico</option>
                  <option value="meeting">Reunião</option>
                  <option value="event">Evento</option>
                  <option value="holiday">Feriado</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Descrição</label>
                <textarea 
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={3}
                  placeholder="Descrição do evento"
                ></textarea>
              </div>
              
              <div className="flex justify-end space-x-3 pt-4">
                <button 
                  type="button"
                  onClick={() => setShowEventModal(false)}
                  className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancelar
                </button>
                <button 
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Criar Evento
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}