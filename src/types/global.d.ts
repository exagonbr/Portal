// Definições globais para TypeScript

interface Window {
  // Handtalk
  HT: any;
  ht: any;
  
  // Service Worker
  clearServiceWorkerCache: (reason?: string) => Promise<any>;
  getServiceWorkerCacheInfo: () => Promise<any>;
  
  // Analytics
  gtag: (command: string, ...args: any[]) => void;
} 