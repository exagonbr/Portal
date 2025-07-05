const axios = require('axios');

async function testSessionsWithAuth() {
    const BACKEND_URL = 'http://localhost:3001';
    
    console.log('🧪 Testando POST /sessions/create com autenticação válida');
    console.log('=======================================================');
    
    // Primeiro, vamos tentar fazer login com credenciais conhecidas
    const testCredentials = [
        { email: 'admin@sabercon.edu.br', password: 'password123' },
        { email: 'gestor@sabercon.edu.br', password: 'password123' },
        { email: 'professor@sabercon.edu.br', password: 'password123' },
        { email: 'julia.c@ifsp.com', password: 'password123' },
        { email: 'coordenador@sabercon.edu.com', password: 'password123' },
        { email: 'renato@gmail.com', password: 'password123' }
    ];
    
    let validToken = null;
    let validUser = null;
    
    console.log('1. Tentando fazer login com usuários existentes...');
    
    for (const credentials of testCredentials) {
        try {
            console.log(`   Testando login: ${credentials.email}`);
            
            const loginResponse = await axios.post(`${BACKEND_URL}/auth/login`, {
                email: credentials.email,
                password: credentials.password
            });
            
            if (loginResponse.data.success) {
                validToken = loginResponse.data.data.accessToken;
                validUser = loginResponse.data.data.user;
                console.log(`   ✅ Login bem-sucedido com: ${credentials.email}`);
                console.log(`   👤 Usuário: ${validUser.name} (${validUser.role})`);
                break;
            }
            
        } catch (error) {
            console.log(`   ❌ Falha no login: ${credentials.email}`);
            if (error.response && error.response.data) {
                console.log(`      Erro: ${error.response.data.message}`);
            }
        }
    }
    
    if (!validToken) {
        console.log('\n❌ Não foi possível fazer login com nenhum usuário existente.');
        console.log('💡 Vamos tentar criar um usuário de teste...');
        
        // Tentar criar um usuário de teste (se a rota existir)
        try {
            const createUserResponse = await axios.post(`${BACKEND_URL}/users`, {
                email: 'teste@portal.com',
                fullName: 'Usuário de Teste',
                password: 'teste123',
                enabled: true
            });
            
            if (createUserResponse.data.success) {
                console.log('✅ Usuário de teste criado com sucesso!');
                
                // Tentar fazer login com o usuário criado
                const loginResponse = await axios.post(`${BACKEND_URL}/auth/login`, {
                    email: 'teste@portal.com',
                    password: 'teste123'
                });
                
                if (loginResponse.data.success) {
                    validToken = loginResponse.data.data.accessToken;
                    validUser = loginResponse.data.data.user;
                    console.log('✅ Login com usuário de teste bem-sucedido!');
                }
            }
        } catch (error) {
            console.log('❌ Não foi possível criar usuário de teste.');
        }
    }
    
    if (!validToken) {
        console.log('\n❌ Não foi possível obter um token válido.');
        console.log('💡 Verifique se há usuários no banco de dados ou se o sistema de autenticação está funcionando.');
        return;
    }
    
    console.log('\n2. Testando criação de sessão com token válido...');
    console.log('================================================');
    
    // Teste 1: Criar sessão com email
    try {
        console.log('\n📧 Teste 1: Criando sessão com email...');
        
        const sessionResponse = await axios.post(`${BACKEND_URL}/sessions/create`, {
            email: validUser.email
        }, {
            headers: {
                'Authorization': `Bearer ${validToken}`,
                'Content-Type': 'application/json'
            }
        });
        
        console.log('✅ Sessão criada com sucesso!');
        console.log('📋 Resposta:');
        console.log(JSON.stringify(sessionResponse.data, null, 2));
        
        // Salvar o sessionId para testes futuros
        const sessionId = sessionResponse.data.data?.sessionId;
        if (sessionId) {
            console.log(`🔑 Session ID: ${sessionId}`);
        }
        
    } catch (error) {
        console.log('❌ Erro ao criar sessão com email:');
        if (error.response) {
            console.log(`   Status: ${error.response.status}`);
            console.log(`   Dados: ${JSON.stringify(error.response.data, null, 2)}`);
        } else {
            console.log(`   Erro: ${error.message}`);
        }
    }
    
    // Teste 2: Criar sessão com userId
    try {
        console.log('\n🆔 Teste 2: Criando sessão com userId...');
        
        const sessionResponse = await axios.post(`${BACKEND_URL}/sessions/create`, {
            userId: validUser.id
        }, {
            headers: {
                'Authorization': `Bearer ${validToken}`,
                'Content-Type': 'application/json'
            }
        });
        
        console.log('✅ Sessão criada com sucesso!');
        console.log('📋 Resposta:');
        console.log(JSON.stringify(sessionResponse.data, null, 2));
        
    } catch (error) {
        console.log('❌ Erro ao criar sessão com userId:');
        if (error.response) {
            console.log(`   Status: ${error.response.status}`);
            console.log(`   Dados: ${JSON.stringify(error.response.data, null, 2)}`);
        } else {
            console.log(`   Erro: ${error.message}`);
        }
    }
    
    // Teste 3: Criar sessão com ambos os campos
    try {
        console.log('\n📧🆔 Teste 3: Criando sessão com email e userId...');
        
        const sessionResponse = await axios.post(`${BACKEND_URL}/sessions/create`, {
            email: validUser.email,
            userId: validUser.id
        }, {
            headers: {
                'Authorization': `Bearer ${validToken}`,
                'Content-Type': 'application/json'
            }
        });
        
        console.log('✅ Sessão criada com sucesso!');
        console.log('📋 Resposta:');
        console.log(JSON.stringify(sessionResponse.data, null, 2));
        
    } catch (error) {
        console.log('❌ Erro ao criar sessão com ambos os campos:');
        if (error.response) {
            console.log(`   Status: ${error.response.status}`);
            console.log(`   Dados: ${JSON.stringify(error.response.data, null, 2)}`);
        } else {
            console.log(`   Erro: ${error.message}`);
        }
    }
    
    // Teste 4: Teste de validação (sem dados)
    try {
        console.log('\n❌ Teste 4: Testando validação (sem dados)...');
        
        const sessionResponse = await axios.post(`${BACKEND_URL}/sessions/create`, {
            // Payload vazio para testar validação
        }, {
            headers: {
                'Authorization': `Bearer ${validToken}`,
                'Content-Type': 'application/json'
            }
        });
        
        console.log('⚠️ Resposta inesperada (deveria dar erro):');
        console.log(JSON.stringify(sessionResponse.data, null, 2));
        
    } catch (error) {
        console.log('✅ Validação funcionando corretamente!');
        if (error.response) {
            console.log(`   Status: ${error.response.status}`);
            console.log(`   Dados: ${JSON.stringify(error.response.data, null, 2)}`);
        }
    }
    
    console.log('\n🎉 Testes completos!');
}

testSessionsWithAuth(); 