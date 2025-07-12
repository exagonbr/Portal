'use client'

import React, { useState, useEffect } from 'react'
import { useSystemSettings } from '@/hooks/useSystemSettings'
import { usePublicSettings } from '@/hooks/usePublicSettings'

interface DynamicBackgroundProps {
  className?: string
  children?: React.ReactNode
  overlay?: boolean
  overlayOpacity?: number
  usePublic?: boolean
}

export default function DynamicBackground({
  className = '',
  children,
  overlay = true,
  overlayOpacity = 0.5,
  usePublic = false
}: DynamicBackgroundProps) {
  // Usar hook público ou privado baseado na prop
  const systemHook = useSystemSettings()
  const publicHook = usePublicSettings()
  
  const { settings, loading } = usePublic ? publicHook : systemHook
  const [backgroundStyle, setBackgroundStyle] = useState<React.CSSProperties>({})
  const [randomVideo, setRandomVideo] = useState<string | null>(null)
  const [availableVideos, setAvailableVideos] = useState<string[]>([])

  // Pré-carregar vídeo padrão imediatamente
  useEffect(() => {
    const preloadDefaultVideo = () => {
      const video = document.createElement('video')
      video.preload = 'auto'
      video.src = '/back_video4.mp4'
      video.load()
      console.log('🎥 Pré-carregando vídeo padrão')
    }
    
    preloadDefaultVideo()
  }, [])

  useEffect(() => {
    if (loading || !settings) return

    const { background_type, main_background, primary_color } = settings

    let style: React.CSSProperties = {}

    switch (background_type) {
      case 'video':
        // Para vídeo, não definimos background aqui, será renderizado como elemento
        style = {
          position: 'relative',
          overflow: 'hidden'
        }
        break
      
      case 'image':
        style = {
          backgroundImage: `url(${main_background})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          backgroundAttachment: 'fixed'
        }
        break
      
      case 'color':
        style = {
          backgroundColor: main_background || primary_color || '#1e3a8a'
        }
        break
      
      default:
        style = {
          backgroundColor: primary_color || '#1e3a8a'
        }
    }

    setBackgroundStyle(style)
  }, [settings, loading])

  // Função para buscar vídeos disponíveis
  const fetchAvailableVideos = async () => {
    try {
      const response = await fetch('/api/admin/system/available-videos');
      if (!response.ok) {
        throw new Error('Erro ao carregar vídeos');
      }
      
      const data = await response.json();
      
      if (data.success && Array.isArray(data.videos) && data.videos.length > 0) {
        setAvailableVideos(data.videos);
        return data.videos;
      } else {
        // Fallback para vídeos padrão
        const fallbackVideos = [
          '/back_video.mp4',
          '/back_video1.mp4',
          '/back_video2.mp4',
          '/back_video3.mp4',
          '/back_video4.mp4'
        ];
        setAvailableVideos(fallbackVideos);
        return fallbackVideos;
      }
    } catch (error) {
      console.error('Erro ao carregar vídeos disponíveis:', error);
      // Fallback para vídeos padrão
      const fallbackVideos = [
        '/back_video.mp4',
        '/back_video1.mp4',
        '/back_video2.mp4',
        '/back_video3.mp4',
        '/back_video4.mp4'
      ];
      setAvailableVideos(fallbackVideos);
      return fallbackVideos;
    }
  };

  // Função para selecionar vídeo aleatório
  const selectRandomVideo = (videosList: string[]) => {
    if (videosList.length === 0) {
      setRandomVideo('/back_video4.mp4');
      return;
    }
    
    // Selecionar um vídeo aleatório diferente do atual se possível
    let randomIndex = Math.floor(Math.random() * videosList.length);
    let selectedVideo = videosList[randomIndex];
    
    // Se há mais de um vídeo e o selecionado é igual ao atual, tentar outro
    if (videosList.length > 1 && selectedVideo === randomVideo) {
      // Tentar até 5 vezes para encontrar um vídeo diferente
      for (let i = 0; i < 5; i++) {
        randomIndex = Math.floor(Math.random() * videosList.length);
        selectedVideo = videosList[randomIndex];
        if (selectedVideo !== randomVideo) {
          break;
        }
      }
    }
    
    console.log('🎲 Vídeo aleatório selecionado:', selectedVideo);
    setRandomVideo(selectedVideo);
  };

  // Carregar vídeos disponíveis e selecionar aleatório quando necessário
  useEffect(() => {
    if (settings?.random_video_enabled && settings?.background_type === 'video') {
      console.log('🎲 Modo vídeo aleatório ativado, carregando vídeos...');
      fetchAvailableVideos().then(videos => {
        selectRandomVideo(videos);
      });
    } else if (settings?.background_type === 'video' && !settings?.random_video_enabled) {
      // Limpar vídeo aleatório se não estiver no modo aleatório
      setRandomVideo(null);
    }
  }, [settings?.random_video_enabled, settings?.background_type]);

  // Forçar nova seleção aleatória a cada vez que o componente é montado (nova página/reload)
  useEffect(() => {
    if (settings?.random_video_enabled && settings?.background_type === 'video' && availableVideos.length > 0) {
      // Remover delay para carregamento mais rápido
      selectRandomVideo(availableVideos);
    }
  }, [availableVideos.length]); // Depende apenas do comprimento para evitar loops

  const renderVideoBackground = () => {
    // Sempre renderizar vídeo se não há configuração específica contra
    if (settings?.background_type && settings?.background_type !== 'video') {
      return null
    }

    // Determinar a fonte do vídeo baseado no tipo e configurações
    let videoSource = settings?.main_background || '/back_video4.mp4'; // Fallback imediato
    
    // Se o modo aleatório estiver ativado, usar o vídeo aleatório
    if (settings?.random_video_enabled && randomVideo) {
      videoSource = randomVideo;
      console.log('🎥 Usando vídeo aleatório:', videoSource);
    } else if (settings?.main_background) {
      console.log('🎥 Usando vídeo configurado:', videoSource);
    } else {
      console.log('🎥 Usando vídeo padrão:', videoSource);
    }

    return (
      <video
        key={videoSource} // Força re-render quando o vídeo muda
        autoPlay
        muted
        loop
        playsInline
        preload="auto"
        className="absolute inset-0 w-full h-full object-cover z-0"
        style={{ minWidth: '100%', minHeight: '100%' }}
        onLoadStart={() => console.log('🎥 Vídeo começou a carregar:', videoSource)}
        onCanPlay={() => console.log('🎥 Vídeo pronto para reproduzir:', videoSource)}
        onError={(e) => console.error('🎥 Erro ao carregar vídeo:', videoSource, e)}
      >
        <source src={videoSource} type="video/mp4" />
        {/* Fallback para navegadores que não suportam o vídeo */}
        <div 
          className="absolute inset-0 w-full h-full"
          style={{ 
            backgroundColor: settings.primary_color || '#1e3a8a' 
          }} 
        />
      </video>
    )
  }

  const renderOverlay = () => {
    if (!overlay) return null

    return (
      <div 
        className="absolute inset-0 z-10"
        style={{
          backgroundColor: `rgba(0, 0, 0, ${overlayOpacity})`,
          backdropFilter: 'blur(1px)'
        }}
      />
    )
  }

  // Não bloquear renderização durante loading - mostrar vídeo padrão
  if (loading) {
    return (
      <div className={`relative ${className}`} style={{ backgroundColor: '#1e3a8a' }}>
        {/* Renderizar vídeo padrão mesmo durante loading */}
        <video
          autoPlay
          muted
          loop
          playsInline
          preload="auto"
          className="absolute inset-0 w-full h-full object-cover z-0"
          style={{ minWidth: '100%', minHeight: '100%' }}
        >
          <source src="/back_video4.mp4" type="video/mp4" />
        </video>
        {overlay && renderOverlay()}
        <div className="relative z-20">
          {children}
        </div>
      </div>
    )
  }

  return (
    <div 
      className={`relative ${className}`}
      style={backgroundStyle}
    >
      {/* Renderizar vídeo de fundo se necessário */}
      {renderVideoBackground()}
      
      {/* Overlay opcional */}
      {renderOverlay()}
      
      {/* Conteúdo */}
      <div className="relative z-20">
        {children}
      </div>
    </div>
  )
}

// Hook para usar apenas as configurações de background
export function useBackgroundSettings(usePublic = false) {
  const systemHook = useSystemSettings()
  const publicHook = usePublicSettings()
  
  const { settings, loading } = usePublic ? publicHook : systemHook
  
  return {
    backgroundType: settings?.background_type || 'video',
    backgroundValue: settings?.main_background || '/back_video4.mp4',
    primaryColor: settings?.primary_color || '#1e3a8a',
    secondaryColor: settings?.secondary_color || '#3b82f6',
    randomVideoEnabled: settings?.random_video_enabled || false,
    loading
  }
}

// Componente simplificado para usar em páginas de login
export function LoginBackground({ children, className = '' }: { children: React.ReactNode, className?: string }) {
  return (
    <DynamicBackground
      className={`min-h-screen flex items-center justify-center ${className}`}
      overlay={true}
      overlayOpacity={0.6}
      usePublic={true}
    >
      {children}
    </DynamicBackground>
  )
}

// Componente para dashboard com overlay mais sutil
export function DashboardBackground({ children, className = '' }: { children: React.ReactNode, className?: string }) {
  return (
    <DynamicBackground 
      className={`min-h-screen ${className}`}
      overlay={true}
      overlayOpacity={0.3}
    >
      {children}
    </DynamicBackground>
  )
} 