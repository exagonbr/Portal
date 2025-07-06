import db from '../config/database';
import { UserActivity, ActivitySession, ActivitySummary, ActivityType } from '../types/activity';
import { format, startOfDay, endOfDay, subDays, subMonths } from 'date-fns';

export interface ActivityFilter {
  userId?: string;
  sessionId?: string;
  activityType?: ActivityType | ActivityType[];
  entityType?: string;
  entityId?: string;
  startDate?: Date;
  endDate?: Date;
  ipAddress?: string;
  success?: boolean;
  limit?: number;
  offset?: number;
  orderBy?: 'created_at' | 'duration_seconds';
  order?: 'asc' | 'desc';
}

export interface ActivityStats {
  totalActivities: number;
  uniqueUsers: number;
  uniqueSessions: number;
  totalDuration: number;
  averageDuration: number;
  activityByType: Record<string, number>;
  activityByHour: Record<string, number>;
  topPages: Array<{ path: string; count: number }>;
  topUsers: Array<{ userId: string; count: number; duration: number }>;
  errorRate: number;
  deviceBreakdown: {
    desktop: number;
    mobile: number;
    tablet: number;
    other: number;
  };
  browserBreakdown: Record<string, number>;
  locationBreakdown: Record<string, number>;
}

export class ActivityTrackingService {
  /**
   * Busca atividades com filtros
   */
  async getActivities(filter: ActivityFilter): Promise<UserActivity[]> {
    let query = db('user_activity');

    if (filter.userId) {
      query = query.where('user_id', filter.userId);
    }

    if (filter.sessionId) {
      query = query.where('session_id', filter.sessionId);
    }

    if (filter.activityType) {
      if (Array.isArray(filter.activityType)) {
        query = query.whereIn('activity_type', filter.activityType);
      } else {
        query = query.where('activity_type', filter.activityType);
      }
    }

    if (filter.entityType) {
      query = query.where('entity_type', filter.entityType);
    }

    if (filter.entityId) {
      query = query.where('entity_id', filter.entityId);
    }

    if (filter.startDate) {
      query = query.where('created_at', '>=', filter.startDate);
    }

    if (filter.endDate) {
      query = query.where('created_at', '<=', filter.endDate);
    }

    if (filter.ipAddress) {
      query = query.where('ip_address', filter.ipAddress);
    }

    if (filter.success !== undefined) {
      query = query.whereRaw("(details->>'success')::boolean = ?", [filter.success]);
    }

    const orderBy = filter.orderBy || 'created_at';
    const order = filter.order || 'desc';
    query = query.orderBy(orderBy, order);

    if (filter.limit) {
      query = query.limit(filter.limit);
    }

    if (filter.offset) {
      query = query.offset(filter.offset);
    }

    return query;
  }

  /**
   * Busca sessões ativas
   */
  async getActiveSessions(limit: number = 100): Promise<ActivitySession[]> {
    return db('activity_sessions')
      .where('is_active', true)
      .orderBy('last_activity', 'desc')
      .limit(limit);
  }

  /**
   * Busca sessões de um usuário
   */
  async getUserSessions(userId: string, limit: number = 50): Promise<ActivitySession[]> {
    return db('activity_sessions')
      .where('user_id', userId)
      .orderBy('start_time', 'desc')
      .limit(limit);
  }

  /**
   * Obtém estatísticas de atividade
   */
  async getActivityStats(filter: ActivityFilter): Promise<ActivityStats> {
    const activities = await this.getActivities({ ...filter, limit: undefined });

    // Estatísticas básicas
    const totalActivities = activities.length;
    const uniqueUsers = new Set(activities.map(a => a.user_id)).size;
    const uniqueSessions = new Set(activities.map(a => a.session_id).filter(Boolean)).size;
    const totalDuration = activities.reduce((sum, a) => sum + (a.duration_seconds || 0), 0);
    const averageDuration = totalActivities > 0 ? totalDuration / totalActivities : 0;

    // Atividades por tipo
    const activityByType: Record<string, number> = {};
    activities.forEach(activity => {
      activityByType[activity.activity_type] = (activityByType[activity.activity_type] || 0) + 1;
    });

    // Atividades por hora
    const activityByHour: Record<string, number> = {};
    activities.forEach(activity => {
      const hour = format(new Date(activity.created_at), 'HH');
      activityByHour[hour] = (activityByHour[hour] || 0) + 1;
    });

    // Top páginas
    const pageViews = activities.filter(a => a.activity_type === 'page_view');
    const pageCounts: Record<string, number> = {};
    pageViews.forEach(activity => {
      const path = activity.details?.path || 'unknown';
      pageCounts[path] = (pageCounts[path] || 0) + 1;
    });
    const topPages = Object.entries(pageCounts)
      .map(([path, count]) => ({ path, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    // Top usuários
    const userStats: Record<string, { count: number; duration: number }> = {};
    activities.forEach(activity => {
      if (!userStats[activity.user_id]) {
        userStats[activity.user_id] = { count: 0, duration: 0 };
      }
      userStats[activity.user_id].count++;
      userStats[activity.user_id].duration += activity.duration_seconds || 0;
    });
    const topUsers = Object.entries(userStats)
      .map(([userId, stats]) => ({ userId, ...stats }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    // Taxa de erro
    const errors = activities.filter(a => 
      a.activity_type === 'error' || 
      a.details?.success === false ||
      (a.details?.status_code && a.details.status_code >= 400)
    );
    const errorRate = totalActivities > 0 ? (errors.length / totalActivities) * 100 : 0;

    // Breakdown por dispositivo
    const deviceBreakdown = {
      desktop: 0,
      mobile: 0,
      tablet: 0,
      other: 0
    };
    activities.forEach(activity => {
      const deviceType = activity.details?.device_type || 
                        (activity.device_info?.includes('mobile') ? 'mobile' :
                         activity.device_info?.includes('tablet') ? 'tablet' : 'desktop');
      if (deviceType in deviceBreakdown) {
        deviceBreakdown[deviceType as keyof typeof deviceBreakdown]++;
      } else {
        deviceBreakdown.other++;
      }
    });

    // Breakdown por navegador
    const browserBreakdown: Record<string, number> = {};
    activities.forEach(activity => {
      const browser = activity.browser || 'unknown';
      browserBreakdown[browser] = (browserBreakdown[browser] || 0) + 1;
    });

    // Breakdown por localização
    const locationBreakdown: Record<string, number> = {};
    activities.forEach(activity => {
      const location = activity.location || activity.details?.country || 'unknown';
      locationBreakdown[location] = (locationBreakdown[location] || 0) + 1;
    });

    return {
      totalActivities,
      uniqueUsers,
      uniqueSessions,
      totalDuration,
      averageDuration,
      activityByType,
      activityByHour,
      topPages,
      topUsers,
      errorRate,
      deviceBreakdown,
      browserBreakdown,
      locationBreakdown
    };
  }

  /**
   * Obtém resumo de atividades por período
   */
  async getActivitySummary(userId: string, startDate: Date, endDate: Date): Promise<ActivitySummary[]> {
    return db('activity_summaries')
      .where('user_id', userId)
      .whereBetween('date', [startOfDay(startDate), endOfDay(endDate)])
      .orderBy('date', 'asc');
  }

  /**
   * Busca atividades suspeitas
   */
  async getSuspiciousActivities(limit: number = 100): Promise<UserActivity[]> {
    return db('user_activity')
      .where(function() {
        this.where('activity_type', 'login_failed')
          .orWhere('activity_type', 'error')
          .orWhereRaw("details->>'status_code' = '403'")
          .orWhereRaw("details->>'status_code' = '401'")
          .orWhereRaw("duration_seconds > 300") // Requisições muito longas
          .orWhereRaw("details->>'response_size' > '10000000'"); // Respostas muito grandes
      })
      .orderBy('created_at', 'desc')
      .limit(limit);
  }

  /**
   * Busca tentativas de login falhadas
   */
  async getFailedLogins(userId?: string, limit: number = 50): Promise<UserActivity[]> {
    let query = db('user_activity')
      .where('activity_type', 'login_failed');

    if (userId) {
      query = query.where('user_id', userId);
    }

    return query
      .orderBy('created_at', 'desc')
      .limit(limit);
  }

  /**
   * Obtém trilha de auditoria para uma entidade
   */
  async getEntityAuditTrail(entityType: string, entityId: string): Promise<UserActivity[]> {
    return db('user_activity')
      .where('entity_type', entityType)
      .where('entity_id', entityId)
      .orderBy('created_at', 'desc');
  }

  /**
   * Busca atividades por IP
   */
  async getActivitiesByIP(ipAddress: string, limit: number = 100): Promise<UserActivity[]> {
    return db('user_activity')
      .where('ip_address', ipAddress)
      .orderBy('created_at', 'desc')
      .limit(limit);
  }

  /**
   * Exporta logs para CSV
   */
  async exportToCSV(filter: ActivityFilter): Promise<string> {
    const activities = await this.getActivities(filter);

    const headers = [
      'ID',
      'User ID',
      'Session ID',
      'Activity Type',
      'Entity Type',
      'Entity ID',
      'Action',
      'IP Address',
      'Browser',
      'OS',
      'Device',
      'Location',
      'Duration (s)',
      'Success',
      'Error',
      'Created At'
    ];

    const rows = activities.map(activity => [
      activity.id,
      activity.user_id,
      activity.session_id || '',
      activity.activity_type,
      activity.entity_type || '',
      activity.entity_id || '',
      activity.action,
      activity.ip_address || '',
      activity.browser || '',
      activity.operating_system || '',
      activity.device_info || '',
      activity.location || '',
      activity.duration_seconds || '',
      activity.details?.success !== false ? 'Yes' : 'No',
      activity.details?.error || '',
      format(new Date(activity.created_at), 'yyyy-MM-dd HH:mm:ss')
    ]);

    const csv = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(','))
    ].join('\n');

    return csv;
  }

  /**
   * Limpa logs antigos
   */
  async cleanupOldLogs(daysToKeep: number = 90): Promise<number> {
    const cutoffDate = subDays(new Date(), daysToKeep);

    const result = await db('user_activity')
      .where('created_at', '<', cutoffDate)
      .delete();

    return result;
  }

  /**
   * Obtém relatório de conformidade
   */
  async getComplianceReport(startDate: Date, endDate: Date): Promise<any> {
    const activities = await this.getActivities({ startDate, endDate });

    // Agrupar por tipo de operação sensível
    const sensitiveOperations = activities.filter(a => 
      ['data_create', 'data_update', 'data_delete', 'data_export', 
       'settings_change', 'password_change', 'profile_update'].includes(a.activity_type)
    );

    // Acessos a dados pessoais
    const personalDataAccess = activities.filter(a =>
      a.entity_type === 'user' || 
      a.entity_type === 'profile' ||
      a.activity_type === 'profile_view'
    );

    // Downloads e exportações
    const dataExports = activities.filter(a =>
      a.activity_type === 'data_export' ||
      a.activity_type === 'file_download'
    );

    return {
      period: {
        start: format(startDate, 'yyyy-MM-dd'),
        end: format(endDate, 'yyyy-MM-dd')
      },
      summary: {
        totalActivities: activities.length,
        sensitiveOperations: sensitiveOperations.length,
        personalDataAccess: personalDataAccess.length,
        dataExports: dataExports.length
      },
      details: {
        sensitiveOperationsByType: this.groupByType(sensitiveOperations),
        personalDataAccessByUser: this.groupByUser(personalDataAccess),
        exportsByUser: this.groupByUser(dataExports)
      }
    };
  }

  private groupByType(activities: UserActivity[]): Record<string, number> {
    const grouped: Record<string, number> = {};
    activities.forEach(activity => {
      grouped[activity.activity_type] = (grouped[activity.activity_type] || 0) + 1;
    });
    return grouped;
  }

  private groupByUser(activities: UserActivity[]): Array<{ userId: string; count: number }> {
    const grouped: Record<string, number> = {};
    activities.forEach(activity => {
      grouped[activity.user_id] = (grouped[activity.user_id] || 0) + 1;
    });
    return Object.entries(grouped)
      .map(([userId, count]) => ({ userId, count }))
      .sort((a, b) => b.count - a.count);
  }
}

export default new ActivityTrackingService(); 