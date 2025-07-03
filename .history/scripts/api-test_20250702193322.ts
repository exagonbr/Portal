import axios from 'axios';
import fs from 'fs';
import path from 'path';

const API_BASE_URL = 'http://localhost:3000/api';
const API_DIR = path.join(__dirname, '../src/app/api');

const credentials = {
  email: 'admin@sabercon.edu.br',
  password: 'password123',
};

// Função para fazer login e obter o token
async function getAuthToken(): Promise<string | null> {
  try {
    console.log('🔑 Autenticando...');
    const response = await axios.post(`${API_BASE_URL}/auth/login`, credentials);
    const token = response.data?.data?.accessToken;
    if (token) {
      console.log('✅ Autenticação bem-sucedida!');
      return token;
    }
    console.error('❌ Token não encontrado na resposta de login.');
    return null;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error('❌ Falha na autenticação:', error.response?.data || error.message);
    } else {
      console.error('❌ Falha na autenticação (erro desconhecido):', error);
    }
    return null;
  }
}

// Função para encontrar todas as rotas da API
function findApiRoutes(dir: string, base = '/api'): string[] {
  const routes: string[] = [];
  const entries = fs.readdirSync(dir, { withFileTypes: true });

  for (const entry of entries) {
    if (entry.isDirectory()) {
      // Ignora diretórios de metadados do Next.js e rotas dinâmicas/agrupadas
      if (entry.name.startsWith('_') || entry.name.startsWith('(') || entry.name.startsWith('[')) {
        continue;
      }
      const fullPath = path.join(dir, entry.name);
      const routePath = `${base}/${entry.name}`;
      routes.push(...findApiRoutes(fullPath, routePath));
    } else if (/^route\.(ts|js|tsx|jsx)$/.test(entry.name)) {
      // Adiciona a rota base. O 'base' é o caminho do diretório que contém o arquivo de rota.
      routes.push(base);
    }
  }
  return routes;
}


// Função para testar uma única rota
async function testRoute(token: string, route: string) {
  // Pular rotas que não são de teste ou que exigem parâmetros
  if (route.includes('login') || route.includes('register') || route.includes('refresh')) {
    console.log(`🟡 Pulando rota de autenticação: ${route}`);
    return;
  }

  const methodsToTest = ['GET', 'POST', 'PUT', 'DELETE'];

  for (const method of methodsToTest) {
    try {
      console.log(`▶️  Testando rota: ${method} ${route}`);
      const response = await axios({
        method,
        url: `${API_BASE_URL}${route}`,
        headers: {
          Authorization: `Bearer ${token}`,
        },
        // Envia um corpo vazio para métodos que o exigem
        data: method === 'POST' || method === 'PUT' ? {} : undefined,
      });
      console.log(`✅ SUCESSO [${response.status}]: ${method} ${route}`);
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        const { status, data } = error.response;
        if (status === 405) {
          // 405 Method Not Allowed é um resultado esperado para métodos não implementados
          console.log(`⚪️ INFO [${status}]: ${method} ${route} (Método não permitido)`);
        } else if (status === 401 || status === 403) {
          console.log(`🔶 AVISO [${status}]: ${method} ${route} (Acesso negado como esperado)`);
        } else {
          console.error(`❌ FALHA [${status}]: ${method} ${route} - ${data?.message || 'Sem mensagem'}`);
        }
      } else {
        console.error(`❌ ERRO DESCONHECIDO: ${method} ${route}`, error);
      }
    }
  }
}

// Função principal
async function main() {
  const token = await getAuthToken();
  if (!token) {
    console.error('🛑 Testes não podem continuar sem um token de autenticação.');
    return;
  }

  const allRoutes = findApiRoutes(API_DIR);
  console.log(`\n🔎 Encontradas ${allRoutes.length} rotas para testar.`);
  
  // Filtra rotas duplicadas
  const uniqueRoutes = Array.from(new Set(allRoutes));
  console.log(`\n🚀 Iniciando testes em ${uniqueRoutes.length} rotas únicas...`);

  for (const route of uniqueRoutes) {
    await testRoute(token, route);
  }

  console.log('\n\n🏁 Testes concluídos.');
}

main();
