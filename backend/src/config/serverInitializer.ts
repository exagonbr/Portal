import express from 'express';
import { testRedisConnection } from './redis';
import { CacheWarmupService } from '../services/CacheWarmupService';
import { Logger } from '../utils/Logger';

/**
 * Classe responsável pela inicialização do servidor
 */
export class ServerInitializer {
  private readonly PORT = parseInt(process.env.PORT || '3001', 10);
  private readonly HOST = '127.0.0.1';

  constructor(private logger: Logger) {}

  /**
   * Inicializa o servidor com todas as verificações necessárias
   */
  async initialize(app: express.Application): Promise<void> {
    await this.testConnections();
    await this.startServer(app);
  }

  /**
   * Testa todas as conexões necessárias
   */
  private async testConnections(): Promise<void> {
    this.logger.info('📊 Testando conexões...');
    
    // Teste de conexão com PostgreSQL (comentado por enquanto)
    // const dbConnected = await testDatabaseConnection();
    // if (!dbConnected) {
    //   throw new Error('Falha na conexão com PostgreSQL');
    // }
    
    const redisConnected = await testRedisConnection();
    if (!redisConnected) {
      this.logger.warn('⚠️  Redis não conectado - algumas funcionalidades podem não funcionar');
    } else {
      await this.performCacheWarmup();
    }
  }

  /**
   * Executa o warmup do cache se o Redis estiver conectado
   */
  private async performCacheWarmup(): Promise<void> {
    this.logger.info('🔥 Iniciando warmup do cache...');
    
    try {
      await CacheWarmupService.warmupCache();
      this.logger.info('✅ Warmup do cache concluído com sucesso');
    } catch (warmupError) {
      const errorMessage = warmupError instanceof Error
        ? warmupError.message
        : 'Erro desconhecido';
      
      this.logger.error(`❌ Erro durante o warmup do cache: ${errorMessage}`, warmupError);
    }
  }

  /**
   * Inicia o servidor HTTP
   */
  private async startServer(app: express.Application): Promise<void> {
    return new Promise((resolve, reject) => {
      const server = app.listen(this.PORT, this.HOST, () => {
        this.logger.info(`✅ Servidor rodando na porta ${this.PORT}`);
        this.logger.info(`🌐 Ambiente: ${process.env.NODE_ENV || 'development'}`);
        this.logger.info(`📋 Health check: http://localhost:${this.PORT}/health`);
        this.logger.info(`🔗 API: http://localhost:${this.PORT}/api`);
        this.logger.info(`📚 Documentação: http://localhost:${this.PORT}/backend/docs`);
        resolve();
      });

      server.on('error', (error) => {
        this.logger.error('❌ Erro ao iniciar servidor HTTP', error);
        reject(error);
      });
    });
  }
} 