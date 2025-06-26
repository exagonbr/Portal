import db from '../config/database';
import crypto from 'crypto';

export interface SystemSetting {
  id: string;
  key: string;
  value: string;
  type: 'string' | 'number' | 'boolean' | 'json';
  description?: string;
  category: 'general' | 'appearance' | 'aws' | 'email' | 'notifications' | 'security';
  is_public: boolean;
  is_encrypted: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface SettingsUpdate {
  [key: string]: any;
}

class SystemSettingsService {
  private encryptionKey = process.env.SETTINGS_ENCRYPTION_KEY || 'default-key-change-in-production';

  // Criptografar valor sensível
  private encrypt(text: string): string {
    const cipher = crypto.createCipher('aes-256-cbc', this.encryptionKey);
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    return encrypted;
  }

  // Descriptografar valor sensível
  private decrypt(encryptedText: string): string {
    try {
      const decipher = crypto.createDecipher('aes-256-cbc', this.encryptionKey);
      let decrypted = decipher.update(encryptedText, 'hex', 'utf8');
      decrypted += decipher.final('utf8');
      return decrypted;
    } catch (error) {
      console.error('Erro ao descriptografar:', error);
      return encryptedText; // Retorna o valor original se não conseguir descriptografar
    }
  }

  // Converter valor para o tipo correto
  private parseValue(value: string, type: string): any {
    switch (type) {
      case 'boolean':
        return value === 'true' || value === '1';
      case 'number':
        return parseFloat(value) || 0;
      case 'json':
        try {
          return JSON.parse(value);
        } catch {
          return {};
        }
      default:
        return value;
    }
  }

  // Converter valor para string para armazenamento
  private stringifyValue(value: any): string {
    if (typeof value === 'object') {
      return JSON.stringify(value);
    }
    return String(value);
  }

  // Buscar todas as configurações
  async getAllSettings(includePrivate: boolean = false): Promise<Record<string, any>> {
    try {
      const query = db<SystemSetting>('system_settings').select('*');
      
      if (!includePrivate) {
        query.where('is_public', true);
      }

      const settings = await query.orderBy(['category', 'key']);

      const result: Record<string, any> = {};

      for (const setting of settings) {
        let value = setting.value;

        // Descriptografar se necessário
        if (setting.is_encrypted && value) {
          value = this.decrypt(value);
        }

        // Converter para o tipo correto
        const parsedValue = this.parseValue(value, setting.type);

        // Organizar por categoria
        if (!result[setting.category]) {
          result[setting.category] = {};
        }

        result[setting.category][setting.key] = parsedValue;
      }

      return result;
    } catch (error) {
      console.error('Erro ao buscar configurações:', error);
      throw new Error('Erro ao buscar configurações do sistema');
    }
  }

  // Buscar configurações por categoria
  async getSettingsByCategory(category: string, includePrivate: boolean = false): Promise<Record<string, any>> {
    try {
      const query = db<SystemSetting>('system_settings')
        .select('*')
        .where('category', category);
      
      if (!includePrivate) {
        query.where('is_public', true);
      }

      const settings = await query.orderBy('key');

      const result: Record<string, any> = {};

      for (const setting of settings) {
        let value = setting.value;

        // Descriptografar se necessário
        if (setting.is_encrypted && value) {
          value = this.decrypt(value);
        }

        // Converter para o tipo correto
        const parsedValue = this.parseValue(value, setting.type);
        result[setting.key] = parsedValue;
      }

      return result;
    } catch (error) {
      console.error('Erro ao buscar configurações por categoria:', error);
      throw new Error(`Erro ao buscar configurações da categoria ${category}`);
    }
  }

  // Buscar uma configuração específica
  async getSetting(key: string): Promise<any> {
    try {
      const setting = await db<SystemSetting>('system_settings')
        .select('*')
        .where('key', key)
        .first();

      if (!setting) {
        return null;
      }

      let value = setting.value;

      // Descriptografar se necessário
      if (setting.is_encrypted && value) {
        value = this.decrypt(value);
      }

      // Converter para o tipo correto
      return this.parseValue(value, setting.type);
    } catch (error) {
      console.error('Erro ao buscar configuração:', error);
      throw new Error(`Erro ao buscar configuração ${key}`);
    }
  }

  // Atualizar configurações
  async updateSettings(updates: SettingsUpdate): Promise<void> {
    const trx = await db.transaction();
    
    try {
      for (const [key, value] of Object.entries(updates)) {
        // Buscar configuração existente
        const existingSetting = await trx<SystemSetting>('system_settings')
          .select('*')
          .where('key', key)
          .first();

        if (!existingSetting) {
          // Se não existe, criar nova configuração
          await this.createSetting(trx, {
            key,
            value: this.stringifyValue(value),
            type: typeof value === 'object' ? 'json' : (typeof value as 'string' | 'number' | 'boolean'),
            category: 'general',
            description: `Configuração ${key}`,
            is_public: false,
            is_encrypted: false
          });
        } else {
          // Atualizar configuração existente
          let finalValue = this.stringifyValue(value);

          // Criptografar se necessário
          if (existingSetting.is_encrypted) {
            finalValue = this.encrypt(finalValue);
          }

          await trx<SystemSetting>('system_settings')
            .where('key', key)
            .update({
              value: finalValue,
              updated_at: new Date()
            });
        }
      }

      await trx.commit();
    } catch (error) {
      await trx.rollback();
      console.error('Erro ao atualizar configurações:', error);
      throw new Error('Erro ao atualizar configurações do sistema');
    }
  }

  // Criar nova configuração
  private async createSetting(trx: any, setting: Omit<SystemSetting, 'id' | 'created_at' | 'updated_at'>): Promise<void> {
    let finalValue = setting.value;

    // Criptografar se necessário
    if (setting.is_encrypted) {
      finalValue = this.encrypt(finalValue);
    }

    await trx('system_settings').insert({
      id: db.raw('gen_random_uuid()'),
      key: setting.key,
      value: finalValue,
      type: setting.type,
      description: setting.description,
      category: setting.category,
      is_public: setting.is_public,
      is_encrypted: setting.is_encrypted,
      created_at: new Date(),
      updated_at: new Date()
    });
  }

  // Deletar configuração
  async deleteSetting(key: string): Promise<void> {
    try {
      await db<SystemSetting>('system_settings')
        .where('key', key)
        .delete();
    } catch (error) {
      console.error('Erro ao deletar configuração:', error);
      throw new Error(`Erro ao deletar configuração ${key}`);
    }
  }

  // Buscar configurações formatadas para o frontend
  async getFormattedSettings(): Promise<Record<string, any>> {
    try {
      const settings = await this.getAllSettings(true);
      
      // Converter para o formato esperado pelo frontend
      const formatted: Record<string, any> = {};

      Object.entries(settings).forEach(([category, categorySettings]) => {
        Object.entries(categorySettings as Record<string, any>).forEach(([key, value]) => {
          // Usar a chave original sem modificação
          formatted[key] = value;
        });
      });

      return formatted;
    } catch (error) {
      console.error('Erro ao buscar configurações formatadas:', error);
      throw new Error('Erro ao buscar configurações formatadas');
    }
  }

  // Resetar configurações para valores padrão
  async resetToDefaults(): Promise<void> {
    const trx = await db.transaction();
    
    try {
      // Deletar todas as configurações existentes
      await trx<SystemSetting>('system_settings').delete();

      // Recriar configurações padrão (mesmo código da migração)
      const defaultSettings = [
        // Configurações Gerais
        { key: 'site_name', value: 'Portal Educacional', type: 'string', category: 'general', description: 'Nome do sistema', is_public: true },
        { key: 'site_title', value: 'Portal Educacional - Sistema de Gestão', type: 'string', category: 'general', description: 'Título do sistema', is_public: true },
        { key: 'site_url', value: 'https://portal.educacional.com', type: 'string', category: 'general', description: 'URL do sistema', is_public: true },
        { key: 'site_description', value: 'Sistema completo de gestão educacional', type: 'string', category: 'general', description: 'Descrição do sistema', is_public: true },
        { key: 'maintenance_mode', value: 'false', type: 'boolean', category: 'general', description: 'Modo de manutenção', is_public: false },
        
        // Configurações de Aparência
        { key: 'logo_light', value: '/logo-light.png', type: 'string', category: 'appearance', description: 'Logo para tema claro', is_public: true },
        { key: 'logo_dark', value: '/logo-dark.png', type: 'string', category: 'appearance', description: 'Logo para tema escuro', is_public: true },
        { key: 'background_type', value: 'video', type: 'string', category: 'appearance', description: 'Tipo de background (video, image, color)', is_public: true },
        { key: 'main_background', value: '/back_video4.mp4', type: 'string', category: 'appearance', description: 'Background principal', is_public: true },
        { key: 'primary_color', value: '#1e3a8a', type: 'string', category: 'appearance', description: 'Cor primária', is_public: true },
        { key: 'secondary_color', value: '#3b82f6', type: 'string', category: 'appearance', description: 'Cor secundária', is_public: true },
        
        // Configurações AWS
        { key: 'aws_access_key', value: 'AKIAYKBH43KYB2DJUQJL', type: 'string', category: 'aws', description: 'AWS Access Key ID', is_public: false, is_encrypted: true },
        { key: 'aws_secret_key', value: 'GXpEEWBptV5F52NprsclOgU5ziolVNsGgY0JNeC7', type: 'string', category: 'aws', description: 'AWS Secret Access Key', is_public: false, is_encrypted: true },
        { key: 'aws_region', value: 'sa-east-1', type: 'string', category: 'aws', description: 'Região AWS', is_public: false },
        { key: 'aws_bucket_main', value: '', type: 'string', category: 'aws', description: 'Bucket principal', is_public: false },
        { key: 'aws_bucket_backup', value: '', type: 'string', category: 'aws', description: 'Bucket de backup', is_public: false },
        { key: 'aws_bucket_media', value: '', type: 'string', category: 'aws', description: 'Bucket de mídia', is_public: false },
        
        // Configurações de Email
        { key: 'email_smtp_host', value: 'smtp.gmail.com', type: 'string', category: 'email', description: 'Servidor SMTP', is_public: false },
        { key: 'email_smtp_port', value: '587', type: 'number', category: 'email', description: 'Porta SMTP', is_public: false },
        { key: 'email_smtp_user', value: 'sabercon@sabercon.com.br', type: 'string', category: 'email', description: 'Usuário SMTP', is_public: false },
        { key: 'email_smtp_password', value: 'Mayta#P1730*K', type: 'string', category: 'email', description: 'Senha SMTP', is_public: false, is_encrypted: true },
        { key: 'email_smtp_secure', value: 'true', type: 'boolean', category: 'email', description: 'Usar TLS/SSL', is_public: false },
        { key: 'email_from_name', value: 'Portal Educacional - Sabercon', type: 'string', category: 'email', description: 'Nome do remetente', is_public: false },
        { key: 'email_from_address', value: 'noreply@sabercon.com.br', type: 'string', category: 'email', description: 'Email do remetente', is_public: false },
        
        // Configurações de Notificações
        { key: 'notifications_email_enabled', value: 'true', type: 'boolean', category: 'notifications', description: 'Notificações por email habilitadas', is_public: false },
        { key: 'notifications_sms_enabled', value: 'false', type: 'boolean', category: 'notifications', description: 'Notificações por SMS habilitadas', is_public: false },
        { key: 'notifications_push_enabled', value: 'true', type: 'boolean', category: 'notifications', description: 'Notificações push habilitadas', is_public: false },
        { key: 'notifications_digest_frequency', value: 'daily', type: 'string', category: 'notifications', description: 'Frequência do resumo de notificações', is_public: false },
        
        // Configurações de Segurança
        { key: 'security_min_password_length', value: '8', type: 'number', category: 'security', description: 'Tamanho mínimo da senha', is_public: false },
        { key: 'security_require_special_chars', value: 'true', type: 'boolean', category: 'security', description: 'Exigir caracteres especiais', is_public: false },
        { key: 'security_require_numbers', value: 'true', type: 'boolean', category: 'security', description: 'Exigir números', is_public: false },
        { key: 'security_session_timeout', value: '30', type: 'number', category: 'security', description: 'Timeout da sessão (minutos)', is_public: false },
        { key: 'security_two_factor_enabled', value: 'false', type: 'boolean', category: 'security', description: 'Autenticação de dois fatores habilitada', is_public: false }
      ];

      for (const setting of defaultSettings) {
        await this.createSetting(trx, setting as any);
      }

      await trx.commit();
    } catch (error) {
      await trx.rollback();
      console.error('Erro ao resetar configurações:', error);
      throw new Error('Erro ao resetar configurações para padrão');
    }
  }
}

export default new SystemSettingsService(); 