'use client'

import { useState } from 'react'

export default function GuardianHistoryPage() {
  const [activities] = useState([
    {
      id: '1',
      type: 'grade',
      title: 'Nota Publicada',
      description: 'Matemática - Prova Bimestral: 8.5',
      date: '2025-06-10T14:30:00',
      student: 'Ana Silva',
      icon: 'grade'
    },
    {
      id: '2',
      type: 'attendance',
      title: 'Falta Registrada',
      description: 'Ausência na aula de História',
      date: '2025-06-09T08:00:00',
      student: 'Ana Silva',
      icon: 'event_busy'
    },
    {
      id: '3',
      type: 'assignment',
      title: 'Atividade Entregue',
      description: 'Lista de Exercícios - Português',
      date: '2025-06-08T16:45:00',
      student: 'Ana Silva',
      icon: 'assignment_turned_in'
    },
    {
      id: '4',
      type: 'message',
      title: 'Mensagem Recebida',
      description: 'Prof. Silva enviou uma mensagem sobre o projeto',
      date: '2025-06-07T10:20:00',
      student: 'Ana Silva',
      icon: 'mail'
    },
    {
      id: '5',
      type: 'payment',
      title: 'Pagamento Confirmado',
      description: 'Mensalidade de Maio - R$ 850,00',
      date: '2025-05-08T09:15:00',
      student: 'Ana Silva',
      icon: 'payment'
    },
    {
      id: '6',
      type: 'meeting',
      title: 'Reunião Agendada',
      description: 'Reunião de Pais - 20/06 às 19h',
      date: '2025-05-05T11:30:00',
      student: 'Ana Silva',
      icon: 'event'
    }
  ])

  const [filter, setFilter] = useState('all')

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'grade': return 'bg-success/10 text-success'
      case 'attendance': return 'bg-error/10 text-error'
      case 'assignment': return 'bg-accent-blue/10 text-accent-blue'
      case 'message': return 'bg-purple/10 text-purple'
      case 'payment': return 'bg-green/10 text-green'
      case 'meeting': return 'bg-warning/10 text-warning'
      default: return 'bg-background-tertiary text-text-secondary'
    }
  }

  const getTypeText = (type: string) => {
    switch (type) {
      case 'grade': return 'Nota'
      case 'attendance': return 'Frequência'
      case 'assignment': return 'Atividade'
      case 'message': return 'Mensagem'
      case 'payment': return 'Pagamento'
      case 'meeting': return 'Reunião'
      default: return 'Atividade'
    }
  }

  const filteredActivities = filter === 'all' 
    ? activities 
    : activities.filter(activity => activity.type === filter)

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString)
    return {
      date: date.toLocaleDateString('pt-BR'),
      time: date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
    }
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-text-primary">Histórico de Atividades</h1>
        <div className="flex space-x-2">
          <select 
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="bg-background-primary border border-border text-text-primary px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent-blue"
          >
            <option value="all">Todas as atividades</option>
            <option value="grade">Notas</option>
            <option value="attendance">Frequência</option>
            <option value="assignment">Atividades</option>
            <option value="message">Mensagens</option>
            <option value="payment">Pagamentos</option>
            <option value="meeting">Reuniões</option>
          </select>
          <button className="bg-accent-blue text-white px-4 py-2 rounded-lg hover:bg-accent-blue/90 transition-colors">
            Exportar
          </button>
        </div>
      </div>

      {/* Estatísticas */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
        {['grade', 'attendance', 'assignment', 'message', 'payment', 'meeting'].map((type) => (
          <div key={type} className="bg-background-primary rounded-lg border border-border p-4 text-center">
            <div className={`w-8 h-8 rounded-full mx-auto mb-2 flex items-center justify-center ${getTypeColor(type)}`}>
              <span className="material-symbols-outlined text-[16px]">
                {type === 'grade' ? 'grade' :
                 type === 'attendance' ? 'event_busy' :
                 type === 'assignment' ? 'assignment' :
                 type === 'message' ? 'mail' :
                 type === 'payment' ? 'payment' :
                 'event'}
              </span>
            </div>
            <p className="text-sm font-medium text-text-secondary">{getTypeText(type)}</p>
            <p className="text-lg font-bold text-text-primary">
              {activities.filter(a => a.type === type).length}
            </p>
          </div>
        ))}
      </div>

      {/* Timeline de Atividades */}
      <div className="bg-background-primary rounded-lg border border-border">
        <div className="p-6 border-b border-border">
          <h2 className="text-lg font-semibold text-text-primary">
            Timeline de Atividades ({filteredActivities.length} itens)
          </h2>
        </div>
        
        <div className="p-6">
          <div className="space-y-4">
            {filteredActivities.map((activity, index) => {
              const { date, time } = formatDateTime(activity.date)
              return (
                <div key={activity.id} className="flex items-start space-x-4">
                  {/* Timeline line */}
                  <div className="flex flex-col items-center">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${getTypeColor(activity.type)}`}>
                      <span className="material-symbols-outlined text-[16px]">
                        {activity.icon}
                      </span>
                    </div>
                    {index < filteredActivities.length - 1 && (
                      <div className="w-0.5 h-8 bg-border mt-2"></div>
                    )}
                  </div>
                  
                  {/* Content */}
                  <div className="flex-1 pb-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="text-lg font-medium text-text-primary">{activity.title}</h3>
                        <p className="text-text-secondary mt-1">{activity.description}</p>
                        <p className="text-sm text-text-tertiary mt-1">Aluno: {activity.student}</p>
                      </div>
                      
                      <div className="text-right text-sm text-text-secondary">
                        <p>{date}</p>
                        <p>{time}</p>
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
          
          {filteredActivities.length === 0 && (
            <div className="text-center py-8 text-text-secondary">
              Nenhuma atividade encontrada para o filtro selecionado.
            </div>
          )}
        </div>
      </div>
    </div>
  )
}