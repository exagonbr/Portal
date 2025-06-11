const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const certificatesDir = path.join(__dirname, '..', 'certificates');

// Criar diretório de certificados se não existir
if (!fs.existsSync(certificatesDir)) {
  fs.mkdirSync(certificatesDir, { recursive: true });
}

try {
  // Verificar se mkcert está instalado
  execSync('mkcert -version', { stdio: 'ignore' });
  
  // Gerar certificados
  console.log('Gerando certificados SSL para desenvolvimento...');
  execSync(`mkcert -install`, { stdio: 'inherit' });
  execSync(`mkcert -key-file ${path.join(certificatesDir, 'localhost-key.pem')} -cert-file ${path.join(certificatesDir, 'localhost.pem')} localhost`, { stdio: 'inherit' });
  
  console.log('Certificados gerados com sucesso!');
} catch (error) {
  console.error('Erro ao gerar certificados:', error.message);
  console.log('\nPara gerar certificados SSL, você precisa:');
  console.log('1. Instalar mkcert: https://github.com/FiloSottile/mkcert');
  console.log('2. Executar: npm run generate-certificates');
  process.exit(1);
} 