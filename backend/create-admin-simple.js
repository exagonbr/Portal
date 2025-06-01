#!/usr/bin/env node

const bcrypt = require('bcryptjs');
const { Client } = require('pg');
require('dotenv').config();

console.log('👑 CRIANDO ADMIN MASTER - PORTAL EDUCACIONAL');
console.log('='.repeat(50));

// Dados do Admin Master
const ADMIN_DATA = {
  email: 'maia.cspg@gmail.com',
  password: 'maia.cspg@gmail.com',
  name: 'Admin Master',
  role: 'admin_master'
};

// Configuração do banco PostgreSQL
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
  database: process.env.DB_NAME || 'portal_educacional'
};

async function createAdminMaster() {
  const client = new Client(dbConfig);
  
  try {
    console.log('🔌 Conectando ao PostgreSQL...');
    console.log(`Host: ${dbConfig.host}:${dbConfig.port}`);
    console.log(`Database: ${dbConfig.database}`);
    console.log(`User: ${dbConfig.user}`);
    
    await client.connect();
    console.log('✅ Conexão estabelecida com sucesso!');

    // Verificar se usuário já existe
    console.log('\n🔍 Verificando se admin já existe...');
    const existingUserQuery = 'SELECT id, email, name, role FROM users WHERE email = $1';
    const existingUserResult = await client.query(existingUserQuery, [ADMIN_DATA.email]);

    let userId;
    
    if (existingUserResult.rows.length > 0) {
      console.log('⚠️  Admin com email já existe. Atualizando dados...');
      
      userId = existingUserResult.rows[0].id;
      
      // Hash da nova senha
      const hashedPassword = await bcrypt.hash(ADMIN_DATA.password, 12);
      
      // Atualizar usuário existente
      const updateQuery = `
        UPDATE users SET
          name = $1,
          password = $2,
          role = $3,
          is_active = true,
          is_verified = true,
          updated_at = NOW(),
          permissions = $4,
          metadata = $5
        WHERE email = $6
        RETURNING id, email, name, role`;
      
      const permissions = JSON.stringify([
        'admin_master',
        'user_management',
        'institution_management',
        'content_management',
        'analytics_access',
        'system_settings',
        'backup_restore',
        'migration_control'
      ]);
      
      const metadata = JSON.stringify({
        admin_level: 'master',
        created_by: 'system',
        admin_notes: 'Admin Master atualizado via script',
        access_level: 'unlimited',
        updated_at: new Date().toISOString()
      });

      const updateResult = await client.query(updateQuery, [
        ADMIN_DATA.name,
        hashedPassword,
        ADMIN_DATA.role,
        permissions,
        metadata,
        ADMIN_DATA.email
      ]);

      console.log('✅ Admin Master atualizado com sucesso!');
      
    } else {
      console.log('➕ Criando novo Admin Master...');
      
      // Gerar UUID (PostgreSQL nativo)
      const uuidResult = await client.query('SELECT gen_random_uuid() as uuid');
      userId = uuidResult.rows[0].uuid;
      
      // Hash da senha
      const hashedPassword = await bcrypt.hash(ADMIN_DATA.password, 12);
      
      // Criar novo usuário admin
      const insertQuery = `
        INSERT INTO users (
          id, email, name, password, role, is_active, is_verified,
          email_verified_at, created_at, updated_at, permissions, metadata
        ) VALUES (
          $1, $2, $3, $4, $5, true, true,
          NOW(), NOW(), NOW(), $6, $7
        ) RETURNING id, email, name, role`;
      
      const permissions = JSON.stringify([
        'admin_master',
        'user_management',
        'institution_management',
        'content_management',
        'analytics_access',
        'system_settings',
        'backup_restore',
        'migration_control'
      ]);
      
      const metadata = JSON.stringify({
        admin_level: 'master',
        created_by: 'system',
        admin_notes: 'Admin Master criado via script de inicialização',
        access_level: 'unlimited'
      });

      const insertResult = await client.query(insertQuery, [
        userId,
        ADMIN_DATA.email,
        ADMIN_DATA.name,
        hashedPassword,
        ADMIN_DATA.role,
        permissions,
        metadata
      ]);

      console.log('✅ Admin Master criado com sucesso!');
      
      // Tentar criar perfil se a tabela existir
      try {
        const profileCheckQuery = `
          SELECT EXISTS (
            SELECT 1 FROM information_schema.tables 
            WHERE table_name = 'user_profiles'
          ) as table_exists`;
        
        const profileCheckResult = await client.query(profileCheckQuery);
        
        if (profileCheckResult.rows[0].table_exists) {
          // Verificar se perfil já existe
          const existingProfileQuery = 'SELECT id FROM user_profiles WHERE user_id = $1';
          const existingProfileResult = await client.query(existingProfileQuery, [userId]);
          
          if (existingProfileResult.rows.length === 0) {
            // Gerar UUID para o perfil
            const profileUuidResult = await client.query('SELECT gen_random_uuid() as uuid');
            const profileId = profileUuidResult.rows[0].uuid;
            
            const profileInsertQuery = `
              INSERT INTO user_profiles (
                id, user_id, bio, preferences, created_at, updated_at
              ) VALUES (
                $1, $2, $3, $4, NOW(), NOW()
              )`;
            
            const preferences = JSON.stringify({
              theme: 'dark',
              language: 'pt-BR',
              notifications: {
                email: true,
                push: true,
                sms: false
              },
              dashboard: {
                layout: 'admin',
                widgets: ['users', 'content', 'analytics', 'system']
              }
            });

            await client.query(profileInsertQuery, [
              profileId,
              userId,
              'Administrador Master do Portal Educacional',
              preferences
            ]);
            
            console.log('✅ Perfil do Admin Master criado');
          }
        }
      } catch (error) {
        console.log('⚠️  Aviso: Não foi possível criar perfil (tabela pode não existir)');
      }
    }

    // Limpar sessions antigas se tabela existir
    try {
      const sessionCheckQuery = `
        SELECT EXISTS (
          SELECT 1 FROM information_schema.tables 
          WHERE table_name = 'user_sessions'
        ) as table_exists`;
      
      const sessionCheckResult = await client.query(sessionCheckQuery);
      
      if (sessionCheckResult.rows[0].table_exists) {
        await client.query('DELETE FROM user_sessions WHERE user_id = $1', [userId]);
        console.log('✅ Sessions antigas do admin limpas');
      }
    } catch (error) {
      console.log('⚠️  Aviso: Não foi possível limpar sessions');
    }

    // Exibir informações finais
    console.log('\n📋 INFORMAÇÕES DO ADMIN MASTER:');
    console.log('='.repeat(50));
    
    const adminQuery = `
      SELECT id, email, name, role, is_active, created_at, permissions
      FROM users 
      WHERE email = $1`;
    
    const adminResult = await client.query(adminQuery, [ADMIN_DATA.email]);
    
    if (adminResult.rows.length > 0) {
      const admin = adminResult.rows[0];
      console.log(`👤 ID: ${admin.id}`);
      console.log(`📧 Email: ${admin.email}`);
      console.log(`👨‍💼 Nome: ${admin.name}`);
      console.log(`🔑 Role: ${admin.role}`);
      console.log(`✅ Ativo: ${admin.is_active}`);
      console.log(`📅 Criado em: ${admin.created_at}`);
      
      if (admin.permissions) {
        const permissions = JSON.parse(admin.permissions);
        console.log(`🛡️  Permissões: ${permissions.join(', ')}`);
      }
    }

    console.log('\n🎯 CREDENCIAIS DE ACESSO:');
    console.log('='.repeat(50));
    console.log(`📧 Email: ${ADMIN_DATA.email}`);
    console.log(`🔐 Senha: ${ADMIN_DATA.password}`);
    
    console.log('\n🚀 PRÓXIMOS PASSOS:');
    console.log('='.repeat(50));
    console.log('1. Acesse o portal usando as credenciais acima');
    console.log('2. Altere a senha após o primeiro login');
    console.log('3. Configure as instituições e usuários');
    console.log('4. Verifique as permissões do sistema');
    console.log('5. Configure integrações necessárias');

    console.log('\n✅ Admin Master configurado com sucesso! 👑');

  } catch (error) {
    console.error('\n❌ Erro ao criar Admin Master:', error.message);
    
    if (error.code === 'ECONNREFUSED') {
      console.log('\n💡 DICAS PARA RESOLVER:');
      console.log('1. Verifique se o PostgreSQL está rodando');
      console.log('2. Confirme as credenciais no arquivo .env');
      console.log('3. Teste a conexão manualmente');
    } else if (error.code === '42P01') {
      console.log('\n💡 TABELA NÃO ENCONTRADA:');
      console.log('1. Execute as migrations primeiro');
      console.log('2. Verifique se a migração foi concluída');
      console.log('3. Confirme o nome do banco de dados');
    } else if (error.code === '28P01') {
      console.log('\n💡 ERRO DE AUTENTICAÇÃO:');
      console.log('1. Verifique usuário e senha do PostgreSQL');
      console.log('2. Confirme as variáveis de ambiente');
    }
    
    process.exit(1);
  } finally {
    await client.end();
    console.log('\n🔌 Conexão fechada');
  }
}

// Executar script
if (require.main === module) {
  createAdminMaster().catch(console.error);
} 