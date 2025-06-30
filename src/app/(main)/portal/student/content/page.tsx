'use client';

import AreaContentManager from '@/components/content/AreaContentManager';
import { ContentType } from '@/types/content';

export default function StudentContentPage() {
  const allowedTypes = [
    ContentType.MP4,      // For videos
    ContentType.PDF,      // For support materials
    ContentType.SCORM     // For interactive games/content
  ];

  return (
    <AreaContentManager
      area="student"
      allowedTypes={allowedTypes}
      title="Student Portal"
    />
  );
}
