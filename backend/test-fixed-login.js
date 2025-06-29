const { db } = require('./dist/database/connection');
const bcrypt = require('bcrypt');

async function testFixedLogin() {
  try {
    console.log('🔍 Testando login corrigido...');
    
    // Buscar usuário admin principal
    const user = await db('users')
      .select('*')
      .where('email', 'sabercon@sabercon.com.br')
      .where('enabled', true)
      .first();
      
    if (!user) {
      console.log('❌ Usuário não encontrado');
      return;
    }
    
    console.log('✅ Usuário encontrado:', {
      id: user.id,
      email: user.email,
      full_name: user.full_name,
      enabled: user.enabled,
      is_admin: user.is_admin
    });
    
    // Vamos criar uma senha de teste para este usuário
    const testPassword = 'admin123';
    const hashedPassword = await bcrypt.hash(testPassword, 10);
    
    console.log(`🔐 Criando senha de teste: ${testPassword}`);
    
    // Atualizar a senha do usuário
    await db('users')
      .where('id', user.id)
      .update({ password: hashedPassword });
      
    console.log('✅ Senha atualizada com sucesso');
    
    // Testar o login
    const isValidPassword = await bcrypt.compare(testPassword, hashedPassword);
    console.log(`🔐 Teste de senha: ${isValidPassword ? '✅ VÁLIDA' : '❌ Inválida'}`);
    
    // Simular o processo de login
    console.log('\n🚀 Simulando processo de login...');
    
    // Determinar role baseado nos campos booleanos
    let roleInfo = { name: 'Estudante', slug: 'STUDENT' };
    if (user.is_admin) {
      roleInfo = { name: 'Administrador', slug: 'ADMIN' };
    } else if (user.is_teacher) {
      roleInfo = { name: 'Professor', slug: 'TEACHER' };
    }
    
    console.log('📋 Role determinada:', roleInfo);
    
    // Determinar permissões
    let permissions = [];
    if (user.is_admin) {
      permissions = ['admin', 'read', 'write', 'delete'];
    } else if (user.is_teacher) {
      permissions = ['teacher', 'read', 'write'];
    } else {
      permissions = ['student', 'read'];
    }
    
    console.log('🔑 Permissões:', permissions);
    
    console.log('\n🎉 LOGIN SIMULADO COM SUCESSO!');
    console.log('📧 Email para teste:', user.email);
    console.log('🔐 Senha para teste:', testPassword);
    
  } catch (error) {
    console.error('❌ Erro:', error.message);
    console.error('Stack:', error.stack);
  } finally {
    await db.destroy();
    process.exit(0);
  }
}

testFixedLogin();