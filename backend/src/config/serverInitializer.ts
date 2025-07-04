import express from 'express';
import { Logger } from '../utils/Logger';
import { AppDataSource } from './typeorm.config';

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
  await this.connectDatabase();
  await this.startServer(app);
}

/**
 * Conecta ao banco de dados
 */
private async connectDatabase(): Promise<void> {
  this.logger.info('📊 Conectando ao banco de dados...');
  try {
    if (!AppDataSource.isInitialized) {
      await AppDataSource.initialize();
      this.logger.info('✅ Conexão com o banco de dados estabelecida com sucesso');
    }
  } catch (error) {
    this.logger.error('❌ Erro ao conectar com o banco de dados:', error);
    process.exit(1); // Encerra a aplicação se não conseguir conectar ao DB
  }
}

/**
 * Inicia o servidor HTTP
 */
private async startServer(app: express.Application): Promise<void> {
  return new Promise((resolve, reject) => {
    const server = app.listen(this.PORT, this.HOST, () => {
      this.logger.info(`✅ Servidor rodando em http://${this.HOST}:${this.PORT}`);
      this.logger.info(`🌐 Ambiente: ${process.env.NODE_ENV || 'development'}`);
      resolve();
    });

    server.on('error', (error) => {
      this.logger.error('❌ Erro ao iniciar o servidor HTTP', error);
      reject(error);
    });
  });
}
}