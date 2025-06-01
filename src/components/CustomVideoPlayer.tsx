'use client';

import React, { useRef, useState, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import {
  PlayIcon,
  PauseIcon,
  SpeakerWaveIcon,
  SpeakerXMarkIcon,
  ArrowsPointingOutIcon,
  ArrowsPointingInIcon,
  ForwardIcon,
  BackwardIcon,
  Cog6ToothIcon,
  XMarkIcon,
  BookmarkIcon,
  PencilIcon,
  StarIcon,
  ShareIcon,
  AdjustmentsHorizontalIcon,
  LanguageIcon,
  ClockIcon
} from '@heroicons/react/24/outline';
import {
  PlayIcon as PlaySolidIcon,
  PauseIcon as PauseSolidIcon,
  StarIcon as StarSolidIcon
} from '@heroicons/react/24/solid';

interface VideoSource {
  src: string;
  type: 'video/mp4' | 'video/webm' | 'video/ogg' | 'youtube' | 'vimeo';
  quality?: '360p' | '480p' | '720p' | '1080p' | '4K';
  label?: string;
}

interface Subtitle {
  language: string;
  label: string;
  src: string;
  default?: boolean;
}

interface VideoNote {
  id: string;
  timestamp: number;
  content: string;
  createdAt: Date;
}

interface CustomVideoPlayerProps {
  videoId: string;
  title: string;
  sources: VideoSource[];
  subtitles?: Subtitle[];
  autoplay?: boolean;
  thumbnail?: string;
  duration?: number;
  currentProgress?: number;
  onProgress?: (progress: number) => void;
  onComplete?: () => void;
  onClose: () => void;
  allowNotes?: boolean;
  allowBookmarks?: boolean;
  allowRating?: boolean;
  allowSharing?: boolean;
  customControls?: boolean;
}

interface PlaybackSettings {
  quality: string;
  speed: number;
  subtitles: string;
  volume: number;
}

export default function CustomVideoPlayer({
  videoId,
  title,
  sources,
  subtitles = [],
  autoplay = false,
  thumbnail,
  duration = 0,
  currentProgress = 0,
  onProgress,
  onComplete,
  onClose,
  allowNotes = true,
  allowBookmarks = true,
  allowRating = true,
  allowSharing = true,
  customControls = true
}: CustomVideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const progressRef = useRef<HTMLDivElement>(null);
  
  // Player state
  const [isPlaying, setIsPlaying] = useState(autoplay);
  const [currentTime, setCurrentTime] = useState(0);
  const [videoDuration, setVideoDuration] = useState(duration);
  const [volume, setVolume] = useState(1);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [isBuffering, setIsBuffering] = useState(false);
  const [mounted, setMounted] = useState(false);
  
  // Settings state
  const [settings, setSettings] = useState<PlaybackSettings>({
    quality: 'auto',
    speed: 1,
    subtitles: 'off',
    volume: 100
  });
  
  // Notes and interactions
  const [notes, setNotes] = useState<VideoNote[]>([]);
  const [isAddingNote, setIsAddingNote] = useState(false);
  const [noteContent, setNoteContent] = useState('');
  const [bookmarks, setBookmarks] = useState<number[]>([]);
  const [rating, setRating] = useState(0);
  const [sidePanel, setSidePanel] = useState<'notes' | 'settings' | 'info' | null>(null);

  // Video source selection
  const [currentSource, setCurrentSource] = useState(0);
  
  useEffect(() => {
    setMounted(true);
    document.body.style.overflow = 'hidden';
    
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, []);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!videoRef.current) return;
      
      switch (e.key) {
        case 'Escape':
          onClose();
          break;
        case ' ':
          e.preventDefault();
          togglePlay();
          break;
        case 'ArrowLeft':
          e.preventDefault();
          skipBackward();
          break;
        case 'ArrowRight':
          e.preventDefault();
          skipForward();
          break;
        case 'ArrowUp':
          e.preventDefault();
          adjustVolume(0.1);
          break;
        case 'ArrowDown':
          e.preventDefault();
          adjustVolume(-0.1);
          break;
        case 'f':
          e.preventDefault();
          toggleFullscreen();
          break;
        case 'm':
          e.preventDefault();
          toggleMute();
          break;
        case 'n':
          if (allowNotes) {
            e.preventDefault();
            addNote();
          }
          break;
        case 'b':
          if (allowBookmarks) {
            e.preventDefault();
            toggleBookmark();
          }
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose, allowNotes, allowBookmarks]);

  // Auto-hide controls
  useEffect(() => {
    let timeout: NodeJS.Timeout;
    
    const hideControls = () => {
      setShowControls(false);
    };
    
    const showControlsHandler = () => {
      setShowControls(true);
      clearTimeout(timeout);
      timeout = setTimeout(hideControls, 3000);
    };
    
    if (isPlaying && !isSettingsOpen && sidePanel === null) {
      timeout = setTimeout(hideControls, 3000);
    }
    
    const container = containerRef.current;
    if (container) {
      container.addEventListener('mousemove', showControlsHandler);
      container.addEventListener('touchstart', showControlsHandler);
    }
    
    return () => {
      clearTimeout(timeout);
      if (container) {
        container.removeEventListener('mousemove', showControlsHandler);
        container.removeEventListener('touchstart', showControlsHandler);
      }
    };
  }, [isPlaying, isSettingsOpen, sidePanel]);

  // Video event handlers
  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      setVideoDuration(videoRef.current.duration);
      if (currentProgress > 0) {
        videoRef.current.currentTime = (currentProgress / 100) * videoRef.current.duration;
      }
    }
  };

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      const current = videoRef.current.currentTime;
      setCurrentTime(current);
      
      if (onProgress && videoDuration > 0) {
        const progress = (current / videoDuration) * 100;
        onProgress(progress);
      }
    }
  };

  const handleEnded = () => {
    setIsPlaying(false);
    if (onComplete) {
      onComplete();
    }
  };

  const handleWaiting = () => setIsBuffering(true);
  const handleCanPlay = () => setIsBuffering(false);

  // Control functions
  const togglePlay = useCallback(() => {
    if (!videoRef.current) return;
    
    if (isPlaying) {
      videoRef.current.pause();
    } else {
      videoRef.current.play();
    }
    setIsPlaying(!isPlaying);
  }, [isPlaying]);

  const skipForward = () => {
    if (videoRef.current) {
      videoRef.current.currentTime = Math.min(
        videoRef.current.currentTime + 10,
        videoDuration
      );
    }
  };

  const skipBackward = () => {
    if (videoRef.current) {
      videoRef.current.currentTime = Math.max(
        videoRef.current.currentTime - 10,
        0
      );
    }
  };

  const adjustVolume = (delta: number) => {
    if (videoRef.current) {
      const newVolume = Math.max(0, Math.min(1, volume + delta));
      setVolume(newVolume);
      videoRef.current.volume = newVolume;
      setSettings(prev => ({ ...prev, volume: newVolume * 100 }));
    }
  };

  const toggleMute = () => {
    if (videoRef.current) {
      if (volume > 0) {
        videoRef.current.volume = 0;
        setVolume(0);
      } else {
        videoRef.current.volume = settings.volume / 100;
        setVolume(settings.volume / 100);
      }
    }
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  const seekTo = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!videoRef.current || !progressRef.current) return;
    
    const rect = progressRef.current.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const percentage = clickX / rect.width;
    const newTime = percentage * videoDuration;
    
    videoRef.current.currentTime = newTime;
    setCurrentTime(newTime);
  };

  const changePlaybackSpeed = (speed: number) => {
    if (videoRef.current) {
      videoRef.current.playbackRate = speed;
      setSettings(prev => ({ ...prev, speed }));
    }
  };

  const changeQuality = (quality: string) => {
    if (quality === 'auto') {
      setCurrentSource(0);
    } else {
      const sourceIndex = sources.findIndex(source => source.quality === quality);
      if (sourceIndex !== -1) {
        setCurrentSource(sourceIndex);
      }
    }
    setSettings(prev => ({ ...prev, quality }));
  };

  // Notes functionality
  const addNote = () => {
    setIsAddingNote(true);
    setSidePanel('notes');
  };

  const saveNote = () => {
    if (noteContent.trim()) {
      const newNote: VideoNote = {
        id: Date.now().toString(),
        timestamp: currentTime,
        content: noteContent.trim(),
        createdAt: new Date()
      };
      setNotes(prev => [...prev, newNote]);
      setNoteContent('');
      setIsAddingNote(false);
    }
  };

  const deleteNote = (noteId: string) => {
    setNotes(prev => prev.filter(note => note.id !== noteId));
  };

  const jumpToNote = (timestamp: number) => {
    if (videoRef.current) {
      videoRef.current.currentTime = timestamp;
      setCurrentTime(timestamp);
    }
  };

  // Bookmarks functionality
  const toggleBookmark = () => {
    const isBookmarked = bookmarks.includes(currentTime);
    if (isBookmarked) {
      setBookmarks(prev => prev.filter(time => time !== currentTime));
    } else {
      setBookmarks(prev => [...prev, currentTime].sort((a, b) => a - b));
    }
  };

  const jumpToBookmark = (timestamp: number) => {
    if (videoRef.current) {
      videoRef.current.currentTime = timestamp;
      setCurrentTime(timestamp);
    }
  };

  // Time formatting
  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  if (!mounted) {
    return null;
  }

  // Render settings panel
  const renderSettingsPanel = () => (
    <div className="w-full lg:w-80 bg-gray-900 text-white flex flex-col">
      <div className="p-4 border-b border-gray-700">
        <h3 className="text-lg font-semibold">Configurações</h3>
      </div>
      
      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {/* Qualidade */}
        <div>
          <h4 className="text-sm font-medium mb-3">Qualidade</h4>
          <div className="space-y-2">
            {['auto', ...sources.map(s => s.quality).filter(Boolean)].map(quality => (
              <button
                key={quality}
                onClick={() => changeQuality(quality!)}
                className={`w-full text-left px-3 py-2 rounded text-sm ${
                  settings.quality === quality
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-800 hover:bg-gray-700'
                }`}
              >
                {quality === 'auto' ? 'Automático' : quality}
              </button>
            ))}
          </div>
        </div>

        {/* Velocidade */}
        <div>
          <h4 className="text-sm font-medium mb-3">Velocidade de Reprodução</h4>
          <div className="space-y-2">
            {[0.5, 0.75, 1, 1.25, 1.5, 2].map(speed => (
              <button
                key={speed}
                onClick={() => changePlaybackSpeed(speed)}
                className={`w-full text-left px-3 py-2 rounded text-sm ${
                  settings.speed === speed
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-800 hover:bg-gray-700'
                }`}
              >
                {speed}x
              </button>
            ))}
          </div>
        </div>

        {/* Legendas */}
        {subtitles.length > 0 && (
          <div>
            <h4 className="text-sm font-medium mb-3">Legendas</h4>
            <div className="space-y-2">
              <button
                onClick={() => setSettings(prev => ({ ...prev, subtitles: 'off' }))}
                className={`w-full text-left px-3 py-2 rounded text-sm ${
                  settings.subtitles === 'off'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-800 hover:bg-gray-700'
                }`}
              >
                Desligado
              </button>
              {subtitles.map(subtitle => (
                <button
                  key={subtitle.language}
                  onClick={() => setSettings(prev => ({ ...prev, subtitles: subtitle.language }))}
                  className={`w-full text-left px-3 py-2 rounded text-sm ${
                    settings.subtitles === subtitle.language
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-800 hover:bg-gray-700'
                  }`}
                >
                  {subtitle.label}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );

  // Render notes panel
  const renderNotesPanel = () => (
    <div className="w-full lg:w-80 bg-gray-900 text-white flex flex-col">
      <div className="p-4 border-b border-gray-700">
        <h3 className="text-lg font-semibold">Anotações</h3>
      </div>
      
      <div className="flex-1 overflow-y-auto">
        {/* Add note form */}
        {isAddingNote && (
          <div className="p-4 border-b border-gray-700">
            <textarea
              value={noteContent}
              onChange={(e) => setNoteContent(e.target.value)}
              placeholder="Digite sua anotação..."
              className="w-full h-20 p-2 bg-gray-800 border border-gray-600 rounded text-sm resize-none"
              autoFocus
            />
            <div className="flex gap-2 mt-2">
              <button
                onClick={saveNote}
                className="px-3 py-1 bg-blue-600 hover:bg-blue-700 rounded text-sm"
              >
                Salvar
              </button>
              <button
                onClick={() => {
                  setIsAddingNote(false);
                  setNoteContent('');
                }}
                className="px-3 py-1 bg-gray-600 hover:bg-gray-700 rounded text-sm"
              >
                Cancelar
              </button>
            </div>
          </div>
        )}

        {/* Notes list */}
        <div className="p-4 space-y-3">
          {notes.map(note => (
            <div key={note.id} className="bg-gray-800 p-3 rounded">
              <div className="flex items-center justify-between mb-2">
                <button
                  onClick={() => jumpToNote(note.timestamp)}
                  className="text-blue-400 hover:text-blue-300 text-sm font-medium"
                >
                  {formatTime(note.timestamp)}
                </button>
                <button
                  onClick={() => deleteNote(note.id)}
                  className="text-red-400 hover:text-red-300"
                >
                  <XMarkIcon className="w-4 h-4" />
                </button>
              </div>
              <p className="text-sm text-gray-300">{note.content}</p>
            </div>
          ))}
          
          {notes.length === 0 && !isAddingNote && (
            <p className="text-gray-500 text-sm text-center py-8">
              Nenhuma anotação ainda. Clique no botão de anotação para adicionar uma.
            </p>
          )}
        </div>
      </div>
      
      <div className="p-4 border-t border-gray-700">
        <button
          onClick={addNote}
          className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded text-sm font-medium"
        >
          <PencilIcon className="w-4 h-4" />
          Nova Anotação
        </button>
      </div>
    </div>
  );

  // Render info panel
  const renderInfoPanel = () => (
    <div className="w-full lg:w-80 bg-gray-900 text-white flex flex-col">
      <div className="p-4 border-b border-gray-700">
        <h3 className="text-lg font-semibold">Informações</h3>
      </div>
      
      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {/* Video info */}
        <div>
          <h4 className="text-sm font-medium mb-2">Título</h4>
          <p className="text-sm text-gray-300">{title}</p>
        </div>
        
        <div>
          <h4 className="text-sm font-medium mb-2">Duração</h4>
          <p className="text-sm text-gray-300">{formatTime(videoDuration)}</p>
        </div>

        {/* Rating */}
        {allowRating && (
          <div>
            <h4 className="text-sm font-medium mb-3">Avaliação</h4>
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map(star => (
                <button
                  key={star}
                  onClick={() => setRating(star)}
                  className="text-yellow-400 hover:text-yellow-300"
                >
                  {star <= rating ? (
                    <StarSolidIcon className="w-5 h-5" />
                  ) : (
                    <StarIcon className="w-5 h-5" />
                  )}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Bookmarks */}
        {allowBookmarks && bookmarks.length > 0 && (
          <div>
            <h4 className="text-sm font-medium mb-3">Marcadores</h4>
            <div className="space-y-2">
              {bookmarks.map(timestamp => (
                <button
                  key={timestamp}
                  onClick={() => jumpToBookmark(timestamp)}
                  className="w-full text-left px-3 py-2 bg-gray-800 hover:bg-gray-700 rounded text-sm"
                >
                  {formatTime(timestamp)}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Share */}
        {allowSharing && (
          <div>
            <button className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 rounded text-sm font-medium">
              <ShareIcon className="w-4 h-4" />
              Compartilhar
            </button>
          </div>
        )}
      </div>
    </div>
  );

  return createPortal(
    <div
      ref={containerRef}
      className="fixed inset-0 z-[99999] bg-black"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <div className="flex h-full">
        {/* Main video area */}
        <div className="flex-1 relative">
          {/* Video element */}
          <video
            ref={videoRef}
            className="w-full h-full object-contain"
            src={sources[currentSource]?.src}
            poster={thumbnail}
            onLoadedMetadata={handleLoadedMetadata}
            onTimeUpdate={handleTimeUpdate}
            onEnded={handleEnded}
            onWaiting={handleWaiting}
            onCanPlay={handleCanPlay}
            autoPlay={autoplay}
          >
            {subtitles.map(subtitle => (
              <track
                key={subtitle.language}
                kind="subtitles"
                src={subtitle.src}
                srcLang={subtitle.language}
                label={subtitle.label}
                default={subtitle.default}
              />
            ))}
          </video>

          {/* Buffering indicator */}
          {isBuffering && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/50">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-white"></div>
            </div>
          )}

          {/* Controls overlay */}
          {(showControls || !isPlaying) && customControls && (
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/30">
              {/* Top controls */}
              <div className="absolute top-0 left-0 right-0 p-4 flex items-center justify-between">
                <h1 className="text-white text-lg font-medium truncate max-w-md">
                  {title}
                </h1>
                <button
                  onClick={onClose}
                  className="text-white hover:text-gray-300 p-2"
                >
                  <XMarkIcon className="w-6 h-6" />
                </button>
              </div>

              {/* Center play button */}
              {!isPlaying && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <button
                    onClick={togglePlay}
                    className="w-20 h-20 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center transition-all"
                  >
                    <PlaySolidIcon className="w-10 h-10 text-white ml-1" />
                  </button>
                </div>
              )}

              {/* Bottom controls */}
              <div className="absolute bottom-0 left-0 right-0 p-4">
                {/* Progress bar */}
                <div
                  ref={progressRef}
                  className="w-full h-1 bg-white/30 rounded-full cursor-pointer mb-4"
                  onClick={seekTo}
                >
                  <div
                    className="h-full bg-blue-500 rounded-full relative"
                    style={{ width: `${(currentTime / videoDuration) * 100}%` }}
                  >
                    <div className="absolute right-0 top-1/2 transform -translate-y-1/2 w-3 h-3 bg-blue-500 rounded-full opacity-0 hover:opacity-100 transition-opacity"></div>
                  </div>
                  
                  {/* Bookmarks on progress bar */}
                  {bookmarks.map(timestamp => (
                    <div
                      key={timestamp}
                      className="absolute top-0 w-1 h-full bg-yellow-400 transform -translate-x-1/2"
                      style={{ left: `${(timestamp / videoDuration) * 100}%` }}
                    />
                  ))}
                </div>

                {/* Control buttons */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    {/* Play/Pause */}
                    <button
                      onClick={togglePlay}
                      className="text-white hover:text-gray-300"
                    >
                      {isPlaying ? (
                        <PauseSolidIcon className="w-8 h-8" />
                      ) : (
                        <PlaySolidIcon className="w-8 h-8" />
                      )}
                    </button>

                    {/* Skip buttons */}
                    <button
                      onClick={skipBackward}
                      className="text-white hover:text-gray-300"
                    >
                      <BackwardIcon className="w-6 h-6" />
                    </button>
                    <button
                      onClick={skipForward}
                      className="text-white hover:text-gray-300"
                    >
                      <ForwardIcon className="w-6 h-6" />
                    </button>

                    {/* Volume */}
                    <div className="flex items-center gap-2">
                      <button
                        onClick={toggleMute}
                        className="text-white hover:text-gray-300"
                      >
                        {volume > 0 ? (
                          <SpeakerWaveIcon className="w-6 h-6" />
                        ) : (
                          <SpeakerXMarkIcon className="w-6 h-6" />
                        )}
                      </button>
                      <input
                        type="range"
                        min="0"
                        max="1"
                        step="0.1"
                        value={volume}
                        onChange={(e) => {
                          const newVolume = parseFloat(e.target.value);
                          setVolume(newVolume);
                          if (videoRef.current) {
                            videoRef.current.volume = newVolume;
                          }
                        }}
                        className="w-20 accent-blue-500"
                      />
                    </div>

                    {/* Time display */}
                    <span className="text-white text-sm">
                      {formatTime(currentTime)} / {formatTime(videoDuration)}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    {/* Interactive buttons */}
                    {allowBookmarks && (
                      <button
                        onClick={toggleBookmark}
                        className={`p-2 rounded ${
                          bookmarks.includes(Math.floor(currentTime))
                            ? 'text-yellow-400'
                            : 'text-white hover:text-gray-300'
                        }`}
                        title="Adicionar marcador"
                      >
                        <BookmarkIcon className="w-5 h-5" />
                      </button>
                    )}

                    {allowNotes && (
                      <button
                        onClick={addNote}
                        className="text-white hover:text-gray-300 p-2 rounded"
                        title="Adicionar anotação"
                      >
                        <PencilIcon className="w-5 h-5" />
                      </button>
                    )}

                    {/* Settings */}
                    <button
                      onClick={() => {
                        setSidePanel(sidePanel === 'settings' ? null : 'settings');
                        setIsSettingsOpen(!isSettingsOpen);
                      }}
                      className="text-white hover:text-gray-300 p-2 rounded"
                    >
                      <Cog6ToothIcon className="w-5 h-5" />
                    </button>

                    {/* Info */}
                    <button
                      onClick={() => setSidePanel(sidePanel === 'info' ? null : 'info')}
                      className="text-white hover:text-gray-300 p-2 rounded"
                    >
                      <AdjustmentsHorizontalIcon className="w-5 h-5" />
                    </button>

                    {/* Fullscreen */}
                    <button
                      onClick={toggleFullscreen}
                      className="text-white hover:text-gray-300 p-2 rounded"
                    >
                      {isFullscreen ? (
                        <ArrowsPointingInIcon className="w-5 h-5" />
                      ) : (
                        <ArrowsPointingOutIcon className="w-5 h-5" />
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Side panel */}
        {sidePanel && (
          <div className="border-l border-gray-700">
            {sidePanel === 'settings' && renderSettingsPanel()}
            {sidePanel === 'notes' && renderNotesPanel()}
            {sidePanel === 'info' && renderInfoPanel()}
          </div>
        )}
      </div>
    </div>,
    document.body
  );
} 