'use client';

import AreaContentManager from '@/components/content/AreaContentManager';
import { ContentType } from '@/types/content';

export default function BooksContentPage() {
  const allowedTypes = [
    ContentType.PDF,    // For PDF books and documents
    ContentType.EPUB    // For e-books
  ];

  return (
    <AreaContentManager
      area="books"
      allowedTypes={allowedTypes}
      title="Books Portal"
    />
  );
}
