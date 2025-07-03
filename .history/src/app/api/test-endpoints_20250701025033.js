// Script para testar todos os endpoints da API
// Execute com: node src/app/api/test-endpoints.js

const BASE_URL = process.env.NODE_ENV === 'production'
  ? 'https://portal.sabercon.com.br/api'
  : 'http://localhost:3000/api';

// Token de teste (substitua por um token válido)
const TEST_TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJhZG1pbiIsImVtYWlsIjoiYWRtaW5Ac2FiZXJjb24uZWR1LmJyIiwibmFtZSI6IkFkbWluaXN0cmFkb3IiLCJyb2xlIjoiU1lTVEVNX0FETUlOIiwiaW5zdGl0dXRpb25JZCI6Imluc3Rfc2FiZXJjb24iLCJwZXJtaXNzaW9ucyI6W10sImlhdCI6MTczODM0NzI5NCwiZXhwIjoxNzM4NDMzNjk0fQ.Ej6Ej6Ej6Ej6Ej6Ej6Ej6Ej6Ej6Ej6Ej6Ej6Ej6Ej6';

const endpoints = [
  // Dashboard
  { method: 'GET', path: '/dashboard/analytics', description: 'Analytics do Dashboard' },
  { method: 'GET', path: '/dashboard/engagement', description: 'Métricas de Engajamento' },
  
  // AWS
  { method: 'GET', path: '/aws/connection-logs/stats', description: 'Estatísticas AWS' },
  { method: 'GET', path: '/aws/connection-logs', description: 'Logs de Conexão AWS' },
  { method: 'GET', path: '/aws/settings', description: 'Configurações AWS' },
  
  // Instituições
  { method: 'GET', path: '/institutions?limit=10&active=true', description: 'Listar Instituições' },
  { method: 'GET', path: '/institutions/inst_sabercon', description: 'Buscar Instituição por ID' },
  
  // Usuários
  { method: 'GET', path: '/user?limit=10', description: 'Listar Usuários' },
  { method: 'GET', path: '/user/me', description: 'Perfil do Usuário' },
  { method: 'GET', path: '/user/stats', description: 'Estatísticas de Usuários' },
  
  // Roles
  { method: 'GET', path: '/roles', description: 'Listar Roles' },
  { method: 'GET', path: '/roles/stats', description: 'Estatísticas de Roles' },
  
  // Cursos
  { method: 'GET', path: '/courses?limit=10', description: 'Listar Cursos' },
  
  // Livros
  { method: 'GET', path: '/books?limit=10', description: 'Listar Livros' },
  
  // Turmas
  { method: 'GET', path: '/classes?limit=10', description: 'Listar Turmas' },
  
  // Tarefas
  { method: 'GET', path: '/assignments?limit=10', description: 'Listar Tarefas' },
  
  // Escolas
  { method: 'GET', path: '/schools?limit=10', description: 'Listar Escolas' },
  
  // Configurações
  { method: 'GET', path: '/settings', description: 'Configurações Gerais' },
  { method: 'GET', path: '/settings/general', description: 'Configurações Gerais' },
  { method: 'GET', path: '/settings/security', description: 'Configurações de Segurança' },
  
  // Conteúdo
  { method: 'GET', path: '/content/buckets', description: 'Buckets S3' },
  { method: 'GET', path: '/content/files/all', description: 'Todos os Arquivos' },
  
  // Fila
  { method: 'GET', path: '/queue', description: 'Status da Fila' },
  { method: 'GET', path: '/queue/next', description: 'Próximo Item da Fila' },
  { method: 'GET', path: '/queue/stats', description: 'Estatísticas da Fila' },
  
  // Sessões
  { method: 'GET', path: '/sessions', description: 'Sessões Ativas' },
  
  // Notificações
  { method: 'GET', path: '/notifications?limit=10', description: 'Listar Notificações' },
  
  // Relatórios
  { method: 'GET', path: '/reports?limit=10', description: 'Listar Relatórios' },
  
  // Gamificação
  { method: 'GET', path: '/gamification/badges', description: 'Badges' },
  { method: 'GET', path: '/gamification/leaderboard', description: 'Ranking' },
  { method: 'GET', path: '/gamification/rewards', description: 'Recompensas' },
  { method: 'GET', path: '/gamification/xp', description: 'Experiência' },
  
  // Fórum
  { method: 'GET', path: '/forum/topics?limit=10', description: 'Tópicos do Fórum' },
  
  // Grupos de Estudo
  { method: 'GET', path: '/study-groups?limit=10', description: 'Grupos de Estudo' },
  
  // Quizzes
  { method: 'GET', path: '/quizzes?limit=10', description: 'Quizzes' },
  
  // Lições
  { method: 'GET', path: '/lessons?limit=10', description: 'Lições' },
  
  // Unidades
  { method: 'GET', path: '/units?limit=10', description: 'Unidades' }
];

async function testEndpoint(endpoint) {
  const url = `${BASE_URL}${endpoint.path}`;
  
  try {
    const response = await fetch(url, {
      method: endpoint.method,
      headers: {
        'Authorization': `Bearer ${TEST_TOKEN}`,
        'Content-Type': 'application/json'
      }
    });
    
    const status = response.status;
    const statusText = response.statusText;
    
    let result = '';
    if (status === 200) {
      result = '✅ OK';
    } else if (status === 401) {
      result = '🔒 Unauthorized';
    } else if (status === 403) {
      result = '🚫 Forbidden';
    } else if (status === 404) {
      result = '❌ Not Found';
    } else if (status === 500) {
      result = '💥 Server Error';
    } else {
      result = `⚠️ ${status} ${statusText}`;
    }
    
    console.log(`${result} ${endpoint.method} ${endpoint.path} - ${endpoint.description}`);
    
    // Se for erro 500, mostrar detalhes
    if (status === 500) {
      try {
        const errorData = await response.json();
        console.log(`   Error: ${errorData.error || errorData.message || 'Unknown error'}`);
      } catch (e) {
        console.log(`   Error: Failed to parse error response`);
      }
    }
    
  } catch (error) {
    console.log(`💥 NETWORK ERROR ${endpoint.method} ${endpoint.path} - ${endpoint.description}`);
    console.log(`   Error: ${error.message}`);
  }
}

async function testAllEndpoints() {
  console.log('🚀 Testando todos os endpoints da API...\n');
  console.log(`Base URL: ${BASE_URL}`);
  console.log(`Total de endpoints: ${endpoints.length}\n`);
  
  for (const endpoint of endpoints) {
    await testEndpoint(endpoint);
    // Pequena pausa para não sobrecarregar o servidor
    await new Promise(resolve => setTimeout(resolve, 100));
  }
  
  console.log('\n✨ Teste concluído!');
}

// Executar testes
if (typeof window === 'undefined') {
  // Node.js environment
  const fetch = require('node-fetch');
  testAllEndpoints();
} else {
  // Browser environment
  console.log('Execute este script no Node.js: node src/app/api/test-endpoints.js');
} 