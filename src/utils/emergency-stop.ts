/**
 * Utilitário para parar loops de emergência
 */

// Flag global para parar loops
let emergencyStopActive = false;

/**
 * Ativa o stop de emergência
 */
export function activateEmergencyStop(): void {
  emergencyStopActive = true;
  console.log('🚨 EMERGENCY STOP ATIVADO - Parando todos os loops');
  
  // Limpar todos os timeouts e intervals ativos
  if (typeof window !== 'undefined') {
    // Limpar timeouts (método mais simples)
    for (let i = 1; i <= 1000; i++) {
      clearTimeout(i);
    }
    
    // Limpar intervals (método mais simples)
    for (let i = 1; i <= 1000; i++) {
      clearInterval(i);
    }
    
    // Disparar evento customizado para componentes escutarem
    window.dispatchEvent(new CustomEvent('emergency-stop'));
  }
}

/**
 * Desativa o stop de emergência
 */
export function deactivateEmergencyStop(): void {
  emergencyStopActive = false;
  console.log('✅ Emergency stop desativado');
}

/**
 * Verifica se o stop de emergência está ativo
 */
export function isEmergencyStopActive(): boolean {
  return emergencyStopActive;
}

/**
 * Hook para componentes verificarem o emergency stop
 */
export function useEmergencyStop(): {
  isActive: boolean;
  activate: () => void;
  deactivate: () => void;
} {
  return {
    isActive: emergencyStopActive,
    activate: activateEmergencyStop,
    deactivate: deactivateEmergencyStop
  };
}

/**
 * Intercepta fetch para parar requisições durante emergency stop
 */
if (typeof window !== 'undefined') {
  const originalFetch = window.fetch;
  
  window.fetch = async (...args) => {
    if (emergencyStopActive) {
      console.log('🚨 Requisição bloqueada por emergency stop:', args[0]);
      throw new Error('Emergency stop ativo - requisição cancelada');
    }
    
    return originalFetch(...args);
  };
} 