import { apiClient } from './apiClient';

const publicVapidKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;

// Use the browser's PushSubscription type and extend it
type PushSubscriptionWithKeys = PushSubscription & {
  toJSON(): {
    endpoint: string;
    keys: {
      p256dh: string;
      auth: string;
    };
  };
};

class PushNotificationService {
  private swRegistration: ServiceWorkerRegistration | null = null;

  async initialize(): Promise<void> {
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
      console.warn('Push notifications are not supported');
      return;
    }

    try {
      // Register service worker
      this.swRegistration = await navigator.serviceWorker.register('/sw.js');
      console.log('Service Worker registered');

      // Check permission
      const permission = await this.requestNotificationPermission();
      if (permission === 'granted') {
        await this.subscribeToPushNotifications();
      }
    } catch (error) {
      console.error('Error initializing push notifications:', error);
    }
  }

  private async requestNotificationPermission(): Promise<NotificationPermission> {
    if (!('Notification' in window)) {
      console.warn('Notifications not supported');
      return 'denied';
    }

    if (Notification.permission === 'granted') {
      return 'granted';
    }

    if (Notification.permission === 'denied') {
      return 'denied';
    }

    return await Notification.requestPermission();
  }

  private async subscribeToPushNotifications(): Promise<void> {
    try {
      if (!this.swRegistration) {
        throw new Error('Service Worker not registered');
      }

      if (!publicVapidKey) {
        throw new Error('VAPID public key not configured');
      }

      // Get push subscription
      let subscription = await this.swRegistration.pushManager.getSubscription();

      // If no subscription exists, create one
      if (!subscription) {
        subscription = await this.swRegistration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: this.urlBase64ToUint8Array(publicVapidKey)
        });
      }

      // Send subscription to backend
      await this.saveSubscription(subscription as PushSubscriptionWithKeys);
    } catch (error) {
      console.error('Error subscribing to push notifications:', error);
      throw error;
    }
  }

  private async saveSubscription(subscription: PushSubscriptionWithKeys): Promise<void> {
    if (!subscription.endpoint) {
      throw new Error('Invalid push subscription');
    }
    try {
      await apiClient.post('/api/push-subscriptions', subscription.toJSON());
      console.log('Push subscription saved');
    } catch (error) {
      console.error('Error saving push subscription:', error);
      throw error;
    }
  }

  private urlBase64ToUint8Array(base64String: string): Uint8Array {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding)
      .replace(/\-/g, '+')
      .replace(/_/g, '/');

    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
  }

  async unsubscribe(): Promise<void> {
    try {
      if (!this.swRegistration) {
        throw new Error('Service Worker not registered');
      }

      const subscription = await this.swRegistration.pushManager.getSubscription();
      if (subscription) {
        await subscription.unsubscribe();
      await apiClient.delete(`/api/push-subscriptions/${encodeURIComponent(subscription.endpoint)}`);
        console.log('Successfully unsubscribed from push notifications');
      }
    } catch (error) {
      console.error('Error unsubscribing from push notifications:', error);
      throw error;
    }
  }
}

export const pushNotificationService = new PushNotificationService();
