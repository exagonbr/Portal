'use client';

import { useEffect, useRef } from 'react';
import { pushNotificationService } from '@/services/pushNotificationService';
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
