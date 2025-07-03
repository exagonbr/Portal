/**
 * Classe utilitária para logging
 */
export class Logger {
  private context: string;

  constructor(context: string) {
    this.context = context;
  }

  debug(message: string, ...args: any[]): void {
    console.debug(`[${this.context}] ${message}`, ...args);
  }

  info(message: string, ...args: any[]): void {
    console.info(`[${this.context}] ${message}`, ...args);
  }

  warn(message: string, ...args: any[]): void {
    console.warn(`[${this.context}] ${message}`, ...args);
  }

  error(message: string, error?: any): void {
    console.error(`[${this.context}] ${message}`, error || '');
  }
}