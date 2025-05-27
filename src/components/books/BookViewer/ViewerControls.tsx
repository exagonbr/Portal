import React, { useState } from 'react';
import { 
  FiChevronLeft, 
  FiChevronRight,
  FiPlus,
  FiMinus,
  FiBookmark,
  FiEdit,
  FiSearch
} from 'react-icons/fi';
import { Book } from '@/constants/mockData';
import Image from 'next/image';

interface ViewerControlsProps {
  book: Book;
  onAnnotationAdd: (annotation: any) => void;
  onHighlightAdd: (highlight: any) => void;
}

const ViewerControls: React.FC<ViewerControlsProps> = ({ 
  book,
  onAnnotationAdd,
  onHighlightAdd
}) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [zoom, setZoom] = useState(100);
  const [showThumbnails, setShowThumbnails] = useState(true);
  const [showMarks, setShowMarks] = useState(true);

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
  };

  const handleZoom = (direction: 'in' | 'out') => {
    setZoom(prev => direction === 'in' ? prev + 10 : prev - 10);
  };

  return (
    <div className="flex flex-col h-full">
            <div>
                        <Image
                          src={book.thumbnail}
                          alt={book.title}
                          width={200}
                          height={300}
                          className="rounded shadow"
                        />
                        <h1 className="mt-4 text-xl font-bold">{book.title}</h1>
                        <p className="text-sm text-gray-600">by {book.author}</p>
                        <p className="mt-2 text-gray-700">{book.synopsis}</p>
            </div>
      {/* Navigation Controls */}
      <div className="flex items-center justify-between p-2 border-b border-gray-700">
        <button 
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={currentPage <= 1}
          className="p-1 rounded hover:bg-gray-700 disabled:opacity-50"
        >
          <FiChevronLeft size={20} />
        </button>
        
        <span className="text-sm">
          Page {currentPage} of {book.pageCount || '?'}
        </span>
        
        <button 
          onClick={() => handlePageChange(currentPage + 1)}
          className="p-1 rounded hover:bg-gray-700"
        >
          <FiChevronRight size={20} />
        </button>
      </div>

      {/* Zoom Controls */}
      <div className="flex items-center justify-between p-2 border-b border-gray-700">
        <button 
          onClick={() => handleZoom('out')}
          className="p-1 rounded hover:bg-gray-700"
        >
          <FiMinus size={20} />
        </button>
        
        <span className="text-sm">{zoom}%</span>
        
        <button 
          onClick={() => handleZoom('in')}
          className="p-1 rounded hover:bg-gray-700"
        >
          <FiPlus size={20} />
        </button>
      </div>

      {/* Thumbnails Section */}
      {showThumbnails && (
        <div className="flex-1 overflow-y-auto p-2">
          <h3 className="text-sm font-medium mb-2">Pages</h3>
          <div className="grid grid-cols-2 gap-2">
            {/* Placeholder for thumbnails */}
            {Array.from({ length: 5 }).map((_, i) => (
              <div 
                key={i}
                className="bg-gray-700 rounded h-20 cursor-pointer hover:bg-gray-600"
                onClick={() => handlePageChange(i + 1)}
              />
            ))}
          </div>
        </div>
      )}

      {/* Marks Section */}
      {showMarks && (
        <div className="p-2 border-t border-gray-700">
          <h3 className="text-sm font-medium mb-2">Marks</h3>
          <div className="space-y-2">
            <button 
              onClick={() => onAnnotationAdd({ page: currentPage })}
              className="flex items-center gap-2 text-sm w-full p-1 hover:bg-gray-700 rounded"
            >
              <FiEdit size={16} /> Add Annotation
            </button>
            <button 
              onClick={() => onHighlightAdd({ page: currentPage })}
              className="flex items-center gap-2 text-sm w-full p-1 hover:bg-gray-700 rounded"
            >
              <FiBookmark size={16} /> Add Highlight
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ViewerControls;
