import { PrismaClient } from '@prisma/client'

// Tipos de eventos de auditoria
export enum AuditEventType {
  // Autenticação
  USER_LOGIN = 'USER_LOGIN',
  USER_LOGOUT = 'USER_LOGOUT',
  USER_REGISTER = 'USER_REGISTER',
  PASSWORD_CHANGE = 'PASSWORD_CHANGE',
  PASSWORD_RESET = 'PASSWORD_RESET',
  
  // CRUD de entidades
  ENTITY_CREATE = 'ENTITY_CREATE',
  ENTITY_UPDATE = 'ENTITY_UPDATE',
  ENTITY_DELETE = 'ENTITY_DELETE',
  ENTITY_VIEW = 'ENTITY_VIEW',
  
  // Ações específicas
  ENROLLMENT_CREATE = 'ENROLLMENT_CREATE',
  ENROLLMENT_CANCEL = 'ENROLLMENT_CANCEL',
  ASSIGNMENT_SUBMIT = 'ASSIGNMENT_SUBMIT',
  ASSIGNMENT_GRADE = 'ASSIGNMENT_GRADE',
  QUIZ_ATTEMPT = 'QUIZ_ATTEMPT',
  QUIZ_COMPLETE = 'QUIZ_COMPLETE',
  
  // Administrativas
  PERMISSION_GRANT = 'PERMISSION_GRANT',
  PERMISSION_REVOKE = 'PERMISSION_REVOKE',
  SETTINGS_UPDATE = 'SETTINGS_UPDATE',
  REPORT_GENERATE = 'REPORT_GENERATE',
  
  // Segurança
  SECURITY_ALERT = 'SECURITY_ALERT',
  ACCESS_DENIED = 'ACCESS_DENIED',
  RATE_LIMIT_EXCEEDED = 'RATE_LIMIT_EXCEEDED',
}

export interface AuditLogEntry {
  id?: string
  event_type: AuditEventType
  user_id: string | null
  user_email?: string
  user_role?: string
  entity_type?: string
  entity_id?: string
  action: string
  details?: Record<string, any>
  ip_address?: string
  user_agent?: string
  status: 'SUCCESS' | 'FAILURE'
  error_message?: string
  created_at?: Date
}

class AuditService {
  private prisma: PrismaClient | null = null
  private queue: AuditLogEntry[] = []
  private flushInterval: NodeJS.Timeout | null = null

  constructor() {
    // Em produção, inicializar Prisma
    // this.prisma = new PrismaClient()
    
    // Flush da fila a cada 5 segundos
    this.flushInterval = setInterval(() => {
      this.flush()
    }, 5000)
  }

  async log(entry: AuditLogEntry): Promise<void> {
    // Adicionar timestamp
    entry.created_at = new Date()
    
    // Adicionar à fila
    this.queue.push(entry)
    
    // Se a fila estiver muito grande, fazer flush imediato
    if (this.queue.length >= 100) {
      await this.flush()
    }
  }

  async logSuccess(
    eventType: AuditEventType,
    userId: string | null,
    action: string,
    details?: Record<string, any>
  ): Promise<void> {
    await this.log({
      event_type: eventType,
      user_id: userId,
      action,
      details,
      status: 'SUCCESS'
    })
  }

  async logFailure(
    eventType: AuditEventType,
    userId: string | null,
    action: string,
    error: string,
    details?: Record<string, any>
  ): Promise<void> {
    await this.log({
      event_type: eventType,
      user_id: userId,
      action,
      details,
      status: 'FAILURE',
      error_message: error
    })
  }

  async logEntityChange(
    operation: 'CREATE' | 'UPDATE' | 'DELETE',
    entityType: string,
    entityId: string,
    userId: string,
    changes?: Record<string, any>
  ): Promise<void> {
    const eventType = `ENTITY_${operation}` as AuditEventType
    
    await this.log({
      event_type: eventType,
      user_id: userId,
      entity_type: entityType,
      entity_id: entityId,
      action: `${operation} ${entityType}`,
      details: changes,
      status: 'SUCCESS'
    })
  }

  async logSecurityEvent(
    eventType: AuditEventType,
    userId: string | null,
    action: string,
    ipAddress?: string,
    userAgent?: string,
    details?: Record<string, any>
  ): Promise<void> {
    await this.log({
      event_type: eventType,
      user_id: userId,
      action,
      ip_address: ipAddress,
      user_agent: userAgent,
      details,
      status: 'FAILURE'
    })
  }

  private async flush(): Promise<void> {
    if (this.queue.length === 0) return
    
    const entries = [...this.queue]
    this.queue = []
    
    try {
      // Em produção, salvar no banco
      if (this.prisma) {
        // await this.prisma.auditLog.createMany({
        //   data: entries
        // })
      } else {
        // Em desenvolvimento, apenas logar no console
        console.log('[AUDIT]', entries.length, 'entries:', entries)
      }
    } catch (error) {
      console.error('[AUDIT] Erro ao salvar logs:', error)
      // Re-adicionar à fila em caso de erro
      this.queue.unshift(...entries)
    }
  }

  async query(filters: {
    userId?: string
    eventType?: AuditEventType
    entityType?: string
    entityId?: string
    startDate?: Date
    endDate?: Date
    status?: 'SUCCESS' | 'FAILURE'
    limit?: number
    offset?: number
  }): Promise<AuditLogEntry[]> {
    // Em produção, buscar do banco
    if (this.prisma) {
      // return await this.prisma.auditLog.findMany({
      //   where: { ...filters },
      //   orderBy: { created_at: 'desc' },
      //   take: filters.limit || 100,
      //   skip: filters.offset || 0
      // })
    }
    
    // Em desenvolvimento, retornar array vazio
    return []
  }

  destroy(): void {
    if (this.flushInterval) {
      clearInterval(this.flushInterval)
    }
    this.flush()
  }
}

// Singleton
export const auditService = new AuditService()

// Helper functions
export function auditLogin(userId: string, email: string, role: string, ip?: string): void {
  auditService.logSuccess(
    AuditEventType.USER_LOGIN,
    userId,
    'User logged in',
    { email, role, ip }
  )
}

export function auditLogout(userId: string): void {
  auditService.logSuccess(
    AuditEventType.USER_LOGOUT,
    userId,
    'User logged out'
  )
}

export function auditEntityCreate(
  entityType: string,
  entityId: string,
  userId: string,
  data?: any
): void {
  auditService.logEntityChange('CREATE', entityType, entityId, userId, data)
}

export function auditEntityUpdate(
  entityType: string,
  entityId: string,
  userId: string,
  changes?: any
): void {
  auditService.logEntityChange('UPDATE', entityType, entityId, userId, changes)
}

export function auditEntityDelete(
  entityType: string,
  entityId: string,
  userId: string
): void {
  auditService.logEntityChange('DELETE', entityType, entityId, userId)
}

export function auditSecurityAlert(
  action: string,
  userId: string | null,
  ip?: string,
  details?: any
): void {
  auditService.logSecurityEvent(
    AuditEventType.SECURITY_ALERT,
    userId,
    action,
    ip,
    undefined,
    details
  )
} 