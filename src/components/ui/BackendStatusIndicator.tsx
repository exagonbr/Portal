'use client';

import React, { useState } from 'react';
import { useBackendStatus } from '@/hooks/useBackendStatus';
import { CheckCircle, XCircle, AlertTriangle, RefreshCw } from 'lucide-react';
import { Tooltip, Badge, Button, Popover } from 'antd';

interface BackendStatusIndicatorProps {
  url?: string;
  interval?: number;
  showLabel?: boolean;
  showResponseTime?: boolean;
  size?: 'small' | 'default' | 'large';
  position?: 'top-right' | 'bottom-right' | 'top-left' | 'bottom-left' | 'inline';
}

const BackendStatusIndicator: React.FC<BackendStatusIndicatorProps> = ({
  url,
  interval = 60000,
  showLabel = false,
  showResponseTime = false,
  size = 'default',
  position = 'bottom-right'
}) => {
  const [isChecking, setIsChecking] = useState(false);
  
  const { isOnline, lastChecked, responseTime, error, checkNow } = useBackendStatus({
    url,
    interval,
    showToasts: true
  });

  // Formatar o timestamp de última verificação
  const formattedLastChecked = lastChecked 
    ? new Intl.DateTimeFormat('pt-BR', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      }).format(lastChecked)
    : 'Nunca';

  // Determinar a cor do status
  const statusColor = isOnline ? 'success' : 'error';
  
  // Determinar o ícone do status
  const StatusIcon = isOnline ? CheckCircle : XCircle;
  
  // Lidar com a verificação manual
  const handleCheckNow = async () => {
    setIsChecking(true);
    try {
      await checkNow();
    } finally {
      setIsChecking(false);
    }
  };
  
  // Conteúdo do popover
  const popoverContent = (
    <div className="p-2 space-y-2 max-w-xs">
      <div className="flex justify-between items-center">
        <span className="font-medium">Status:</span>
        <Badge 
          status={statusColor} 
          text={isOnline ? 'Online' : 'Offline'} 
        />
      </div>
      
      {showResponseTime && responseTime !== null && (
        <div className="flex justify-between items-center">
          <span className="font-medium">Tempo de resposta:</span>
          <span>{responseTime}ms</span>
        </div>
      )}
      
      <div className="flex justify-between items-center">
        <span className="font-medium">Última verificação:</span>
        <span>{formattedLastChecked}</span>
      </div>
      
      {error && (
        <div className="mt-2">
          <span className="font-medium text-red-500">Erro:</span>
          <div className="text-xs bg-red-50 p-1 rounded mt-1 text-red-600 overflow-hidden text-ellipsis">
            {error.message}
          </div>
        </div>
      )}
      
      <div className="mt-3 flex justify-end">
        <Button 
          size="small"
          onClick={handleCheckNow}
          loading={isChecking}
          icon={<RefreshCw className="h-3 w-3" />}
        >
          Verificar agora
        </Button>
      </div>
    </div>
  );
  
  // Classes para posicionamento
  const positionClasses = {
    'top-right': 'fixed top-4 right-4',
    'bottom-right': 'fixed bottom-4 right-4',
    'top-left': 'fixed top-4 left-4',
    'bottom-left': 'fixed bottom-4 left-4',
    'inline': ''
  };
  
  // Tamanhos do indicador
  const sizeClasses = {
    small: 'h-2 w-2',
    default: 'h-3 w-3',
    large: 'h-4 w-4'
  };
  
  return (
    <div className={position !== 'inline' ? positionClasses[position] : ''}>
      <Popover 
        content={popoverContent} 
        title="Status do Servidor" 
        trigger="click"
        placement="topRight"
      >
        <div className="flex items-center space-x-1 cursor-pointer bg-white/80 backdrop-blur-sm rounded-full px-2 py-1 shadow-sm border">
          <StatusIcon className={`${sizeClasses[size]} ${isOnline ? 'text-green-500' : 'text-red-500'}`} />
          
          {showLabel && (
            <span className={`text-sm ${isOnline ? 'text-green-600' : 'text-red-600'}`}>
              {isOnline ? 'Online' : 'Offline'}
            </span>
          )}
          
          {showResponseTime && responseTime !== null && isOnline && (
            <span className="text-xs text-gray-500 ml-1">
              {responseTime}ms
            </span>
          )}
        </div>
      </Popover>
    </div>
  );
};

export default BackendStatusIndicator; 