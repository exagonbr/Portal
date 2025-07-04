import { useState, useEffect, useCallback } from 'react';

// Interfaces permanecem as mesmas para manter a compatibilidade
export interface BackgroundSettings {
  type: 'video' | 'image' | 'color';
  value: string;
  opacity?: number;
  overlay?: boolean;
}

export interface FullSystemSettings {
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

const defaultFullSettings: FullSystemSettings = {
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

export function useSystemSettings() {
  const [settings, setSettings] = useState<FullSystemSettings>(defaultFullSettings);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [availableVideos, setAvailableVideos] = useState<string[]>([]);

  const loadSettings = useCallback(async (forceReload = false) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/admin/system/settings', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include'
      });

      const data = await response.json();
      
      if (data.success && data.settings) {
        // Se recebemos configurações limitadas ou públicas, mesclar com os padrões
        if (data.isPublic || data.isLimited) {
          setSettings({
            ...defaultFullSettings,
            ...data.settings
          });
        } else {
          // Configurações completas para admin
          setSettings(data.settings);
        }
      } else {
        // Se não houver configurações no servidor, usar padrões
        setSettings(defaultFullSettings);
      }
    } catch (err) {
      console.error('Erro ao carregar configurações:', err);
      // Em caso de erro, usar configurações padrão
      setSettings(defaultFullSettings);
      // Não mostrar erro para usuários não autenticados
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadSettings();
    // Lista de vídeos disponíveis
    setAvailableVideos([
      '/back_video.mp4',
      '/back_video1.mp4',
      '/back_video2.mp4',
      '/back_video3.mp4',
      '/back_video4.mp4'
    ]);
  }, [loadSettings]);

  const updateSettings = (newSettings: Partial<FullSystemSettings>) => {
    setSettings(prev => ({
      ...prev,
      ...newSettings
    }));
  };

  const saveSettings = async (newSettings: Partial<FullSystemSettings>): Promise<boolean> => {
    setSaving(true);
    setError(null);
    
    try {
      const response = await fetch('/api/admin/system/settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(newSettings)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Erro ao salvar configurações');
      }

      if (data.success) {
        // Atualizar configurações locais com os dados salvos
        if (data.settings) {
          setSettings(data.settings);
        }
        return true;
      } else {
        throw new Error(data.error || 'Erro ao salvar configurações');
      }
    } catch (err: any) {
      console.error('Erro ao salvar configurações:', err);
      setError(err.message || 'Erro ao salvar configurações');
      return false;
    } finally {
      setSaving(false);
    }
  };

  const testAwsConnection = async (credentials: {
    accessKeyId: string;
    secretAccessKey: string;
    region: string;
  }): Promise<any> => {
    try {
      const response = await fetch('/api/admin/system/test-aws', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(credentials)
      });

      const data = await response.json();
      return data;
    } catch (err) {
      console.error('Erro ao testar conexão AWS:', err);
      return { 
        success: false, 
        message: 'Erro ao testar conexão com AWS' 
      };
    }
  };

  const testEmailConnection = async (emailConfig: {
    host: string;
    port: number;
    user: string;
    password: string;
    secure: boolean;
    fromAddress: string;
  }): Promise<any> => {
    try {
      const response = await fetch('/api/admin/system/test-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(emailConfig)
      });

      const data = await response.json();
      return data;
    } catch (err) {
      console.error('Erro ao testar conexão de email:', err);
      return { 
        success: false, 
        message: 'Erro ao testar conexão de email' 
      };
    }
  };

  const resetSettings = async (): Promise<boolean> => {
    setSaving(true);
    setError(null);
    
    try {
      const response = await fetch('/api/admin/system/settings/reset', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include'
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Erro ao resetar configurações');
      }

      if (data.success) {
        // Recarregar configurações após reset
        await loadSettings(true);
        return true;
      } else {
        throw new Error(data.error || 'Erro ao resetar configurações');
      }
    } catch (err: any) {
      console.error('Erro ao resetar configurações:', err);
      setError(err.message || 'Erro ao resetar configurações');
      return false;
    } finally {
      setSaving(false);
    }
  };
  
  const getRandomVideo = () => {
    if (availableVideos.length === 0) return '/back_video4.mp4';
    const randomIndex = Math.floor(Math.random() * availableVideos.length);
    return availableVideos[randomIndex];
  };

  return {
    settings,
    loading,
    saving,
    error,
    saveSettings,
    testAwsConnection,
    testEmailConnection,
    updateSettings,
    updateLoginBackground: (bg: BackgroundSettings) => {
      updateSettings({ 
        background_type: bg.type,
        main_background: bg.value 
      });
    },
    resetSettings,
    loadSettings,
    isLoading: loading,
    availableVideos,
    getRandomVideo
  };
}
