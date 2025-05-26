'use client'

import { useEffect, useState, useCallback } from 'react'
import { jitsiService } from '@/services/jitsiService'
import { ClassroomConfig, AttendanceRecord } from '@/types/classroom'
import { useAuth } from '@/contexts/AuthContext'

interface VirtualClassroomProps {
  classroomId: string
  title: string
  isHost: boolean
  onAttendanceUpdate?: (record: AttendanceRecord) => void
  onRecordingStatusChange?: (status: string) => void
}

export default function VirtualClassroom({
  classroomId,
  title,
  isHost,
  onAttendanceUpdate,
  onRecordingStatusChange
}: VirtualClassroomProps) {
  const { user } = useAuth()
  const [isInitialized, setIsInitialized] = useState(false)
  const [isRecording, setIsRecording] = useState(false)
  const [participants, setParticipants] = useState<string[]>([])
  const [joinTime] = useState<string>(new Date().toISOString())

  const containerId = 'virtual-classroom-container'

  const initializeJitsi = useCallback(async () => {
    try {
      await jitsiService.initialize()

      const config: ClassroomConfig = {
        roomName: `classroom-${classroomId}`,
        displayName: title,
        userInfo: {
          displayName: user?.name || 'Anonymous',
          email: user?.email
        },
        configOverwrite: {
          startWithAudioMuted: !isHost,
          startWithVideoMuted: !isHost,
          disableModeratorIndicator: false,
          enableClosePage: true
        },
        interfaceConfigOverwrite: {
          TOOLBAR_BUTTONS: isHost ? [
            'microphone', 'camera', 'desktop', 'recording',
            'chat', 'raisehand', 'videoquality', 'tileview',
            'mute-everyone', 'security'
          ] : [
            'microphone', 'camera', 'desktop',
            'chat', 'raisehand', 'videoquality', 'tileview'
          ],
          SHOW_JITSI_WATERMARK: false
        }
      }

      jitsiService.createMeeting(containerId, config)
      setIsInitialized(true)

      // Set up event listeners
      jitsiService.onParticipantJoined((participantId) => {
        setParticipants(prev => [...prev, participantId])
        updateAttendance('joined', participantId)
      })

      jitsiService.onParticipantLeft((participantId) => {
        setParticipants(prev => prev.filter(id => id !== participantId))
        updateAttendance('left', participantId)
      })

      jitsiService.onRecordingStatusChanged((status) => {
        setIsRecording(status === 'on')
        onRecordingStatusChange?.(status)
      })
    } catch (error) {
      console.error('Failed to initialize virtual classroom:', error)
    }
  }, [classroomId, title, isHost, user])

  const updateAttendance = (action: 'joined' | 'left', participantId: string) => {
    if (!onAttendanceUpdate) return

    const record: AttendanceRecord = {
      classroomId,
      userId: participantId,
      userName: participantId, // Should be replaced with actual user name
      status: 'present',
      joinTime: action === 'joined' ? new Date().toISOString() : joinTime,
      leaveTime: action === 'left' ? new Date().toISOString() : undefined,
      totalDuration: 0, // Should be calculated based on join/leave times
      attentiveness: 100 // Default value, should be updated based on activity
    }

    onAttendanceUpdate(record)
  }

  useEffect(() => {
    initializeJitsi()

    return () => {
      if (isInitialized) {
        jitsiService.dispose()
      }
    }
  }, [initializeJitsi, isInitialized])

  return (
    <div className="flex flex-col h-full">
      {/* Meeting Controls */}
      {isInitialized && isHost && (
        <div className="bg-white border-b border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => isRecording ? jitsiService.stopRecording() : jitsiService.startRecording()}
                className={`inline-flex items-center px-4 py-2 rounded-lg text-sm font-medium ${
                  isRecording
                    ? 'bg-red-600 text-white hover:bg-red-700'
                    : 'bg-blue-600 text-white hover:bg-blue-700'
                }`}
              >
                <span className="material-symbols-outlined mr-2">
                  {isRecording ? 'stop_circle' : 'fiber_manual_record'}
                </span>
                {isRecording ? 'Stop Recording' : 'Start Recording'}
              </button>
              <button
                onClick={() => jitsiService.toggleScreenSharing()}
                className="inline-flex items-center px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 text-sm font-medium"
              >
                <span className="material-symbols-outlined mr-2">screen_share</span>
                Share Screen
              </button>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-500">
                {participants.length} participant{participants.length !== 1 ? 's' : ''}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Virtual Classroom Container */}
      <div
        id={containerId}
        className="flex-1 w-full bg-gray-900"
        style={{ minHeight: '600px' }}
      />
    </div>
  )
}
