/**
 * Script para testar autenticação no SystemAdminService
 */

import { systemAdminService } from '../services/systemAdminService';
import { getCurrentToken, validateToken, isAuthenticated } from '../utils/token-validator';

async function testSystemAdminAuth() {
  console.log('🧪 [TEST-SYSTEM-ADMIN-AUTH] Iniciando testes...\n');

  try {
    // 1. Verificar token atual
    console.log('1️⃣ VERIFICANDO TOKEN ATUAL:');
    const currentToken = getCurrentToken();
    console.log('Token presente:', !!currentToken);
    if (currentToken) {
      console.log('Token length:', currentToken.length);
      console.log('Token preview:', currentToken.substring(0, 20) + '...');
      
      const validation = validateToken(currentToken);
      console.log('Token válido:', validation.isValid);
      console.log('Token expirado:', validation.isExpired);
      console.log('Precisa refresh:', validation.needsRefresh);
    }
    console.log('');

    // 2. Verificar status de autenticação
    console.log('2️⃣ VERIFICANDO STATUS DE AUTENTICAÇÃO:');
    const authStatus = isAuthenticated();
    console.log('Está autenticado:', authStatus);
    console.log('');

    // 3. Testar getRealUserStats
    console.log('3️⃣ TESTANDO getRealUserStats:');
    try {
      const userStats = await systemAdminService.getRealUserStats();
      console.log('✅ getRealUserStats executado com sucesso');
      console.log('Dados recebidos:', {
        total_users: userStats?.total_users,
        active_users: userStats?.active_users,
        hasRoleData: !!userStats?.users_by_role
      });
    } catch (error) {
      console.log('❌ Erro em getRealUserStats:', error);
    }
    console.log('');

    // 4. Testar getRoleStats
    console.log('4️⃣ TESTANDO getRoleStats:');
    try {
      const roleStats = await systemAdminService.getRoleStats();
      console.log('✅ getRoleStats executado com sucesso');
      console.log('Dados recebidos:', roleStats ? 'Dados presentes' : 'Null/undefined');
    } catch (error) {
      console.log('❌ Erro em getRoleStats:', error);
    }
    console.log('');

    // 5. Testar getAwsConnectionStats
    console.log('5️⃣ TESTANDO getAwsConnectionStats:');
    try {
      const awsStats = await systemAdminService.getAwsConnectionStats();
      console.log('✅ getAwsConnectionStats executado com sucesso');
      console.log('Dados recebidos:', awsStats ? 'Dados presentes' : 'Null/undefined');
    } catch (error) {
      console.log('❌ Erro em getAwsConnectionStats:', error);
    }
    console.log('');

    console.log('✅ [TEST-SYSTEM-ADMIN-AUTH] Testes concluídos');

  } catch (error) {
    console.log('❌ [TEST-SYSTEM-ADMIN-AUTH] Erro geral nos testes:', error);
  }
}

// Executar se chamado diretamente
if (typeof window !== 'undefined') {
  (window as any).testSystemAdminAuth = testSystemAdminAuth;
  console.log('🔧 Função testSystemAdminAuth disponível no console do browser');
}

export { testSystemAdminAuth }; 