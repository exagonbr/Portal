import { BaseRepository } from './BaseRepository';
import { AwsConnectionLog } from '../types/aws'; // Supondo que os tipos AWS estejam definidos

export interface CreateAwsConnectionLogDto extends Omit<AwsConnectionLog, 'id' | 'created_at' | 'updated_at'> {}

export class AwsConnectionLogRepository extends BaseRepository<AwsConnectionLog> {
  constructor() {
    super('aws_connection_logs');
  }

  async createLog(data: CreateAwsConnectionLogDto): Promise<AwsConnectionLog> {
    return this.create(data);
  }

  async findBySettings(awsSettingsId: string, limit: number = 50, offset: number = 0): Promise<AwsConnectionLog[]> {
    return this.db(this.tableName)
      .where({ aws_settings_id: awsSettingsId })
      .orderBy('created_at', 'desc')
      .limit(limit)
      .offset(offset);
  }

  async findByUser(userId: string, limit: number = 50, offset: number = 0): Promise<AwsConnectionLog[]> {
    return this.db(this.tableName)
      .where({ user_id: userId })
      .orderBy('created_at', 'desc')
      .limit(limit)
      .offset(offset);
  }

  async findByService(service: string, limit: number = 50, offset: number = 0): Promise<AwsConnectionLog[]> {
    return this.db(this.tableName)
      .where({ service })
      .orderBy('created_at', 'desc')
      .limit(limit)
      .offset(offset);
  }
  
  async findFailures(awsSettingsId?: string, limit: number = 50): Promise<AwsConnectionLog[]> {
    let query = this.db(this.tableName).where({ success: false });
    if (awsSettingsId) {
        query = query.andWhere({ aws_settings_id: awsSettingsId });
    }
    return query.orderBy('created_at', 'desc').limit(limit);
  }
}