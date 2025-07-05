/**
 * Script de teste para verificar se o roleService está funcionando
 */

import { roleService } from './services/roleService';

async function testRoleService() {
  console.log('🧪 Testando roleService...');
  
  try {
    console.log('📋 Testando getActiveRoles...');
    const activeRoles = await roleService.getActiveRoles();
    console.log('✅ getActiveRoles funcionou!', {
      count: activeRoles.length,
      roles: activeRoles.map(r => ({ id: r.id, name: r.name }))
    });
    
    console.log('📋 Testando getRoles...');
    const allRoles = await roleService.getRoles({ limit: 5 });
    console.log('✅ getRoles funcionou!', {
      count: allRoles.items.length,
      total: allRoles.total,
      roles: allRoles.items.map(r => ({ id: r.id, name: r.name }))
    });
    
  } catch (error) {
    console.log('❌ Erro no teste:', error);
  }
}

// Executar apenas se chamado diretamente
if (typeof window !== 'undefined') {
  (window as any).testRoleService = testRoleService;
  console.log('🧪 Função testRoleService disponível no window.testRoleService()');
}

export { testRoleService };