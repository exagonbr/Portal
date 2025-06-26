import db from '../config/database';
import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';

async function createAdminSimple() {
  try {
    console.log('🚀 Criando usuário administrador de forma simplificada...\n');
    
    // 1. Buscar role SYSTEM_ADMIN existente
    const adminRole = await db('roles')
      .where('name', 'SYSTEM_ADMIN')
      .first();
    
    if (!adminRole) {
      console.error('❌ Role SYSTEM_ADMIN não encontrada!');
      return;
    }
    
    console.log(`✅ Role encontrada: ${adminRole.name} (ID: ${adminRole.id})`);
    
    // 2. Usar a primeira instituição existente
    console.log('\n📋 Buscando instituição existente...');
    const institution = await db('institution')
      .where('name', 'Sabercon Educação')
      .first();
    
    if (!institution) {
      console.error('❌ Nenhuma instituição encontrada!');
      return;
    }
    
    // Converter o ID numérico para UUID (usando um UUID fixo baseado no ID)
    // Isso é uma solução temporária devido à inconsistência do schema
    const institutionUuid = `00000000-0000-0000-0000-${String(institution.id).padStart(12, '0')}`;
    
    console.log(`✅ Instituição encontrada: ${institution.name} (ID original: ${institution.id})`);
    console.log(`   UUID gerado: ${institutionUuid}`);
    
    // 3. Verificar se o usuário admin já existe
    const existingUser = await db('users')
      .where('email', 'admin@sabercon.edu.br')
      .first();
    
    if (existingUser) {
      console.log('\n⚠️  Usuário admin já existe!');
      
      // Ativar o usuário se estiver inativo
      if (!existingUser.is_active) {
        await db('users')
          .where('id', existingUser.id)
          .update({
            is_active: true,
            role_id: adminRole.id,
            institution_id: institutionUuid
          });
        console.log('✅ Usuário ativado e atualizado!');
      }
    } else {
      // 4. Criar novo usuário admin
      console.log('\n📋 Criando novo usuário admin...');
      const hashedPassword = await bcrypt.hash('password123', 12);
      const userId = uuidv4();
      
      await db('users').insert({
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
        institution_id: 1,
        deleted: false
      });
      
      console.log(`✅ Usuário criado com sucesso! ID: ${userId}`);
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

createAdminSimple();