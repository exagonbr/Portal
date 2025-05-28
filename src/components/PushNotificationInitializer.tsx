'use client';

import { useEffect } from 'react';
import { pushNotificationService } from '@/services/pushNotificationService';

export const PushNotificationInitializer: React.FC = () => {
  useEffect(() => {
    const initializePushNotifications = async () => {
      try {
        await pushNotificationService.initialize();
      } catch (error) {
        console.error('Failed to initialize push notifications:', error);
      }
    };

    // Initialize push notifications when component mounts
    initializePushNotifications();

    // Cleanup on unmount (if needed)
    return () => {
      // Any cleanup code if necessary
    };
  }, []);

  // This component doesn't render anything
  return null;
};

export default PushNotificationInitializer;
