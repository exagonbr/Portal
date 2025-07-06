'use client';

import React from 'react';
import UniversalVideoPlayer from '@/components/UniversalVideoPlayer';

interface TVShowVideo {
  id: number;
  title: string;
  description?: string;
  url?: string;
  duration?: number;
  thumbnail_url?: string;
  video_type?: string;
  position?: number;
}

interface TVShowPlayerProps {
  videos: TVShowVideo[];
  collectionName: string;
  sessionNumber?: number;
  initialIndex: number;
  onClose: () => void;
}

export function TVShowPlayer({
  videos,
  collectionName,
  sessionNumber,
  initialIndex,
  onClose
}: TVShowPlayerProps) {
  // Detectar tipo de vídeo
  const detectVideoType = (url: string): 'mp4' | 'youtube' | 'vimeo' | 'direct' => {
    if (!url) return 'direct';
    
    if (url.includes('youtube.com') || url.includes('youtu.be')) {
      return 'youtube';
    }
    
    if (url.includes('vimeo.com')) {
      return 'vimeo';
    }
    
    if (url.endsWith('.mp4')) {
      return 'mp4';
    }
    
    return 'direct';
  };

  // Transformar vídeo para o formato do player
  const transformVideoForPlayer = (video: TVShowVideo, index: number) => {
    return {
      id: video.id,
      title: video.title,
      description: video.description,
      url: video.url || '',
      duration: video.duration,
      thumbnail: video.thumbnail_url,
      type: video.video_type || detectVideoType(video.url || ''),
      position: video.position || index + 1
    };
  };

  const transformedVideos = videos.map(transformVideoForPlayer);

  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-90 flex items-center justify-center">
      <div className="relative w-full h-full max-w-7xl mx-auto p-4">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-white hover:text-gray-300 z-10"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>

        <div className="h-full flex flex-col">
          <div className="flex-1 relative">
            <UniversalVideoPlayer
              videos={transformedVideos}
              initialVideoIndex={initialIndex}
              collectionName={collectionName}
              sessionNumber={sessionNumber}
              onClose={onClose}
            />
          </div>
        </div>
      </div>
    </div>
  );
} 