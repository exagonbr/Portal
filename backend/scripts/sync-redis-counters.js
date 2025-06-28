#!/usr/bin/env node

/**
 * Script para sincronizar contadores Redis de sessões
 * Útil para manutenção e correção de inconsistências
 */

const { SessionService } = require('../dist/services/SessionService');

async function main() {
  try {
    console.log('🔄 Iniciando sincronização de contadores Redis...');
    
    // Sincronizar contadores de sessão
    await SessionService.syncSessionCounters();
    
    // Obter estatísticas atualizadas
    const stats = await SessionService.getSessionStats();
    
    console.log('📊 Estatísticas atualizadas:');
    console.log('  - Usuários ativos:', stats.activeUsers);
    console.log('  - Sessões ativas:', stats.totalActiveSessions);
    console.log('  - Por dispositivo:', stats.sessionsByDevice);
    
    console.log('✅ Sincronização concluída com sucesso!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Erro na sincronização:', error);
    process.exit(1);
  }
}

// Executar apenas se chamado diretamente
if (require.main === module) {
  main();
}

module.exports = { main };
