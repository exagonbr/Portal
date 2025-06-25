'use client';

import { useState, useEffect } from 'react';

interface VideoData {
  id: string;
  title: string;
  video_url: string;
  thumbnail_url?: string;
  duration?: string;
  description?: string;
  episode_number?: number;
  module_number?: number;
  episode_code?: string;
  created_at?: string;
}

interface VideoSource {
  id: string;
  title: string;
  url: string;
  type: 'mp4' | 'youtube' | 'vimeo' | 'direct';
  thumbnail?: string;
  duration?: string;
  description?: string;
  episode_number?: number;
}

interface UseVideosByShowResult {
  videos: VideoSource[];
  groupedVideos: Record<string, VideoSource[]>;
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

export function useVideosByShow(showId: number | string): UseVideosByShowResult {
  const [videos, setVideos] = useState<VideoSource[]>([]);
  const [groupedVideos, setGroupedVideos] = useState<Record<string, VideoSource[]>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const detectVideoType = (url: string): 'mp4' | 'youtube' | 'vimeo' | 'direct' => {
    if (!url) return 'direct';
    
    if (url.includes('youtube.com') || url.includes('youtu.be')) {
      return 'youtube';
    }
    
    if (url.includes('vimeo.com')) {
      return 'vimeo';
    }
    
    if (url.endsWith('.mp4') || url.includes('.mp4')) {
      return 'mp4';
    }
    
    return 'direct';
  };

  const transformVideoData = (videoData: VideoData): VideoSource => {
    return {
      id: videoData.id,
      title: videoData.title,
      url: videoData.video_url,
      type: detectVideoType(videoData.video_url),
      thumbnail: videoData.thumbnail_url,
      duration: videoData.duration,
      description: videoData.description,
      episode_number: videoData.episode_number
    };
  };

  const fetchVideos = async () => {
    if (!showId) {
      setError('ID do show é obrigatório');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Buscar vídeos do show específico
      const response = await fetch(`/api/tv-shows/${showId}/modules`);
      
      if (!response.ok) {
        throw new Error(`Erro ao buscar vídeos: ${response.status}`);
      }

      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.message || 'Erro ao buscar vídeos');
      }

      const moduleGroups = result.data || {};
      
      // Transformar os dados agrupados em uma lista plana de vídeos
      const allVideos: VideoSource[] = [];
      const transformedGroups: Record<string, VideoSource[]> = {};

      Object.entries(moduleGroups).forEach(([moduleKey, moduleVideos]) => {
        const videos = (moduleVideos as VideoData[]).map(transformVideoData);
        transformedGroups[moduleKey] = videos;
        allVideos.push(...videos);
      });

      // Ordenar vídeos por número do episódio
      allVideos.sort((a, b) => {
        const aEpisode = a.episode_number || 0;
        const bEpisode = b.episode_number || 0;
        return aEpisode - bEpisode;
      });

      setVideos(allVideos);
      setGroupedVideos(transformedGroups);

    } catch (err) {
      console.error('Erro ao buscar vídeos:', err);
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
    groupedVideos,
    loading,
    error,
    refetch: fetchVideos
  };
}

// Hook alternativo para buscar vídeos de um módulo específico
export function useVideosByModule(showId: number | string, moduleKey: string): UseVideosByShowResult {
  const { videos, groupedVideos, loading, error, refetch } = useVideosByShow(showId);
  
  const moduleVideos = groupedVideos[moduleKey] || [];
  
  return {
    videos: moduleVideos,
    groupedVideos: { [moduleKey]: moduleVideos },
    loading,
    error,
    refetch
  };
}

// Hook para buscar um vídeo específico por ID
export function useVideoById(videoId: string) {
  const [video, setVideo] = useState<VideoSource | null>(null);
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
        setVideo(transformVideoData(videoData));

      } catch (err) {
        console.error('Erro ao buscar vídeo:', err);
        setError(err instanceof Error ? err.message : 'Erro desconhecido');
      } finally {
        setLoading(false);
      }
    };

    fetchVideo();
  }, [videoId]);

  const transformVideoData = (videoData: VideoData): VideoSource => {
    return {
      id: videoData.id,
      title: videoData.title,
      url: videoData.video_url,
      type: detectVideoType(videoData.video_url),
      thumbnail: videoData.thumbnail_url,
      duration: videoData.duration,
      description: videoData.description,
      episode_number: videoData.episode_number
    };
  };

  const detectVideoType = (url: string): 'mp4' | 'youtube' | 'vimeo' | 'direct' => {
    if (!url) return 'direct';
    
    if (url.includes('youtube.com') || url.includes('youtu.be')) {
      return 'youtube';
    }
    
    if (url.includes('vimeo.com')) {
      return 'vimeo';
    }
    
    if (url.endsWith('.mp4') || url.includes('.mp4')) {
      return 'mp4';
    }
    
    return 'direct';
  };

  return { video, loading, error };
}