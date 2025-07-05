import express from 'express';
import * as dotenv from 'dotenv';
import { Logger } from './utils/Logger';
import { setupMiddlewares } from './config/middlewares';
import { setupRoutes } from './config/routes';
import { setupErrorHandling } from './config/errorHandling';
import { db } from './database/connection';
import { AppDataSource } from './config/typeorm.config';

// Carrega variáveis de ambiente
dotenv.config();

const logger = new Logger('ServerStartup');

/**
 * Cria e configura a aplicação Express
 */
function createApp(): express.Application {
  const app = express();
  
  // Configuração de middlewares
  setupMiddlewares(app);
  
  // Configuração de rotas
  setupRoutes(app);
  
  // Configuração de tratamento de erros
  setupErrorHandling(app);
  
  return app;
}

/**
 * Função principal para inicializar o servidor
 */
async function startServer(): Promise<void> {
  try {
    logger.info('🚀 Iniciando Portal Sabercon Backend...');
    
    // Inicializar TypeORM
    logger.info('🔧 Inicializando TypeORM...');
    if (!AppDataSource.isInitialized) {
      await AppDataSource.initialize();
      logger.info('✅ TypeORM inicializado com sucesso');
    }
    
    // Testar conexão com banco (Knex)
    logger.info('📊 Testando conexão com banco de dados (Knex)...');
    await db.raw('SELECT 1');
    logger.info('✅ Conexão com banco de dados OK');
    
    const app = createApp();
    const PORT = parseInt(process.env.PORT || '3001', 10);
    const HOST = '127.0.0.1';
    
    app.listen(PORT, HOST, () => {
      logger.info(`✅ Servidor rodando em http://${HOST}:${PORT}`);
      logger.info(`🌐 Ambiente: ${process.env.NODE_ENV || 'development'}`);
    });
    
  } catch (error) {
    const errorMessage = error instanceof Error
      ? error.message
      : 'Erro desconhecido';
    
    logger.error(`❌ Erro ao iniciar servidor: ${errorMessage}`, error);
    process.exit(1);
  }
}

/**
 * Configuração de graceful shutdown
 */
function setupGracefulShutdown(): void {
  const shutdown = async (signal: string) => {
    logger.info(`🛑 ${signal} recebido, encerrando servidor...`);
    
    try {
      // Finalizar TypeORM
      if (AppDataSource.isInitialized) {
        await AppDataSource.destroy();
        logger.info('✅ TypeORM finalizado com sucesso');
      }
      
      // Finalizar Knex
      await db.destroy();
      logger.info('✅ Knex finalizado com sucesso');
    } catch (error) {
      logger.error('❌ Erro ao finalizar conexões:', error);
    }
    
    process.exit(0);
  };

  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));
}

// Inicia o servidor apenas se este arquivo for executado diretamente
if (require.main === module) {
  setupGracefulShutdown();
  startServer();
}

export default createApp;