const axios = require('axios');

const BASE_URL = 'https://portal.sabercon.com.br/api';

// Função para fazer login e obter token
async function login() {
  try {
    console.log('🔐 Fazendo login...');
    const response = await axios.post(`${BASE_URL}/auth/optimized/login`, {
      email: 'admin@sabercon.edu.br',
      password: 'password123'
    });
    
    if (response.data.success && response.data.data.token) {
      console.log('✅ Login realizado com sucesso');
      return response.data.data.token;
    } else {
      throw new Error('Login falhou');
    }
  } catch (error) {
    console.error('❌ Erro no login:', error.response?.data || error.message);
    throw error;
  }
}

// Função para testar verificação de email
async function testEmailVerification(token) {
  try {
    console.log('\n📧 Testando verificação de email...');
    const response = await axios.post(`${BASE_URL}/notifications/email/verify`, {}, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log('✅ Resposta da verificação de email:', {
      success: response.data.success,
      message: response.data.message,
      data: response.data.data
    });
    
    return response.data;
  } catch (error) {
    console.error('❌ Erro na verificação de email:', error.response?.data || error.message);
    throw error;
  }
}

// Função para testar envio de notificação
async function testSendNotification(token) {
  try {
    console.log('\n📢 Testando envio de notificação...');
    const notificationData = {
      title: 'Teste de Notificação',
      message: 'Esta é uma notificação de teste enviada via API',
      type: 'info',
      category: 'system',
      priority: 'medium',
      sendPush: false,
      sendEmail: true,
      recipients: {
        userIds: undefined,
        emails: undefined,
        roles: undefined
      }
    };
    
    const response = await axios.post(`${BASE_URL}/notifications/send`, notificationData, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log('✅ Resposta do envio de notificação:', {
      success: response.data.success,
      message: response.data.message,
      data: response.data.data
    });
    
    return response.data;
  } catch (error) {
    console.error('❌ Erro no envio de notificação:', error.response?.data || error.message);
    throw error;
  }
}

// Função principal
async function main() {
  try {
    console.log('🚀 Iniciando testes das APIs de notificação...\n');
    
    // 1. Fazer login
    const token = await login();
    
    // 2. Testar verificação de email
    await testEmailVerification(token);
    
    // 3. Testar envio de notificação
    await testSendNotification(token);
    
    console.log('\n🎉 Todos os testes foram executados!');
    
  } catch (error) {
    console.error('\n💥 Erro geral nos testes:', error.message);
    process.exit(1);
  }
}

// Executar testes
main();