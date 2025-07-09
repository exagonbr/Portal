/**
 * Utilitário para gerenciar erros de chunk loading
 * Detecta automaticamente erros de carregamento e recarrega a página quando necessário
 */

export class ChunkErrorHandler {
  private static instance: ChunkErrorHandler | null = null
  private retryCount = 0
  private maxRetries = 3
  private retryDelay = 2000

  static getInstance(): ChunkErrorHandler {
    if (!ChunkErrorHandler.instance) {
      ChunkErrorHandler.instance = new ChunkErrorHandler()
    }
    return ChunkErrorHandler.instance
  }

  /**
   * Inicializa o handler de erros de chunk
   */
  init(): void {
    // Handler para erros de carregamento de chunks
    window.addEventListener('error', this.handleChunkError.bind(this))
    
    // Handler para erros de Promise não capturadas (pode incluir chunks)
    window.addEventListener('unhandledrejection', this.handlePromiseRejection.bind(this))
    
    console.log('🛠️ ChunkErrorHandler inicializado')
  }

  /**
   * Remove os listeners de erro
   */
  destroy(): void {
    window.removeEventListener('error', this.handleChunkError.bind(this))
    window.removeEventListener('unhandledrejection', this.handlePromiseRejection.bind(this))
  }

  /**
   * Verifica se um erro é relacionado a chunk loading
   */
  private isChunkError(error: Error | string): boolean {
    const message = typeof error === 'string' ? error : error.message || ''
    const chunkErrorPatterns = [
      'Loading chunk',
      'ChunkLoadError',
      'Loading CSS chunk',
      'Loading async chunk',
      'Failed to import'
    ]
    
    return chunkErrorPatterns.some(pattern => message.includes(pattern))
  }

  /**
   * Handler para erros de script/chunk
   */
  private handleChunkError(event: ErrorEvent): void {
    const error = event.error || event.message || ''
    
    if (this.isChunkError(error)) {
      console.error('🚨 ChunkLoadError detectado:', {
        message: event.message,
        filename: event.filename,
        error: event.error,
        retryCount: this.retryCount
      })
      
      this.handleRetry('Erro de carregamento de chunk')
    }
  }

  /**
   * Handler para promises rejeitadas não capturadas
   */
  private handlePromiseRejection(event: PromiseRejectionEvent): void {
    const reason = event.reason
    
    if (reason && this.isChunkError(reason)) {
      console.error('🚨 Promise rejection com ChunkError:', {
        reason,
        retryCount: this.retryCount
      })
      
      this.handleRetry('Erro de Promise com chunk')
      event.preventDefault() // Evitar que o erro apareça no console
    }
  }

  /**
   * Gerencia tentativas de reload automático
   */
  private handleRetry(source: string): void {
    if (this.retryCount >= this.maxRetries) {
      console.error('❌ Máximo de tentativas atingido. Mostrando erro permanente.')
      this.showPermanentError()
      return
    }

    this.retryCount++
    
    console.log(`🔄 Tentativa ${this.retryCount}/${this.maxRetries} - ${source}`)
    
    // Mostrar notificação ao usuário
    this.showRetryNotification(this.retryCount, this.maxRetries)
    
    // Aguardar antes de recarregar
    setTimeout(() => {
      window.location.reload()
    }, this.retryDelay)
  }

  /**
   * Mostra notificação de retry ao usuário
   */
  private showRetryNotification(current: number, max: number): void {
    const notification = document.createElement('div')
    notification.id = 'chunk-error-notification'
    notification.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: #fbbf24;
      color: #92400e;
      padding: 16px;
      border-radius: 8px;
      border: 1px solid #f59e0b;
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
      z-index: 9999;
      max-width: 300px;
      font-family: system-ui, -apple-system, sans-serif;
      font-size: 14px;
    `
    
    notification.innerHTML = `
      <div style="display: flex; align-items: center; gap: 8px;">
        <div style="animation: spin 1s linear infinite;">🔄</div>
        <div>
          <div style="font-weight: 600;">Recarregando página...</div>
          <div style="font-size: 12px; opacity: 0.8;">Tentativa ${current}/${max}</div>
        </div>
      </div>
    `
    
    // Remover notificação anterior se existir
    const existing = document.getElementById('chunk-error-notification')
    if (existing) {
      existing.remove()
    }
    
    document.body.appendChild(notification)
    
    // Adicionar CSS de animação se não existir
    if (!document.getElementById('chunk-error-styles')) {
      const style = document.createElement('style')
      style.id = 'chunk-error-styles'
      style.textContent = `
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `
      document.head.appendChild(style)
    }
  }

  /**
   * Mostra erro permanente quando todas as tentativas falharam
   */
  private showPermanentError(): void {
    const errorOverlay = document.createElement('div')
    errorOverlay.id = 'chunk-error-overlay'
    errorOverlay.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0, 0, 0, 0.8);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 10000;
      font-family: system-ui, -apple-system, sans-serif;
    `
    
    errorOverlay.innerHTML = `
      <div style="
        background: white;
        padding: 32px;
        border-radius: 12px;
        max-width: 400px;
        text-align: center;
        box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
      ">
        <div style="font-size: 48px; margin-bottom: 16px;">⚠️</div>
        <h2 style="color: #dc2626; margin: 0 0 16px 0; font-size: 20px; font-weight: 600;">
          Erro ao carregar a página
        </h2>
        <p style="color: #6b7280; margin: 0 0 24px 0; line-height: 1.5;">
          Houve um problema persistente ao carregar os recursos da página. 
          Isso pode ser devido a uma atualização recente ou problema de conectividade.
        </p>
        <button 
          onclick="window.location.reload()" 
          style="
            background: #dc2626;
            color: white;
            border: none;
            padding: 12px 24px;
            border-radius: 8px;
            cursor: pointer;
            font-size: 14px;
            font-weight: 500;
          "
        >
          Tentar Novamente
        </button>
      </div>
    `
    
    document.body.appendChild(errorOverlay)
  }

  /**
   * Reset do contador de tentativas (útil para testes)
   */
  resetRetryCount(): void {
    this.retryCount = 0
  }
}

// Função de conveniência para inicializar o handler
export function initChunkErrorHandler(): void {
  if (typeof window !== 'undefined') {
    const handler = ChunkErrorHandler.getInstance()
    handler.init()
  }
}

// Auto-inicializar se estiver no browser
if (typeof window !== 'undefined') {
  // Aguardar o DOM estar pronto
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initChunkErrorHandler)
  } else {
    initChunkErrorHandler()
  }
} 