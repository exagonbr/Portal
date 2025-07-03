import db from '../config/database';
import bcrypt from 'bcryptjs';

async function createAdminUser() {
  try {
    console.log('🚀 Criando usuário administrador...\n');
    
    // 1. Verificar ou criar instituição
    console.log('📋 Verificando instituição...');
    let institution = await db('institution')
      .where('name', 'Sabercon Educação')
      .first();
    
    if (!institution) {
      console.log('   Criando nova instituição...');
      [institution] = await db('institution').insert({
        name: 'Sabercon Educação',
        company_name: 'Sabercon Educação LTDA',
        accountable_name: 'Administrador Sistema',
        accountable_contact: 'admin@sabercon.edu.br',
        document: '00.000.000/0001-00', // CNPJ fictício
        street: 'Rua Principal',
        district: 'Centro',
        state: 'SP',
        postal_code: '00000-000',
        contract_disabled: false,
        contract_term_start: new Date(),
        contract_term_end: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 ano
        deleted: false,
        has_library_platform: true,
        has_principal_platform: true,
        has_student_platform: true
      }).returning('*');
      console.log(`   ✅ Instituição criada: ${institution.name} (ID: ${institution.id})`);
    } else {
      console.log(`   ✅ Instituição já existe: ${institution.name} (ID: ${institution.id})`);
    }
    
    // 2. Verificar ou criar role SYSTEM_ADMIN
    console.log('\n📋 Verificando role de administrador...');
    let adminRole = await db('roles')
      .where('name', 'SYSTEM_ADMIN')
      .first();
    
    if (!adminRole) {
      console.log('   Criando nova role...');
      [adminRole] = await db('roles').insert({
        name: 'SYSTEM_ADMIN',
        description: 'Administrador do Sistema',
        status: 'active'
      }).returning('*');
      console.log(`   ✅ Role criada: ${adminRole.name} (ID: ${adminRole.id})`);
    } else {
      console.log(`   ✅ Role já existe: ${adminRole.name} (ID: ${adminRole.id})`);
    }
    
    // 3. Verificar ou criar usuário admin
    console.log('\n📋 Verificando usuário admin...');
    let adminUser = await db('users')
      .where('email', 'admin@sabercon.edu.br')
      .first();
    
    if (!adminUser) {
      console.log('   Criando novo usuário admin...');
      const hashedPassword = await bcrypt.hash('password123', 12);
      
      [adminUser] = await db('users').insert({
        email: 'admin@sabercon.edu.br',
        password: hashedPassword,
        name: 'Administrador do Sistema',
        role_id: adminRole.id,
        institution_id: institution.id,
        is_active: true
      }).returning('*');
      
      console.log(`   ✅ Usuário criado: ${adminUser.email} (ID: ${adminUser.id})`);
    } else {
      console.log(`   ✅ Usuário já existe: ${adminUser.email} (ID: ${adminUser.id})`);
      
      // Verificar se o usuário está ativo
      if (!adminUser.is_active) {
        console.log('   ⚠️  Usuário estava inativo. Ativando...');
        await db('users')
          .where('id', adminUser.id)
          .update({ is_active: true });
        console.log('   ✅ Usuário ativado!');
      }
    }
    
    // 4. Verificar ou criar permissões básicas
    console.log('\n📋 Verificando permissões básicas...');
    const permissionNames = [
      { name: 'system.manage', resource: 'system', action: 'manage', description: 'Gerenciar sistema' },
      { name: 'users.manage', resource: 'users', action: 'manage', description: 'Gerenciar usuários' },
      { name: 'portal.access', resource: 'portal', action: 'access', description: 'Acessar portal' }
    ];
    
    const permissions = [];
    for (const permData of permissionNames) {
      let permission = await db('permissions')
        .where('name', permData.name)
        .first();
      
      if (!permission) {
        console.log(`   Criando permissão: ${permData.name}`);
        [permission] = await db('permissions').insert(permData).returning('*');
      }
      permissions.push(permission);
    }
    console.log(`   ✅ ${permissions.length} permissões verificadas/criadas`);
    
    // 5. Associar permissões à role
    console.log('\n📋 Verificando associações de permissões...');
    let associationsCreated = 0;
    
    for (const permission of permissions) {
      const exists = await db('role_permissions')
        .where({
          role_id: adminRole.id,
          permission_id: permission.id
        })
        .first();
      
      if (!exists) {
        await db('role_permissions').insert({
          role_id: adminRole.id,
          permission_id: permission.id
        });
        associationsCreated++;
      }
    }
    
    console.log(`   ✅ ${associationsCreated} novas associações criadas`);
    
    console.log('\n🎉 USUÁRIO ADMIN CRIADO COM SUCESSO!');
    console.log('==========================================');
    console.log('📧 Email: admin@sabercon.edu.br');
    console.log('🔑 Senha: password123');
    console.log('==========================================');
    
  } catch (error) {
    console.error('❌ Erro ao criar usuário admin:', error);
    throw error;
  } finally {
    await db.destroy();
  }
}

createAdminUser();