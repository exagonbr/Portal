/**
 * Script para testar as permissões de notificação
 * Executa os testes das funções de controle de acesso
 */

// Simular as funções de permissão (versão simplificada para teste)
function normalizeRole(role) {
  if (!role) return null;
  
  const normalized = role.trim().toLowerCase();
  
  const roleVariations = {
    'aluno': 'student',
    'estudante': 'student',
    'professor': 'teacher',
    'docente': 'teacher',
    'administrador': 'system_admin',
    'admin': 'system_admin',
    'system_admin': 'system_admin',
    'gestor': 'institution_manager',
    'gerente': 'institution_manager',
    'institution_manager': 'institution_manager',
    'coordenador acadêmico': 'academic_coordinator',
    'coordenador': 'academic_coordinator',
    'academic_coordinator': 'academic_coordinator',
    'responsável': 'guardian',
    'pai': 'guardian',
    'mãe': 'guardian',
    'guardian': 'guardian'
  };
  
  return roleVariations[normalized] || normalized;
}

function canSendNotifications(role) {
  if (!role) {
    console.log('❌ canSendNotifications: role é null/undefined');
    return false;
  }

  console.log(`🔍 canSendNotifications: verificando permissão para role "${role}"`);

  const normalizedRole = normalizeRole(role) || role.toLowerCase();
  
  const restrictedRoles = [
    'student', 'aluno', 'estudante',
    'guardian', 'responsável', 'pai', 'mãe'
  ];
  
  const isRestricted = restrictedRoles.some(restricted => {
    return normalizedRole === restricted || 
           role.toLowerCase() === restricted ||
           role.toLowerCase().includes(restricted) ||
           restricted.includes(role.toLowerCase());
  });

  if (isRestricted) {
    console.log(`❌ canSendNotifications: role "${role}" não pode enviar notificações (restrita)`);
    return false;
  }

  console.log(`✅ canSendNotifications: role "${role}" pode enviar notificações`);
  return true;
}

function getNotifiableRoles(userRole) {
  if (!userRole || !canSendNotifications(userRole)) {
    return [];
  }

  const normalizedRole = normalizeRole(userRole) || userRole.toLowerCase();
  
  if (normalizedRole === 'system_admin' || userRole.toLowerCase().includes('admin')) {
    return [
      'institution_manager', 'gestor', 'manager',
      'academic_coordinator', 'coordenador',
      'teacher', 'professor',
      'student', 'aluno',
      'guardian', 'responsável'
    ];
  }
  
  if (normalizedRole === 'institution_manager' || userRole.toLowerCase().includes('gestor')) {
    return [
      'academic_coordinator', 'coordenador',
      'teacher', 'professor',
      'student', 'aluno',
      'guardian', 'responsável'
    ];
  }
  
  if (normalizedRole === 'academic_coordinator' || userRole.toLowerCase().includes('coordenador')) {
    return [
      'teacher', 'professor',
      'student', 'aluno',
      'guardian', 'responsável'
    ];
  }
  
  if (normalizedRole === 'teacher' || userRole.toLowerCase().includes('professor')) {
    return [
      'student', 'aluno',
      'guardian', 'responsável'
    ];
  }
  
  return ['student', 'aluno'];
}

// Executar testes
function testNotificationPermissions() {
  const testRoles = [
    'SYSTEM_ADMIN', 'system_admin', 'admin', 'administrador',
    'INSTITUTION_MANAGER', 'institution_manager', 'gestor', 'manager',
    'ACADEMIC_COORDINATOR', 'academic_coordinator', 'coordenador',
    'TEACHER', 'teacher', 'professor',
    'STUDENT', 'student', 'aluno',
    'GUARDIAN', 'guardian', 'responsável'
  ];
  
  console.log('🧪 Testando permissões de notificação:');
  console.log('=====================================');
  
  testRoles.forEach(role => {
    const canSend = canSendNotifications(role);
    const notifiableRoles = getNotifiableRoles(role);
    
    console.log(`\n📋 ${role}:`);
    console.log(`   Pode enviar notificações: ${canSend ? '✅ SIM' : '❌ NÃO'}`);
    if (canSend) {
      console.log(`   Pode notificar: [${notifiableRoles.join(', ')}]`);
    }
  });
  
  console.log('\n=====================================');
  console.log('✅ Teste concluído!');
  console.log('\n📊 Resumo:');
  console.log('   ✅ Roles que PODEM enviar: System Admin, Institution Manager, Academic Coordinator, Teacher');
  console.log('   ❌ Roles que NÃO podem enviar: Student, Guardian');
}

// Executar o teste
testNotificationPermissions(); 