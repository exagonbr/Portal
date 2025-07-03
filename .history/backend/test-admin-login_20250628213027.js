const { db } = require('./dist/database/connection');
const bcrypt = require('bcrypt');

async function testAdminLogin() {
  try {
    console.log('🔍 Testando login do admin...');
    
    // Buscar usuário admin
    const user = await db('users')
      .select('*')
      .where('email', 'admin@sabercon.edu.br')
      .first();
      
    if (!user) {
      console.log('❌ Usuário admin@sabercon.edu.br não encontrado');
      
      // Buscar usuários similares
      const similarUsers = await db('users')
        .select('id', 'email', 'full_name', 'enabled', 'is_admin')
        .where('email', 'like', '%admin%')
        .orWhere('is_admin', true)
        .limit(5);
        
      console.log('🔍 Usuários admin encontrados:');
      similarUsers.forEach(u => {
        console.log(`  - ID: ${u.id}, Email: ${u.email}, Nome: ${u.full_name}, Admin: ${u.is_admin}, Ativo: ${u.enabled}`);
      });
      
      return;
    }
    
    console.log('✅ Usuário encontrado:', {
      id: user.id,
      email: user.email,
      full_name: user.full_name,
      enabled: user.enabled,
      is_admin: user.is_admin,
      is_teacher: user.is_teacher,
      is_student: user.is_student,
      institution_id: user.institution_id
    });
    
    // Testar senha
    const testPassword = 'password123';
    console.log(`🔐 Testando senha: ${testPassword}`);
    console.log(`🔐 Hash armazenado: ${user.password ? user.password.substring(0, 20) + '...' : 'NULL'}`);
    
    if (!user.password) {
      console.log('❌ Usuário não tem senha definida');
      return;
    }
    
    const isValidPassword = await bcrypt.compare(testPassword, user.password);
    console.log(`🔐 Senha válida: ${isValidPassword}`);
    
    if (!isValidPassword) {
      // Testar outras senhas comuns
      const commonPasswords = ['root', 'admin', '123456', 'password'];
      for (const pwd of commonPasswords) {
        const isValid = await bcrypt.compare(pwd, user.password);
        if (isValid) {
          console.log(`✅ Senha correta encontrada: ${pwd}`);
          break;
        }
      }
    }
    
  } catch (error) {
    console.error('❌ Erro:', error.message);
    console.error('Stack:', error.stack);
  } finally {
    await db.destroy();
    process.exit(0);
  }
}

testAdminLogin();