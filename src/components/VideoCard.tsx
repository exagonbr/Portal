'use client';

import React from 'react';

interface VideoCardProps {
  thumbnail: string;
  title: string;
  duration: string;
  progress?: number;
}

export default function VideoCard({ thumbnail, title, duration, progress }: VideoCardProps) {
  return (
    <div className="w-52 bg-white rounded-lg shadow-lg overflow-hidden">
      <div className="relative">
        <img src={thumbnail} alt={title} className="w-full h-50 object-cover" />
        {progress !== undefined && progress > 0 && (
          <div className="absolute bottom-0 left-0 right-0 h-2 bg-gray-400">
            <div
              className="h-2 bg-blue-950"
              style={{ width: `${progress}%` }}
            />
          </div>
        )}
      </div>
      <div className="p-2">
        <h3 className="text-sm font-semibold truncate" title={title}>{title}</h3>
      </div>
    </div>
  );
}