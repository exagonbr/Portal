'use client'

import React, { useEffect, useRef, useState } from 'react'
import { Play, Pause, Volume2, VolumeX, Maximize, Settings } from 'lucide-react'
import useActivityTracking from '@/hooks/useActivityTracking'
import { VideoWatchingActivity } from '@/types/activity'

interface VideoPlayerWithTrackingProps {
  videoId: number
  tvShowId?: number
  videoUrl: string
  title: string
  duration?: number
  poster?: string
  quality?: string[]
  subtitles?: Array<{
    language: string
    url: string
    label: string
  }>
}

export default function VideoPlayerWithTracking({
  videoId,
  tvShowId,
  videoUrl,
  title,
  duration = 0,
  poster,
  quality = ['720p', '1080p'],
  subtitles = []
}: VideoPlayerWithTrackingProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [videoDuration, setVideoDuration] = useState(duration)
  const [volume, setVolume] = useState(1)
  const [isMuted, setIsMuted] = useState(false)
  const [playbackSpeed, setPlaybackSpeed] = useState(1)
  const [selectedQuality, setSelectedQuality] = useState(quality[0] || '720p')
  const [showControls, setShowControls] = useState(true)
  const [isFullscreen, setIsFullscreen] = useState(false)
  
  // Estado para rastreamento
  const [watchStartTime, setWatchStartTime] = useState<Date | null>(null)
  const [totalWatchTime, setTotalWatchTime] = useState(0)
  const [pauseCount, setPauseCount] = useState(0)
  const [seekCount, setSeekCount] = useState(0)
  const [lastProgressUpdate, setLastProgressUpdate] = useState(0)
  
  const {
    trackVideoStart,
    trackVideoProgress,
    trackVideoComplete,
    trackActivity
  } = useActivityTracking()

  // Inicializar vídeo e rastrear início
  useEffect(() => {
    if (videoRef.current) {
      const video = videoRef.current
      
      const handleLoadedMetadata = () => {
        setVideoDuration(video.duration)
        trackVideoStart(videoId, tvShowId)
        setWatchStartTime(new Date())
      }

      const handleTimeUpdate = () => {
        const current = video.currentTime
        setCurrentTime(current)
        
        // Atualizar progresso a cada 10 segundos
        if (current - lastProgressUpdate >= 10) {
          updateViewingProgress(current)
          setLastProgressUpdate(current)
        }
      }

      const handlePlay = () => {
        setIsPlaying(true)
        if (!watchStartTime) {
          setWatchStartTime(new Date())
        }
        
        trackActivity('video_play', {
          video_id: videoId,
          tv_show_id: tvShowId,
          current_time: video.currentTime,
          quality: selectedQuality,
          playback_speed: playbackSpeed
        })
      }

      const handlePause = () => {
        setIsPlaying(false)
        setPauseCount(prev => prev + 1)
        
        trackActivity('video_pause', {
          video_id: videoId,
          tv_show_id: tvShowId,
          current_time: video.currentTime,
          pause_count: pauseCount + 1
        })
      }

      const handleSeeked = () => {
        setSeekCount(prev => prev + 1)
        
        trackActivity('video_seek', {
          video_id: videoId,
          tv_show_id: tvShowId,
          current_time: video.currentTime,
          seek_count: seekCount + 1
        })
      }

      const handleEnded = () => {
        setIsPlaying(false)
        const finalWatchTime = calculateTotalWatchTime()
        
        trackVideoComplete(videoId, finalWatchTime)
        
        // Marcar como completo
        updateViewingProgress(video.duration, true)
      }

      video.addEventListener('loadedmetadata', handleLoadedMetadata)
      video.addEventListener('timeupdate', handleTimeUpdate)
      video.addEventListener('play', handlePlay)
      video.addEventListener('pause', handlePause)
      video.addEventListener('seeked', handleSeeked)
      video.addEventListener('ended', handleEnded)

      return () => {
        video.removeEventListener('loadedmetadata', handleLoadedMetadata)
        video.removeEventListener('timeupdate', handleTimeUpdate)
        video.removeEventListener('play', handlePlay)
        video.removeEventListener('pause', handlePause)
        video.removeEventListener('seeked', handleSeeked)
        video.removeEventListener('ended', handleEnded)
      }
    }
  }, [videoId, tvShowId, selectedQuality, playbackSpeed])

  // Salvar progresso quando o componente for desmontado
  useEffect(() => {
    return () => {
      if (currentTime > 0) {
        updateViewingProgress(currentTime)
      }
    }
  }, [])

  const calculateTotalWatchTime = (): number => {
    if (!watchStartTime) return totalWatchTime
    
    const now = new Date()
    const sessionTime = (now.getTime() - watchStartTime.getTime()) / 1000
    return totalWatchTime + sessionTime
  }

  const updateViewingProgress = (position: number, completed: boolean = false) => {
    const completionPercentage = videoDuration > 0 ? (position / videoDuration) * 100 : 0
    
    const watchData: Partial<VideoWatchingActivity> = {
      tv_show_id: tvShowId,
      duration_watched_seconds: Math.floor(position),
      total_duration_seconds: Math.floor(videoDuration),
      completion_percentage: Math.round(completionPercentage),
      quality: selectedQuality,
      playback_speed: playbackSpeed,
      pauses_count: pauseCount,
      seeks_count: seekCount,
      completed: completed || completionPercentage >= 90 // Considerar completo se assistiu 90%+
    }

    trackVideoProgress(videoId, watchData)
  }

  const togglePlayPause = () => {
    if (!videoRef.current) return

    if (isPlaying) {
      videoRef.current.pause()
    } else {
      videoRef.current.play()
    }
  }

  const handleVolumeChange = (newVolume: number) => {
    if (!videoRef.current) return
    
    setVolume(newVolume)
    videoRef.current.volume = newVolume
    setIsMuted(newVolume === 0)
  }

  const toggleMute = () => {
    if (!videoRef.current) return
    
    const newMuted = !isMuted
    setIsMuted(newMuted)
    videoRef.current.muted = newMuted
  }

  const handleSeek = (newTime: number) => {
    if (!videoRef.current) return
    
    videoRef.current.currentTime = newTime
    setCurrentTime(newTime)
  }

  const changePlaybackSpeed = (speed: number) => {
    if (!videoRef.current) return
    
    setPlaybackSpeed(speed)
    videoRef.current.playbackRate = speed
    
    trackActivity('settings_change', {
      video_id: videoId,
      setting: 'playback_speed',
      value: speed
    })
  }

  const changeQuality = (newQuality: string) => {
    const currentTime = videoRef.current?.currentTime || 0
    setSelectedQuality(newQuality)
    
    // Em uma implementação real, você mudaria a fonte do vídeo aqui
    // e depois restauraria o tempo atual
    
    trackActivity('settings_change', {
      video_id: videoId,
      setting: 'quality',
      value: newQuality
    })
  }

  const toggleFullscreen = () => {
    if (!videoRef.current) return

    if (!isFullscreen) {
      if (videoRef.current.requestFullscreen) {
        videoRef.current.requestFullscreen()
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen()
      }
    }
    setIsFullscreen(!isFullscreen)
  }

  const formatTime = (time: number): string => {
    const minutes = Math.floor(time / 60)
    const seconds = Math.floor(time % 60)
    return `${minutes}:${seconds.toString().padStart(2, '0')}`
  }

  const progressPercentage = videoDuration > 0 ? (currentTime / videoDuration) * 100 : 0

  return (
    <div className="relative bg-black rounded-lg overflow-hidden group">
      {/* Vídeo */}
      <video
        ref={videoRef}
        src={videoUrl}
        poster={poster}
        className="w-full h-auto"
        onClick={togglePlayPause}
        onMouseEnter={() => setShowControls(true)}
        onMouseLeave={() => setShowControls(false)}
      />

      {/* Overlay de controles */}
      {showControls && (
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          {/* Título do vídeo */}
          <div className="absolute top-4 left-4 right-4">
            <h3 className="text-white text-lg font-semibold truncate">
              {title}
            </h3>
          </div>

          {/* Controles principais */}
          <div className="absolute bottom-0 left-0 right-0 p-4">
            {/* Barra de progresso */}
            <div className="mb-4">
              <div className="relative h-1 bg-white/30 rounded-full cursor-pointer">
                <div 
                  className="absolute h-full bg-blue-500 rounded-full"
                  style={{ width: `${progressPercentage}%` }}
                />
                <input
                  type="range"
                  min="0"
                  max={videoDuration}
                  value={currentTime}
                  onChange={(e) => handleSeek(Number(e.target.value))}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
              </div>
            </div>

            {/* Controles de reprodução */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                {/* Play/Pause */}
                <button
                  onClick={togglePlayPause}
                  className="text-white hover:text-blue-400 transition-colors"
                >
                  {isPlaying ? (
                    <Pause className="w-8 h-8" />
                  ) : (
                    <Play className="w-8 h-8" />
                  )}
                </button>

                {/* Volume */}
                <div className="flex items-center space-x-2">
                  <button
                    onClick={toggleMute}
                    className="text-white hover:text-blue-400 transition-colors"
                  >
                    {isMuted || volume === 0 ? (
                      <VolumeX className="w-6 h-6" />
                    ) : (
                      <Volume2 className="w-6 h-6" />
                    )}
                  </button>
                  
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.1"
                    value={volume}
                    onChange={(e) => handleVolumeChange(Number(e.target.value))}
                    className="w-16 h-1 bg-white/30 rounded-full appearance-none cursor-pointer"
                  />
                </div>

                {/* Tempo */}
                <span className="text-white text-sm">
                  {formatTime(currentTime)} / {formatTime(videoDuration)}
                </span>
              </div>

              <div className="flex items-center space-x-4">
                {/* Velocidade de reprodução */}
                <select
                  value={playbackSpeed}
                  onChange={(e) => changePlaybackSpeed(Number(e.target.value))}
                  className="bg-black/50 text-white text-sm rounded px-2 py-1 border border-white/30"
                >
                  <option value={0.5}>0.5x</option>
                  <option value={0.75}>0.75x</option>
                  <option value={1}>1x</option>
                  <option value={1.25}>1.25x</option>
                  <option value={1.5}>1.5x</option>
                  <option value={2}>2x</option>
                </select>

                {/* Qualidade */}
                <select
                  value={selectedQuality}
                  onChange={(e) => changeQuality(e.target.value)}
                  className="bg-black/50 text-white text-sm rounded px-2 py-1 border border-white/30"
                >
                  {quality.map(q => (
                    <option key={q} value={q}>{q}</option>
                  ))}
                </select>

                {/* Tela cheia */}
                <button
                  onClick={toggleFullscreen}
                  className="text-white hover:text-blue-400 transition-colors"
                >
                  <Maximize className="w-6 h-6" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Indicador de carregamento */}
      {!isPlaying && currentTime === 0 && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="bg-black/50 rounded-full p-4">
            <Play className="w-12 h-12 text-white" />
          </div>
        </div>
      )}
    </div>
  )
} 