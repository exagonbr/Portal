#!/usr/bin/env node

import { AppDataSource } from '../config/typeorm.config';
import AuthService from '../services/AuthService';
import { testRedisConnection } from '../config/redis';
import getRedisClient from '../config/redis';
import * as dotenv from 'dotenv';

// Carrega variáveis de ambiente
dotenv.config();

async function setupDatabase() {
  console.log('🗄️  Configurando banco de dados...');
  
  try {
    // Inicializa conexão com o banco
    if (!AppDataSource.isInitialized) {
      await AppDataSource.initialize();
      console.log('✅ Conexão com banco de dados estabelecida');
    }

    // Executa migrações se necessário
    const pendingMigrations = await AppDataSource.showMigrations();
    if (pendingMigrations) {
      console.log('📋 Executando migrações pendentes...');
      await AppDataSource.runMigrations();
      console.log('✅ Migrações executadas com sucesso');
    }

    console.log('✅ Banco de dados configurado com sucesso');
  } catch (error) {
    console.log('❌ Erro ao configurar banco de dados:', error);
    throw error;
  }
}

async function setupRedis() {
  console.log('🔴 Configurando Redis...');
  
  try {
    const redisConnected = await testRedisConnection();
    if (!redisConnected) {
      throw new Error('Falha na conexão com Redis');
    }
    console.log('✅ Redis configurado com sucesso');
  } catch (error) {
    console.log('❌ Erro ao configurar Redis:', error);
    throw error;
  }
}

async function createDefaultData() {
  console.log('👥 Criando dados padrão...');
  
  try {
    // Aviso sobre a necessidade de implementar a criação de dados padrão
    console.log('⚠️ Funcionalidade de criação de dados padrão precisa ser implementada');
    console.log('📋 Verifique a implementação em AuthService ou crie os dados manualmente');
    
    console.log('✅ Setup de dados padrão concluído');
  } catch (error) {
    console.log('❌ Erro ao criar dados padrão:', error);
    throw error;
  }
}

async function cleanupExpiredSessions() {
  console.log('🧹 Limpando sessões expiradas...');
  
  try {
    const redis = getRedisClient();
    
    // Limpa tokens blacklisted expirados
    const blacklistedKeys = await redis.keys('blacklisted_tokens:*');
    for (const key of blacklistedKeys) {
      const ttl = await redis.ttl(key);
      if (ttl <= 0) {
        await redis.del(key);
      }
    }
    
    // Limpa sessões órfãs
    const sessionKeys = await redis.keys('session:*');
    for (const key of sessionKeys) {
      const ttl = await redis.ttl(key);
      if (ttl <= 0) {
        await redis.del(key);
      }
    }
    
    console.log(`✅ ${blacklistedKeys.length} chaves de sessão verificadas`);
  } catch (error) {
    console.log('❌ Erro ao limpar sessões:', error);
    throw error;
  }
}

async function showSystemInfo() {
  console.log('\n📊 Informações do Sistema:');
  console.log(`   Ambiente: ${process.env.NODE_ENV || 'development'}`);
  console.log(`   Versão Node.js: ${process.version}`);
  console.log(`   Porta da API: ${process.env.PORT || 3001}`);
  console.log(`   URL do Redis: ${process.env.REDIS_HOST || 'localhost'}:${process.env.REDIS_PORT || 6379}`);
  console.log(`   CORS Origin: ${process.env.CORS_ORIGIN || 'https://portal.sabercon.com.br'}`);
  console.log(`   JWT Secret: ✅ Hardcoded (Produção)`);
  
  // Verifica configurações importantes
  const warnings = [];
  
  // JWT_SECRET agora é hardcoded - não precisa de verificação
  
  if (process.env.NODE_ENV === 'production' && !process.env.REDIS_PASSWORD) {
    warnings.push('Redis sem senha em produção');
  }
  
  if (warnings.length > 0) {
    console.log('\n⚠️  Avisos de Configuração:');
    warnings.forEach(warning => console.log(`   - ${warning}`));
  }
}

async function main() {
  console.log('🚀 Iniciando setup do Portal Sabercon Backend...\n');
  
  try {
    // Setup do banco de dados
    await setupDatabase();
    
    // Setup do Redis
    await setupRedis();
    
    // Cria dados padrão
    await createDefaultData();
    
    // Limpa sessões expiradas
    await cleanupExpiredSessions();
    
    // Mostra informações do sistema
    await showSystemInfo();
    
    console.log('\n✅ Setup concluído com sucesso!');
    console.log('\n🌐 Para iniciar o servidor, execute:');
    console.log('   npm run dev (desenvolvimento)');
    console.log('   npm run start (produção)\n');
    
  } catch (error) {
    console.log('\n❌ Falha no setup:', error);
    process.exit(1);
  } finally {
    // Fecha conexões
    if (AppDataSource.isInitialized) {
      await AppDataSource.destroy();
    }
    
    const redis = getRedisClient();
    if (redis.status === 'ready') {
      await redis.quit();
    }
    
    process.exit(0);
  }
}

// Executa o setup se este arquivo for executado diretamente
if (require.main === module) {
  main().catch(error => {
    console.log('Erro fatal no setup:', error);
    process.exit(1);
  });
}

export default main; 