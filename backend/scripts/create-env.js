#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

/**
 * Script para criar arquivo .env com todas as variáveis necessárias
 * Uso: npm run create-env ou node scripts/create-env.js
 */

// Função para gerar JWT secret seguro
function generateJWTSecret() {
  return crypto.randomBytes(64).toString('hex');
}

// Template do arquivo .env
const envTemplate = `# ===================================
# Portal Sabercon Backend - Environment Variables
# Generated automatically on ${new Date().toISOString()}
# ===================================

# APPLICATION SETTINGS
NODE_ENV=development
PORT=3001

# JWT SETTINGS
# SECURITY WARNING: Change this to a secure random key in production!
JWT_SECRET=${generateJWTSecret()}

# DATABASE SETTINGS (PostgreSQL)
DB_HOST=localhost
DB_PORT=5432
DB_NAME=portal_sabercon
DB_USER=postgres
DB_PASSWORD=root
DB_SSL=false

# REDIS SETTINGS
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=
REDIS_DB=0
REDIS_TLS=false

# REDIS QUEUE SETTINGS (Optional - uses main Redis if not set)
QUEUE_REDIS_HOST=
QUEUE_REDIS_PORT=
QUEUE_REDIS_PASSWORD=
QUEUE_REDIS_DB=1

# CORS SETTINGS
CORS_ORIGIN=https://portal.sabercon.com.br
CORS_CREDENTIALS=true

# ADMIN USER SETTINGS
ADMIN_EMAIL=admin@portal.com
ADMIN_PASSWORD=password123

# QUEUE CONCURRENCY SETTINGS
EMAIL_QUEUE_CONCURRENCY=3
NOTIFICATION_QUEUE_CONCURRENCY=5
FILE_PROCESSING_QUEUE_CONCURRENCY=2

# API VERSION
npm_package_version=2.0.0

# ===================================
# PRODUCTION SECURITY CHECKLIST:
# ===================================
# ✅ Change JWT_SECRET to a secure random key (done above)
# ⚠️  Set strong DB_PASSWORD
# ⚠️  Set REDIS_PASSWORD if using Redis authentication  
# ⚠️  Set NODE_ENV=production
# ⚠️  Configure proper CORS_ORIGIN for your domain
# ⚠️  Change ADMIN_PASSWORD to a secure password
# ⚠️  Enable DB_SSL=true if using SSL database connection
# ⚠️  Set REDIS_TLS=true if using Redis with TLS
# ===================================

# Example production values:
# NODE_ENV=production
# JWT_SECRET=your-very-secure-jwt-secret-generated-above
# DB_SSL=true
# DB_PASSWORD=your-strong-database-password
# REDIS_PASSWORD=your-strong-redis-password
# REDIS_TLS=true
# CORS_ORIGIN=https://yourdomain.com
# ADMIN_EMAIL=admin@yourdomain.com
# ADMIN_PASSWORD=your-very-strong-admin-password
`;

function main() {
  const envPath = path.join(__dirname, '..', '.env');
  const envExamplePath = path.join(__dirname, '..', '.env.example');
  
  console.log('🔧 Portal Sabercon - Environment Setup');
  console.log('=====================================\n');

  // Verifica se já existe arquivo .env
  if (fs.existsSync(envPath)) {
    console.log('⚠️  Arquivo .env já existe!');
    console.log('   Para sobrescrever, remova o arquivo atual primeiro:');
    console.log('   rm .env\n');
    
    // Cria apenas o .env.example
    try {
      fs.writeFileSync(envExamplePath, envTemplate);
      console.log('✅ Arquivo .env.example criado/atualizado com sucesso!');
    } catch (error) {
      console.log('❌ Erro ao criar .env.example:', error.message);
      process.exit(1);
    }
    
    process.exit(0);
  }

  try {
    // Cria arquivo .env
    fs.writeFileSync(envPath, envTemplate);
    console.log('✅ Arquivo .env criado com sucesso!');
    
    // Cria também o .env.example
    fs.writeFileSync(envExamplePath, envTemplate);
    console.log('✅ Arquivo .env.example criado/atualizado!');
    
    console.log('\n📝 Variáveis de ambiente configuradas:');
    console.log('   ✅ JWT_SECRET - Gerado automaticamente (seguro)');
    console.log('   ✅ Configurações de desenvolvimento padrão');
    console.log('   ✅ Banco PostgreSQL local');
    console.log('   ✅ Redis local');
    console.log('   ✅ CORS configurado para frontend local');
    
    console.log('\n⚠️  IMPORTANTE - Antes de usar em produção:');
    console.log('   1. Altere DB_PASSWORD para uma senha forte');
    console.log('   2. Configure REDIS_PASSWORD se necessário');
    console.log('   3. Altere ADMIN_PASSWORD para uma senha segura');
    console.log('   4. Configure CORS_ORIGIN para seu domínio');
    console.log('   5. Habilite SSL (DB_SSL=true, REDIS_TLS=true)');
    
    console.log('\n🚀 Próximos passos:');
    console.log('   1. Verifique/ajuste as configurações no arquivo .env');
    console.log('   2. Inicie PostgreSQL e Redis');
    console.log('   3. Execute: npm run setup');
    console.log('   4. Execute: npm run dev');
    
    console.log('\n📚 Documentação completa em: docs/ENVIRONMENT_VARIABLES.md');
    
  } catch (error) {
    console.log('❌ Erro ao criar arquivo .env:', error.message);
    process.exit(1);
  }
}

// Executa apenas se chamado diretamente
if (require.main === module) {
  main();
}

module.exports = { main, generateJWTSecret }; 