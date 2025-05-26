import { AttendanceRecord, AttendanceReport } from '@/types/classroom'

class AttendanceService {
  private static instance: AttendanceService
  private records: Map<string, AttendanceRecord[]> = new Map() // classroomId -> records

  private constructor() {}

  public static getInstance(): AttendanceService {
    if (!AttendanceService.instance) {
      AttendanceService.instance = new AttendanceService()
    }
    return AttendanceService.instance
  }

  public addRecord(record: AttendanceRecord): void {
    const classroomRecords = this.records.get(record.classroomId) || []
    
    // Update existing record if user already has one
    const existingIndex = classroomRecords.findIndex(r => r.userId === record.userId)
    if (existingIndex !== -1) {
      classroomRecords[existingIndex] = {
        ...classroomRecords[existingIndex],
        ...record,
        totalDuration: this.calculateDuration(record)
      }
    } else {
      classroomRecords.push({
        ...record,
        totalDuration: this.calculateDuration(record)
      })
    }

    this.records.set(record.classroomId, classroomRecords)
  }

  public getClassroomRecords(classroomId: string): AttendanceRecord[] {
    return this.records.get(classroomId) || []
  }

  public generateReport(classroomId: string): AttendanceReport {
    const records = this.getClassroomRecords(classroomId)
    
    const presentCount = records.filter(r => r.status === 'present').length
    const absentCount = records.filter(r => r.status === 'absent').length
    const lateCount = records.filter(r => r.status === 'late').length
    
    const totalDurations = records.map(r => r.totalDuration)
    const averageDuration = totalDurations.length > 0
      ? totalDurations.reduce((a, b) => a + b, 0) / totalDurations.length
      : 0

    return {
      classroomId,
      totalParticipants: records.length,
      averageDuration,
      presentCount,
      absentCount,
      lateCount,
      records
    }
  }

  private calculateDuration(record: AttendanceRecord): number {
    if (!record.leaveTime) return 0

    const join = new Date(record.joinTime).getTime()
    const leave = new Date(record.leaveTime).getTime()
    return Math.floor((leave - join) / 1000) // Duration in seconds
  }

  public markAsLate(classroomId: string, userId: string, threshold: number): void {
    const records = this.getClassroomRecords(classroomId)
    const userRecord = records.find(r => r.userId === userId)
    
    if (userRecord) {
      userRecord.status = 'late'
      this.addRecord(userRecord)
    }
  }

  public markAsAbsent(classroomId: string, userId: string): void {
    const record: AttendanceRecord = {
      classroomId,
      userId,
      userName: userId, // Should be replaced with actual user name
      status: 'absent',
      joinTime: new Date().toISOString(),
      totalDuration: 0,
      attentiveness: 0
    }
    this.addRecord(record)
  }

  public updateAttentiveness(
    classroomId: string,
    userId: string,
    attentiveness: number
  ): void {
    const records = this.getClassroomRecords(classroomId)
    const userRecord = records.find(r => r.userId === userId)
    
    if (userRecord) {
      userRecord.attentiveness = attentiveness
      this.addRecord(userRecord)
    }
  }

  public exportReport(classroomId: string, format: 'csv' | 'json' = 'json'): string {
    const report = this.generateReport(classroomId)

    if (format === 'csv') {
      const headers = ['userId', 'userName', 'status', 'joinTime', 'leaveTime', 'totalDuration', 'attentiveness']
      const rows = report.records.map(r => 
        headers.map(h => r[h as keyof AttendanceRecord]?.toString() || '').join(',')
      )
      return [headers.join(','), ...rows].join('\n')
    }

    return JSON.stringify(report, null, 2)
  }

  public clearRecords(classroomId: string): void {
    this.records.delete(classroomId)
  }
}

export const attendanceService = AttendanceService.getInstance()
