'use client';

import { useEffect, useRef } from 'react';
// Mock do pushNotificationService para remover a dependência externa
const mockPushNotificationService = {
  initialize: async (): Promise<void> => {
    console.log('Mock Push Notification: Tentando inicializar...');
    await new Promise(resolve => setTimeout(resolve, 100)); // Simula uma pequena demora
    if (typeof window !== 'undefined' && 'Notification' in window) {
      if (Notification.permission === 'granted') {
        console.log('Mock Push Notification: Permissão já concedida.');
        return;
      }
      if (Notification.permission !== 'denied') {
        console.log('Mock Push Notification: Solicitando permissão...');
        // Em um cenário de teste, não podemos realmente solicitar permissão,
        // então apenas simulamos que ela não foi concedida ainda.
        console.log('Mock Push Notification: Permissão ainda não solicitada ou concedida.');
      } else {
        console.warn('Mock Push Notification: Permissão foi negada.');
      }
    } else {
      console.warn('Mock Push Notification: Notificações não são suportadas neste navegador.');
    }
  },
};

const pushNotificationService = mockPushNotificationService;
import { useAuth } from '@/contexts/AuthContext';

export const PushNotificationInitializer: React.FC = () => {
  const { user } = useAuth();
  const initializationAttempted = useRef(false);

  useEffect(() => {
    const initializePushNotifications = async () => {
      // Evita múltiplas tentativas de inicialização
      if (initializationAttempted.current) return;

      // Só inicializar se o usuário estiver logado OU se estiver em modo offline/degradado
      if (!user) {
        console.log('🔄 Push Notification: Usuário não autenticado, aguardando...');
        return;
      }

      initializationAttempted.current = true;

      try {
        console.log('🚀 Push Notification: Iniciando serviço...');
        await pushNotificationService.initialize();
        console.log('✅ Push Notification: Serviço inicializado com sucesso');
      } catch (error) {
        console.warn('⚠️ Push Notification: Falha na inicialização, continuando sem notificações:', error);
        // Não quebra a aplicação, apenas continua sem push notifications
      }
    };

    // Initialize push notifications when user is available
    initializePushNotifications();

    // Reset flag when user changes
    return () => {
      if (!user) {
        initializationAttempted.current = false;
      }
    };
  }, [user]); // Dependência apenas do user

  // This component doesn't render anything
  return null;
};

export default PushNotificationInitializer;
