'use client';

import React from 'react';
import { TVShowVideo } from '@/types/collections';
import UniversalVideoPlayer from './UniversalVideoPlayer';

interface SessionVideoPlayerProps {
  sessionVideos: TVShowVideo[];
  sessionNumber: number;
  collectionName: string;
  initialVideoIndex?: number;
  onClose: () => void;
}

export default function SessionVideoPlayer({
  sessionVideos,
  sessionNumber,
  collectionName,
  initialVideoIndex = 0,
  onClose
}: SessionVideoPlayerProps): JSX.Element | null {
  
  // Transform TVShowVideo to VideoSource format
  const transformedVideos = sessionVideos.map((video, index) => ({
    id: video.id.toString(),
    title: video.title,
    url: video.video_url || '',
    type: detectVideoType(video.video_url || '') as 'mp4' | 'youtube' | 'vimeo' | 'direct',
    thumbnail: video.thumbnail_url,
    duration: video.duration,
    description: video.description,
    episode_number: video.episode_number || index + 1
  }));

  function detectVideoType(url: string): 'mp4' | 'youtube' | 'vimeo' | 'direct' {
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
  }

  return (
    <UniversalVideoPlayer
      videos={transformedVideos}
      initialVideoIndex={initialVideoIndex}
      collectionName={collectionName}
      sessionNumber={sessionNumber}
      onClose={onClose}
      autoplay={true}
    />
  );
}