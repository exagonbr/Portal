'use client';

import React from 'react';
import UniversalVideoPlayer from './UniversalVideoPlayer';

interface VideoPlayerProps {
  videoId: string;
  onClose: () => void;
  videoTitle?: string;
}

export default function VideoPlayer({ videoId, onClose, videoTitle = 'Vídeo' }: VideoPlayerProps): JSX.Element | null {
  
  // Create a single video source for the YouTube video
  const videoSource = {
    id: videoId,
    title: videoTitle,
    url: `https://www.youtube.com/watch?v=${videoId}`,
    type: 'youtube' as const,
    thumbnail: `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`,
    duration: undefined,
    description: undefined,
    episode_number: 1
  };

  return (
    <UniversalVideoPlayer
      videos={[videoSource]}
      initialVideoIndex={0}
      collectionName="Vídeo Individual"
      onClose={onClose}
      autoplay={true}
    />
  );
}
