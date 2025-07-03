'use client';

import AreaContentManager from '@/components/content/AreaContentManager';
import { ContentType } from '@/types/content';

export default function VideosContentPage() {
  const allowedTypes = [
    ContentType.MP4,      // For uploaded video files
    ContentType.YOUTUBE   // For embedded YouTube videos
  ];

  return (
    <AreaContentManager
      area="videos"
      allowedTypes={allowedTypes}
      title="Videos Portal"
    />
  );
}
