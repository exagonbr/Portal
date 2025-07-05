'use client';

import { useState } from 'react';
import { pushNotificationService } from '@/services/pushNotificationService';

interface NotificationPermissionButtonProps {
  className?: string;
  children?: React.ReactNode;
}

export default function NotificationPermissionButton({ 
  className = '', 
  children 
}: NotificationPermissionButtonProps) {
  const [permission, setPermission] = useState<NotificationPermission>(
    typeof window !== 'undefined' ? Notification.permission : 'default'
  );
  const [isRequesting, setIsRequesting] = useState(false);

  const handleRequestPermission = async () => {
    if (isRequesting) return;
    
    setIsRequesting(true);
    
    try {
      console.log('🔔 Solicitando permissão para notificações...');
      const newPermission = await pushNotificationService.requestPermissionFromUser();
      setPermission(newPermission);
      
      if (newPermission === 'granted') {
        console.log('✅ Permissão para notificações concedida');
        // Você pode adicionar uma notificação de sucesso aqui
      } else if (newPermission === 'denied') {
        console.log('❌ Permissão para notificações negada');
        // Você pode adicionar uma mensagem explicativa aqui
      }
    } catch (error) {
      console.log('❌ Erro ao solicitar permissão:', error);
    } finally {
      setIsRequesting(false);
    }
  };

  // Não mostrar o botão se as notificações não são suportadas
  if (typeof window === 'undefined' || !('Notification' in window)) {
    return null;
  }

  // Não mostrar se a permissão já foi concedida
  if (permission === 'granted') {
    return null;
  }

  // Não mostrar se foi permanentemente negada
  if (permission === 'denied') {
    return (
      <div className={`text-sm text-gray-500 ${className}`}>
        <span className="material-symbols-outlined text-sm mr-1">notifications_off</span>
        Notificações desabilitadas
      </div>
    );
  }

  return (
    <button
      onClick={handleRequestPermission}
      disabled={isRequesting}
      className={`
        inline-flex items-center gap-2 px-4 py-2 
        bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400
        text-white text-sm font-medium rounded-lg
        transition-colors duration-200
        ${className}
      `}
    >
      <span className="material-symbols-outlined text-sm">
        {isRequesting ? 'hourglass_empty' : 'notifications'}
      </span>
      {children || (isRequesting ? 'Solicitando...' : 'Ativar Notificações')}
    </button>
  );
} 