'use client';

import { FaWifi } from 'react-icons/fa';

interface OfflineIndicatorProps {
  isOnline: boolean;
}

export function OfflineIndicator({ isOnline }: OfflineIndicatorProps) {
  if (isOnline) return null;

  return (
    <div className="fixed top-0 left-0 right-0 bg-warning text-white p-2 text-center z-50 flex items-center justify-center gap-2">
      <FaWifi className="text-lg opacity-50" />
      <span className="text-sm font-medium">
        Você está offline. Alguns recursos podem estar indisponíveis.
      </span>
    </div>
  );
}
