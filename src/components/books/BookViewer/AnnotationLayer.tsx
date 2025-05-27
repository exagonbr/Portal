import React, { useState } from 'react';
import { Annotation, Highlight } from './types';
import { FiX, FiEdit2 } from 'react-icons/fi';

interface AnnotationLayerProps {
  pageNumber: number;
  scale: number;
  annotations: Annotation[];
  highlights: Highlight[];
  onAnnotationAdd: (annotation: Omit<Annotation, 'id' | 'createdAt'>) => void;
  onAnnotationDelete: (id: string) => void;
  onHighlightAdd: (highlight: Omit<Highlight, 'id' | 'createdAt'>) => void;
  onHighlightDelete: (id: string) => void;
}

export const AnnotationLayer: React.FC<AnnotationLayerProps> = ({
  pageNumber,
  scale,
  annotations,
  highlights,
  onAnnotationAdd,
  onAnnotationDelete,
  onHighlightAdd,
  onHighlightDelete,
}) => {
  const [isAddingAnnotation, setIsAddingAnnotation] = useState(false);
  const [annotationText, setAnnotationText] = useState('');
  const [selectedPosition, setSelectedPosition] = useState<{ x: number; y: number } | null>(null);

  const handlePageClick = (e: React.MouseEvent) => {
    if (!isAddingAnnotation) return;

    const rect = (e.target as HTMLElement).getBoundingClientRect();
    const x = (e.clientX - rect.left) / scale;
    const y = (e.clientY - rect.top) / scale;
    
    setSelectedPosition({ x, y });
  };

  const handleAnnotationSubmit = () => {
    if (!selectedPosition || !annotationText) return;

    onAnnotationAdd({
      pageNumber,
      content: annotationText,
      position: selectedPosition,
    });

    setIsAddingAnnotation(false);
    setAnnotationText('');
    setSelectedPosition(null);
  };

  return (
    <div 
      className="absolute inset-0 pointer-events-none"
      onClick={handlePageClick}
    >
      {/* Render existing annotations */}
      {annotations
        .filter(ann => ann.pageNumber === pageNumber)
        .map(annotation => (
          <div
            key={annotation.id}
            className="absolute bg-yellow-100 p-2 rounded shadow-lg pointer-events-auto"
            style={{
              left: `${annotation.position.x * scale}px`,
              top: `${annotation.position.y * scale}px`,
              maxWidth: '200px',
            }}
          >
            <div className="flex justify-between items-start">
              <p className="text-sm text-gray-800">{annotation.content}</p>
              <button
                onClick={() => onAnnotationDelete(annotation.id)}
                className="ml-2 text-gray-500 hover:text-gray-700"
              >
                <FiX size={14} />
              </button>
            </div>
          </div>
        ))}

      {/* Render existing highlights */}
      {highlights
        .filter(hl => hl.pageNumber === pageNumber)
        .map(highlight => (
          <div
            key={highlight.id}
            className="absolute pointer-events-auto"
            style={{
              left: `${highlight.position.x * scale}px`,
              top: `${highlight.position.y * scale}px`,
              width: `${highlight.position.width * scale}px`,
              height: `${highlight.position.height * scale}px`,
              backgroundColor: highlight.color,
              opacity: 0.3,
            }}
          >
            <button
              onClick={() => onHighlightDelete(highlight.id)}
              className="absolute -top-2 -right-2 bg-white rounded-full p-1 shadow-lg text-gray-500 hover:text-gray-700"
            >
              <FiX size={12} />
            </button>
          </div>
        ))}

      {/* Annotation creation form */}
      {isAddingAnnotation && selectedPosition && (
        <div
          className="absolute bg-white p-3 rounded shadow-lg pointer-events-auto"
          style={{
            left: `${selectedPosition.x * scale}px`,
            top: `${selectedPosition.y * scale}px`,
          }}
        >
          <textarea
            value={annotationText}
            onChange={(e) => setAnnotationText(e.target.value)}
            className="w-full p-2 border rounded mb-2 text-sm"
            placeholder="Add your note..."
            rows={3}
          />
          <div className="flex justify-end space-x-2">
            <button
              onClick={() => {
                setIsAddingAnnotation(false);
                setAnnotationText('');
                setSelectedPosition(null);
              }}
              className="px-2 py-1 text-sm text-gray-600 hover:text-gray-800"
            >
              Cancel
            </button>
            <button
              onClick={handleAnnotationSubmit}
              className="px-2 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              Save
            </button>
          </div>
        </div>
      )}

      {/* Annotation mode indicator */}
      {isAddingAnnotation && (
        <div className="fixed bottom-4 right-4 bg-blue-500 text-white px-4 py-2 rounded shadow-lg">
          Click anywhere on the page to add a note
        </div>
      )}

      {/* Toggle annotation mode button */}
      <button
        onClick={() => setIsAddingAnnotation(!isAddingAnnotation)}
        className="fixed bottom-4 left-4 bg-white text-gray-800 px-3 py-2 rounded-full shadow-lg pointer-events-auto hover:bg-gray-100"
      >
        <FiEdit2 size={20} />
      </button>
    </div>
  );
};

export default AnnotationLayer;
