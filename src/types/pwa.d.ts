declare global {
  interface Window {
    workbox: any;
  }

  interface BeforeInstallPromptEvent extends Event {
    readonly platforms: string[];
    readonly userChoice: Promise<{
      outcome: 'accepted' | 'dismissed';
      platform: string;
    }>;
    prompt(): Promise<void>;
  }

  interface WindowEventMap {
    'beforeinstallprompt': BeforeInstallPromptEvent;
    'appinstalled': Event;
  }

  interface ServiceWorkerRegistration {
    waiting?: ServiceWorker;
    active?: ServiceWorker;
    installing?: ServiceWorker;
    pushManager: PushManager;
    sync: SyncManager;
    periodicSync: PeriodicSyncManager;
    update(): Promise<void>;
    unregister(): Promise<boolean>;
    showNotification(title: string, options?: NotificationOptions): Promise<void>;
    getNotifications(options?: GetNotificationOptions): Promise<Notification[]>;
  }

  interface ServiceWorker extends EventTarget {
    scriptURL: string;
    state: ServiceWorkerState;
    postMessage(message: any, transfer?: Transferable[]): void;
  }

  interface ServiceWorkerState {
    installing: ServiceWorker | null;
    waiting: ServiceWorker | null;
    active: ServiceWorker | null;
  }

  interface PushManager {
    getSubscription(): Promise<PushSubscription | null>;
    permissionState(options?: PushSubscriptionOptionsInit): Promise<PermissionState>;
    subscribe(options?: PushSubscriptionOptionsInit): Promise<PushSubscription>;
  }

  interface SyncManager {
    getTags(): Promise<string[]>;
    register(tag: string): Promise<void>;
  }

  interface PeriodicSyncManager {
    register(tag: string, options?: PeriodicSyncOptions): Promise<void>;
    unregister(tag: string): Promise<void>;
    getTags(): Promise<string[]>;
  }

  interface PeriodicSyncOptions {
    minInterval: number;
  }

  interface GetNotificationOptions {
    tag?: string;
  }
}

export interface PWAContextType {
  isOnline: boolean;
  isInstallable: boolean;
  isInstalled: boolean;
  deferredPrompt: BeforeInstallPromptEvent | null;
  registration: ServiceWorkerRegistration | null;
  installPWA: () => Promise<void>;
  updateServiceWorker: () => Promise<void>;
}

export interface PWAProviderProps {
  children: React.ReactNode;
}

export interface PWAInstallPromptProps {
  registration: ServiceWorkerRegistration | null;
}

export interface OfflineIndicatorProps {
  isOnline: boolean;
}

// Ensure this file is treated as a module
export {};
