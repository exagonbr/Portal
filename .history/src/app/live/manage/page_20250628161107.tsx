'use client'

import React, { useState } from 'react'
import { Calendar, Clock, Users, Video, VideoOff, Play, Settings, Plus, Search, Filter, ChevronRight, AlertCircle, CheckCircle, Mic, MicOff, Monitor, MonitorOff } from 'lucide-react'
import DashboardLayout from '@/components/dashboard/DashboardLayout'

interface LiveClass {
  id: string
  title: string
  course: string
  date: string
  time: string
  duration: number
  status: 'scheduled' | 'live' | 'completed'
  students: {
    enrolled: number
    attending?: number
    attended?: number
  }
  recording?: {
    url: string
    duration: number
    views: number
  }
  meetingUrl?: string
  description: string
}

export default function LiveManagePage() {
  const [liveClasses, setLiveClasses] = useState<LiveClass[]>([
    {
      id: '1',
      title: 'Introdução ao React Hooks',
      course: 'Desenvolvimento Web Avançado',
      date: '2024-01-20',
      time: '19:00',
      duration: 90,
      status: 'live',
      students: {
        enrolled: 45,
        attending: 38
      },
      meetingUrl: 'https://meet.example.com/react-hooks-intro',
      description: 'Aprenda os conceitos fundamentais dos React Hooks'
    },
    {
      id: '2',
      title: 'Algoritmos de Ordenação',
      course: 'Estrutura de Dados',
      date: '2024-01-22',
      time: '14:00',
      duration: 120,
      status: 'scheduled',
      students: {
        enrolled: 32
      },
      description: 'Análise comparativa de algoritmos de ordenação'
    },
    {
      id: '3',
      title: 'Design Patterns em JavaScript',
      course: 'Desenvolvimento Web Avançado',
      date: '2024-01-18',
      time: '19:00',
      duration: 90,
      status: 'completed',
      students: {
        enrolled: 45,
        attended: 41
      },
      recording: {
        url: 'https://videos.example.com/design-patterns-js',
        duration: 88,
        views: 156
      },
      description: 'Padrões de projeto aplicados em JavaScript moderno'
    }
  ])

  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState<'all' | 'scheduled' | 'live' | 'completed'>('all')
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [isVideoOn, setIsVideoOn] = useState(true)
  const [isAudioOn, setIsAudioOn] = useState(true)
  const [isScreenSharing, setIsScreenSharing] = useState(false)

  const filteredClasses = liveClasses.filter(liveClass => {
    const matchesSearch = liveClass.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         liveClass.course.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesFilter = filterStatus === 'all' || liveClass.status === filterStatus
    return matchesSearch && matchesFilter
  })

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'live':
        return 'text-red-600 bg-red-50'
      case 'scheduled':
        return 'text-blue-600 bg-blue-50'
      case 'completed':
        return 'text-green-600 bg-green-50'
      default:
        return 'text-gray-600 bg-gray-50'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'live':
        return <div className="flex items-center gap-1">
          <div className="w-2 h-2 bg-red-600 rounded-full animate-pulse" />
          <span>Ao Vivo</span>
        </div>
      case 'scheduled':
        return <Clock className="w-4 h-4" />
      case 'completed':
        return <CheckCircle className="w-4 h-4" />
      default:
        return null
    }
  }

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    })
  }

  const LiveClassCard = ({ liveClass }: { liveClass: LiveClass }) => {
    const isLive = liveClass.status === 'live'
    
    return (
      <div className={`bg-white rounded-lg shadow-sm border ${isLive ? 'border-red-200' : 'border-gray-200'} p-6 hover:shadow-md transition-shadow`}>
        <div className="flex justify-between items-start mb-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">{liveClass.title}</h3>
            <p className="text-sm text-gray-600">{liveClass.course}</p>
          </div>
          <span className={`px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1 ${getStatusColor(liveClass.status)}`}>
            {getStatusIcon(liveClass.status)}
            {liveClass.status === 'scheduled' && 'Agendada'}
            {liveClass.status === 'completed' && 'Concluída'}
          </span>
        </div>

        <p className="text-sm text-gray-600 mb-4 line-clamp-2">{liveClass.description}</p>

        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Calendar className="w-4 h-4" />
            <span>{formatDate(liveClass.date)}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Clock className="w-4 h-4" />
            <span>{liveClass.time} ({liveClass.duration} min)</span>
          </div>
        </div>

        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2 text-sm">
            <Users className="w-4 h-4 text-gray-500" />
            {liveClass.status === 'live' && (
              <span className="text-gray-700">
                {liveClass.students.attending}/{liveClass.students.enrolled} alunos online
              </span>
            )}
            {liveClass.status === 'scheduled' && (
              <span className="text-gray-700">
                {liveClass.students.enrolled} alunos inscritos
              </span>
            )}
            {liveClass.status === 'completed' && (
              <span className="text-gray-700">
                {liveClass.students.attended}/{liveClass.students.enrolled} participaram
              </span>
            )}
          </div>
          {liveClass.recording && (
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Play className="w-4 h-4" />
              <span>{liveClass.recording.views} visualizações</span>
            </div>
          )}
        </div>

        <div className="flex gap-2">
          {liveClass.status === 'live' && (
            <button className="flex-1 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors flex items-center justify-center gap-2">
              <Video className="w-4 h-4" />
              Entrar na Aula
            </button>
          )}
          {liveClass.status === 'scheduled' && (
            <>
              <button className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2">
                <Settings className="w-4 h-4" />
                Configurar
              </button>
              <button className="flex-1 border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors">
                Cancelar
              </button>
            </>
          )}
          {liveClass.status === 'completed' && (
            <>
              <button className="flex-1 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center gap-2">
                <Play className="w-4 h-4" />
                Ver Gravação
              </button>
              <button className="flex-1 border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors">
                Estatísticas
              </button>
            </>
          )}
        </div>
      </div>
    )
  }

  const LiveStreamSimulator = () => {
    return (
      <div className="bg-gray-900 rounded-lg p-6 text-white">
        <div className="aspect-video bg-gray-800 rounded-lg mb-4 flex items-center justify-center relative">
          {isVideoOn ? (
            <div className="text-center">
              <Video className="w-16 h-16 mx-auto mb-2 text-gray-600" />
              <p className="text-gray-500">Câmera do Professor</p>
            </div>
          ) : (
            <div className="text-center">
              <VideoOff className="w-16 h-16 mx-auto mb-2 text-gray-600" />
              <p className="text-gray-500">Vídeo Desativado</p>
            </div>
          )}
          {isScreenSharing && (
            <div className="absolute inset-0 bg-blue-900 bg-opacity-50 rounded-lg flex items-center justify-center">
              <Monitor className="w-16 h-16 text-blue-300" />
            </div>
          )}
        </div>
        
        <div className="flex items-center justify-center gap-4">
          <button
            onClick={() => setIsVideoOn(!isVideoOn)}
            className={`p-3 rounded-lg transition-colors ${
              isVideoOn ? 'bg-gray-700 hover:bg-gray-600' : 'bg-red-600 hover:bg-red-700'
            }`}
          >
            {isVideoOn ? <Video className="w-5 h-5" /> : <VideoOff className="w-5 h-5" />}
          </button>
          
          <button
            onClick={() => setIsAudioOn(!isAudioOn)}
            className={`p-3 rounded-lg transition-colors ${
              isAudioOn ? 'bg-gray-700 hover:bg-gray-600' : 'bg-red-600 hover:bg-red-700'
            }`}
          >
            {isAudioOn ? <Mic className="w-5 h-5" /> : <MicOff className="w-5 h-5" />}
          </button>
          
          <button
            onClick={() => setIsScreenSharing(!isScreenSharing)}
            className={`p-3 rounded-lg transition-colors ${
              isScreenSharing ? 'bg-blue-600 hover:bg-blue-700' : 'bg-gray-700 hover:bg-gray-600'
            }`}
          >
            {isScreenSharing ? <Monitor className="w-5 h-5" /> : <MonitorOff className="w-5 h-5" />}
          </button>
          
          <button className="px-6 py-3 bg-red-600 hover:bg-red-700 rounded-lg transition-colors font-medium">
            Encerrar Transmissão
          </button>
        </div>
      </div>
    )
  }

  return (
    <DashboardLayout>
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Gestão de Aulas ao Vivo</h1>
        <p className="text-gray-600">Gerencie suas aulas ao vivo, agendamentos e gravações</p>
      </div>

      {/* Live Stream Simulator for live classes */}
      {liveClasses.some(c => c.status === 'live') && (
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Transmissão ao Vivo</h2>
          <LiveStreamSimulator />
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Aulas Hoje</p>
              <p className="text-2xl font-bold text-gray-900">3</p>
            </div>
            <Calendar className="w-8 h-8 text-blue-600" />
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Ao Vivo Agora</p>
              <p className="text-2xl font-bold text-red-600">1</p>
            </div>
            <div className="relative">
              <Video className="w-8 h-8 text-red-600" />
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-600 rounded-full animate-pulse" />
            </div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total de Alunos</p>
              <p className="text-2xl font-bold text-gray-900">122</p>
            </div>
            <Users className="w-8 h-8 text-green-600" />
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Horas Gravadas</p>
              <p className="text-2xl font-bold text-gray-900">48h</p>
            </div>
            <Play className="w-8 h-8 text-purple-600" />
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Buscar aulas..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
          
          <div className="flex gap-2">
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as any)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">Todos os Status</option>
              <option value="scheduled">Agendadas</option>
              <option value="live">Ao Vivo</option>
              <option value="completed">Concluídas</option>
            </select>
            
            <button
              onClick={() => setShowCreateModal(true)}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
            >
              <Plus className="w-5 h-5" />
              Nova Aula
            </button>
          </div>
        </div>
      </div>

      {/* Live Classes Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredClasses.map((liveClass) => (
          <LiveClassCard key={liveClass.id} liveClass={liveClass} />
        ))}
      </div>

      {/* Create Modal Placeholder */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">Agendar Nova Aula ao Vivo</h2>
            <p className="text-gray-600 mb-4">Funcionalidade de agendamento será implementada em breve.</p>
            <button
              onClick={() => setShowCreateModal(false)}
              className="w-full bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors"
            >
              Fechar
            </button>
          </div>
        </div>
      )}
    </div>
    </DashboardLayout>
  )
}
