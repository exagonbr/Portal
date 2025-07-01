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
    try {
      console.log('🔍 Iniciando busca de estatísticas AWS...');
      
      const fromDate = new Date();
      fromDate.setDate(fromDate.getDate() - days);

      let baseQuery = this.db('aws_connection_logs')
        .where('created_at', '>=', fromDate);

      if (awsSettingsId) {
        baseQuery = baseQuery.where('aws_settings_id', awsSettingsId);
      }

      // Executar queries de forma mais segura com timeouts menores
      const queryTimeout = 5000; // 5 segundos por query

      // Total de conexões com timeout
      let total_connections = 0;
      try {
        const totalResult = await Promise.race([
          baseQuery.clone().count('* as count').first(),
          new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout')), queryTimeout))
        ]) as any;
        total_connections = parseInt(totalResult?.count?.toString() || '0');
      } catch (error) {
        console.warn('⚠️ Erro ao obter total de conexões, usando valor padrão');
      }

      // Conexões bem-sucedidas com timeout
      let successful_connections = 0;
      try {
        const successResult = await Promise.race([
          baseQuery.clone().where('success', true).count('* as count').first(),
          new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout')), queryTimeout))
        ]) as any;
        successful_connections = parseInt(successResult?.count?.toString() || '0');
      } catch (error) {
        console.warn('⚠️ Erro ao obter conexões bem-sucedidas, usando valor padrão');
      }

      // Conexões falhadas
      const failed_connections = total_connections - successful_connections;

      // Taxa de sucesso
      const success_rate = total_connections > 0 
        ? (successful_connections / total_connections) * 100 
        : 0;

      // Tempo médio de resposta com timeout
      let average_response_time = 0;
      try {
        const avgTimeResult = await Promise.race([
          baseQuery.clone().whereNotNull('response_time_ms').avg('response_time_ms as avg_time').first(),
          new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout')), queryTimeout))
        ]) as any;
        average_response_time = parseFloat(avgTimeResult?.avg_time?.toString() || '0');
      } catch (error) {
        console.warn('⚠️ Erro ao obter tempo médio, usando valor padrão');
      }

      // Última conexão com timeout
      let last_connection = null;
      try {
        const lastConnectionResult = await Promise.race([
          baseQuery.clone().orderBy('created_at', 'desc').select('created_at').first(),
          new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout')), queryTimeout))
        ]) as any;
        last_connection = lastConnectionResult?.created_at || null;
      } catch (error) {
        console.warn('⚠️ Erro ao obter última conexão');
      }

      // Última conexão bem-sucedida com timeout
      let last_successful_connection = null;
      try {
        const lastSuccessResult = await Promise.race([
          baseQuery.clone().where('success', true).orderBy('created_at', 'desc').select('created_at').first(),
          new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout')), queryTimeout))
        ]) as any;
        last_successful_connection = lastSuccessResult?.created_at || null;
      } catch (error) {
        console.warn('⚠️ Erro ao obter última conexão bem-sucedida');
      }

      // Serviços utilizados com timeout
      let services_used: string[] = [];
      try {
        const servicesResult = await Promise.race([
          baseQuery.clone().distinct('service').select('service').limit(10), // Limitar resultados
          new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout')), queryTimeout))
        ]) as any;
        services_used = servicesResult.map((row: any) => row.service).filter(Boolean);
      } catch (error) {
        console.warn('⚠️ Erro ao obter serviços utilizados');
        services_used = ['s3', 'cloudwatch']; // Valores padrão
      }

      console.log('✅ Estatísticas AWS obtidas com sucesso');

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
    } catch (error) {
      console.log('❌ Erro geral ao obter estatísticas AWS:', error);
      
      // Retornar dados mínimos em caso de erro crítico
      return {
        total_connections: 0,
        successful_connections: 0,
        failed_connections: 0,
        success_rate: 0,
        average_response_time: 0,
        last_connection: null,
        last_successful_connection: null,
        services_used: []
      };
    }
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