'use client'

import { useState } from 'react'

export default function GuardianAnnouncementsPage() {
  const [announcements] = useState([
    {
      id: '1',
      title: 'Reunião de Pais - 1º Bimestre',
      content: 'Informamos que a reunião de pais do 1º bimestre será realizada no dia 20/06 às 19h no auditório da escola.',
      author: 'Coordenação Pedagógica',
      date: '2025-06-10',
      priority: 'high',
      read: false
    },
    {
      id: '2',
      title: 'Alteração no Horário das Aulas',
      content: 'Devido ao feriado, as aulas de sexta-feira serão transferidas para sábado.',
      author: 'Secretaria',
      date: '2025-06-08',
      priority: 'medium',
      read: true
    },
    {
      id: '3',
      title: 'Festa Junina da Escola',
      content: 'Venha participar da nossa festa junina! Será no dia 25/06 a partir das 18h.',
      author: 'Direção',
      date: '2025-06-05',
      priority: 'low',
      read: true
    }
  ])

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-error/10 text-error border-error/20'
      case 'medium': return 'bg-warning/10 text-warning border-warning/20'
      case 'low': return 'bg-accent-blue/10 text-accent-blue border-accent-blue/20'
      default: return 'bg-background-tertiary text-text-secondary border-border'
    }
  }

  const getPriorityText = (priority: string) => {
    switch (priority) {
      case 'high': return 'Alta'
      case 'medium': return 'Média'
      case 'low': return 'Baixa'
      default: return 'Normal'
    }
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-text-primary">Comunicados</h1>
        <div className="flex items-center space-x-2">
          <span className="text-sm text-text-secondary">
            {announcements.filter(a => !a.read).length} não lidos
          </span>
        </div>
      </div>

      <div className="space-y-4">
        {announcements.map((announcement) => (
          <div 
            key={announcement.id} 
            className={`bg-background-primary rounded-lg border p-6 transition-all ${
              !announcement.read ? 'border-accent-blue/20 bg-accent-blue/5' : 'border-border'
            }`}
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center space-x-3 mb-2">
                  <h3 className={`text-lg font-semibold ${!announcement.read ? 'text-text-primary' : 'text-text-secondary'}`}>
                    {announcement.title}
                  </h3>
                  {!announcement.read && (
                    <div className="w-2 h-2 rounded-full bg-accent-blue"></div>
                  )}
                </div>
                
                <p className="text-text-secondary mb-3">{announcement.content}</p>
                
                <div className="flex items-center space-x-4 text-sm text-text-tertiary">
                  <span>{announcement.author}</span>
                  <span>•</span>
                  <span>{new Date(announcement.date).toLocaleDateString('pt-BR')}</span>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getPriorityColor(announcement.priority)}`}>
                  {getPriorityText(announcement.priority)}
                </span>
                <button className="text-text-secondary hover:text-text-primary">
                  <span className="material-symbols-outlined">bookmark_border</span>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}