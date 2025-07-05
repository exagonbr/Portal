export interface VirtualClassroom {
  id: string
  courseId: string
  title: string
  description?: string
  startTime: string
  endTime?: string
  status: ClassroomStatus
  hostId: string
  meetingId: string
  recordingUrl?: string
  attendees: Attendee[]
}

export type ClassroomStatus = 'scheduled' | 'in-progress' | 'completed' | 'cancelled'

export interface Attendee {
  userId: string
  name: string
  role: 'host' | 'participant'
  joinedAt: string
  leftAt?: string
  duration?: number
  isOnline: boolean
}

export interface ClassroomConfig {
  roomName: string
  displayName: string
  subject?: string
  width?: string | number
  height?: string | number
  userInfo: {
    displayName: string
    email?: string
    avatarUrl?: string
  }
  configOverwrite?: {
    startWithAudioMuted?: boolean
    startWithVideoMuted?: boolean
    disableModeratorIndicator?: boolean
    enableClosePage?: boolean
    disableInviteFunctions?: boolean
  }
  interfaceConfigOverwrite?: {
    TOOLBAR_BUTTONS?: string[]
    SHOW_JITSI_WATERMARK?: boolean
    SHOW_WATERMARK_FOR_GUESTS?: boolean
  }
}

export interface RecordingMetadata {
  id: string
  classroomId: string
  startTime: string
  endTime: string
  duration: number
  size: number
  url: string
  status: 'processing' | 'ready' | 'error'
}

export interface AttendanceRecord {
  classroomId: string
  userId: string
  userName: string
  status: 'present' | 'absent' | 'late'
  joinTime: string
  leaveTime?: string
  totalDuration: number
  attentiveness?: number // Percentage of time actively participating
}

export interface AttendanceReport {
  classroomId: string
  totalParticipants: number
  averageDuration: number
  presentCount: number
  absentCount: number
  lateCount: number
  records: AttendanceRecord[]
}
