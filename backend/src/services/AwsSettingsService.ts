import { Knex } from 'knex';
import { AwsSettingsRepository } from '../repositories/AwsSettingsRepository';
import { AwsConnectionLogRepository } from '../repositories/AwsConnectionLogRepository';
import { 
  AwsSettings, 
  CreateAwsSettingsDto, 
  UpdateAwsSettingsDto, 
  AwsConnectionTestResult,
  CreateAwsConnectionLogDto 
} from '../types/aws';

export class AwsSettingsService {
  private awsSettingsRepo: AwsSettingsRepository;
  private connectionLogRepo: AwsConnectionLogRepository;

  constructor(db: Knex) {
    this.awsSettingsRepo = new AwsSettingsRepository(db);
    this.connectionLogRepo = new AwsConnectionLogRepository(db);
  }

  async getActiveSettings(): Promise<AwsSettings | null> {
    return await this.awsSettingsRepo.findActive();
  }

  async getSettingsById(id: string): Promise<AwsSettings | null> {
    return await this.awsSettingsRepo.findById(id);
  }

  async getAllSettings(): Promise<AwsSettings[]> {
    return await this.awsSettingsRepo.findAll();
  }

  async createSettings(data: CreateAwsSettingsDto, userId?: string): Promise<AwsSettings> {
    // Validações básicas
    this.validateSettingsData(data);

    return await this.awsSettingsRepo.create(data, userId);
  }

  async updateSettings(id: string, data: UpdateAwsSettingsDto, userId?: string): Promise<AwsSettings | null> {
    const existingSettings = await this.awsSettingsRepo.findById(id);
    if (!existingSettings) {
      throw new Error('Configurações AWS não encontradas');
    }

    // Validações básicas se houver dados para validar
    if (Object.keys(data).length > 0) {
      this.validateSettingsData(data, true);
    }

    return await this.awsSettingsRepo.update(id, data, userId);
  }

  async setActiveSettings(id: string, userId?: string): Promise<AwsSettings | null> {
    const settings = await this.awsSettingsRepo.findById(id);
    if (!settings) {
      throw new Error('Configurações AWS não encontradas');
    }

    return await this.awsSettingsRepo.setActive(id, userId);
  }

  async deleteSettings(id: string): Promise<boolean> {
    const settings = await this.awsSettingsRepo.findById(id);
    if (!settings) {
      throw new Error('Configurações AWS não encontradas');
    }

    if (settings.is_active) {
      throw new Error('Não é possível deletar configurações ativas');
    }

    return await this.awsSettingsRepo.delete(id);
  }

  async getSettingsHistory(limit = 10): Promise<AwsSettings[]> {
    return await this.awsSettingsRepo.getHistory(limit);
  }

  async testConnection(
    awsSettingsId: string, 
    userId?: string,
    userAgent?: string,
    ipAddress?: string
  ): Promise<AwsConnectionTestResult> {
    const settings = await this.awsSettingsRepo.findById(awsSettingsId);
    if (!settings) {
      throw new Error('Configurações AWS não encontradas');
    }

    const startTime = Date.now();
    let result: AwsConnectionTestResult;

    try {
      // Simular teste de conexão (em produção, usar AWS SDK real)
      result = await this.performAwsConnectionTest(settings);
    } catch (error) {
      result = {
        success: false,
        message: 'Erro inesperado durante teste de conexão',
        response_time_ms: Date.now() - startTime,
        error_details: error instanceof Error ? error.message : 'Erro desconhecido'
      };
    }

    // Registrar log da conexão
    const logData: CreateAwsConnectionLogDto = {
      aws_settings_id: awsSettingsId,
      user_id: userId,
      region: settings.region,
      service: 'connection_test',
      success: result.success,
      message: result.message,
      error_details: result.error_details,
      response_time_ms: result.response_time_ms,
      ip_address: ipAddress,
      user_agent: userAgent,
      request_metadata: {
        test_type: 'manual_connection_test',
        timestamp: new Date().toISOString()
      }
    };

    await this.connectionLogRepo.create(logData);

    return result;
  }

  private async performAwsConnectionTest(settings: AwsSettings): Promise<AwsConnectionTestResult> {
    const startTime = Date.now();
    
    // Validações básicas das credenciais
    if (!settings.access_key_id || !settings.secret_access_key) {
      return {
        success: false,
        message: 'Credenciais da AWS não configuradas',
        response_time_ms: Date.now() - startTime
      };
    }

    // Simular delay de rede
    await new Promise(resolve => setTimeout(resolve, Math.random() * 1000 + 500));

    // Simular resultado (90% de chance de sucesso)
    const success = Math.random() > 0.1;
    const response_time_ms = Date.now() - startTime;

    if (success) {
      return {
        success: true,
        message: 'Conexão com AWS estabelecida com sucesso',
        response_time_ms
      };
    } else {
      return {
        success: false,
        message: 'Falha na autenticação com AWS. Verifique suas credenciais.',
        response_time_ms,
        error_details: 'InvalidAccessKeyId: The AWS Access Key Id you provided does not exist in our records.'
      };
    }
  }

  private validateSettingsData(data: Partial<CreateAwsSettingsDto>, isUpdate = false): void {
    if (!isUpdate) {
      // Validações obrigatórias para criação
      if (!data.access_key_id) {
        throw new Error('Access Key ID é obrigatório');
      }
      if (!data.secret_access_key) {
        throw new Error('Secret Access Key é obrigatório');
      }
      if (!data.region) {
        throw new Error('Região é obrigatória');
      }
    }

    // Validações de formato
    if (data.access_key_id && data.access_key_id.length < 16) {
      throw new Error('Access Key ID deve ter pelo menos 16 caracteres');
    }

    if (data.secret_access_key && data.secret_access_key.length < 20) {
      throw new Error('Secret Access Key deve ter pelo menos 20 caracteres');
    }

    if (data.region && !/^[a-z0-9-]+$/.test(data.region)) {
      throw new Error('Região deve conter apenas letras minúsculas, números e hífens');
    }

    if (data.update_interval && (data.update_interval < 10 || data.update_interval > 300)) {
      throw new Error('Intervalo de atualização deve estar entre 10 e 300 segundos');
    }

    if (data.s3_bucket_name && !/^[a-z0-9-\.]+$/.test(data.s3_bucket_name)) {
      throw new Error('Nome do bucket S3 deve conter apenas letras minúsculas, números, hífens e pontos');
    }
  }
} 