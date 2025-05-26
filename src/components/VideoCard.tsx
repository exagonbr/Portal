'use client';

import React from 'react';
import { PlayIcon } from '@heroicons/react/24/solid';

interface VideoCardProps {
  thumbnail: string;
  title: string;
  duration: string;
  progress?: number;
}

export default function VideoCard({ thumbnail, title, duration, progress }: VideoCardProps) {
  return (
    <div className="group relative w-full max-w-[13rem] bg-white rounded-lg shadow-md hover:shadow-xl transition-all duration-300 hover:scale-105">
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
        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
          <div className="w-12 h-12 rounded-full bg-white/90 flex items-center justify-center transform scale-0 group-hover:scale-100 transition-transform duration-300">
            <PlayIcon className="w-6 h-6 text-blue-600" />
          </div>
        </div>

        {/* Duration Badge */}
        <div className="absolute bottom-2 right-2 px-2 py-1 bg-black/70 text-white text-xs font-medium rounded-md">
          {duration}
        </div>

        {/* Progress Bar */}
        {progress !== undefined && progress > 0 && (
          <div className="absolute bottom-0 left-0 right-0 h-1">
            <div className="h-full bg-gray-200/30">
              <div
                className="h-full bg-blue-600 transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-3">
        <h3 
          className="text-sm font-medium text-gray-900 line-clamp-2 group-hover:text-blue-600 transition-colors duration-300"
          title={title}
        >
          {title}
        </h3>
      </div>
    </div>
  );
}
