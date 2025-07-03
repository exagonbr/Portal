'use client';

import { FaWifi } from 'react-icons/fa';

interface OfflineIndicatorProps {
  isOnline: boolean;
}

export function OfflineIndicator({ isOnline }: OfflineIndicatorProps) {
  if (isOnline) return null;

  return (
    <div className="fixed top-0 left-0 right-0 bg-warning-DEFAULT text-warning-text p-2 text-center z-[100000] flex items-center justify-center gap-2 shadow-md">
      <FaWifi className="text-lg opacity-80" />
      <span className="text-sm font-medium">
        Você está offline. Alguns recursos podem estar indisponíveis.
      </span>
    </div>
  );
}
