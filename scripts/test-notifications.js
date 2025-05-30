const fetch = require('node-fetch');

const API_BASE = process.env.API_BASE || 'http://localhost:3001/api';
const TEST_EMAIL = process.env.TEST_EMAIL || 'test@example.com';
const AUTH_TOKEN = process.env.AUTH_TOKEN; // Token JWT para autenticação

console.log('\n=== Teste das Funcionalidades de Notificação ===\n');

async function testEmailVerification() {
  console.log('🔍 Testando verificação de email...');
  
  try {
    const response = await fetch(`${API_BASE}/notifications/email/verify`, {
      headers: {
        'Authorization': `Bearer ${AUTH_TOKEN}`
      }
    });
    
    const data = await response.json();
    
    if (response.ok) {
      console.log('✅ Verificação de email:', data.data.connected ? 'Conectado' : 'Desconectado');
      console.log('   Mensagem:', data.data.message);
    } else {
      console.log('❌ Erro na verificação:', data.message);
    }
  } catch (error) {
    console.log('❌ Erro na verificação de email:', error.message);
  }
  
  console.log('');
}

async function testEmailSending() {
  console.log('📧 Testando envio de email...');
  
  try {
    const response = await fetch(`${API_BASE}/notifications/email/test`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${AUTH_TOKEN}`
      },
      body: JSON.stringify({
        to: TEST_EMAIL
      })
    });
    
    const data = await response.json();
    
    if (response.ok) {
      console.log('✅ Email de teste enviado com sucesso');
      console.log(`   Destinatário: ${TEST_EMAIL}`);
    } else {
      console.log('❌ Erro no envio de email:', data.message);
    }
  } catch (error) {
    console.log('❌ Erro no envio de email:', error.message);
  }
  
  console.log('');
}

async function testNotificationSending() {
  console.log('🔔 Testando envio de notificação completa...');
  
  try {
    const response = await fetch(`${API_BASE}/notifications/send`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${AUTH_TOKEN}`
      },
      body: JSON.stringify({
        title: 'Teste de Notificação',
        message: 'Esta é uma notificação de teste do sistema',
        type: 'info',
        category: 'system',
        sendPush: true,
        sendEmail: true,
        recipients: {
          emails: [TEST_EMAIL]
        }
      })
    });
    
    const data = await response.json();
    
    if (response.ok) {
      console.log('✅ Notificação enviada com sucesso');
      console.log('   Push enviadas:', data.data?.pushSentCount || 0);
      console.log('   Emails enviados:', data.data?.emailSentCount || 0);
    } else {
      console.log('❌ Erro no envio de notificação:', data.message);
    }
  } catch (error) {
    console.log('❌ Erro no envio de notificação:', error.message);
  }
  
  console.log('');
}

async function runTests() {
  if (!AUTH_TOKEN) {
    console.log('❌ Token de autenticação não fornecido');
    console.log('   Use: AUTH_TOKEN=seu_token node scripts/test-notifications.js');
    console.log('   Ou: AUTH_TOKEN=seu_token TEST_EMAIL=seu_email@example.com node scripts/test-notifications.js\n');
    return;
  }
  
  console.log(`🎯 Testando com email: ${TEST_EMAIL}`);
  console.log(`🌐 API Base: ${API_BASE}\n`);
  
  await testEmailVerification();
  await testEmailSending();
  await testNotificationSending();
  
  console.log('🏁 Testes concluídos!');
  console.log('\n💡 Dicas:');
  console.log('- Verifique sua caixa de entrada para emails de teste');
  console.log('- Para push notifications, acesse /notifications/send no frontend');
  console.log('- Verifique os logs do backend para mais detalhes');
}

runTests().catch(console.error); 