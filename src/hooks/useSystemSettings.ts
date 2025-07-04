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
  site_name: 'Portal Educacional (Desacoplado)',
  site_title: 'Portal Educacional - Sistema de Gestão',
  site_url: 'http://localhost:3000',
  site_description: 'Sistema em modo desacoplado.',
  maintenance_mode: false,
  logo_light: '/logo-light.png',
  logo_dark: '/logo-dark.png',
  background_type: 'video',
  main_background: '/back_video4.mp4',
  primary_color: '#1e3a8a',
  secondary_color: '#3b82f6',
  aws_access_key: '',
  aws_secret_key: '',
  aws_region: '',
  aws_bucket_main: '',
  aws_bucket_backup: '',
  aws_bucket_media: '',
  email_smtp_host: '',
  email_smtp_port: 0,
  email_smtp_user: '',
  email_smtp_password: '',
  email_smtp_secure: false,
  email_from_name: '',
  email_from_address: '',
  notifications_email_enabled: false,
  notifications_sms_enabled: false,
  notifications_push_enabled: false,
  notifications_digest_frequency: 'daily'
};

export function useSystemSettings() {
  const [settings, setSettings] = useState<FullSystemSettings>(defaultFullSettings);
  const [loading, setLoading] = useState(false); // Nunca está carregando em modo mock
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [availableVideos, setAvailableVideos] = useState<string[]>([]);

  const loadSettings = useCallback(async (forceReload = false) => {
    console.warn("useSystemSettings: A busca de configurações está desativada em modo desacoplado. Usando valores padrão.");
    setSettings(defaultFullSettings);
  }, []);

  useEffect(() => {
    loadSettings();
    setAvailableVideos([
      '/back_video.mp4',
      '/back_video1.mp4',
      '/back_video2.mp4',
      '/back_video3.mp4',
      '/back_video4.mp4'
    ]);
  }, [loadSettings]);

  const updateSettings = (newSettings: Partial<FullSystemSettings>) => {
    console.warn("useSystemSettings: A atualização de configurações está desativada.");
    // Não faz nada para evitar mudanças inesperadas
  };

  const saveSettings = async (newSettings: Partial<FullSystemSettings>): Promise<boolean> => {
    console.error("saveSettings não está disponível em modo desacoplado.");
    setError("Função indisponível em modo desacoplado.");
    return false;
  };

  const testAwsConnection = async (credentials: any): Promise<any> => {
    console.error("testAwsConnection não está disponível em modo desacoplado.");
    return { success: false, message: "Função indisponível." };
  };

  const testEmailConnection = async (emailConfig: any): Promise<any> => {
    console.error("testEmailConnection não está disponível em modo desacoplado.");
    return { success: false, message: "Função indisponível." };
  };

  const resetSettings = async () => {
    console.error("resetSettings não está disponível em modo desacoplado.");
    return false;
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
    updateLoginBackground: (bg: any) => console.warn("updateLoginBackground desativado."),
    resetSettings,
    loadSettings,
    isLoading: loading,
    availableVideos,
    getRandomVideo
  };
}
