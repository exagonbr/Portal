import { Knex } from 'knex';
import { AwsSettings, CreateAwsSettingsDto, UpdateAwsSettingsDto } from '../types/aws';

export class AwsSettingsRepository {
  constructor(private db: Knex) {}

  async findActive(): Promise<AwsSettings | null> {
    const result = await this.db('aws_settings')
      .where('is_active', true)
      .orderBy('created_at', 'desc')
      .first();
    
    return result || null;
  }

  async findById(id: string): Promise<AwsSettings | null> {
    const result = await this.db('aws_settings')
      .where('id', id)
      .first();
    
    return result || null;
  }

  async findAll(): Promise<AwsSettings[]> {
    return await this.db('aws_settings')
      .orderBy('created_at', 'desc');
  }

  async create(data: CreateAwsSettingsDto, userId?: string): Promise<AwsSettings> {
    // Primeiro, desativar todas as configurações existentes
    await this.db('aws_settings')
      .update({ 
        is_active: false, 
        updated_at: new Date(),
        updated_by: userId 
      });

    const settingsData = {
      ...data,
      cloudwatch_namespace: data.cloudwatch_namespace || 'Portal/Metrics',
      update_interval: data.update_interval || 30,
      enable_real_time_updates: data.enable_real_time_updates ?? true,
      is_active: true,
      created_by: userId,
      updated_by: userId,
      created_at: new Date(),
      updated_at: new Date()
    };

    const [settings] = await this.db('aws_settings')
      .insert(settingsData)
      .returning('*');

    return settings;
  }

  async update(id: string, data: UpdateAwsSettingsDto, userId?: string): Promise<AwsSettings | null> {
    const updateData = {
      ...data,
      updated_by: userId,
      updated_at: new Date()
    };

    const [settings] = await this.db('aws_settings')
      .where('id', id)
      .update(updateData)
      .returning('*');

    return settings || null;
  }

  async setActive(id: string, userId?: string): Promise<AwsSettings | null> {
    // Primeiro, desativar todas as configurações
    await this.db('aws_settings')
      .update({ 
        is_active: false, 
        updated_at: new Date(),
        updated_by: userId 
      });

    // Ativar a configuração específica
    const [settings] = await this.db('aws_settings')
      .where('id', id)
      .update({ 
        is_active: true, 
        updated_at: new Date(),
        updated_by: userId 
      })
      .returning('*');

    return settings || null;
  }

  async delete(id: string): Promise<boolean> {
    const deletedCount = await this.db('aws_settings')
      .where('id', id)
      .del();

    return deletedCount > 0;
  }

  async getHistory(limit = 10): Promise<AwsSettings[]> {
    return await this.db('aws_settings')
      .select('*')
      .orderBy('created_at', 'desc')
      .limit(limit);
  }
} 