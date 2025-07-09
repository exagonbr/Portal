import { apiGet, apiPost, apiPut } from './apiService';

export interface AttendanceRecord {
  userId: string;
  classId: string;
  joinedAt: Date;
  leftAt?: Date;
  duration?: number;
}

class AttendanceServiceClass {
  private records: Map<string, AttendanceRecord> = new Map();

  async addRecord(record: AttendanceRecord): Promise<void> {
    try {
      const key = `${record.userId}-${record.classId}`;
      this.records.set(key, record);
      
      // Enviar para o servidor
      await apiPost('/attendance/record', record);
    } catch (error) {
      console.error('Erro ao adicionar registro de presença:', error);
    }
  }

  async updateRecord(userId: string, classId: string, leftAt: Date): Promise<void> {
    try {
      const key = `${userId}-${classId}`;
      const record = this.records.get(key);
      
      if (record) {
        record.leftAt = leftAt;
        record.duration = leftAt.getTime() - record.joinedAt.getTime();
        
        // Atualizar no servidor
        await apiPut(`/attendance/record/${userId}/${classId}`, {
          leftAt,
          duration: record.duration
        });
      }
    } catch (error) {
      console.error('Erro ao atualizar registro de presença:', error);
    }
  }

  async getClassAttendance(classId: string): Promise<AttendanceRecord[]> {
    try {
      const response = await apiGet<AttendanceRecord[]>(`/attendance/class/${classId}`);
      return response || [];
    } catch (error) {
      console.error('Erro ao buscar presença da aula:', error);
      return [];
    }
  }

  async getUserAttendance(userId: string): Promise<AttendanceRecord[]> {
    try {
      const response = await apiGet<AttendanceRecord[]>(`/attendance/user/${userId}`);
      return response || [];
    } catch (error) {
      console.error('Erro ao buscar presença do usuário:', error);
      return [];
    }
  }

  clearLocalRecords(): void {
    this.records.clear();
  }
}

export const attendanceService = new AttendanceServiceClass(); 