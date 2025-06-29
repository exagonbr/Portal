const http = require('http');

async function testCorrectEndpoint() {
  try {
    console.log('🧪 Testando Endpoint Correto de Login...\n');
    
    const postData = JSON.stringify({
      email: 'admin@sabercon.edu.br',
      password: 'password123'
    });

    const options = {
      hostname: 'localhost',
      port: 3001,
      path: '/api/auth/optimized/login',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData)
      }
    };

    console.log('📋 Testando com credenciais do log original...');
    console.log('📧 Email: admin@sabercon.edu.br');
    console.log('🔑 Password: password123');

    const req = http.request(options, (res) => {
      console.log(`\n📊 Status: ${res.statusCode}`);
      
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        try {
          const response = JSON.parse(data);
          console.log('\n📄 Resposta completa:');
          console.log(JSON.stringify(response, null, 2));
          
          if (response.success) {
            console.log('\n✅ LOGIN BEM-SUCEDIDO!');
            console.log(`📊 Role: ${response.user?.role_slug}`);
            console.log(`🔑 Permissões: ${response.user?.permissions?.length || 0}`);
            console.log(`👤 Nome: ${response.user?.name}`);
            
            if (response.token) {
              console.log('\n🎯 Decodificando token JWT...');
              const jwt = require('jsonwebtoken');
              const JWT_SECRET = process.env.JWT_SECRET || 'ExagonTech';
              
              try {
                const decoded = jwt.verify(response.token, JWT_SECRET);
                console.log(`🔑 Permissões no token: ${decoded.permissions?.length || 0}`);
                
                if (decoded.permissions && decoded.permissions.length > 0) {
                  console.log('\n🎉 PERFEITO! Permissões RBAC no token:');
                  decoded.permissions.forEach((perm, i) => {
                    console.log(`  ${i + 1}. ${perm}`);
                  });
                  
                  console.log('\n✅ SISTEMA RBAC TOTALMENTE FUNCIONAL!');
                  console.log('🎯 O frontend pode usar essas permissões para renderizar o menu lateral corretamente!');
                } else {
                  console.log('❌ Permissões não encontradas no token');
                }
              } catch (jwtError) {
                console.error('❌ Erro ao decodificar JWT:', jwtError.message);
              }
            }
          } else {
            console.log('\n❌ LOGIN FALHOU');
            console.log(`📄 Mensagem: ${response.message}`);
          }
          
        } catch (error) {
          console.error('❌ Erro ao parsear resposta:', error.message);
          console.log('📄 Resposta raw:', data);
        }
        
        process.exit(0);
      });
    });

    req.on('error', (error) => {
      console.error('❌ Erro na requisição:', error.message);
      process.exit(1);
    });

    req.write(postData);
    req.end();
    
  } catch (error) {
    console.error('❌ Erro no teste:', error.message);
    process.exit(1);
  }
}

testCorrectEndpoint();