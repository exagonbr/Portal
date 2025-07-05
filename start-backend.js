/**
 * Script para iniciar o backend
 * Executa o servidor backend com as configurações corretas
 */

const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

// Configuração
const backendDir = path.join(__dirname, 'backend');
const envFile = path.join(backendDir, '.env');

// Verificar se o diretório backend existe
if (!fs.existsSync(backendDir)) {
  console.error('❌ Diretório backend não encontrado:', backendDir);
  process.exit(1);
}

// Criar arquivo .env se não existir
if (!fs.existsSync(envFile)) {
  console.log('📝 Criando arquivo .env para o backend...');
  
  const envContent = `# Configuração do backend
NODE_ENV=development
PORT=3001

# Banco de dados
DB_HOST=localhost
DB_PORT=5432
DB_NAME=portal_sabercon
DB_USER=postgres
DB_PASSWORD=root
DB_SSL=false

# Configurações de email
SMTP_HOST=localhost
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=
SMTP_PASS=
EMAIL_FROM=noreply@portal.sabercon.com
FRONTEND_URL=http://localhost:3000

# Web Push
VAPID_EMAIL=admin@portal.sabercon.com
VAPID_PUBLIC_KEY=BLBx-hf1GJ7FbQ-rTvSjDHcf1TkTvBIIgKRvE3RKrxJK1Zw4qCnP9dL1f4zn9uDRJqCHDzCopobMjcYGsMqOZ7U
VAPID_PRIVATE_KEY=h_fKOQnVXWUf9IKU_9xFjJ9XTI9KMOFADRxKC-XK_JE
`;
  
  fs.writeFileSync(envFile, envContent);
  console.log('✅ Arquivo .env criado com sucesso');
}

// Iniciar o backend
console.log('🚀 Iniciando o servidor backend...');

const npmCmd = process.platform === 'win32' ? 'npm.cmd' : 'npm';
const backend = spawn(npmCmd, ['run', 'dev'], { 
  cwd: backendDir,
  stdio: 'inherit',
  env: { ...process.env }
});

backend.on('error', (error) => {
  console.error('❌ Erro ao iniciar o backend:', error.message);
});

backend.on('close', (code) => {
  if (code !== 0) {
    console.log(`🛑 Processo do backend encerrado com código: ${code}`);
  } else {
    console.log('✅ Servidor backend encerrado normalmente');
  }
});

// Capturar sinais para encerrar o processo corretamente
['SIGINT', 'SIGTERM'].forEach(signal => {
  process.on(signal, () => {
    console.log(`\n📣 Recebido sinal ${signal}, encerrando o backend...`);
    backend.kill(signal);
    process.exit(0);
  });
});

console.log('ℹ️ O servidor backend está em execução. Pressione Ctrl+C para encerrar.'); 