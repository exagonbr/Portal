export enum LogLevel {
  ERROR = 0,
  WARN = 1,
  INFO = 2,
  DEBUG = 3
}

export interface LogEntry {
  timestamp: Date;
  level: LogLevel;
  context: string;
  message: string;
  data?: any;
  error?: Error;
}

export class Logger {
  private context: string;
  private logLevel: LogLevel;

  constructor(context: string, logLevel: LogLevel = LogLevel.INFO) {
    this.context = context;
    this.logLevel = process.env.NODE_ENV === 'development' ? LogLevel.DEBUG : LogLevel.INFO;
  }

  private shouldLog(level: LogLevel): boolean {
    return level <= this.logLevel;
  }

  private formatMessage(level: LogLevel, message: string, data?: any): string {
    const timestamp = new Date().toISOString();
    const levelName = LogLevel[level];
    const dataStr = data ? ` | Data: ${JSON.stringify(data, null, 2)}` : '';
    
    return `[${timestamp}] [${levelName}] [${this.context}] ${message}${dataStr}`;
  }

  private log(level: LogLevel, message: string, data?: any, error?: Error): void {
    if (!this.shouldLog(level)) return;

    const formattedMessage = this.formatMessage(level, message, data);

    switch (level) {
      case LogLevel.ERROR:
        if (error) {
          console.log(formattedMessage, error);
        } else {
          console.log(formattedMessage);
        }
        break;
      case LogLevel.WARN:
        console.warn(formattedMessage);
        break;
      case LogLevel.INFO:
        console.info(formattedMessage);
        break;
      case LogLevel.DEBUG:
        console.debug(formattedMessage);
        break;
    }

    // Em produção, aqui você poderia enviar logs para um serviço externo
    // como Winston, Elasticsearch, CloudWatch, etc.
    if (process.env.NODE_ENV === 'production') {
      const logEntry: LogEntry = {
        timestamp: new Date(),
        level,
        context: this.context,
        message,
        data,
        ...(error && { error })
      };
      this.sendToExternalService(logEntry);
    }
  }

  private sendToExternalService(logEntry: LogEntry): void {
    // Implementar integração com serviços de logging externos
    // Por exemplo: Winston, Elasticsearch, CloudWatch, etc.
  }

  error(message: string, data?: any, error?: Error): void {
    this.log(LogLevel.ERROR, message, data, error);
  }

  warn(message: string, data?: any): void {
    this.log(LogLevel.WARN, message, data);
  }

  info(message: string, data?: any): void {
    this.log(LogLevel.INFO, message, data);
  }

  debug(message: string, data?: any): void {
    this.log(LogLevel.DEBUG, message, data);
  }

  // Métodos de conveniência para casos específicos
  apiRequest(method: string, url: string, userId?: string, data?: any): void {
    this.info(`API Request: ${method} ${url}`, {
      userId,
      requestData: data,
      timestamp: new Date().toISOString()
    });
  }

  apiResponse(method: string, url: string, statusCode: number, duration?: number): void {
    this.info(`API Response: ${method} ${url} - ${statusCode}`, {
      statusCode,
      duration: duration ? `${duration}ms` : undefined,
      timestamp: new Date().toISOString()
    });
  }

  databaseQuery(query: string, params?: any, duration?: number): void {
    this.debug('Database Query', {
      query,
      params,
      duration: duration ? `${duration}ms` : undefined,
      timestamp: new Date().toISOString()
    });
  }

  authEvent(event: string, userId: string, success: boolean, details?: any): void {
    this.info(`Auth Event: ${event}`, {
      userId,
      success,
      details,
      timestamp: new Date().toISOString()
    });
  }

  businessLogic(operation: string, entityId?: string, data?: any): void {
    this.info(`Business Logic: ${operation}`, {
      entityId,
      data,
      timestamp: new Date().toISOString()
    });
  }

  performance(operation: string, duration: number, metadata?: any): void {
    const level = duration > 1000 ? LogLevel.WARN : LogLevel.DEBUG;
    this.log(level, `Performance: ${operation} took ${duration}ms`, metadata);
  }

  security(event: string, userId?: string, ipAddress?: string, details?: any): void {
    this.warn(`Security Event: ${event}`, {
      userId,
      ipAddress,
      details,
      timestamp: new Date().toISOString()
    });
  }
}

// Singleton para logger global
export const globalLogger = new Logger('Global');

// Factory function para criar loggers específicos
export function createLogger(context: string, logLevel?: LogLevel): Logger {
  return new Logger(context, logLevel);
}