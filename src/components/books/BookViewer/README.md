# BookViewer Components

A comprehensive book viewing system that supports both PDF and EPUB formats with advanced features like annotations, highlights, and bookmarks.

## Components

### `index.tsx` - Main BookViewer Component
The main entry point that determines which viewer to render based on the book format.

**Props:**
- `book: Book` - The book object containing metadata and file path
- `initialAnnotations?: Annotation[]` - Pre-existing annotations
- `initialHighlights?: Highlight[]` - Pre-existing highlights
- `initialBookmarks?: Bookmark[]` - Pre-existing bookmarks
- `onAnnotationAdd?: (annotation: Annotation) => void` - Callback when annotation is added
- `onHighlightAdd?: (highlight: Highlight) => void` - Callback when highlight is added
- `onBookmarkAdd?: (bookmark: Bookmark) => void` - Callback when bookmark is added

### `PDFViewer.tsx` - PDF Document Viewer
Renders PDF documents with full feature support.

**Features:**
- Page navigation with keyboard shortcuts
- Zoom controls (50% - 200%)
- Dual page view mode
- Fullscreen support
- Annotations with position tracking
- Text highlighting
- Bookmarks
- Page thumbnails

### `EPUBViewer.tsx` - EPUB Document Viewer
Renders EPUB documents with feature parity to PDF viewer.

**Features:**
- Flow-based pagination
- Dynamic font sizing
- Dual page spread support
- Fullscreen mode
- Text selection for highlights
- Annotations overlay
- Bookmarks
- Responsive layout

### `ViewerControls.tsx` - Unified Control Panel
Shared control panel for both viewers providing:
- Book metadata display
- Page navigation controls
- Zoom controls
- View mode toggles (dual page, fullscreen)
- Quick action buttons (add note, highlight)
- Page thumbnails
- Bookmark management

### `AnnotationLayer.tsx` - Annotation Overlay
Manages the display and interaction of annotations and highlights on document pages.

### `BaseViewer.tsx` - Base Viewer Container
Shared container component for consistent layout and styling.

### `types.ts` - TypeScript Definitions
Defines all interfaces and types used across the viewer components.

### `utils.ts` - Utility Functions
Helper functions for:
- Creating annotations, highlights, and bookmarks
- Filtering items by page
- Keyboard shortcut handling
- Zoom calculations

## Usage Example

```tsx
import BookViewer from '@/components/books/BookViewer';
import { Book } from '@/constants/mockData';

const MyBookReader = () => {
  const book: Book = {
    id: '1',
    title: 'Sample Book',
    author: 'John Doe',
    format: 'pdf', // or 'epub'
    filePath: '/books/sample.pdf',
    // ... other properties
  };

  const handleAnnotationAdd = (annotation) => {
    // Save annotation to backend
    console.log('New annotation:', annotation);
  };

  return (
    <BookViewer
      book={book}
      onAnnotationAdd={handleAnnotationAdd}
      onHighlightAdd={(highlight) => console.log('New highlight:', highlight)}
      onBookmarkAdd={(bookmark) => console.log('New bookmark:', bookmark)}
    />
  );
};
```

## Keyboard Shortcuts

- **Arrow Left**: Previous page
- **Arrow Right**: Next page
- **+/=**: Zoom in
- **-**: Zoom out
- **F**: Toggle fullscreen

## Supported Formats

- **PDF**: Full support via react-pdf
- **EPUB**: Full support via epubjs

## Dependencies

- `react-pdf`: PDF rendering
- `epubjs`: EPUB rendering
- `screenfull`: Fullscreen API wrapper
- `uuid`: Unique ID generation
- `react-icons`: UI icons

## Future Enhancements

- [ ] Search functionality within documents
- [ ] Export annotations and highlights
- [ ] Sync reading position across devices
- [ ] Support for more ebook formats (MOBI, AZW3)
- [ ] Text-to-speech integration
- [ ] Dark mode theme
- [ ] Mobile gesture support