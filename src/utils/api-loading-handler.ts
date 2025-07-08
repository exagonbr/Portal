/**
 * Utilitário para gerenciar indicadores de loading durante requisições com retry
 */

export interface LoadingState {
  isLoading: boolean;
  attempt: number;
  maxAttempts: number;
  message: string;
}

export class ApiLoadingHandler {
  private listeners: Set<(state: LoadingState) => void> = new Set();
  private currentState: LoadingState = {
    isLoading: false,
    attempt: 0,
    maxAttempts: 0,
    message: '',
  };

  /**
   * Adiciona um listener para mudanças no estado de loading
   */
  addListener(listener: (state: LoadingState) => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  /**
   * Atualiza o estado e notifica todos os listeners
   */
  private updateState(newState: Partial<LoadingState>) {
    this.currentState = { ...this.currentState, ...newState };
    this.listeners.forEach(listener => listener(this.currentState));
  }

  /**
   * Inicia o estado de loading
   */
  start(message: string = 'Carregando...', maxAttempts: number = 3) {
    this.updateState({
      isLoading: true,
      attempt: 1,
      maxAttempts,
      message,
    });
  }

  /**
   * Atualiza a tentativa atual
   */
  updateAttempt(attempt: number, message?: string) {
    this.updateState({
      attempt,
      message: message || `Tentativa ${attempt}/${this.currentState.maxAttempts}...`,
    });
  }

  /**
   * Finaliza o estado de loading
   */
  finish() {
    this.updateState({
      isLoading: false,
      attempt: 0,
      maxAttempts: 0,
      message: '',
    });
  }

  /**
   * Obtém o estado atual
   */
  getState(): LoadingState {
    return { ...this.currentState };
  }
}

// Instância singleton para uso global
export const globalLoadingHandler = new ApiLoadingHandler();

/**
 * Hook para usar o loading handler em componentes React
 */
export const useApiLoading = () => {
  const [state, setState] = useState<LoadingState>(globalLoadingHandler.getState());

  useEffect(() => {
    return globalLoadingHandler.addListener(setState);
  }, []);

  return {
    loadingState: state,
    startLoading: (message?: string, maxAttempts?: number) => 
      globalLoadingHandler.start(message, maxAttempts),
    updateAttempt: (attempt: number, message?: string) => 
      globalLoadingHandler.updateAttempt(attempt, message),
    finishLoading: () => globalLoadingHandler.finish(),
  };
};

/**
 * Componente de loading com informações de retry
 */
export const ApiLoadingIndicator: React.FC<{ 
  className?: string;
  showDetails?: boolean;
}> = ({ className = '', showDetails = true }) => {
  const { loadingState } = useApiLoading();

  if (!loadingState.isLoading) return null;

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
      <div className="flex flex-col">
        <span className="text-sm font-medium text-gray-700">
          {loadingState.message}
        </span>
        {showDetails && loadingState.maxAttempts > 1 && loadingState.attempt > 1 && (
          <span className="text-xs text-gray-500">
            Tentativa {loadingState.attempt} de {loadingState.maxAttempts}
          </span>
        )}
      </div>
    </div>
  );
};

export default ApiLoadingHandler; 