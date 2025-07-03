import db from '../config/database';
import bcrypt from 'bcryptjs';

async function createAdminLegacy() {
  try {
    console.log('🚀 Criando usuário administrador para sistema legado...\n');
    
    // 1. Verificar se já existe um usuário admin
    const existingAdmin = await db('users')
      .where('email', 'admin@sabercon.edu.br')
      .first();
    
    if (existingAdmin) {
      console.log('⚠️  Usuário admin já existe!');
      console.log(`   ID: ${existingAdmin.id}`);
      console.log(`   Email: ${existingAdmin.email}`);
      console.log(`   Nome: ${existingAdmin.name}`);
      console.log(`   Ativo: ${existingAdmin.is_active ? 'Sim' : 'Não'}`);
      
      if (!existingAdmin.is_active) {
        console.log('\n📋 Ativando usuário...');
        await db('users')
          .where('id', existingAdmin.id)
          .update({
            is_active: true,
            password: await bcrypt.hash('password123', 12)
          });
        console.log('✅ Usuário ativado e senha redefinida!');
      }
    } else {
      // 2. Buscar uma instituição existente
      const institution = await db('institution')
        .where('name', 'Sabercon Educação')
        .first();
      
      const institutionId = institution ? institution.id : 1;
      
      // 3. Criar novo usuário admin
      console.log('📋 Criando novo usuário admin...');
      const hashedPassword = await bcrypt.hash('password123', 12);
      
      const [newUser] = await db('users').insert({
        email: 'admin@sabercon.edu.br',
        password: hashedPassword,
        full_name: 'Administrador do Sistema',
        username: 'admin',
        enabled: true,
        account_expired: false,
        account_locked: false,
        password_expired: false,
        is_admin: true,
        is_manager: true,
        is_teacher: false,
        is_student: false,
        reset_password: false,
        institution_id: institutionId,
        deleted: false
      }).returning('*');
      
      console.log(`✅ Usuário criado com sucesso!`);
      console.log(`   ID: ${newUser.id}`);
      console.log(`   Email: ${newUser.email}`);
    }
    
    console.log('\n🎉 PROCESSO CONCLUÍDO!');
    console.log('==========================================');
    console.log('📧 Email: admin@sabercon.edu.br');
    console.log('🔑 Senha: password123');
    console.log('==========================================');
    
  } catch (error) {
    console.error('❌ Erro:', error);
  } finally {
    await db.destroy();
  }
}

createAdminLegacy();