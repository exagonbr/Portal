'use client'

import { useEffect, useState } from 'react'
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

  // Carregar vídeos disponíveis para vídeo aleatório
  useEffect(() => {
    if (settings?.random_video_enabled && settings?.background_type === 'video') {
      fetchAvailableVideos();
    }
  }, [settings?.random_video_enabled, settings?.background_type]);

  // Função para buscar vídeos disponíveis
  const fetchAvailableVideos = async () => {
    try {
      const response = await fetch('/api/admin/system/available-videos');
      if (!response.ok) {
        throw new Error('Erro ao carregar vídeos');
      }
      
      const data = await response.json();
      
      if (data.success && Array.isArray(data.videos) && data.videos.length > 0) {
        // Selecionar um vídeo aleatório
        const randomIndex = Math.floor(Math.random() * data.videos.length);
        setRandomVideo(data.videos[randomIndex]);
      }
    } catch (error) {
      console.error('Erro ao carregar vídeos aleatórios:', error);
      // Fallback para um vídeo padrão
      setRandomVideo('/back_video.mp4');
    }
  };

  const renderVideoBackground = () => {
    if ((!settings?.background_type || (settings?.background_type !== 'video' && settings?.background_type !== 'video_url' && settings?.background_type !== 'video_random'))) {
      return null
    }

    // Determinar a fonte do vídeo baseado no tipo
    let videoSource = settings.main_background;
    if (settings.background_type === 'video_url') {
      videoSource = settings.background_video_url;
    } else if (settings.background_type === 'video_random') {
      videoSource = randomVideo || '/back_video.mp4';
    }

    if (!videoSource) return null;

    return (
      <video
        autoPlay
        muted
        loop
        playsInline
        className="absolute inset-0 w-full h-full object-cover z-0"
        style={{ minWidth: '100%', minHeight: '100%' }}
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

  if (loading) {
    return (
      <div className={`relative ${className}`} style={{ backgroundColor: '#1e3a8a' }}>
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