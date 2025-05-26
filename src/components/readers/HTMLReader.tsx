import React, { useEffect, useRef, useState } from 'react';

interface HTMLReaderProps {
  url: string;
  onLoadSuccess?: () => void;
  onLoadError?: (error: Error) => void;
}

export default function HTMLReader({ url, onLoadSuccess, onLoadError }: HTMLReaderProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [scale, setScale] = useState(1);

  useEffect(() => {
    const iframe = iframeRef.current;
    if (!iframe) return;

    const handleLoad = () => {
      try {
        // Add custom styles to the iframe content
        const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document;
        if (iframeDoc) {
          const style = iframeDoc.createElement('style');
          style.textContent = `
            body {
              margin: 0;
              padding: 20px;
              font-family: system-ui, -apple-system, sans-serif;
              line-height: 1.6;
              max-width: 800px;
              margin: 0 auto;
              zoom: ${scale};
            }
            img {
              max-width: 100%;
              height: auto;
            }
          `;
          iframeDoc.head.appendChild(style);
        }
        onLoadSuccess?.();
      } catch (err) {
        onLoadError?.(err as Error);
      }
    };

    iframe.addEventListener('load', handleLoad);
    return () => iframe.removeEventListener('load', handleLoad);
  }, [onLoadSuccess, onLoadError, scale]);

  const zoomIn = () => setScale(prev => Math.min(prev + 0.1, 2));
  const zoomOut = () => setScale(prev => Math.max(prev - 0.1, 0.5));
  const resetZoom = () => setScale(1);

  return (
    <div className="w-full h-full">
      <div className="bg-gray-800 p-2 mb-4 flex items-center justify-center space-x-2">
        <button
          onClick={zoomOut}
          className="px-3 py-1 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          -
        </button>
        <button
          onClick={resetZoom}
          className="px-3 py-1 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          100%
        </button>
        <button
          onClick={zoomIn}
          className="px-3 py-1 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          +
        </button>
      </div>
      <div className="w-full h-[calc(100%-3rem)] flex justify-center">
        <iframe
          ref={iframeRef}
          src={url}
          className="w-full h-full border-0 bg-white"
          title="HTML Content"
          sandbox="allow-same-origin allow-scripts"
        />
      </div>
    </div>
  );
}
