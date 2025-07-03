const { db } = require('./dist/database/connection');
const bcrypt = require('bcrypt');

async function testRealAdmin() {
  try {
    console.log('🔍 Testando login do admin real...');
    
    // Buscar usuário admin principal
    const user = await db('users')
      .select('*')
      .where('email', 'sabercon@sabercon.com.br')
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
      is_admin: user.is_admin,
      password_length: user.password ? user.password.length : 0
    });
    
    // Testar senhas comuns
    const testPasswords = ['password123', 'root', 'admin', '123456', 'password', 'sabercon'];
    
    for (const testPassword of testPasswords) {
      console.log(`🔐 Testando senha: ${testPassword}`);
      
      if (!user.password) {
        console.log('❌ Usuário não tem senha definida');
        continue;
      }
      
      try {
        const isValidPassword = await bcrypt.compare(testPassword, user.password);
        console.log(`   Resultado: ${isValidPassword ? '✅ VÁLIDA' : '❌ Inválida'}`);
        
        if (isValidPassword) {
          console.log(`🎉 SENHA CORRETA ENCONTRADA: ${testPassword}`);
          break;
        }
      } catch (error) {
        console.log(`   Erro ao testar senha: ${error.message}`);
      }
    }
    
    // Verificar se o hash da senha está correto
    console.log('\n🔍 Análise do hash da senha:');
    if (user.password) {
      console.log(`   Comprimento: ${user.password.length}`);
      console.log(`   Começa com $2b$: ${user.password.startsWith('$2b$')}`);
      console.log(`   Começa com $2a$: ${user.password.startsWith('$2a$')}`);
      console.log(`   Primeiros 20 chars: ${user.password.substring(0, 20)}`);
    }
    
  } catch (error) {
    console.log('❌ Erro:', error.message);
    console.log('Stack:', error.stack);
  } finally {
    await db.destroy();
    process.exit(0);
  }
}

testRealAdmin();