import { useState, useEffect, useCallback } from 'react';

export interface PublicSettings {
  site_name: string;
  site_title: string;
  site_url: string;
  site_description: string;
  maintenance_mode: boolean;
  logo_light: string;
  logo_dark: string;
  background_type: 'video' | 'video_url' | 'image' | 'color';
  main_background: string;
  background_video_url: string;
  primary_color: string;
  secondary_color: string;
}

const defaultPublicSettings: PublicSettings = {
  site_name: 'Portal Educacional',
  site_title: 'Portal Educacional - Sistema de Gestão',
  site_url: 'http://localhost:3000',
  site_description: 'Sistema completo de gestão educacional.',
  maintenance_mode: false,
  logo_light: '/logo-light.png',
  logo_dark: '/logo-dark.png',
  background_type: 'video',
  main_background: '/back_video4.mp4',
  background_video_url: '',
  primary_color: '#1e3a8a',
  secondary_color: '#3b82f6',
};

export function usePublicSettings() {
  const [settings, setSettings] = useState<PublicSettings>(defaultPublicSettings);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadSettings = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/public/settings', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        // Não precisa de credentials para rota pública
      });

      const data = await response.json();
      
      if (data.success && data.settings) {
        setSettings(data.settings);
      } else {
        // Se não houver configurações no servidor, usar padrões
        setSettings(defaultPublicSettings);
      }
    } catch (err) {
      console.error('Erro ao carregar configurações públicas:', err);
      // Em caso de erro, usar configurações padrão
      setSettings(defaultPublicSettings);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadSettings();
  }, [loadSettings]);

  const getRandomVideo = () => {
    const availableVideos = [
      '/back_video.mp4',
      '/back_video1.mp4',
      '/back_video2.mp4',
      '/back_video3.mp4',
      '/back_video4.mp4',
      '/back_video5.mp4',
      '/back_video6.mp4',
      '/back_video7.mp4',
      '/back_video8.mp4',
      '/back_video9.mp4',
      '/back_video10.mp4',
      '/back_video11.mp4',
      '/back_video12.mp4',
      '/back_video13.mp4',
      '/back_video14.mp4',
      '/back_video15.mp4',
      '/back_video16.mp4'
    ];
    const randomIndex = Math.floor(Math.random() * availableVideos.length);
    return availableVideos[randomIndex];
  };

  return {
    settings,
    loading,
    error,
    loadSettings,
    getRandomVideo
  };
}