import React, { ReactNode } from 'react';
import { ViewerState } from './types';

interface BaseViewerProps {
  children: ReactNode;
  viewerState: ViewerState;
  isFullscreen: boolean;
  containerRef: React.RefObject<HTMLDivElement>;
}

export const BaseViewer: React.FC<BaseViewerProps> = ({
  children,
  viewerState,
  isFullscreen,
  containerRef
}) => {
  return (
    <div 
      ref={containerRef}
      className={`flex h-full ${isFullscreen ? 'bg-gray-900' : ''}`}
    >
      <div className="flex-1 overflow-auto relative">
        {children}
      </div>
    </div>
  );
};

export default BaseViewer;