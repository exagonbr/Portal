import { Knex } from 'knex';
import { AwsConnectionLog, CreateAwsConnectionLogDto, AwsConnectionLogStats } from '../types/aws';

export class AwsConnectionLogRepository {
  constructor(private db: Knex) {}

  async create(data: CreateAwsConnectionLogDto): Promise<AwsConnectionLog> {
    const logData = {
      ...data,
      created_at: new Date(),
      updated_at: new Date()
    };

    const [log] = await this.db('aws_connection_logs')
      .insert(logData)
      .returning('*');

    return log;
  }

  async findById(id: string): Promise<AwsConnectionLog | null> {
    const result = await this.db('aws_connection_logs')
      .where('id', id)
      .first();
    
    return result || null;
  }

  async findBySettings(
    awsSettingsId: string, 
    limit = 50, 
    offset = 0
  ): Promise<AwsConnectionLog[]> {
    return await this.db('aws_connection_logs')
      .where('aws_settings_id', awsSettingsId)
      .orderBy('created_at', 'desc')
      .limit(limit)
      .offset(offset);
  }

  async findByUser(
    userId: string, 
    limit = 50, 
    offset = 0
  ): Promise<AwsConnectionLog[]> {
    return await this.db('aws_connection_logs')
      .where('user_id', userId)
      .orderBy('created_at', 'desc')
      .limit(limit)
      .offset(offset);
  }

  async findByService(
    service: string, 
    limit = 50, 
    offset = 0
  ): Promise<AwsConnectionLog[]> {
    return await this.db('aws_connection_logs')
      .where('service', service)
      .orderBy('created_at', 'desc')
      .limit(limit)
      .offset(offset);
  }

  async findRecent(limit = 100): Promise<AwsConnectionLog[]> {
    return await this.db('aws_connection_logs')
      .orderBy('created_at', 'desc')
      .limit(limit);
  }

  async findFailures(
    awsSettingsId?: string, 
    limit = 50
  ): Promise<AwsConnectionLog[]> {
    let query = this.db('aws_connection_logs')
      .where('success', false)
      .orderBy('created_at', 'desc')
      .limit(limit);

    if (awsSettingsId) {
      query = query.where('aws_settings_id', awsSettingsId);
    }

    return await query;
  }

  async getStats(
    awsSettingsId?: string, 
    days = 30
  ): Promise<AwsConnectionLogStats> {
    const fromDate = new Date();
    fromDate.setDate(fromDate.getDate() - days);

    let baseQuery = this.db('aws_connection_logs')
      .where('created_at', '>=', fromDate);

    if (awsSettingsId) {
      baseQuery = baseQuery.where('aws_settings_id', awsSettingsId);
    }

    // Total de conexões
    const totalResult = await baseQuery.clone().count('* as count').first();
    const total_connections = parseInt(totalResult?.count?.toString() || '0');

    // Conexões bem-sucedidas
    const successResult = await baseQuery.clone()
      .where('success', true)
      .count('* as count')
      .first();
    const successful_connections = parseInt(successResult?.count?.toString() || '0');

    // Conexões falhadas
    const failed_connections = total_connections - successful_connections;

    // Taxa de sucesso
    const success_rate = total_connections > 0 
      ? (successful_connections / total_connections) * 100 
      : 0;

    // Tempo médio de resposta
    const avgTimeResult = await baseQuery.clone()
      .whereNotNull('response_time_ms')
      .avg('response_time_ms as avg_time')
      .first();
    const average_response_time = parseFloat(avgTimeResult?.avg_time?.toString() || '0');

    // Última conexão
    const lastConnectionResult = await baseQuery.clone()
      .orderBy('created_at', 'desc')
      .select('created_at')
      .first();
    const last_connection = lastConnectionResult?.created_at || null;

    // Última conexão bem-sucedida
    const lastSuccessResult = await baseQuery.clone()
      .where('success', true)
      .orderBy('created_at', 'desc')
      .select('created_at')
      .first();
    const last_successful_connection = lastSuccessResult?.created_at || null;

    // Serviços utilizados
    const servicesResult = await baseQuery.clone()
      .distinct('service')
      .select('service');
    const services_used = servicesResult.map((row: any) => row.service);

    return {
      total_connections,
      successful_connections,
      failed_connections,
      success_rate: Math.round(success_rate * 100) / 100,
      average_response_time: Math.round(average_response_time * 100) / 100,
      last_connection,
      last_successful_connection,
      services_used
    };
  }

  async getConnectionTrends(
    awsSettingsId?: string,
    days = 7
  ): Promise<Array<{ date: string; total: number; successful: number; failed: number }>> {
    const fromDate = new Date();
    fromDate.setDate(fromDate.getDate() - days);

    let query = this.db('aws_connection_logs')
      .where('created_at', '>=', fromDate)
      .select(
        this.db.raw('DATE(created_at) as date'),
        this.db.raw('COUNT(*) as total'),
        this.db.raw('SUM(CASE WHEN success = true THEN 1 ELSE 0 END) as successful'),
        this.db.raw('SUM(CASE WHEN success = false THEN 1 ELSE 0 END) as failed')
      )
      .groupBy(this.db.raw('DATE(created_at)'))
      .orderBy('date', 'asc');

    if (awsSettingsId) {
      query = query.where('aws_settings_id', awsSettingsId);
    }

    const results = await query;

    return results.map((row: any) => ({
      date: row.date,
      total: parseInt(row.total?.toString() || '0'),
      successful: parseInt(row.successful?.toString() || '0'),
      failed: parseInt(row.failed?.toString() || '0')
    }));
  }

  async deleteOldLogs(days = 90): Promise<number> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);

    return await this.db('aws_connection_logs')
      .where('created_at', '<', cutoffDate)
      .del();
  }
} 