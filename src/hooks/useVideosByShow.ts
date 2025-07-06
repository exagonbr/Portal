'use client';

import { useState, useEffect } from 'react';

interface VideoData {
  id: number;
  title: string;
  description: string;
  video_url?: string;
  thumbnail_url?: string;
  duration?: number;
  module_number?: number;
  session_number?: number;
  episode_number?: number;
  is_active?: boolean;
  // Campos para controle de legendas
  label?: string;
  is_default?: boolean;
  has_subtitles?: boolean;
  alternative_versions?: {
    id: string | number;
    title?: string;
    url: string;
    thumbnail?: string;
    duration?: string | number;
    description?: string;
    episode_number?: number;
    label?: string;
    is_default?: boolean;
  }[];
}

interface ModuleData {
  [key: string]: VideoData[];
}

interface UseVideosByShowReturn {
  videos: VideoData[];
  modules: ModuleData;
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

export const useVideosByShow = (showId: number | null): UseVideosByShowReturn => {
  const [videos, setVideos] = useState<VideoData[]>([]);
  const [modules, setModules] = useState<ModuleData>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchVideos = async () => {
    if (!showId) {
      setVideos([]);
      setModules({});
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Buscar vídeos individuais
      const videosResponse = await fetch(`/api/tv-shows/${showId}/videos`);
      if (!videosResponse.ok) {
        throw new Error('Erro ao carregar vídeos');
      }
      const videosData = await videosResponse.json();
      
      if (videosData.success) {
        setVideos(videosData.data || []);
      }

      // Buscar módulos agrupados
      const modulesResponse = await fetch(`/api/tv-shows/${showId}/videos/grouped`);
      if (!modulesResponse.ok) {
        throw new Error('Erro ao carregar módulos');
      }
      const modulesData = await modulesResponse.json();
      
      if (modulesData.success) {
        setModules(modulesData.data || {});
      }

    } catch (err) {
      console.log('Erro ao buscar vídeos:', err);
      setError(err instanceof Error ? err.message : 'Erro desconhecido');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVideos();
  }, [showId]);

  return {
    videos,
    modules,
    loading,
    error,
    refetch: fetchVideos
  };
};

// Hook alternativo para buscar vídeos de um módulo específico
export function useVideosByModule(showId: number | string, moduleKey: string): UseVideosByShowReturn {
  const { videos, modules, loading, error, refetch } = useVideosByShow(typeof showId === 'string' ? parseInt(showId) : showId);
  
  const moduleVideos = modules[moduleKey] || [];
  
  return {
    videos: moduleVideos,
    modules,
    loading,
    error,
    refetch
  };
}

// Hook para buscar um vídeo específico por ID
export function useVideoById(videoId: string) {
  const [video, setVideo] = useState<VideoData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!videoId) {
      setError('ID do vídeo é obrigatório');
      setLoading(false);
      return;
    }

    const fetchVideo = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch(`/api/tv-shows/videos/${videoId}`);
        
        if (!response.ok) {
          throw new Error(`Erro ao buscar vídeo: ${response.status}`);
        }

        const result = await response.json();
        
        if (!result.success) {
          throw new Error(result.message || 'Erro ao buscar vídeo');
        }

        const videoData = result.data as VideoData;
        setVideo(videoData);

      } catch (err) {
        console.log('Erro ao buscar vídeo:', err);
        setError(err instanceof Error ? err.message : 'Erro desconhecido');
      } finally {
        setLoading(false);
      }
    };

    fetchVideo();
  }, [videoId]);

  return { video, loading, error };
}