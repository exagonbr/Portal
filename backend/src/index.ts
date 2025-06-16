import express from 'express';
import * as dotenv from 'dotenv';
import { Logger } from './utils/Logger';
import { setupMiddlewares } from './config/middlewares';
import { setupRoutes } from './config/routes';
import { setupErrorHandling } from './config/errorHandling';
import { ServerInitializer } from './config/serverInitializer';

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
    
    const app = createApp();
    const serverInitializer = new ServerInitializer(logger);
    
    await serverInitializer.initialize(app);
    
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
  const shutdown = (signal: string) => {
    logger.info(`🛑 ${signal} recebido, encerrando servidor...`);
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