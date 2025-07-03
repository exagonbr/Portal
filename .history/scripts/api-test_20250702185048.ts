import axios from 'axios';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const API_BASE_URL = 'http://localhost:3001/api';
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
      if (error.request) {
        console.error('❌ Detalhes da requisição:', error.request);
      }
    } else {
      console.error('❌ Falha na autenticação (erro desconhecido):', error);
    }
    return null;
  }
}

// Função para encontrar todas as rotas da API
function findApiRoutes(dir: string, base = '/api'): string[] {
  let routes: string[] = [];
  const entries = fs.readdirSync(dir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    const routePath = `${base}/${entry.name.replace(/\\/g, '/')}`;

    if (entry.isDirectory()) {
      // Ignora diretórios especiais
      if (entry.name.startsWith('_') || entry.name.startsWith('[...')) {
        continue;
      }
      routes = routes.concat(findApiRoutes(fullPath, routePath));
    } else if (entry.name === 'route.ts') {
      // Remove /route.ts do final
      routes.push(base);
    }
  }
  return routes;
}


// Função para testar uma única rota
async function testRoute(token: string, route: string) {
  // Pular rotas que não são de teste ou que exigem parâmetros
  if (route.includes('[') || route.includes('login') || route.includes('register') || route.includes('refresh')) {
      console.log(`🟡 Pulando rota dinâmica ou de autenticação: ${route}`);
      return;
  }

  try {
    console.log(`▶️  Testando rota: GET ${route}`);
    const response = await axios.get(`${API_BASE_URL}${route}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    console.log(`✅ SUCESSO [${response.status}]: GET ${route}`);
  } catch (error) {
    if (axios.isAxiosError(error)) {
        if (error.response) {
            if (error.response.status === 401 || error.response.status === 403) {
                console.log(`🔶 AVISO [${error.response.status}]: GET ${route} (Acesso negado como esperado)`);
            } else {
                console.error(`❌ FALHA [${error.response.status}]: GET ${route} - ${error.response.data?.message || 'Sem mensagem'}`);
            }
        } else {
            console.error(`❌ ERRO: GET ${route} - ${error.message}`);
        }
    } else {
        console.error(`❌ ERRO DESCONHECIDO: GET ${route}`, error);
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