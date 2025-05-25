'use client'

import { useAuth } from '@/contexts/AuthContext'

interface LiveClass {
  id: number
  title: string
  description: string
  status: 'live' | 'scheduled' | 'ended'
  startTime: string
  duration: string
  instructor: {
    name: string
    avatar: string
    department: string
  }
  course: string
  participants: number
  maxParticipants: number
  materials: number
  recordingAvailable: boolean
  meetingUrl: string
}

const MOCK_LIVE_CLASSES: LiveClass[] = [
  {
    id: 1,
    title: 'Introdução à Análise Complexa',
    description: 'Estudo das funções de variável complexa, limites, continuidade e diferenciabilidade',
    status: 'live',
    startTime: '2024-01-15T10:00:00',
    duration: '1h30min',
    instructor: {
      name: 'Dr. João Silva',
      avatar: '/avatars/joao.jpg',
      department: 'Matemática'
    },
    course: 'Matemática Avançada',
    participants: 45,
    maxParticipants: 50,
    materials: 3,
    recordingAvailable: false,
    meetingUrl: 'https://meet.example.com/math101'
  },
  {
    id: 2,
    title: 'Mecânica Quântica: Princípios Fundamentais',
    description: 'Discussão sobre os fundamentos da mecânica quântica e suas aplicações',
    status: 'scheduled',
    startTime: '2024-01-15T14:00:00',
    duration: '2h',
    instructor: {
      name: 'Dra. Maria Santos',
      avatar: '/avatars/maria.jpg',
      department: 'Física'
    },
    course: 'Física Fundamental',
    participants: 0,
    maxParticipants: 40,
    materials: 5,
    recordingAvailable: false,
    meetingUrl: 'https://meet.example.com/physics101'
  },
  {
    id: 3,
    title: 'Reações Orgânicas Avançadas',
    description: 'Estudo detalhado de mecanismos de reação em química orgânica',
    status: 'scheduled',
    startTime: '2024-01-15T16:00:00',
    duration: '1h30min',
    instructor: {
      name: 'Dr. Pedro Costa',
      avatar: '/avatars/pedro.jpg',
      department: 'Química'
    },
    course: 'Química Orgânica',
    participants: 0,
    maxParticipants: 35,
    materials: 2,
    recordingAvailable: false,
    meetingUrl: 'https://meet.example.com/chem101'
  }
]

const STATUS_COLORS = {
  live: { bg: 'bg-green-100', text: 'text-green-800', label: 'Ao Vivo Agora' },
  scheduled: { bg: 'bg-yellow-100', text: 'text-yellow-800', label: 'Agendada' },
  ended: { bg: 'bg-gray-100', text: 'text-gray-800', label: 'Encerrada' }
}

export default function LiveClassesPage() {
  const { user } = useAuth()

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header Section */}
      <div className="mb-8">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Aulas ao Vivo</h1>
            <p className="text-gray-600">Participe das aulas ao vivo e interaja com professores</p>
          </div>
          <div className="flex space-x-4">
            <button className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200">
              <span className="material-icons text-sm mr-2">filter_list</span>
              Filtrar
            </button>
            <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
              <span className="material-icons text-sm mr-2">video_call</span>
              Nova Aula
            </button>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="text-sm font-medium text-gray-500 mb-1">Aulas Hoje</div>
            <div className="text-2xl font-bold text-gray-800">3</div>
            <div className="mt-4 flex items-center">
              <span className="text-green-500 text-sm">1 ao vivo</span>
              <span className="text-gray-500 text-sm ml-2">2 agendadas</span>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="text-sm font-medium text-gray-500 mb-1">Participantes</div>
            <div className="text-2xl font-bold text-blue-600">45</div>
            <div className="mt-4 flex items-center">
              <span className="text-blue-500 text-sm">↑ 12</span>
              <span className="text-gray-500 text-sm ml-2">online agora</span>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="text-sm font-medium text-gray-500 mb-1">Horas Esta Semana</div>
            <div className="text-2xl font-bold text-gray-800">12h</div>
            <div className="mt-4 flex items-center">
              <span className="text-green-500 text-sm">↑ 2h</span>
              <span className="text-gray-500 text-sm ml-2">vs. semana anterior</span>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="text-sm font-medium text-gray-500 mb-1">Gravações</div>
            <div className="text-2xl font-bold text-gray-800">24</div>
            <div className="mt-4 flex items-center">
              <span className="text-green-500 text-sm">↑ 3</span>
              <span className="text-gray-500 text-sm ml-2">esta semana</span>
            </div>
          </div>
        </div>
      </div>

      {/* Live Classes Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {MOCK_LIVE_CLASSES.map((liveClass) => (
          <div key={liveClass.id} className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between mb-4">
              <span className={`px-3 py-1 ${STATUS_COLORS[liveClass.status].bg} ${STATUS_COLORS[liveClass.status].text} rounded-full text-sm`}>
                {STATUS_COLORS[liveClass.status].label}
              </span>
              <span className="text-sm text-gray-500">
                Início: {formatDate(liveClass.startTime)}
              </span>
            </div>
            <h3 className="text-lg font-semibold mb-2">{liveClass.title}</h3>
            <p className="text-gray-600 mb-4">{liveClass.description}</p>
            <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
              <div className="flex items-center space-x-2">
                <span className="material-icons text-gray-400">person</span>
                <div>
                  <p className="font-medium text-gray-800">{liveClass.instructor.name}</p>
                  <p className="text-gray-500">{liveClass.instructor.department}</p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <span className="material-icons text-gray-400">school</span>
                <span className="text-gray-700">{liveClass.course}</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="material-icons text-gray-400">schedule</span>
                <span className="text-gray-700">{liveClass.duration}</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="material-icons text-gray-400">groups</span>
                <span className="text-gray-700">
                  {liveClass.participants}/{liveClass.maxParticipants} participantes
                </span>
              </div>
            </div>
            <div className="flex items-center justify-between pt-4 border-t border-gray-100">
              <div className="flex items-center space-x-4">
                <div className="flex items-center text-gray-500">
                  <span className="material-icons text-gray-400 text-base mr-1">attachment</span>
                  <span>{liveClass.materials} materiais</span>
                </div>
                {liveClass.recordingAvailable && (
                  <div className="flex items-center text-gray-500">
                    <span className="material-icons text-gray-400 text-base mr-1">videocam</span>
                    <span>Gravação disponível</span>
                  </div>
                )}
              </div>
              <button 
                className={`px-6 py-2 rounded-lg ${
                  liveClass.status === 'live'
                    ? 'bg-blue-600 text-white hover:bg-blue-700'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {liveClass.status === 'live' ? 'Entrar na Aula' : 'Lembrar-me'}
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Calendar Section */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold">Calendário de Aulas</h2>
          <div className="flex space-x-2">
            <button className="p-2 hover:bg-gray-100 rounded-lg">
              <span className="material-icons">chevron_left</span>
            </button>
            <button className="px-4 py-2 text-gray-700 font-medium">Janeiro 2024</button>
            <button className="p-2 hover:bg-gray-100 rounded-lg">
              <span className="material-icons">chevron_right</span>
            </button>
          </div>
        </div>
        <div className="grid grid-cols-7 gap-4">
          {/* Calendar Header */}
          {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map((day) => (
            <div key={day} className="text-center font-medium text-gray-500 py-2">
              {day}
            </div>
          ))}
          {/* Calendar Days */}
          {Array.from({ length: 31 }).map((_, i) => (
            <div
              key={i}
              className={`aspect-square rounded-lg flex flex-col items-center justify-center text-sm
                ${i === 14 ? 'bg-blue-50 text-blue-800 font-medium' : 'hover:bg-gray-50'}`}
            >
              <span>{i + 1}</span>
              {i === 14 && (
                <div className="mt-1 flex space-x-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>
                  <span className="w-1.5 h-1.5 rounded-full bg-yellow-500"></span>
                  <span className="w-1.5 h-1.5 rounded-full bg-yellow-500"></span>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
