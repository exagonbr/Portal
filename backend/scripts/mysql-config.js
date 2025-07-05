/**
 * Exemplo de configuração para conexão com MySQL legado
 * 
 * Copie este arquivo para mysql-config.js e ajuste as configurações
 * conforme seu ambiente MySQL legado.
 */

module.exports = {
  // Configurações do MySQL (Sistema Legado)
  mysql: {
    host: 'sabercon.cifrllkocsxl.sa-east-1.rds.amazonaws.com',
    port: 3306,
    user: 'sabercon',
    password: 'gWg28m8^vffI9X#',
    database: 'sabercon',
    charset: 'utf8mb4',
    
    // Configurações adicionais opcionais
    connectionLimit: 10,
    acquireTimeout: 60000,
    timeout: 60000,
    reconnect: true
  },
  
  // Configurações específicas da migração
  migration: {
    batchSize: 100, // Processar usuários em lotes
    logInterval: 50, // Log a cada X usuários processados
    defaultPassword: 'passsword123' // Senha padrão para usuários sem senha
  }
}; 