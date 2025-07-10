import { AppDataSource } from '../src/config/typeorm.config';
import { User } from '../src/entities/User';
import { Role } from '../src/entities/Role';
import * as bcrypt from 'bcryptjs';
import { IsNull } from 'typeorm';

async function diagnoseAuthIssue() {
  try {
    console.log('🔍 Iniciando diagnóstico de problema de autenticação...\n');
    
    // Inicializar conexão com banco
    await AppDataSource.initialize();
    console.log('✅ Conexão com banco de dados estabelecida');
    
    const userRepository = AppDataSource.getRepository(User);
    const roleRepository = AppDataSource.getRepository(Role);
    
    // 1. Verificar quantos usuários existem
    const totalUsers = await userRepository.count();
    console.log(`\n📊 Total de usuários no banco: ${totalUsers}`);
    
    if (totalUsers === 0) {
      console.log('❌ Nenhum usuário encontrado no banco de dados!');
      console.log('💡 Você precisa criar usuários primeiro.');
      return;
    }
    
    // 2. Verificar usuários com diferentes status
    const activeUsers = await userRepository.count({ where: { enabled: true } });
    const inactiveUsers = await userRepository.count({ where: { enabled: false } });
    const nullEnabledUsers = await userRepository.count({ where: { enabled: IsNull() } });
    
    console.log(`\n📈 Status dos usuários:`);
    console.log(`   - Ativos (enabled = true): ${activeUsers}`);
    console.log(`   - Inativos (enabled = false): ${inactiveUsers}`);
    console.log(`   - Status nulo (enabled = null): ${nullEnabledUsers}`);
    
    // 3. Listar alguns usuários para análise
    console.log(`\n👥 Primeiros 10 usuários:`);
    const users = await userRepository.find({
      take: 10,
      relations: ['role'],
      select: ['id', 'email', 'fullName', 'enabled', 'isAdmin', 'isManager', 'isTeacher', 'isStudent']
    });
    
    users.forEach(user => {
      console.log(`   - ${user.email} (${user.fullName})`);
      console.log(`     Status: enabled=${user.enabled}, admin=${user.isAdmin}, manager=${user.isManager}`);
      console.log(`     Role: ${user.role?.name || 'Sem role'}`);
      console.log(`     Flags: teacher=${user.isTeacher}, student=${user.isStudent}`);
      console.log('');
    });
    
    // 4. Verificar se existem roles no sistema
    const totalRoles = await roleRepository.count();
    console.log(`\n🎭 Total de roles no sistema: ${totalRoles}`);
    
    if (totalRoles === 0) {
      console.log('❌ Nenhuma role encontrada no sistema!');
      console.log('💡 Você precisa criar roles primeiro.');
    } else {
      const roles = await roleRepository.find();
      console.log('📋 Roles disponíveis:');
      roles.forEach(role => {
        console.log(`   - ${role.name}: ${role.description || 'Sem descrição'}`);
      });
    }
    
    // 5. Verificar usuário específico para teste (se fornecido)
    const testEmail = 'admin@sabercon.edu.br';
    console.log(`\n🔍 Verificando usuário específico: ${testEmail}`);
    
    const testUser = await userRepository.findOne({
      where: { email: testEmail },
      relations: ['role']
    });
    
    if (testUser) {
      console.log('✅ Usuário encontrado:');
      console.log(`   - ID: ${testUser.id}`);
      console.log(`   - Email: ${testUser.email}`);
      console.log(`   - Nome: ${testUser.fullName}`);
      console.log(`   - Enabled: ${testUser.enabled}`);
      console.log(`   - Role: ${testUser.role?.name || 'Sem role'}`);
      console.log(`   - Senha definida: ${testUser.password ? 'Sim' : 'Não'}`);
      console.log(`   - Senha hash válido: ${testUser.password?.startsWith('$2') ? 'Sim' : 'Não'}`);
      
      // Testar senha se fornecida
      if (testUser.password) {
        const testPassword = 'password123';
        console.log(`\n🔐 Testando senha "${testPassword}"...`);
        const isValid = await testUser.comparePassword(testPassword);
        console.log(`   - Senha válida: ${isValid ? 'Sim' : 'Não'}`);
      }
    } else {
      console.log('❌ Usuário não encontrado');
    }
    
    // 6. Sugestões de correção
    console.log('\n💡 Sugestões para correção:');
    
    if (inactiveUsers > 0 || nullEnabledUsers > 0) {
      console.log('1. Ativar usuários inativos:');
      console.log('   npm run activate-users');
    }
    
    if (totalRoles === 0) {
      console.log('2. Criar roles básicas do sistema:');
      console.log('   npm run create-roles');
    }
    
    const usersWithoutRole = await userRepository.count({ where: { role: null } });
    if (usersWithoutRole > 0) {
      console.log('3. Atribuir roles aos usuários:');
      console.log('   npm run assign-roles');
    }
    
    if (totalUsers === 0) {
      console.log('4. Criar usuário administrador:');
      console.log('   npm run create-admin');
    }
    
  } catch (error) {
    console.error('❌ Erro durante diagnóstico:', error);
  } finally {
    await AppDataSource.destroy();
    console.log('\n✅ Diagnóstico concluído');
  }
}

// Executar diagnóstico
if (require.main === module) {
  diagnoseAuthIssue();
}

export default diagnoseAuthIssue; 