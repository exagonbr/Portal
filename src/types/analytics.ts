export interface ActiveSession {
  id: string
  userId: string
  userName: string
  userRole: string
  userAvatar?: string
  ip: string
  location: string
  device: string
  browser: string
  startTime: Date
  lastActivity: Date
  duration: number // em minutos
  status: 'active' | 'idle' | 'away'
}

export interface SystemUsageData {
  timestamp: Date
  activeUsers: number
  cpuUsage: number
  memoryUsage: number
  responseTime: number
}

export interface ResourceDistribution {
  category: string
  value: number
  percentage: number
  color: string
}

export interface S3FileTypeDistribution {
  fileType: string
  count: number
  size: number // em MB
  percentage: number
} 