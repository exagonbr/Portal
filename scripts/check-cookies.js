// Script para verificar o status dos cookies
const https = require('https');
const http = require('http');
const chalk = require('chalk');

// URL para testar (ajuste conforme necessário)
const url = process.env.NODE_ENV === 'production' 
  ? 'https://portal.sabercon.com.br' 
  : 'http://localhost:3000';

console.log(chalk.blue('🍪 Verificando cookies em: ' + url));

// Função para fazer a requisição e verificar os cookies
function checkCookies() {
  const isHttps = url.startsWith('https');
  const client = isHttps ? https : http;
  
  const options = {
    method: 'GET',
    headers: {
      'User-Agent': 'Cookie-Checker/1.0',
    },
  };

  const req = client.request(url, options, (res) => {
    console.log(chalk.green('Status da resposta:'), res.statusCode);
    
    // Verificar headers Set-Cookie
    const setCookieHeaders = res.headers['set-cookie'] || [];
    
    if (setCookieHeaders.length === 0) {
      console.log(chalk.yellow('⚠️ Nenhum cookie definido na resposta'));
    } else {
      console.log(chalk.green('✅ Cookies encontrados:'), setCookieHeaders.length);
      
      // Analisar cada cookie
      setCookieHeaders.forEach((cookieStr, index) => {
        console.log(chalk.blue(`\nCookie #${index + 1}:`));
        console.log(chalk.gray(cookieStr));
        
        // Verificar flags importantes
        const hasSecure = cookieStr.includes('Secure');
        const hasHttpOnly = cookieStr.includes('HttpOnly');
        const hasSameSite = /SameSite=(\w+)/.test(cookieStr);
        const sameSiteValue = cookieStr.match(/SameSite=(\w+)/)?.[1] || 'Não definido';
        
        // Verificar prefixo __Secure-
        const cookieName = cookieStr.split('=')[0];
        const hasSecurePrefix = cookieName.startsWith('__Secure-');
        
        console.log(chalk.cyan('Nome:'), cookieName);
        console.log(chalk.cyan('Secure:'), hasSecure ? chalk.green('✓') : chalk.red('✗'));
        console.log(chalk.cyan('HttpOnly:'), hasHttpOnly ? chalk.green('✓') : chalk.yellow('✗'));
        console.log(chalk.cyan('SameSite:'), sameSiteValue);
        
        // Verificar problemas com prefixo __Secure-
        if (hasSecurePrefix && !hasSecure) {
          console.log(chalk.red('⚠️ ERRO: Cookie com prefixo __Secure- não tem a flag Secure!'));
          console.log(chalk.yellow('Isso fará com que o cookie seja rejeitado pelos navegadores.'));
        }
        
        // Verificar problemas com SameSite
        if (!hasSameSite) {
          console.log(chalk.yellow('⚠️ Aviso: SameSite não definido (padrão é Lax)'));
        }
      });
    }
    
    console.log(chalk.blue('\n🔍 Verificação de cookies concluída'));
  });
  
  req.on('error', (error) => {
    console.error(chalk.red('❌ Erro ao fazer requisição:'), error.message);
  });
  
  req.end();
}

// Executar verificação
checkCookies(); 