'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useTheme } from '@/contexts/ThemeContext'
import { motion } from 'framer-motion'
import Link from 'next/link'

interface LiveClass {
  id: string
  title: string
  description: string
  course: string
  courseId: string
  instructor: string
  startTime: Date
  endTime: Date
  status: 'scheduled' | 'live' | 'ended'
  meetingUrl?: string
  recordingUrl?: string
  participants?: number
  maxParticipants?: number
  topics: string[]
}

export default function StudentLiveClassesPage() {
  const { user } = useAuth()
  const { theme } = useTheme()
  const [liveClasses, setLiveClasses] = useState<LiveClass[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'today' | 'upcoming' | 'past'>('all')
  const [selectedDate, setSelectedDate] = useState<Date>(new Date())

  useEffect(() => {
    fetchLiveClasses()
  }, [])

  const fetchLiveClasses = async () => {
    try {
      // Simular dados por enquanto
      const mockClasses: LiveClass[] = [
        {
          id: '1',
          title: 'Aula de Revisão - Equações',
          description: 'Revisão completa sobre equações do primeiro e segundo grau',
          course: 'Matemática Básica',
          courseId: '1',
          instructor: 'Prof. João Silva',
          startTime: new Date(Date.now() + 30 * 60 * 1000), // Em 30 minutos
          endTime: new Date(Date.now() + 90 * 60 * 1000),
          status: 'scheduled',
          meetingUrl: 'https://meet.example.com/math-101',
          participants: 15,
          maxParticipants: 30,
          topics: ['Equações do 1º grau', 'Equações do 2º grau', 'Exercícios práticos']
        },
        {
          id: '2',
          title: 'Gramática ao Vivo',
          description: 'Aula interativa sobre concordância verbal e nominal',
          course: 'Português - Gramática',
          courseId: '2',
          instructor: 'Prof. Maria Santos',
          startTime: new Date(Date.now() - 30 * 60 * 1000), // Começou há 30 minutos
          endTime: new Date(Date.now() + 30 * 60 * 1000),
          status: 'live',
          meetingUrl: 'https://meet.example.com/port-202',
          participants: 22,
          maxParticipants: 30,
          topics: ['Concordância verbal', 'Concordância nominal', 'Casos especiais']
        },
        {
          id: '3',
          title: 'História em Debate',
          description: 'Discussão sobre a Era Vargas',
          course: 'História do Brasil',
          courseId: '3',
          instructor: 'Prof. Carlos Oliveira',
          startTime: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 horas atrás
          endTime: new Date(Date.now() - 60 * 60 * 1000),
          status: 'ended',
          recordingUrl: 'https://recordings.example.com/hist-303',
          participants: 28,
          topics: ['Era Vargas', 'Estado Novo', 'Política trabalhista']
        },
        {
          id: '4',
          title: 'Laboratório Virtual de Ciências',
          description: 'Experimentos práticos de química',
          course: 'Ciências Naturais',
          courseId: '4',
          instructor: 'Prof. Ana Costa',
          startTime: new Date(Date.now() + 24 * 60 * 60 * 1000), // Amanhã
          endTime: new Date(Date.now() + 25.5 * 60 * 60 * 1000),
          status: 'scheduled',
          meetingUrl: 'https://meet.example.com/sci-404',
          maxParticipants: 25,
          topics: ['Reações químicas', 'Experimentos práticos', 'Segurança no laboratório']
        }
      ]
      
      setLiveClasses(mockClasses)
      setLoading(false)
    } catch (error) {
      console.log('Erro ao buscar aulas ao vivo:', error)
      setLoading(false)
    }
  }

  const filteredClasses = liveClasses.filter(liveClass => {
    const now = new Date()
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    const classDate = new Date(liveClass.startTime.getFullYear(), liveClass.startTime.getMonth(), liveClass.startTime.getDate())
    
    switch (filter) {
      case 'today':
        return classDate.getTime() === today.getTime()
      case 'upcoming':
        return liveClass.status === 'scheduled'
      case 'past':
        return liveClass.status === 'ended'
      default:
        return true
    }
  }).sort((a, b) => {
    // Ordenar por status (live primeiro, depois scheduled, depois ended)
    if (a.status === 'live' && b.status !== 'live') return -1
    if (b.status === 'live' && a.status !== 'live') return 1
    // Depois por horário
    return a.startTime.getTime() - b.startTime.getTime()
  })

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'live': return theme.colors.status.error
      case 'scheduled': return theme.colors.status.info
      case 'ended': return theme.colors.text.tertiary
      default: return theme.colors.text.secondary
    }
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'live': return 'AO VIVO'
      case 'scheduled': return 'Agendada'
      case 'ended': return 'Encerrada'
      default: return status
    }
  }

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
  }

  const formatDate = (date: Date) => {
    const now = new Date()
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    const classDate = new Date(date.getFullYear(), date.getMonth(), date.getDate())
    
    if (classDate.getTime() === today.getTime()) {
      return 'Hoje'
    }
    
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)
    if (classDate.getTime() === tomorrow.getTime()) {
      return 'Amanhã'
    }
    
    return date.toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' })
  }

  const getTimeUntilClass = (startTime: Date) => {
    const now = new Date()
    const diff = startTime.getTime() - now.getTime()
    const minutes = Math.floor(diff / (1000 * 60))
    const hours = Math.floor(minutes / 60)
    
    if (minutes < 0) return null
    if (minutes < 60) return `Em ${minutes} minutos`
    if (hours < 24) return `Em ${hours} horas`
    
    return null
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2" 
             style={{ borderColor: theme.colors.primary.DEFAULT }}></div>
      </div>
    )
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="text-3xl font-bold mb-2" style={{ color: theme.colors.text.primary }}>
          Aulas ao Vivo
        </h1>
        <p style={{ color: theme.colors.text.secondary }}>
          Participe das aulas ao vivo e assista às gravações
        </p>
      </motion.div>

      {/* Aula ao Vivo Agora */}
      {filteredClasses.some(c => c.status === 'live') && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="mb-6 p-4 rounded-lg border-2 animate-pulse"
          style={{
            backgroundColor: theme.colors.status.error + '10',
            borderColor: theme.colors.status.error
          }}
        >
          <div className="flex items-center gap-3">
            <div className="w-3 h-3 rounded-full animate-pulse"
                 style={{ backgroundColor: theme.colors.status.error }}></div>
            <span className="font-semibold" style={{ color: theme.colors.status.error }}>
              AULA AO VIVO AGORA
            </span>
          </div>
        </motion.div>
      )}

      {/* Filtros */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="mb-6 flex gap-2"
      >
        {(['all', 'today', 'upcoming', 'past'] as const).map((filterOption) => (
          <button
            key={filterOption}
            onClick={() => setFilter(filterOption)}
            className={`px-4 py-2 rounded-lg font-medium transition-all text-sm ${
              filter === filterOption ? 'shadow-md' : ''
            }`}
            style={{
              backgroundColor: filter === filterOption ? theme.colors.primary.DEFAULT : theme.colors.background.card,
              color: filter === filterOption ? 'white' : theme.colors.text.secondary,
              borderWidth: '1px',
              borderColor: filter === filterOption ? theme.colors.primary.DEFAULT : theme.colors.border.DEFAULT
            }}
          >
            {filterOption === 'all' ? 'Todas' : 
             filterOption === 'today' ? 'Hoje' :
             filterOption === 'upcoming' ? 'Próximas' : 'Passadas'}
          </button>
        ))}
      </motion.div>

      {/* Lista de Aulas */}
      <div className="space-y-4">
        {filteredClasses.map((liveClass, index) => (
          <motion.div
            key={liveClass.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.05 }}
            className={`rounded-lg shadow-md hover:shadow-lg transition-all ${
              liveClass.status === 'live' ? 'ring-2' : ''
            }`}
            style={{
              backgroundColor: theme.colors.background.card,
              borderWidth: '1px',
              borderColor: liveClass.status === 'live' ? theme.colors.status.error : theme.colors.border.DEFAULT
            }}
          >
            <div className="p-5">
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-semibold" style={{ color: theme.colors.text.primary }}>
                      {liveClass.title}
                    </h3>
                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                      liveClass.status === 'live' ? 'animate-pulse' : ''
                    }`}
                          style={{
                            backgroundColor: getStatusColor(liveClass.status) + '20',
                            color: getStatusColor(liveClass.status)
                          }}>
                      {getStatusLabel(liveClass.status)}
                    </span>
                  </div>
                  <p className="text-sm mb-1" style={{ color: theme.colors.text.secondary }}>
                    {liveClass.course} • {liveClass.instructor}
                  </p>
                  <p className="text-sm" style={{ color: theme.colors.text.secondary }}>
                    {liveClass.description}
                  </p>
                </div>
              </div>

              {/* Informações */}
              <div className="flex flex-wrap gap-4 mb-3 text-sm">
                <div className="flex items-center gap-1">
                  <span className="material-symbols-outlined text-base"
                        style={{ color: theme.colors.text.tertiary }}>
                    calendar_today
                  </span>
                  <span style={{ color: theme.colors.text.secondary }}>
                    {formatDate(liveClass.startTime)}
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <span className="material-symbols-outlined text-base"
                        style={{ color: theme.colors.text.tertiary }}>
                    schedule
                  </span>
                  <span style={{ color: theme.colors.text.secondary }}>
                    {formatTime(liveClass.startTime)} - {formatTime(liveClass.endTime)}
                  </span>
                </div>
                {liveClass.participants !== undefined && (
                  <div className="flex items-center gap-1">
                    <span className="material-symbols-outlined text-base"
                          style={{ color: theme.colors.text.tertiary }}>
                      group
                    </span>
                    <span style={{ color: theme.colors.text.secondary }}>
                      {liveClass.participants}{liveClass.maxParticipants ? `/${liveClass.maxParticipants}` : ''} participantes
                    </span>
                  </div>
                )}
              </div>

              {/* Tópicos */}
              {liveClass.topics.length > 0 && (
                <div className="mb-4">
                  <p className="text-sm font-medium mb-2" style={{ color: theme.colors.text.primary }}>
                    Tópicos da aula:
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {liveClass.topics.map((topic, idx) => (
                      <span
                        key={idx}
                        className="px-3 py-1 rounded-full text-xs"
                        style={{
                          backgroundColor: theme.colors.primary.light + '20',
                          color: theme.colors.primary.DEFAULT
                        }}
                      >
                        {topic}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Tempo até a aula */}
              {liveClass.status === 'scheduled' && getTimeUntilClass(liveClass.startTime) && (
                <div className="mb-3 p-3 rounded-lg"
                     style={{ backgroundColor: theme.colors.status.info + '10' }}>
                  <p className="text-sm font-medium" style={{ color: theme.colors.status.info }}>
                    {getTimeUntilClass(liveClass.startTime)}
                  </p>
                </div>
              )}

              {/* Ações */}
              <div className="flex gap-2">
                {liveClass.status === 'live' && (
                  <a
                    href={liveClass.meetingUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-4 py-2 rounded-lg font-medium text-sm transition-colors flex items-center gap-2"
                    style={{
                      backgroundColor: theme.colors.status.error,
                      color: 'white'
                    }}
                  >
                    <span className="material-symbols-outlined text-base">
                      videocam
                    </span>
                    Entrar na Aula
                  </a>
                )}
                {liveClass.status === 'scheduled' && (
                  <>
                    <button
                      className="px-4 py-2 rounded-lg font-medium text-sm transition-colors border"
                      style={{
                        borderColor: theme.colors.primary.DEFAULT,
                        color: theme.colors.primary.DEFAULT
                      }}
                    >
                      Adicionar ao Calendário
                    </button>
                    {getTimeUntilClass(liveClass.startTime) && 
                     parseInt(getTimeUntilClass(liveClass.startTime)!.match(/\d+/)?.[0] || '60') <= 15 && (
                      <a
                        href={liveClass.meetingUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-4 py-2 rounded-lg font-medium text-sm transition-colors"
                        style={{
                          backgroundColor: theme.colors.primary.DEFAULT,
                          color: 'white'
                        }}
                      >
                        Entrar na Sala
                      </a>
                    )}
                  </>
                )}
                {liveClass.status === 'ended' && liveClass.recordingUrl && (
                  <a
                    href={liveClass.recordingUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-4 py-2 rounded-lg font-medium text-sm transition-colors flex items-center gap-2 border"
                    style={{
                      borderColor: theme.colors.primary.DEFAULT,
                      color: theme.colors.primary.DEFAULT
                    }}
                  >
                    <span className="material-symbols-outlined text-base">
                      play_circle
                    </span>
                    Assistir Gravação
                  </a>
                )}
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Empty State */}
      {filteredClasses.length === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-12"
        >
          <span className="material-symbols-outlined text-6xl mb-4"
                style={{ color: theme.colors.text.tertiary }}>
            video_camera_front
          </span>
          <p className="text-lg" style={{ color: theme.colors.text.secondary }}>
            Nenhuma aula ao vivo encontrada
          </p>
        </motion.div>
      )}
    </div>
  )
} 