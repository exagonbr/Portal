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
      case 'high': return 'bg-error/20 text-error border-error/20'
      case 'medium': return 'bg-accent-yellow/20 text-accent-yellow border-accent-yellow/20'
      case 'low': return 'bg-primary/20 text-primary border-primary/20'
      default: return 'bg-gray-100 text-gray-600 border-gray-200'
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
        <h1 className="text-3xl font-bold text-gray-700 dark:text-gray-800">Comunicados</h1>
        <div className="flex items-center space-x-2">
          <span className="text-sm text-gray-600">
            {announcements.filter(a => !a.read).length} não lidos
          </span>
        </div>
      </div>

      <div className="space-y-4">
        {announcements.map((announcement) => (
          <div 
            key={announcement.id} 
            className={`bg-white rounded-lg border p-6 transition-all ${
              !announcement.read ? 'border-primary/20 bg-primary/5' : 'border-gray-200'
            }`}
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center space-x-3 mb-2">
                  <h3 className={`text-lg font-semibold ${!announcement.read ? 'text-primary' : 'text-gray-600'}`}>
                    {announcement.title}
                  </h3>
                  {!announcement.read && (
                    <div className="w-2 h-2 rounded-full bg-primary"></div>
                  )}
                </div>
                
                <p className="text-gray-600 mb-3">{announcement.content}</p>
                
                <div className="flex items-center space-x-4 text-sm text-gray-500">
                  <span>{announcement.author}</span>
                  <span>•</span>
                  <span>{new Date(announcement.date).toLocaleDateString('pt-BR')}</span>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getPriorityColor(announcement.priority)}`}>
                  {getPriorityText(announcement.priority)}
                </span>
                <button className="text-gray-600 hover:text-primary transition-colors">
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