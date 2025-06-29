const { db } = require('./dist/database/connection');

async function testLogin() {
  try {
    console.log('🔍 Testando conexão com banco de dados...');
    
    // Testar conexão
    await db.raw('SELECT 1');
    console.log('✅ Conexão com banco OK');
    
    // Verificar se existe usuário admin
    const user = await db('users')
      .select('*')
      .where('email', 'admin@sabercon.edu.br')
      .first();
      
    if (user) {
      console.log('✅ Usuário encontrado:', {
        id: user.id,
        email: user.email,
        name: user.name,
        is_active: user.is_active,
        role_id: user.role_id,
        institution_id: user.institution_id
      });
      
      // Verificar se a senha está hasheada
      console.log('🔐 Password hash length:', user.password ? user.password.length : 'NULL');
      console.log('🔐 Password starts with $2b:', user.password ? user.password.startsWith('$2b$') : false);
      
    } else {
      console.log('❌ Usuário admin@sabercon.edu.br não encontrado');
      
      // Listar todos os usuários
      const allUsers = await db('users').select('id', 'email', 'name', 'is_active').limit(5);
      console.log('📋 Primeiros 5 usuários:', allUsers);
    }
    
    // Verificar tabelas relacionadas
    const rolesCount = await db('roles').count('* as count').first();
    console.log('📊 Total de roles:', rolesCount.count);
    
    const institutionsCount = await db('institutions').count('* as count').first();
    console.log('📊 Total de instituições:', institutionsCount.count);
    
  } catch (error) {
    console.error('❌ Erro:', error.message);
    console.error('Stack:', error.stack);
  } finally {
    await db.destroy();
    process.exit(0);
  }
}

testLogin();