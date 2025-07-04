import { BaseRepository } from './BaseRepository';
import { AwsSettings } from '../types/aws'; // Supondo que os tipos AWS estejam definidos

export interface CreateAwsSettingsDto extends Omit<AwsSettings, 'id' | 'created_at' | 'updated_at' | 'created_by' | 'updated_by'> {}
export interface UpdateAwsSettingsDto extends Partial<CreateAwsSettingsDto> {}

export class AwsSettingsRepository extends BaseRepository<AwsSettings> {
  constructor() {
    super('aws_settings');
  }

  async findActive(): Promise<AwsSettings | null> {
    return this.findOne({ is_active: true } as Partial<AwsSettings>);
  }

  async createSettings(data: CreateAwsSettingsDto, userId: string): Promise<AwsSettings> {
    // Desativa outras configurações ativas
    await this.db(this.tableName).where({ is_active: true }).update({ is_active: false });
    
    const settingsData = {
        ...data,
        is_active: true,
        created_by: userId,
        updated_by: userId,
    };
    return this.create(settingsData);
  }

  async updateSettings(id: string, data: UpdateAwsSettingsDto, userId: string): Promise<AwsSettings | null> {
    const updateData = {
        ...data,
        updated_by: userId,
    };
    return this.update(id, updateData);
  }

  async setActive(id: string, userId: string): Promise<AwsSettings | null> {
    await this.db(this.tableName).where({ is_active: true }).update({ is_active: false, updated_by: userId });
    return this.update(id, { is_active: true, updated_by: userId } as Partial<AwsSettings>);
  }
}