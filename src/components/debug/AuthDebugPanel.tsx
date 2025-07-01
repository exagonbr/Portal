'use client';

// Componente de debug removido conforme solicitado
// Este componente foi desabilitado para remover o botão de debug do devtools

interface AuthDebugPanelProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export function AuthDebugPanel({ isOpen = false, onClose }: AuthDebugPanelProps) {
  return null;
}

// Hook para usar o debug panel
export function useAuthDebug() {
  return {
    isOpen: false,
    openDebug: () => {},
    closeDebug: () => {},
    DebugPanel: () => null
  };
}