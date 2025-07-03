'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import VirtualClassroom from '@/components/live/VirtualClassroom'
import { attendanceService } from '@/services/attendanceService'
import { recordingService } from '@/services/recordingService'
import { AttendanceRecord, RecordingMetadata, VirtualClassroom as VirtualClassroomType } from '@/types/classroom'

export default function LiveClassesPage() {
  const { user } = useAuth()
  const [activeClass, setActiveClass] = useState<VirtualClassroomType | null>(null)
  const [recordings, setRecordings] = useState<RecordingMetadata[]>([])
  const [showRecordings, setShowRecordings] = useState(false)

  useEffect(() => {
    if (activeClass) {
      loadRecordings()
    }
  }, [activeClass])

  const loadRecordings = async () => {
    if (!activeClass) return
    try {
      const classRecordings = await recordingService.getClassroomRecordings(activeClass.id)
      setRecordings(classRecordings)
    } catch (error) {
      console.error('Failed to load recordings:', error)
    }
  }

  const handleAttendanceUpdate = (record: AttendanceRecord) => {
    attendanceService.addRecord(record)
  }

  const handleRecordingStatusChange = async (status: string) => {
    if (!activeClass) return

    if (status === 'on') {
      // Recording started
      console.log('Recording started')
    } else if (status === 'off') {
      // Recording stopped
      console.log('Recording stopped')
      await loadRecordings() // Refresh recordings list
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-700 dark:text-gray-800-dark">Aulas ao Vivo</h1>
          <p className="text-gray-600">Participe das aulas ao vivo e interaja com professores</p>
        </div>
        <div className="flex space-x-4">
          {activeClass && (
            <button
              onClick={() => setShowRecordings(!showRecordings)}
              className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors duration-200"
            >
              <span className="material-symbols-outlined text-sm mr-2">video_library</span>
              {showRecordings ? 'Voltar à Aula' : 'Ver Gravações'}
            </button>
          )}
          {user?.role === 'teacher' && (
            <button className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary-dark transition-colors duration-200">
              <span className="material-symbols-outlined text-sm mr-2">video_call</span>
              Nova Aula
            </button>
          )}
        </div>
      </div>

      {/* Active Class or Recordings */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        {activeClass && !showRecordings && (
          <VirtualClassroom
            classroomId={activeClass.id}
            title={activeClass.title}
            isHost={user?.role === 'teacher'}
            onAttendanceUpdate={handleAttendanceUpdate}
            onRecordingStatusChange={handleRecordingStatusChange}
          />
        )}

        {showRecordings && (
          <div className="p-6">
            <h2 className="text-xl font-semibold mb-4 text-primary-dark">Gravações Disponíveis</h2>
            <div className="space-y-4">
              {recordings.map((recording) => (
                <div
                  key={recording.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors duration-200"
                >
                  <div>
                    <p className="font-medium text-primary-dark">Gravação - {formatDate(recording.startTime)}</p>
                    <p className="text-sm text-gray-600">
                      Duração: {Math.floor(recording.duration / 60)}min {recording.duration % 60}s
                    </p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className={`px-2 py-1 text-sm rounded-full ${
                      recording.status === 'ready'
                        ? 'bg-accent-green/20 text-accent-green'
                        : recording.status === 'processing'
                        ? 'bg-accent-yellow/20 text-accent-yellow'
                        : 'bg-error/20 text-error'
                    }`}>
                      {recording.status === 'ready'
                        ? 'Pronto'
                        : recording.status === 'processing'
                        ? 'Processando'
                        : 'Erro'}
                    </span>
                    {recording.status === 'ready' && (
                      <a
                        href={recording.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary-dark transition-colors duration-200"
                      >
                        <span className="material-symbols-outlined text-sm">play_circle</span>
                      </a>
                    )}
                  </div>
                </div>
              ))}
              {recordings.length === 0 && (
                <p className="text-gray-600 text-center py-8">
                  Nenhuma gravação disponível para esta aula.
                </p>
              )}
            </div>
          </div>
        )}

        {!activeClass && !showRecordings && (
          <div className="p-6 text-center">
            <p className="text-gray-600">
              Nenhuma aula ao vivo no momento. Aguarde o início da próxima aula ou crie uma nova.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
