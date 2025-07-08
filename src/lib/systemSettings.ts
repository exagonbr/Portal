import { getSafeConnection } from './database-safe';

export interface SystemSettings {
  site_name: string;
  site_title: string;
  site_url: string;
  site_description: string;
  maintenance_mode: boolean;
  logo_light: string;
  logo_dark: string;
  background_type: 'video' | 'video_random' | 'video_url' | 'image' | 'color';
  main_background: string;
  background_video_url: string;
  random_video_enabled: boolean;
  primary_color: string;
  secondary_color: string;
  aws_access_key: string;
  aws_secret_key: string;
  aws_region: string;
  aws_bucket_main: string;
  aws_bucket_backup: string;
  aws_bucket_media: string;
  email_smtp_host: string;
  email_smtp_port: number;
  email_smtp_user: string;
  email_smtp_password: string;
  email_smtp_secure: boolean;
  email_from_name: string;
  email_from_address: string;
  notifications_email_enabled: boolean;
  notifications_sms_enabled: boolean;
  notifications_push_enabled: boolean;
  notifications_digest_frequency: string;
}

export interface PublicSettings {
  site_name: string;
  site_title: string;
  site_url: string;
  site_description: string;
  maintenance_mode: boolean;
  logo_light: string;
  logo_dark: string;
  background_type: 'video' | 'video_random' | 'video_url' | 'image' | 'color';
  main_background: string;
  background_video_url: string;
  random_video_enabled: boolean;
  primary_color: string;
  secondary_color: string;
}

// Configurações padrão
const defaultSettings: SystemSettings = {
  site_name: 'Portal Educacional',
  site_title: 'Portal Educacional - Sistema de Gestão',
  site_url: 'http://localhost:3000',
  site_description: 'Sistema completo de gestão educacional',
  maintenance_mode: false,
  logo_light: '/logo-light.png',
  logo_dark: '/logo-dark.png',
  background_type: 'video',
  main_background: '/back_video4.mp4',
  background_video_url: '',
  random_video_enabled: false,
  primary_color: '#1e3a8a',
  secondary_color: '#3b82f6',
  aws_access_key: '',
  aws_secret_key: '',
  aws_region: 'sa-east-1',
  aws_bucket_main: '',
  aws_bucket_backup: '',
  aws_bucket_media: '',
  email_smtp_host: '',
  email_smtp_port: 587,
  email_smtp_user: '',
  email_smtp_password: '',
  email_smtp_secure: true,
  email_from_name: '',
  email_from_address: '',
  notifications_email_enabled: false,
  notifications_sms_enabled: false,
  notifications_push_enabled: false,
  notifications_digest_frequency: 'daily',
};

// Função para converter valor do banco para tipo correto
function convertValue(value: string, type: string): any {
  switch (type) {
    case 'boolean':
      return value === 'true';
    case 'number':
      return parseInt(value);
    case 'json':
      try {
        return JSON.parse(value);
      } catch {
        return value;
      }
    default:
      return value;
  }
}

// Função para converter valor para string do banco
function convertToString(value: any): string {
  if (typeof value === 'boolean') {
    return value ? 'true' : 'false';
  }
  if (typeof value === 'number') {
    return value.toString();
  }
  if (typeof value === 'object') {
    return JSON.stringify(value);
  }
  return String(value);
}

// Carregar configurações do sistema
export async function loadSystemSettings(): Promise<SystemSettings> {
  try {
    const connection = await getSafeConnection();
    const settings = await connection('system_settings').select('key', 'value', 'type');
    
    const result: any = { ...defaultSettings };
    
    settings.forEach((setting: any) => {
      if (setting.key in result) {
        result[setting.key] = convertValue(setting.value, setting.type);
      }
    });
    
    return result as SystemSettings;
  } catch (error) {
    return defaultSettings;
  }
}

// Carregar apenas configurações públicas
export async function loadPublicSettings(): Promise<PublicSettings> {
  try {
    const connection = await getSafeConnection();
    const settings = await connection('system_settings')
      .select('key', 'value', 'type')
      .where('is_public', true);
    
    const result: any = {};
    
    // Adicionar configurações padrão públicas
    const publicKeys: (keyof PublicSettings)[] = [
      'site_name', 'site_title', 'site_url', 'site_description', 'maintenance_mode',
      'logo_light', 'logo_dark', 'background_type', 'main_background', 
      'background_video_url', 'primary_color', 'secondary_color', 'random_video_enabled'
    ];
    
    publicKeys.forEach(key => {
      result[key] = defaultSettings[key];
    });
    
    // Sobrescrever com valores do banco
    settings.forEach((setting: any) => {
      if (setting.key in result) {
        result[setting.key] = convertValue(setting.value, setting.type);
      }
    });
    
    return result as PublicSettings;
  } catch (error) {
    // Retornar configurações padrão públicas
    const publicDefaults: PublicSettings = {
      site_name: defaultSettings.site_name,
      site_title: defaultSettings.site_title,
      site_url: defaultSettings.site_url,
      site_description: defaultSettings.site_description,
      maintenance_mode: defaultSettings.maintenance_mode,
      logo_light: defaultSettings.logo_light,
      logo_dark: defaultSettings.logo_dark,
      background_type: defaultSettings.background_type,
      main_background: defaultSettings.main_background,
      background_video_url: defaultSettings.background_video_url,
      random_video_enabled: defaultSettings.random_video_enabled,
      primary_color: defaultSettings.primary_color,
      secondary_color: defaultSettings.secondary_color,
    };
    return publicDefaults;
  }
}

// Salvar configurações do sistema
export async function saveSystemSettings(settings: Partial<SystemSettings>): Promise<boolean> {
  try {
    const connection = await getSafeConnection();
    const settingsToSave = Object.entries(settings);
    
    for (const [key, value] of settingsToSave) {
      const stringValue = convertToString(value);
      
      // Verificar se a configuração já existe
      const existingSetting = await connection('system_settings')
        .where('key', key)
        .first();
      
      if (existingSetting) {
        // Atualizar configuração existente
        await connection('system_settings')
          .where('key', key)
          .update({
            value: stringValue,
            updated_at: new Date()
          });
      } else {
        // Inserir nova configuração
        const type = typeof value === 'boolean' ? 'boolean' : 
                    typeof value === 'number' ? 'number' : 'string';
        
        await connection('system_settings').insert({
          key,
          value: stringValue,
          type,
          category: 'general',
          is_public: ['site_name', 'site_title', 'site_url', 'site_description', 
                     'logo_light', 'logo_dark', 'background_type', 'main_background',
                     'background_video_url', 'primary_color', 'secondary_color', 
                     'random_video_enabled'].includes(key),
          created_at: new Date(),
          updated_at: new Date()
        });
      }
    }
    
    return true;
  } catch (error) {
    console.error('❌ Erro em saveSystemSettings:', error);
    console.error('Stack trace:', error instanceof Error ? error.stack : 'N/A');
    // Propagar o erro em vez de retornar false silenciosamente
    throw error;
  }
}

// Resetar configurações para o padrão
export async function resetSystemSettings(): Promise<boolean> {
  try {
    const connection = await getSafeConnection();
    for (const [key, value] of Object.entries(defaultSettings)) {
      const stringValue = convertToString(value);
      
      await connection('system_settings')
        .where('key', key)
        .update({
          value: stringValue,
          updated_at: new Date()
        });
    }
    
    return true;
  } catch (error) {
    return false;
  }
} 