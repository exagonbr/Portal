/**
 * Utilitário de diagnóstico de rede específico para dispositivos móveis
 */

interface NetworkDiagnostics {
  isOnline: boolean;
  connectionType: string;
  effectiveType?: string;
  downlink?: number;
  rtt?: number;
  saveData?: boolean;
  isMobile: boolean;
  userAgent: string;
  timestamp: number;
}

interface ConnectivityTest {
  endpoint: string;
  success: boolean;
  responseTime: number;
  error?: string;
  status?: number;
}

class MobileNetworkDiagnostics {
  private static instance: MobileNetworkDiagnostics;
  
  static getInstance(): MobileNetworkDiagnostics {
    if (!this.instance) {
      this.instance = new MobileNetworkDiagnostics();
    }
    return this.instance;
  }

  /**
   * Detecta se é dispositivo móvel
   */
  isMobileDevice(): boolean {
    if (typeof window === 'undefined') return false;
    
    const userAgent = navigator.userAgent.toLowerCase();
    return /mobile|android|iphone|ipad|ipod|blackberry|windows phone/i.test(userAgent);
  }

  /**
   * Coleta informações detalhadas da rede
   */
  getNetworkInfo(): NetworkDiagnostics {
    const now = Date.now();
    const userAgent = navigator.userAgent;
    const isMobile = this.isMobileDevice();
    
    // Informações básicas de conectividade
    const isOnline = navigator.onLine;
    
    // Informações da Connection API (se disponível)
    const connection = (navigator as any).connection || 
                      (navigator as any).mozConnection || 
                      (navigator as any).webkitConnection;
    
    let connectionType = 'unknown';
    let effectiveType: string | undefined;
    let downlink: number | undefined;
    let rtt: number | undefined;
    let saveData: boolean | undefined;
    
    if (connection) {
      connectionType = connection.type || connection.effectiveType || 'unknown';
      effectiveType = connection.effectiveType;
      downlink = connection.downlink;
      rtt = connection.rtt;
      saveData = connection.saveData;
    }

    return {
      isOnline,
      connectionType,
      effectiveType,
      downlink,
      rtt,
      saveData,
      isMobile,
      userAgent,
      timestamp: now
    };
  }

  /**
   * Testa conectividade com múltiplos endpoints
   */
  async testConnectivity(endpoints?: string[]): Promise<ConnectivityTest[]> {
    const defaultEndpoints = [
      '/api/health',
      '/api/auth/ping',
      '/',
      'https://www.google.com/favicon.ico'
    ];
    
    const testEndpoints = endpoints || defaultEndpoints;
    const results: ConnectivityTest[] = [];
    
    for (const endpoint of testEndpoints) {
      const result = await this.testSingleEndpoint(endpoint);
      results.push(result);
    }
    
    return results;
  }

  /**
   * Testa um único endpoint
   */
  private async testSingleEndpoint(endpoint: string): Promise<ConnectivityTest> {
    const startTime = Date.now();
    
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10s timeout
      
      const response = await fetch(endpoint, {
        method: 'HEAD',
        cache: 'no-cache',
        signal: controller.signal,
        mode: endpoint.startsWith('http') ? 'no-cors' : 'cors'
      });
      
      clearTimeout(timeoutId);
      const responseTime = Date.now() - startTime;
      
      return {
        endpoint,
        success: true,
        responseTime,
        status: response.status
      };
      
    } catch (error) {
      const responseTime = Date.now() - startTime;
      
      return {
        endpoint,
        success: false,
        responseTime,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Executa diagnóstico completo
   */
  async runFullDiagnostics(): Promise<{
    networkInfo: NetworkDiagnostics;
    connectivityTests: ConnectivityTest[];
    recommendations: string[];
  }> {
    console.log('🔍 Iniciando diagnóstico completo de rede para mobile...');
    
    const networkInfo = this.getNetworkInfo();
    const connectivityTests = await this.testConnectivity();
    
    // Analisar resultados e gerar recomendações
    const recommendations = this.generateRecommendations(networkInfo, connectivityTests);
    
    console.log('📊 Diagnóstico completo:', {
      networkInfo,
      connectivityTests,
      recommendations
    });
    
    return {
      networkInfo,
      connectivityTests,
      recommendations
    };
  }

  /**
   * Gera recomendações baseadas nos resultados
   */
  private generateRecommendations(
    networkInfo: NetworkDiagnostics, 
    connectivityTests: ConnectivityTest[]
  ): string[] {
    const recommendations: string[] = [];
    
    // Verificar se está offline
    if (!networkInfo.isOnline) {
      recommendations.push('Dispositivo está offline. Verifique sua conexão com a internet.');
      return recommendations;
    }
    
    // Verificar qualidade da conexão
    if (networkInfo.effectiveType && ['slow-2g', '2g'].includes(networkInfo.effectiveType)) {
      recommendations.push('Conexão muito lenta detectada. Considere trocar para uma rede mais rápida.');
    }
    
    if (networkInfo.rtt && networkInfo.rtt > 1000) {
      recommendations.push(`Latência alta detectada (${networkInfo.rtt}ms). Isso pode causar lentidão.`);
    }
    
    if (networkInfo.saveData) {
      recommendations.push('Modo de economia de dados ativo. Isso pode afetar o carregamento.');
    }
    
    // Verificar resultados dos testes
    const failedTests = connectivityTests.filter(test => !test.success);
    if (failedTests.length > 0) {
      recommendations.push(`${failedTests.length} de ${connectivityTests.length} testes de conectividade falharam.`);
    }
    
    const slowTests = connectivityTests.filter(test => test.success && test.responseTime > 5000);
    if (slowTests.length > 0) {
      recommendations.push('Alguns endpoints estão respondendo lentamente (>5s).');
    }
    
    // Recomendações específicas para mobile
    if (networkInfo.isMobile) {
      if (networkInfo.connectionType === 'cellular') {
        recommendations.push('Usando conexão celular. Considere WiFi para melhor estabilidade.');
      }
      
      if (connectivityTests.some(test => test.error?.includes('fetch'))) {
        recommendations.push('Erros de fetch detectados. Pode ser um problema de CORS ou bloqueio de rede.');
      }
    }
    
    if (recommendations.length === 0) {
      recommendations.push('Conectividade aparenta estar normal.');
    }
    
    return recommendations;
  }

  /**
   * Monitora mudanças na conectividade
   */
  startConnectivityMonitoring(
    onOnline: () => void,
    onOffline: () => void,
    onConnectionChange?: (info: NetworkDiagnostics) => void
  ): () => void {
    if (typeof window === 'undefined') return () => {};
    
    const handleOnline = () => {
      console.log('📶 Conectividade restaurada');
      onOnline();
      if (onConnectionChange) {
        onConnectionChange(this.getNetworkInfo());
      }
    };
    
    const handleOffline = () => {
      console.log('📵 Conectividade perdida');
      onOffline();
      if (onConnectionChange) {
        onConnectionChange(this.getNetworkInfo());
      }
    };
    
    const handleConnectionChange = () => {
      console.log('🔄 Mudança na conexão detectada');
      if (onConnectionChange) {
        onConnectionChange(this.getNetworkInfo());
      }
    };
    
    // Event listeners
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    // Connection API listeners
    const connection = (navigator as any).connection;
    if (connection) {
      connection.addEventListener('change', handleConnectionChange);
    }
    
    // Cleanup function
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      
      if (connection) {
        connection.removeEventListener('change', handleConnectionChange);
      }
    };
  }
}

// Export singleton instance
export const mobileNetworkDiagnostics = MobileNetworkDiagnostics.getInstance();

// Export types
export type { NetworkDiagnostics, ConnectivityTest };

// Utility functions
export const isMobileDevice = (): boolean => {
  return mobileNetworkDiagnostics.isMobileDevice();
};

export const getNetworkInfo = (): NetworkDiagnostics => {
  return mobileNetworkDiagnostics.getNetworkInfo();
};

export const testConnectivity = async (endpoints?: string[]): Promise<ConnectivityTest[]> => {
  return mobileNetworkDiagnostics.testConnectivity(endpoints);
};

export const runFullDiagnostics = async () => {
  return mobileNetworkDiagnostics.runFullDiagnostics();
}; 