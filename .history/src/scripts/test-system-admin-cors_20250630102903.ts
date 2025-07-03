/**
 * Script para testar configuração de CORS no SystemAdminService
 */

import { systemAdminService } from '../services/systemAdminService';
import { CORS_HEADERS } from '../config/cors';

async function testSystemAdminCors() {
  console.log('🧪 [TEST-SYSTEM-ADMIN-CORS] Iniciando testes de CORS...\n');

  try {
    // 1. Verificar configuração de CORS
    console.log('1️⃣ VERIFICANDO CONFIGURAÇÃO DE CORS:');
    console.log('CORS_HEADERS:', CORS_HEADERS);
    console.log('Access-Control-Allow-Origin:', CORS_HEADERS['Access-Control-Allow-Origin']);
    console.log('Access-Control-Allow-Methods:', CORS_HEADERS['Access-Control-Allow-Methods']);
    console.log('Access-Control-Allow-Headers:', CORS_HEADERS['Access-Control-Allow-Headers']);
    console.log('');

    // 2. Testar requisição para getRealTimeMetrics
    console.log('2️⃣ TESTANDO getRealTimeMetrics com CORS:');
    try {
      const metricsStart = performance.now();
      const metrics = await systemAdminService.getRealTimeMetrics();
      const metricsEnd = performance.now();
      
      console.log('✅ getRealTimeMetrics executado com sucesso');
      console.log(`⏱️ Tempo de execução: ${(metricsEnd - metricsStart).toFixed(2)}ms`);
      console.log('Dados recebidos:', {
        activeUsers: metrics?.activeUsers,
        activeSessions: metrics?.activeSessions,
        hasMemoryUsage: !!metrics?.memoryUsage
      });
    } catch (error) {
      console.error('❌ Erro em getRealTimeMetrics:', error);
    }
    console.log('');

    // 3. Testar requisição para getSystemHealth
    console.log('3️⃣ TESTANDO getSystemHealth com CORS:');
    try {
      const healthStart = performance.now();
      const health = await systemAdminService.getSystemHealth();
      const healthEnd = performance.now();
      
      console.log('✅ getSystemHealth executado com sucesso');
      console.log(`⏱️ Tempo de execução: ${(healthEnd - healthStart).toFixed(2)}ms`);
      console.log('Status geral:', health?.overall);
      console.log('Componentes:', Object.keys(health?.components || {}));
    } catch (error) {
      console.error('❌ Erro em getSystemHealth:', error);
    }
    console.log('');

    // 4. Testar requisição para getRealUserStats
    console.log('4️⃣ TESTANDO getRealUserStats com CORS:');
    try {
      const userStatsStart = performance.now();
      const userStats = await systemAdminService.getRealUserStats();
      const userStatsEnd = performance.now();
      
      console.log('✅ getRealUserStats executado com sucesso');
      console.log(`⏱️ Tempo de execução: ${(userStatsEnd - userStatsStart).toFixed(2)}ms`);
      console.log('Dados recebidos:', {
        total_users: userStats?.total_users,
        active_users: userStats?.active_users,
        hasRoleData: !!userStats?.users_by_role
      });
    } catch (error) {
      console.error('❌ Erro em getRealUserStats:', error);
    }
    console.log('');

    // 5. Testar requisição para getSystemDashboard
    console.log('5️⃣ TESTANDO getSystemDashboard com CORS:');
    try {
      const dashboardStart = performance.now();
      const dashboard = await systemAdminService.getSystemDashboard();
      const dashboardEnd = performance.now();
      
      console.log('✅ getSystemDashboard executado com sucesso');
      console.log(`⏱️ Tempo de execução: ${(dashboardEnd - dashboardStart).toFixed(2)}ms`);
      console.log('Dados recebidos:', {
        users: dashboard?.users ? 'Presente' : 'Ausente',
        sessions: dashboard?.sessions ? 'Presente' : 'Ausente',
        system: dashboard?.system ? 'Presente' : 'Ausente'
      });
    } catch (error) {
      console.error('❌ Erro em getSystemDashboard:', error);
    }
    console.log('');

    // 6. Verificar se há erros relacionados ao CORS no console
    console.log('6️⃣ VERIFICANDO ERROS DE CORS NO CONSOLE:');
    console.log('🔍 Verifique o console do browser para erros como:');
    console.log('   - "CORS policy: No \'Access-Control-Allow-Origin\' header"');
    console.log('   - "has been blocked by CORS policy"');
    console.log('   - "Cross-Origin Request Blocked"');
    console.log('');

    console.log('✅ [TEST-SYSTEM-ADMIN-CORS] Testes de CORS concluídos');
    console.log('📝 Verifique os logs acima para identificar possíveis problemas de CORS');

  } catch (error) {
    console.error('❌ [TEST-SYSTEM-ADMIN-CORS] Erro geral nos testes:', error);
  }
}

// Função para testar uma requisição fetch manual com CORS
async function testManualFetchCors() {
  console.log('\n🧪 [TEST-MANUAL-FETCH-CORS] Testando fetch manual com CORS...');
  
  try {
    const response = await fetch('/api/dashboard/metrics/realtime', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...CORS_HEADERS
      },
      mode: 'cors',
      credentials: 'include'
    });

    console.log('📡 Resposta da requisição manual:');
    console.log('Status:', response.status);
    console.log('OK:', response.ok);
    console.log('Headers:', Object.fromEntries(response.headers.entries()));

    if (response.ok) {
      const data = await response.json();
      console.log('✅ Dados recebidos:', data.success ? 'Sucesso' : 'Falha');
    } else {
      console.log('❌ Requisição falhou com status:', response.status);
    }

  } catch (error) {
    console.error('❌ Erro na requisição manual:', error);
  }
}

// Executar se chamado diretamente
if (typeof window !== 'undefined') {
  (window as any).testSystemAdminCors = testSystemAdminCors;
  (window as any).testManualFetchCors = testManualFetchCors;
  console.log('🔧 Funções de teste CORS disponíveis no console:');
  console.log('   - testSystemAdminCors()');
  console.log('   - testManualFetchCors()');
}

export { testSystemAdminCors, testManualFetchCors }; 