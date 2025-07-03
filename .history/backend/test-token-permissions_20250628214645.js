const { OptimizedAuthService } = require('./dist/services/OptimizedAuthService');
const jwt = require('jsonwebtoken');

async function testTokenPermissions() {
  try {
    console.log('🧪 Testando Permissões no Token JWT...\n');
    
    // Fazer login
    console.log('📋 Fazendo login...');
    const loginResult = await OptimizedAuthService.login('sabercon@sabercon.com.br', 'admin123');
    
    if (loginResult.success) {
      console.log('✅ Login bem-sucedido');
      console.log(`📊 Role: ${loginResult.user.role_slug}`);
      console.log(`🔑 Permissões na resposta: ${loginResult.user.permissions.length}`);
      
      // Decodificar o token JWT para ver o conteúdo
      console.log('\n📋 Decodificando Token JWT...');
      const JWT_SECRET = process.env.JWT_SECRET || 'ExagonTech';
      const decoded = jwt.verify(loginResult.token, JWT_SECRET);
      
      console.log('🔍 Conteúdo do Token:');
      console.log(`  👤 User ID: ${decoded.userId}`);
      console.log(`  📧 Email: ${decoded.email}`);
      console.log(`  👨‍💼 Nome: ${decoded.name}`);
      console.log(`  📊 Role: ${decoded.role}`);
      console.log(`  🔑 Permissões no token: ${decoded.permissions ? decoded.permissions.length : 0}`);
      console.log(`  🏢 Institution ID: ${decoded.institutionId}`);
      console.log(`  🆔 Session ID: ${decoded.sessionId}`);
      console.log(`  ⏰ Tipo: ${decoded.type}`);
      
      if (decoded.permissions && decoded.permissions.length > 0) {
        console.log('\n✅ SUCESSO: Permissões encontradas no token!');
        console.log('🔑 Lista de permissões:');
        decoded.permissions.forEach((permission, index) => {
          console.log(`  ${index + 1}. ${permission}`);
        });
        
        // Verificar se são as permissões RBAC corretas para SYSTEM_ADMIN
        const expectedPermissions = [
          'system:admin',
          'users:create', 'users:read', 'users:update', 'users:delete',
          'institutions:create', 'institutions:read', 'institutions:update', 'institutions:delete',
          'courses:create', 'courses:read', 'courses:update', 'courses:delete',
          'content:create', 'content:read', 'content:update', 'content:delete',
          'analytics:read', 'system:settings', 'logs:read'
        ];
        
        console.log('\n📋 Verificando permissões RBAC:');
        let allCorrect = true;
        expectedPermissions.forEach(permission => {
          const hasPermission = decoded.permissions.includes(permission);
          console.log(`  ${hasPermission ? '✅' : '❌'} ${permission}`);
          if (!hasPermission) allCorrect = false;
        });
        
        if (allCorrect) {
          console.log('\n🎉 PERFEITO: Todas as permissões RBAC estão corretas no token!');
        } else {
          console.log('\n⚠️ ATENÇÃO: Algumas permissões RBAC estão faltando no token');
        }
        
      } else {
        console.log('\n❌ ERRO: Nenhuma permissão encontrada no token!');
      }
      
      // Testar também a validação do token
      console.log('\n📋 Testando validação do token...');
      const validation = await OptimizedAuthService.validateAccessToken(loginResult.token);
      if (validation) {
        console.log('✅ Token validado com sucesso');
        console.log(`🔑 Permissões na validação: ${validation.permissions ? validation.permissions.length : 0}`);
      } else {
        console.log('❌ Falha na validação do token');
      }
      
    } else {
      console.log('❌ Login falhou');
    }
    
  } catch (error) {
    console.error('❌ Erro no teste:', error.message);
    console.error('Stack:', error.stack);
  }
  
  process.exit(0);
}

testTokenPermissions();