'use client'

import { useState } from 'react'

export default function GuardianMeetingsPage() {
  const [meetings] = useState([
    {
      id: '1',
      title: 'Reunião de Pais - 1º Bimestre',
      date: '2025-06-20',
      time: '19:00',
      teacher: 'Prof. Maria Silva',
      subject: 'Matemática',
      status: 'scheduled',
      type: 'presencial'
    },
    {
      id: '2',
      title: 'Atendimento Individual',
      date: '2025-06-15',
      time: '14:30',
      teacher: 'Prof. João Santos',
      subject: 'História',
      status: 'confirmed',
      type: 'online'
    }
  ])

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled': return 'bg-accent-yellow/20 text-accent-yellow'
      case 'confirmed': return 'bg-accent-green/20 text-accent-green'
      case 'cancelled': return 'bg-error/20 text-error'
      default: return 'bg-primary/20 text-primary'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'scheduled': return 'Agendada'
      case 'confirmed': return 'Confirmada'
      case 'cancelled': return 'Cancelada'
      default: return 'Pendente'
    }
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-700 dark:text-gray-800">Reuniões</h1>
        <button className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary-dark transition-colors">
          Agendar Reunião
        </button>
      </div>

      <div className="grid gap-4">
        {meetings.map((meeting) => (
          <div key={meeting.id} className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-primary">{meeting.title}</h3>
                <p className="text-gray-600 mt-1">{meeting.subject} - {meeting.teacher}</p>
                
                <div className="flex items-center space-x-4 mt-3 text-sm text-gray-600">
                  <div className="flex items-center space-x-1">
                    <span className="material-symbols-outlined text-[16px]">calendar_month</span>
                    <span>{new Date(meeting.date).toLocaleDateString('pt-BR')}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <span className="material-symbols-outlined text-[16px]">schedule</span>
                    <span>{meeting.time}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <span className="material-symbols-outlined text-[16px]">
                      {meeting.type === 'online' ? 'videocam' : 'location_on'}
                    </span>
                    <span>{meeting.type === 'online' ? 'Online' : 'Presencial'}</span>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(meeting.status)}`}>
                  {getStatusText(meeting.status)}
                </span>
                <button className="text-gray-600 hover:text-primary transition-colors">
                  <span className="material-symbols-outlined">more_vert</span>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}