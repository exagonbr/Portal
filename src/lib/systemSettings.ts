import { connection } from '@/config/database';

export interface SystemSettings {
  site_name: string;
  site_title: string;
  site_url: string;
  site_description: string;
  maintenance_mode: boolean;
  logo_light: string;
  logo_dark: string;
  background_type: 'video' | 'image' | 'color';
  main_background: string;
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
  notifications_digest_frequency: 'realtime' | 'hourly' | 'daily' | 'weekly';
}

export interface PublicSettings {
  site_name: string;
  site_title: string;
  site_url: string;
  site_description: string;
  maintenance_mode: boolean;
  logo_light: string;
  logo_dark: string;
  background_type: 'video' | 'image' | 'color';
  main_background: string;
  primary_color: string;
  secondary_color: string;
}

// Configurações padrão
const defaultSettings: SystemSettings = {
  site_name: 'Portal Educacional',
  site_title: 'Portal Educacional - Sistema de Gestão',
  site_url: 'http://localhost:3000',
  site_description: 'Sistema completo de gestão educacional.',
  maintenance_mode: false,
  logo_light: '/logo-light.png',
  logo_dark: '/logo-dark.png',
  background_type: 'video',
  main_background: '/back_video4.mp4',
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
  notifications_digest_frequency: 'daily'
};

// Cache em memória
let cachedSettings: SystemSettings | null = null;
let lastCacheUpdate = 0;
const CACHE_TTL = 5 * 60 * 1000; // 5 minutos

// Função para converter valor baseado no tipo
function parseValue(value: string, type: string): any {
  if (!value) return null;
  
  switch (type) {
    case 'boolean':
      return value === 'true' || value === '1';
    case 'number':
      return Number(value);
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

// Função para converter valor para string
function stringifyValue(value: any): string {
  if (value === null || value === undefined) return '';
  if (typeof value === 'object') return JSON.stringify(value);
  return String(value);
}

// Carregar configurações do banco de dados
export async function loadSystemSettings(): Promise<SystemSettings> {
  try {
    // Verificar cache
    const now = Date.now();
    if (cachedSettings && (now - lastCacheUpdate) < CACHE_TTL) {
      return cachedSettings;
    }

    console.log('🔄 Carregando configurações do banco de dados...');
    
    // Buscar configurações do banco
    const dbSettings = await connection('system_settings').select('*');
    
    // Converter para objeto
    const settings: any = { ...defaultSettings };
    
    for (const setting of dbSettings) {
      const key = setting.key;
      const value = parseValue(setting.value, setting.type);
      
      if (key in settings) {
        settings[key] = value;
      }
    }

    // Atualizar cache
    cachedSettings = settings;
    lastCacheUpdate = now;
    
    console.log('✅ Configurações carregadas do banco de dados');
    return settings;
    
  } catch (error) {
    console.error('❌ Erro ao carregar configurações do banco:', error);
    
    // Retornar configurações padrão em caso de erro
    return defaultSettings;
  }
}

// Salvar configurações no banco de dados
export async function saveSystemSettings(updates: Partial<SystemSettings>): Promise<boolean> {
  try {
    console.log('💾 Salvando configurações no banco de dados...');
    
    // Usar transação para garantir consistência
    await connection.transaction(async (trx) => {
      for (const [key, value] of Object.entries(updates)) {
        const stringValue = stringifyValue(value);
        
        // Verificar se a configuração já existe
        const existing = await trx('system_settings')
          .where('key', key)
          .first();
        
        if (existing) {
          // Atualizar configuração existente
          await trx('system_settings')
            .where('key', key)
            .update({
              value: stringValue,
              updated_at: new Date()
            });
        } else {
          // Criar nova configuração
          await trx('system_settings').insert({
            key,
            value: stringValue,
            type: typeof value === 'boolean' ? 'boolean' : 
                  typeof value === 'number' ? 'number' : 'string',
            category: getCategoryForKey(key),
            is_public: isPublicKey(key),
            created_at: new Date(),
            updated_at: new Date()
          });
        }
      }
    });
    
    // Limpar cache para forçar recarregamento
    cachedSettings = null;
    
    console.log('✅ Configurações salvas no banco de dados');
    return true;
    
  } catch (error) {
    console.error('❌ Erro ao salvar configurações no banco:', error);
    return false;
  }
}

// Carregar apenas configurações públicas
export async function loadPublicSettings(): Promise<PublicSettings> {
  try {
    const allSettings = await loadSystemSettings();
    
    return {
      site_name: allSettings.site_name,
      site_title: allSettings.site_title,
      site_url: allSettings.site_url,
      site_description: allSettings.site_description,
      maintenance_mode: allSettings.maintenance_mode,
      logo_light: allSettings.logo_light,
      logo_dark: allSettings.logo_dark,
      background_type: allSettings.background_type,
      main_background: allSettings.main_background,
      primary_color: allSettings.primary_color,
      secondary_color: allSettings.secondary_color,
    };
    
  } catch (error) {
    console.error('❌ Erro ao carregar configurações públicas:', error);
    
    // Retornar configurações padrão públicas
    return {
      site_name: defaultSettings.site_name,
      site_title: defaultSettings.site_title,
      site_url: defaultSettings.site_url,
      site_description: defaultSettings.site_description,
      maintenance_mode: defaultSettings.maintenance_mode,
      logo_light: defaultSettings.logo_light,
      logo_dark: defaultSettings.logo_dark,
      background_type: defaultSettings.background_type,
      main_background: defaultSettings.main_background,
      primary_color: defaultSettings.primary_color,
      secondary_color: defaultSettings.secondary_color,
    };
  }
}

// Resetar configurações para padrão
export async function resetSystemSettings(): Promise<boolean> {
  try {
    console.log('🔄 Resetando configurações para padrão...');
    
    await connection.transaction(async (trx) => {
      // Deletar todas as configurações existentes
      await trx('system_settings').del();
      
      // Inserir configurações padrão
      const settingsToInsert = [];
      for (const [key, value] of Object.entries(defaultSettings)) {
        settingsToInsert.push({
          key,
          value: stringifyValue(value),
          type: typeof value === 'boolean' ? 'boolean' : 
                typeof value === 'number' ? 'number' : 'string',
          category: getCategoryForKey(key),
          is_public: isPublicKey(key),
          created_at: new Date(),
          updated_at: new Date()
        });
      }
      
      await trx('system_settings').insert(settingsToInsert);
    });
    
    // Limpar cache
    cachedSettings = null;
    
    console.log('✅ Configurações resetadas para padrão');
    return true;
    
  } catch (error) {
    console.error('❌ Erro ao resetar configurações:', error);
    return false;
  }
}

// Função auxiliar para determinar categoria da chave
function getCategoryForKey(key: string): string {
  if (key.startsWith('aws_')) return 'aws';
  if (key.startsWith('email_')) return 'email';
  if (key.startsWith('notifications_')) return 'notifications';
  if (key.startsWith('security_')) return 'security';
  if (['logo_light', 'logo_dark', 'background_type', 'main_background', 'primary_color', 'secondary_color'].includes(key)) {
    return 'appearance';
  }
  return 'general';
}

// Função auxiliar para determinar se uma chave é pública
function isPublicKey(key: string): boolean {
  const publicKeys = [
    'site_name', 'site_title', 'site_url', 'site_description',
    'logo_light', 'logo_dark', 'background_type', 'main_background',
    'primary_color', 'secondary_color'
  ];
  return publicKeys.includes(key);
}

// Limpar cache (útil para testes)
export function clearSettingsCache(): void {
  cachedSettings = null;
  lastCacheUpdate = 0;
} 