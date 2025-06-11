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
  private isInitialized = false;

  async initialize(): Promise<void> {
    if (this.isInitialized) return;

    if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
      console.warn('Push notifications are not supported');
      return;
    }

    try {
      // Register service worker
      this.swRegistration = await navigator.serviceWorker.register('/sw.js', {
        scope: '/'
      });
      
      console.log('Service Worker registered successfully');

      // Wait for service worker to be ready
      await navigator.serviceWorker.ready;

      // Check permission and subscribe if granted
      const permission = await this.requestNotificationPermission();
      if (permission === 'granted') {
        try {
          await this.subscribeToPushNotifications();
        } catch (error) {
          console.warn('⚠️ Push Notification: Falha ao subscrever, continuando sem push notifications:', error);
          // Não impede a inicialização da aplicação
        }
      }

      this.isInitialized = true;
    } catch (error) {
      console.error('Error initializing push notifications:', error);
      // Marca como inicializado mesmo com erro para evitar tentativas repetidas
      this.isInitialized = true;
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
        console.warn('⚠️ Push Notification: VAPID public key não configurada, continuando sem push notifications');
        return;
      }

      // Get existing subscription
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
      console.warn('⚠️ Push Notification: Erro ao subscrever, continuando sem push notifications:', error);
      // Não propaga o erro para evitar quebrar a aplicação
    }
  }

  private async saveSubscription(subscription: PushSubscriptionWithKeys): Promise<void> {
    if (!subscription.endpoint) {
      throw new Error('Invalid push subscription');
    }
    
    try {
      const response = await apiClient.post('/push-subscriptions', subscription.toJSON());
      
      if (response.success) {
        console.log('Push subscription saved successfully');
      } else {
        throw new Error(response.message || 'Failed to save subscription');
      }
    } catch (error) {
      // Se é erro de autenticação ou conectividade, apenas logga mas não falha
      if (error instanceof Error) {
        if (error.message.includes('User not authenticated') || 
            error.message.includes('fetch failed') ||
            error.message.includes('Network request failed')) {
          console.warn('⚠️ Push Notification: Backend não disponível, subscription salva localmente:', error.message);
          // Salva subscription localmente para uso futuro
          this.saveSubscriptionLocally(subscription);
          return;
        }
      }
      
      console.error('Error saving push subscription:', error);
      // Não propaga o erro para evitar quebrar a aplicação
      return;
    }
  }

  private saveSubscriptionLocally(subscription: PushSubscriptionWithKeys): void {
    try {
      if (typeof window !== 'undefined') {
        localStorage.setItem('push_subscription', JSON.stringify(subscription.toJSON()));
        localStorage.setItem('push_subscription_timestamp', Date.now().toString());
      }
    } catch (error) {
      console.warn('Could not save subscription locally:', error);
    }
  }

  private getLocalSubscription(): any | null {
    try {
      if (typeof window !== 'undefined') {
        const saved = localStorage.getItem('push_subscription');
        return saved ? JSON.parse(saved) : null;
      }
    } catch (error) {
      console.warn('Could not retrieve local subscription:', error);
    }
    return null;
  }

  async unsubscribe(): Promise<void> {
    try {
      if (!this.swRegistration) {
        throw new Error('Service Worker not registered');
      }

      const subscription = await this.swRegistration.pushManager.getSubscription();
      if (subscription) {
        await subscription.unsubscribe();
        
        try {
          await apiClient.delete(`/api/push-subscriptions/${encodeURIComponent(subscription.endpoint)}`);
          console.log('Successfully unsubscribed from push notifications');
        } catch (error) {
          // Se backend não está disponível, apenas remove localmente
          if (error instanceof Error && 
              (error.message.includes('User not authenticated') || 
               error.message.includes('fetch failed'))) {
            console.warn('⚠️ Push Notification: Backend não disponível, removendo subscription localmente');
            this.removeLocalSubscription();
          } else {
            console.warn('Could not notify backend of unsubscription:', error);
          }
        }
      }
    } catch (error) {
      console.error('Error unsubscribing from push notifications:', error);
      // Não propaga o erro para evitar quebrar a aplicação
    }
  }

  private removeLocalSubscription(): void {
    try {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('push_subscription');
        localStorage.removeItem('push_subscription_timestamp');
      }
    } catch (error) {
      console.warn('Could not remove local subscription:', error);
    }
  }

  async getSubscriptionStatus(): Promise<{
    supported: boolean;
    permission: NotificationPermission;
    subscribed: boolean;
  }> {
    const supported = 'serviceWorker' in navigator && 'PushManager' in window;
    const permission = 'Notification' in window ? Notification.permission : 'denied';
    
    let subscribed = false;
    if (supported && this.swRegistration) {
      try {
        const subscription = await this.swRegistration.pushManager.getSubscription();
        subscribed = !!subscription;
      } catch (error) {
        console.error('Error checking subscription status:', error);
      }
    }

    return { supported, permission, subscribed };
  }

  async requestPermissionAndSubscribe(): Promise<boolean> {
    try {
      const permission = await this.requestNotificationPermission();
      
      if (permission === 'granted') {
        await this.subscribeToPushNotifications();
        return true;
      }
      
      return false;
    } catch (error) {
      console.warn('⚠️ Push Notification: Erro ao solicitar permissão e subscrever:', error);
      // Não propaga o erro, apenas retorna false
      return false;
    }
  }

  private urlBase64ToUint8Array(base64String: string): Uint8Array {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding)
      ?.replace(/-/g, '+')
      ?.replace(/_/g, '/') || '';

    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
  }

  // Test notification
  async sendTestNotification(): Promise<void> {
    if (!this.swRegistration) {
      throw new Error('Service Worker not registered');
    }

    await this.swRegistration.showNotification('Teste de Notificação', {
      body: 'Esta é uma notificação de teste do Portal Sabercon',
      icon: '/icons/icon-192x192.png',
      badge: '/icons/icon.svg',
      tag: 'test-notification',
      data: {
        url: '/',
        timestamp: Date.now()
      }
    });
  }
}

export const pushNotificationService = new PushNotificationService();
