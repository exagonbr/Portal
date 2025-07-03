'use client';

import React, { useState } from 'react';
import { PlayIcon } from '@heroicons/react/24/solid';
import CustomVideoPlayer from './CustomVideoPlayer';

interface VideoCardProps {
  id: string;
  thumbnail: string;
  title: string;
  duration: string;
  progress?: number;
}

export default function VideoCard({ id, thumbnail, title, duration, progress }: VideoCardProps) {
  const [isPlaying, setIsPlaying] = useState(false);

  // Extract video ID from thumbnail URL and create video sources
  const getVideoSources = () => {
    const match = thumbnail.match(/\/vi\/([^/]+)\/maxresdefault\.jpg/);
    const videoId = match ? match[1] : '';
    
    // For YouTube videos, we'll use the YouTube embed URL
    // For other videos, you can add different source types here
    return [
      {
        src: `https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0&modestbranding=1&playsinline=1`,
        type: 'youtube' as const,
        quality: '720p' as const,
        label: 'YouTube HD'
      }
    ];
  };

  // Convert duration string to seconds for the player
  const getDurationInSeconds = () => {
    const [minutes, seconds] = duration.split(':').map(Number);
    return minutes * 60 + seconds;
  };

  return (
    <>
      <div
        className="group relative w-full max-w-[13rem] bg-background-primary rounded-lg shadow-md hover:shadow-xl transition-all duration-300 hover:scale-105 cursor-pointer border border-border-light"
        onClick={() => setIsPlaying(true)}
      >
        {/* Thumbnail Container */}
        <div className="relative aspect-video rounded-t-lg overflow-hidden">
          {/* Thumbnail Image */}
          <img
            src={thumbnail}
            alt={title}
            className="w-full h-full object-cover transform transition-transform duration-300 group-hover:scale-110"
            loading="lazy"
          />

          {/* Play Button Overlay */}
          <div className="absolute inset-0 bg-text-primary/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
            <div className="w-12 h-12 rounded-full bg-background-primary/90 flex items-center justify-center transform scale-0 group-hover:scale-100 transition-transform duration-300">
              <PlayIcon className="w-6 h-6 text-primary-DEFAULT" />
            </div>
          </div>

          {/* Duration Badge */}
          <div className="absolute bottom-2 right-2 px-2 py-1 bg-text-primary/70 text-white text-xs font-medium rounded-md">
            {duration}
          </div>

          {/* Progress Bar */}
          {progress !== undefined && progress > 0 && (
            <div className="absolute bottom-0 left-0 right-0 h-1">
              <div className="h-full bg-secondary-light/50"> {/* Lighter background for progress bar track */}
                <div
                  className="h-full bg-primary-DEFAULT transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-3">
          <h3
            className="text-sm font-medium text-text-primary line-clamp-2 group-hover:text-primary-dark transition-colors duration-300"
            title={title}
          >
            {title}
          </h3>
        </div>
      </div>

      {/* Custom Video Player Modal */}
      {isPlaying && (
        <CustomVideoPlayer
          videoId={id}
          title={title}
          sources={getVideoSources()}
          autoplay={true}
          thumbnail={thumbnail}
          duration={getDurationInSeconds()}
          currentProgress={progress}
          onProgress={(newProgress) => {
            // Here you can save progress to localStorage, database, etc.
            console.log('Video progress:', newProgress);
          }}
          onComplete={() => {
            // Handle video completion
            console.log('Video completed');
            setIsPlaying(false);
          }}
          onClose={() => setIsPlaying(false)}
          allowNotes={true}
          allowBookmarks={true}
          allowRating={true}
          allowSharing={true}
          customControls={true}
          subtitles={[
            // Add subtitle sources here if available
            // {
            //   language: 'pt-BR',
            //   label: 'Português',
            //   src: '/subtitles/video-pt.vtt',
            //   default: true
            // }
          ]}
        />
      )}
    </>
  );
}
