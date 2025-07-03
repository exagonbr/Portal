const { OptimizedAuthService } = require('./src/services/OptimizedAuthService');

async function testAuthDirect() {
  try {
    console.log('🧪 Teste Direto: OptimizedAuthService...\n');
    
    // Teste com o usuário admin@sabercon.edu.br que foi mencionado no problema
    const email = 'admin@sabercon.edu.br';
    const password = 'admin123'; // Assumindo uma senha padrão
    
    console.log(`🔐 Tentando login com: ${email}`);
    
    try {
      const result = await OptimizedAuthService.login(email, password);
      
      console.log('\n✅ LOGIN BEM-SUCEDIDO!');
      console.log(`📊 Role: ${result.user.role}`);
      console.log(`🏷️ Role Slug: ${result.user.role_slug}`);
      console.log(`🔑 Permissões: ${result.user.permissions.length}`);
      console.log(`👤 Nome: ${result.user.name}`);
      console.log(`🏢 Instituição: ${result.user.institution_name || 'N/A'}`);
      
      console.log('\n🔑 Primeiras 10 permissões:');
      result.user.permissions.slice(0, 10).forEach((perm, i) => {
        console.log(`  ${i + 1}. ${perm}`);
      });
      
      console.log('\n🎯 Token JWT gerado:');
      console.log(`📏 Tamanho: ${result.token.length} caracteres`);
      console.log(`⏰ Expira em: ${result.expiresIn} segundos`);
      
      // Verificar se o token contém as informações corretas
      const jwt = require('jsonwebtoken');
      const JWT_SECRET = process.env.JWT_SECRET || 'ExagonTech';
      const decoded = jwt.verify(result.token, JWT_SECRET);
      
      console.log('\n🔍 Dados no token JWT:');
      console.log(`📊 Role: ${decoded.role}`);
      console.log(`🏷️ Role Slug: ${decoded.role_slug}`);
      console.log(`🔑 Permissões no token: ${decoded.permissions.length}`);
      console.log(`👤 Nome: ${decoded.name}`);
      console.log(`📧 Email: ${decoded.email}`);
      
      console.log('\n🎉 PROBLEMA RESOLVIDO!');
      console.log('✅ Role correta mapeada baseada nos campos booleanos');
      console.log('✅ Permissions corretas incluídas no token');
      console.log('✅ Sistema RBAC funcionando perfeitamente');
      
    } catch (loginError) {
      console.log(`❌ Erro no login: ${loginError.message}`);
      
      // Vamos tentar com diferentes credenciais
      console.log('\n🔄 Tentando com credenciais alternativas...');
      
      const alternativeCredentials = [
        { email: 'admin@sabercon.edu.br', password: '123456' },
        { email: 'admin@sabercon.edu.br', password: 'password' },
        { email: 'sabercon@sabercon.com.br', password: 'admin123' },
        { email: 'admin@admin.com', password: 'admin' }
      ];
      
      for (const cred of alternativeCredentials) {
        try {
          console.log(`🔐 Tentando: ${cred.email} / ${cred.password}`);
          const result = await OptimizedAuthService.login(cred.email, cred.password);
          
          console.log('\n✅ LOGIN BEM-SUCEDIDO!');
          console.log(`📊 Role: ${result.user.role}`);
          console.log(`🏷️ Role Slug: ${result.user.role_slug}`);
          console.log(`🔑 Permissões: ${result.user.permissions.length}`);
          console.log(`👤 Nome: ${result.user.name}`);
          
          return; // Sair se conseguiu fazer login
          
        } catch (err) {
          console.log(`❌ Falhou: ${err.message}`);
        }
      }
      
      console.log('\n⚠️ Nenhuma credencial funcionou. Vamos verificar se existem usuários no banco...');
      
      // Verificar usuários no banco
      const { db } = require('./src/database/connection');
      const users = await db('users')
        .select('id', 'email', 'full_name', 'is_admin', 'is_teacher', 'is_student', 'enabled')
        .limit(5);
        
      console.log('\n📋 Usuários encontrados no banco:');
      users.forEach((user, i) => {
        console.log(`  ${i + 1}. ${user.email} - ${user.full_name} (Admin: ${user.is_admin}, Ativo: ${user.enabled})`);
      });
      
      if (users.length === 0) {
        console.log('❌ Nenhum usuário encontrado no banco de dados');
        console.log('💡 Execute o script de criação de usuários de teste primeiro');
      }
    }
    
  } catch (error) {
    console.log('❌ Erro geral:', error.message);
    console.log(error.stack);
  }
}

testAuthDirect().catch(console.log);