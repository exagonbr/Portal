/**
 * Script para testar a integração com a API de login
 * 
 * Este script faz uma requisição para a API de login e verifica
 * se o retorno contém as informações de role e permissões esperadas.
 * 
 * Uso: node test-login-api.js
 */

const fetch = require('node-fetch');

// Configurações
const API_URL = 'http://localhost:3001/api/auth/login';
const TEST_CREDENTIALS = [
  { email: 'admin@example.com', password: 'admin123', expectedRole: 'SYSTEM_ADMIN' },
  { email: 'teacher@example.com', password: 'teacher123', expectedRole: 'TEACHER' },
  { email: 'student@example.com', password: 'student123', expectedRole: 'STUDENT' }
];

/**
 * Função para testar o login
 */
async function testLogin(credentials) {
  console.log(`\n🔐 Testando login para: ${credentials.email}`);
  console.log('---------------------------------------');
  
  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email: credentials.email,
        password: credentials.password
      })
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      console.error('❌ Erro na requisição:', data.message || 'Status: ' + response.status);
      return;
    }
    
    console.log('✅ Login bem-sucedido!');
    console.log('📝 Dados do usuário:');
    console.log(`   - ID: ${data.user.id}`);
    console.log(`   - Nome: ${data.user.name}`);
    console.log(`   - Email: ${data.user.email}`);
    console.log(`   - Role: ${data.user.role?.name}`);
    
    // Verificar permissões
    if (data.user.role?.permissions && data.user.role.permissions.length > 0) {
      console.log('🔑 Permissões:');
      data.user.role.permissions.forEach(permission => {
        console.log(`   - ${permission}`);
      });
    } else {
      console.warn('⚠️ Nenhuma permissão encontrada');
    }
    
    // Verificar token
    if (data.token) {
      console.log('🔒 Token recebido:', data.token.substring(0, 20) + '...');
      
      // Verificar payload do token (sem validar assinatura)
      try {
        const payload = JSON.parse(atob(data.token.split('.')[1]));
        console.log('📦 Payload do token:');
        console.log(`   - userId: ${payload.userId || payload.sub}`);
        console.log(`   - role: ${payload.role}`);
        
        if (payload.permissions) {
          console.log('   - permissions:', payload.permissions.join(', '));
        } else {
          console.warn('⚠️ Nenhuma permissão no token');
        }
        
        console.log(`   - expiração: ${new Date(payload.exp * 1000).toLocaleString()}`);
      } catch (error) {
        console.error('❌ Erro ao decodificar token:', error);
      }
    }
    
    // Verificar redirecionamento
    console.log('🔄 Redirecionamento esperado:');
    let dashboardPath;
    
    switch(data.user.role?.name) {
      case 'SYSTEM_ADMIN':
      case 'admin':
      case 'administrador':
        dashboardPath = '/dashboard/system-admin';
        break;
      case 'TEACHER':
      case 'teacher':
      case 'professor':
        dashboardPath = '/dashboard/teacher';
        break;
      case 'STUDENT':
      case 'student':
      case 'aluno':
        dashboardPath = '/dashboard/student';
        break;
      case 'INSTITUTION_MANAGER':
      case 'manager':
      case 'gestor':
        dashboardPath = '/dashboard/institution-manager';
        break;
      case 'ACADEMIC_COORDINATOR':
      case 'coordinator':
      case 'coordenador':
        dashboardPath = '/dashboard/coordinator';
        break;
      default:
        dashboardPath = '/dashboard';
    }
    
    console.log(`   - Dashboard: ${dashboardPath}`);
    
    // Verificar se a role corresponde à esperada
    if (credentials.expectedRole && data.user.role?.name) {
      const normalizedExpected = credentials.expectedRole.toUpperCase();
      const normalizedActual = data.user.role.name.toUpperCase();
      
      if (normalizedActual === normalizedExpected) {
        console.log('✅ Role corresponde à esperada');
      } else {
        console.warn(`⚠️ Role diferente da esperada: ${normalizedActual} (esperado: ${normalizedExpected})`);
      }
    }
    
  } catch (error) {
    console.error('❌ Erro ao testar login:', error);
  }
}

/**
 * Função para codificar/decodificar Base64
 */
function atob(str) {
  return Buffer.from(str, 'base64').toString('binary');
}

/**
 * Função principal
 */
async function main() {
  console.log('🔍 Iniciando testes de integração com API de login');
  console.log('=================================================');
  
  for (const credentials of TEST_CREDENTIALS) {
    await testLogin(credentials);
  }
  
  console.log('\n🏁 Testes concluídos');
}

// Executar testes
main().catch(error => {
  console.error('❌ Erro fatal:', error);
  process.exit(1);
}); 