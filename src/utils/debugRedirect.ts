/**
 * Utilitário para debuggar e monitorar redirecionamentos
 * Ajuda a identificar e prevenir loops infinitos
 */

interface RedirectHistory {
  timestamp: number;
  from: string;
  to: string;
  reason: string;
  userRole?: string;
}

class RedirectDebugger {
  private static history: RedirectHistory[] = [];
  private static maxHistorySize = 50;
  private static sessionRedirects = new Map<string, number>();
  
  /**
   * Registra um redirecionamento para monitoramento
   */
  static logRedirect(from: string, to: string, reason: string, userRole?: string): void {
    const redirect: RedirectHistory = {
      timestamp: Date.now(),
      from,
      to,
      reason,
      userRole
    };

    this.history.push(redirect);
    
    // Manter apenas os últimos registros
    if (this.history.length > this.maxHistorySize) {
      this.history = this.history.slice(-this.maxHistorySize);
    }

    console.log(`🔄 RedirectDebugger: ${from} → ${to} (${reason}) [${userRole || 'no-role'}]`);
  }

  /**
   * Verifica se há um possível loop de redirecionamento
   */
  static detectLoop(from: string, to: string): boolean {
    const recentRedirects = this.history
      .filter(r => Date.now() - r.timestamp < 10000) // últimos 10 segundos
      .slice(-5); // últimos 5 redirecionamentos

    // Verifica se há redirecionamentos circulares
    const circularPattern = recentRedirects.some((redirect, index) => {
      if (index === 0) return false;
      
      const previous = recentRedirects[index - 1];
      return redirect.from === previous.to && redirect.to === previous.from;
    });

    if (circularPattern) {
      console.warn('🚨 RedirectDebugger: Loop circular detectado!');
      this.printRecentHistory();
      return true;
    }

    // Verifica se há muitos redirecionamentos para a mesma rota
    const sameRouteCount = recentRedirects.filter(r => r.to === to).length;
    if (sameRouteCount >= 3) {
      console.warn(`🚨 RedirectDebugger: Muitos redirecionamentos para ${to}`);
      this.printRecentHistory();
      return true;
    }

    return false;
  }

  /**
   * Incrementa contador de redirecionamentos por sessão
   */
  static incrementSessionRedirects(sessionId: string): number {
    const current = this.sessionRedirects.get(sessionId) || 0;
    const newCount = current + 1;
    this.sessionRedirects.set(sessionId, newCount);
    
    if (newCount > 5) {
      console.warn(`🚨 RedirectDebugger: Sessão ${sessionId} com ${newCount} redirecionamentos`);
    }
    
    return newCount;
  }

  /**
   * Imprime histórico recente para debug
   */
  static printRecentHistory(): void {
    console.group('📋 RedirectDebugger: Histórico Recente');
    
    const recent = this.history.slice(-10);
    recent.forEach((redirect, index) => {
      const timeAgo = Math.round((Date.now() - redirect.timestamp) / 1000);
      console.log(`${index + 1}. ${redirect.from} → ${redirect.to} (${redirect.reason}) - ${timeAgo}s atrás`);
    });
    
    console.groupEnd();
  }

  /**
   * Obtém estatísticas de redirecionamento
   */
  static getStats(): {
    totalRedirects: number;
    recentRedirects: number;
    mostCommonDestination: string | null;
    sessionsWithManyRedirects: number;
  } {
    const now = Date.now();
    const recentRedirects = this.history.filter(r => now - r.timestamp < 60000).length;
    
    // Destino mais comum
    const destinations = this.history.map(r => r.to);
    const destinationCounts = destinations.reduce((acc, dest) => {
      acc[dest] = (acc[dest] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    const mostCommonDestination = Object.entries(destinationCounts)
      .sort(([,a], [,b]) => b - a)[0]?.[0] || null;

    // Sessões com muitos redirecionamentos
    const sessionsWithManyRedirects = Array.from(this.sessionRedirects.values())
      .filter(count => count > 3).length;

    return {
      totalRedirects: this.history.length,
      recentRedirects,
      mostCommonDestination,
      sessionsWithManyRedirects
    };
  }

  /**
   * Limpa histórico antigo
   */
  static cleanup(): void {
    const now = Date.now();
    const oneHourAgo = now - (60 * 60 * 1000);
    
    // Remove redirecionamentos antigos
    this.history = this.history.filter(r => r.timestamp > oneHourAgo);
    
    // Limpa contadores de sessão antigos (baseado em atividade recente)
    const sessionEntries = Array.from(this.sessionRedirects.entries());
    for (const [sessionId, count] of sessionEntries) {
      // Se não há redirecionamentos recentes desta sessão, remove
      const hasRecentActivity = this.history.some(r => 
        r.timestamp > now - (10 * 60 * 1000) // últimos 10 minutos
      );
      
      if (!hasRecentActivity) {
        this.sessionRedirects.delete(sessionId);
      }
    }
  }

  /**
   * Diagnóstica problemas comuns de redirecionamento
   */
  static diagnose(): string[] {
    const issues: string[] = [];
    const stats = this.getStats();
    
    if (stats.recentRedirects > 10) {
      issues.push('Muitos redirecionamentos recentes - possível loop');
    }
    
    if (stats.sessionsWithManyRedirects > 0) {
      issues.push(`${stats.sessionsWithManyRedirects} sessões com redirecionamentos excessivos`);
    }
    
    // Verifica padrões problemáticos
    const recent = this.history.slice(-5);
    const hasBackAndForth = recent.some((redirect, index) => {
      if (index === 0) return false;
      const previous = recent[index - 1];
      return redirect.from === previous.to && redirect.to === previous.from;
    });
    
    if (hasBackAndForth) {
      issues.push('Padrão de ida e volta detectado nos redirecionamentos');
    }
    
    if (issues.length === 0) {
      issues.push('Nenhum problema detectado');
    }
    
    return issues;
  }
}

// Função utilitária para uso fácil
export function debugRedirect(from: string, to: string, reason: string, userRole?: string): boolean {
  // Verifica se há loop antes de registrar
  if (RedirectDebugger.detectLoop(from, to)) {
    return false; // Bloqueia redirecionamento
  }
  
  // Registra o redirecionamento
  RedirectDebugger.logRedirect(from, to, reason, userRole);
  
  return true; // Permite redirecionamento
}

export function getRedirectStats() {
  return RedirectDebugger.getStats();
}

export function printRedirectDiagnosis() {
  const stats = RedirectDebugger.getStats();
  const issues = RedirectDebugger.diagnose();
  
  console.group('🔍 Diagnóstico de Redirecionamentos');
  console.log('📊 Estatísticas:', stats);
  console.log('⚠️ Problemas detectados:', issues);
  RedirectDebugger.printRecentHistory();
  console.groupEnd();
}

// Cleanup automático
if (typeof window !== 'undefined') {
  setInterval(() => {
    RedirectDebugger.cleanup();
  }, 5 * 60 * 1000); // A cada 5 minutos
}

export default RedirectDebugger; 