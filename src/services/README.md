# Serviços Frontend - Portal Sabercon

Esta pasta contém todos os serviços refatorados para comunicação com o backend do Portal Sabercon. A arquitetura foi redesenhada para seguir padrões modernos de desenvolvimento, com foco em tipagem forte, tratamento robusto de erros e reutilização de código.

## 📁 Estrutura dos Arquivos

```
src/services/
├── README.md                 # Esta documentação
├── index.ts                  # Exportações centralizadas
├── apiClient.ts             # Cliente HTTP base
├── authService.ts           # Serviços de autenticação
├── userService.ts           # Serviços de usuários
├── roleService.ts           # Serviços de roles/funções
├── institutionService.ts    # Serviços de instituições
└── courseService.ts         # Serviços de cursos
```

## 🏗️ Arquitetura

### Cliente API Base (`apiClient.ts`)
- **Cliente HTTP centralizado** com configuração padrão
- **Retry automático** para requisições que falharam
- **Tratamento padronizado de erros** com mensagens amigáveis
- **Interceptadores** para logging e monitoramento
- **Tipagem forte** para todas as respostas da API

### Serviços Especializados
Cada serviço segue o mesmo padrão arquitetural:

1. **Classe principal** com métodos organizados por funcionalidade
2. **Instância singleton** exportada para uso direto
3. **Funções de conveniência** para compatibilidade com código existente
4. **Validação de dados** antes do envio para API
5. **Tratamento específico de erros** por contexto

## 🔧 Como Usar

### Importação Centralizada
```typescript
import { services, authService, userService } from '../services';

// Usando a instância centralizada
const users = await services.user.getUsers();

// Usando serviço específico
const currentUser = await authService.getCurrentUser();
```

### Importação Específica
```typescript
import { userService } from '../services/userService';
import { login, logout } from '../services/authService';

// Usando métodos da classe
const users = await userService.getUsers({ page: 1, limit: 10 });

// Usando funções de conveniência
await login('user@example.com', 'password');
```

## 🔐 Autenticação

### Login e Logout
```typescript
import { authService } from '../services';

// Login
const result = await authService.login('email@example.com', 'password');
if (result.success) {
  console.log('Usuário logado:', result.user);
}

// Logout
await authService.logout();
```

### Verificação de Autenticação
```typescript
import { authService } from '../services';

// Verifica se está autenticado
if (authService.isAuthenticated()) {
  const user = await authService.getCurrentUser();
}
```

### Gerenciamento de Token
O token é gerenciado automaticamente:
- **Armazenamento seguro** em localStorage e cookies
- **Renovação automática** quando próximo do vencimento
- **Limpeza automática** em caso de expiração

## 👥 Gerenciamento de Usuários

### Listagem com Filtros
```typescript
import { userService } from '../services';

const result = await userService.getUsers({
  page: 1,
  limit: 20,
  sortBy: 'name',
  sortOrder: 'asc',
  filters: {
    search: 'João',
    role: 'student',
    institution_id: 'inst-123'
  }
});

console.log('Usuários:', result.items);
console.log('Paginação:', result.pagination);
```

### CRUD Completo
```typescript
import { userService } from '../services';

// Criar usuário
const newUser = await userService.createUser({
  email: 'novo@example.com',
  password: 'senha123',
  name: 'Novo Usuário',
  role_id: 'role-id',
  institution_id: 'inst-id',
  usuario: 'novousuario'
});

// Atualizar usuário
const updatedUser = await userService.updateUser('user-id', {
  name: 'Nome Atualizado',
  email: 'atualizado@example.com'
});

// Buscar por ID
const user = await userService.getUserById('user-id');

// Deletar usuário
await userService.deleteUser('user-id');
```

## 🎭 Gerenciamento de Roles

### Operações Básicas
```typescript
import { roleService } from '../services';

// Listar roles ativas
const activeRoles = await roleService.getActiveRoles();

// Criar nova role
const newRole = await roleService.createRole({
  name: 'Nova Role',
  description: 'Descrição da role',
  permissions: ['read', 'write']
});

// Buscar com filtros
const roles = await roleService.getRoles({
  filters: { active: true },
  sortBy: 'name'
});
```

## 🏢 Gerenciamento de Instituições

### Operações Básicas
```typescript
import { institutionService } from '../services';

// Listar instituições
const institutions = await institutionService.getInstitutions({
  page: 1,
  limit: 10,
  filters: { active: true }
});

// Buscar por localização
const localInstitutions = await institutionService.getInstitutionsByLocation(
  'São Paulo', 
  'SP'
);

// Obter estatísticas
const stats = await institutionService.getInstitutionStats();
```

## 📚 Gerenciamento de Cursos

### Operações Básicas
```typescript
import { courseService } from '../services';

// Listar cursos de uma instituição
const courses = await courseService.getCoursesByInstitution('inst-id');

// Matricular estudante
await courseService.enrollStudent('course-id', 'student-id');

// Adicionar professor
await courseService.addTeacher('course-id', 'teacher-id');

// Obter estatísticas
const stats = await courseService.getCourseStats();
```

## 🔄 Tratamento de Erros

### Padrão de Tratamento
Todos os serviços seguem o mesmo padrão de tratamento de erros:

```typescript
try {
  const result = await userService.getUsers();
  // Sucesso
} catch (error) {
  // Erro já tratado e com mensagem amigável
  console.error('Erro:', error.message);
  
  // Exibir para o usuário
  showErrorMessage(error.message);
}
```

### Tipos de Erro
- **400 Bad Request**: Dados inválidos (validação)
- **401 Unauthorized**: Token inválido ou expirado
- **403 Forbidden**: Sem permissão para a operação
- **404 Not Found**: Recurso não encontrado
- **409 Conflict**: Conflito (ex: email já existe)
- **500 Internal Server Error**: Erro interno do servidor

## 📊 Paginação e Filtros

### Padrão de Paginação
```typescript
interface PaginationResult {
  page: number;           // Página atual
  limit: number;          // Itens por página
  total: number;          // Total de itens
  totalPages: number;     // Total de páginas
  hasNext: boolean;       // Tem próxima página
  hasPrev: boolean;       // Tem página anterior
}
```

### Padrão de Filtros
```typescript
interface BaseFilters {
  search?: string;        // Busca geral
  page?: number;          // Página (padrão: 1)
  limit?: number;         // Limite (padrão: 10)
  sortBy?: string;        // Campo para ordenação
  sortOrder?: 'asc' | 'desc'; // Direção da ordenação
}
```

## 🚀 Configuração e Inicialização

### Configuração Automática
```typescript
import { configureServices, initializeServices } from '../services';

// Configuração manual (opcional)
configureServices({
  baseURL: 'https://api.example.com',
  timeout: 30000,
  retryAttempts: 3
});

// Inicialização automática
await initializeServices();
```

### Verificação de Saúde
```typescript
import { checkServicesHealth } from '../services';

const health = await checkServicesHealth();
console.log('Status da API:', health.api);
console.log('Status da Auth:', health.auth);
```

## 🔧 Validação de Dados

### Validação Client-Side
Cada serviço inclui métodos de validação:

```typescript
import { institutionService } from '../services';

const errors = institutionService.validateInstitutionData({
  name: 'Nome da Instituição',
  email: 'email@invalido'
});

if (errors.length > 0) {
  console.log('Erros de validação:', errors);
}
```

## 📤 Import/Export

### Exportação de Dados
```typescript
import { userService, roleService } from '../services';

// Exportar usuários para CSV
const csvBlob = await userService.exportUsers({
  role: 'student'
});

// Criar link de download
const url = URL.createObjectURL(csvBlob);
const link = document.createElement('a');
link.href = url;
link.download = 'usuarios.csv';
link.click();
```

### Importação de Dados
```typescript
import { userService } from '../services';

// Importar usuários de arquivo CSV
const fileInput = document.querySelector('input[type="file"]');
const file = fileInput.files[0];

const result = await userService.importUsers(file);
console.log(`Importados: ${result.success}`);
console.log(`Erros: ${result.errors.length}`);
```

## 🔍 Busca e Autocomplete

### Busca com Debounce
```typescript
import { searchUsers, searchRolesByName } from '../services';

// Implementar debounce para busca
const debouncedSearch = debounce(async (query: string) => {
  if (query.length >= 2) {
    const users = await searchUsers(query);
    updateSearchResults(users.items);
  }
}, 300);
```

### Autocomplete
```typescript
import { institutionService } from '../services';

// Para campos de autocomplete
const handleInputChange = async (value: string) => {
  const suggestions = await institutionService.searchInstitutionsByName(value);
  setSuggestions(suggestions);
};
```

## 🛡️ Segurança

### Proteção de Rotas
```typescript
import { authService } from '../services';

// Hook para proteção de rotas
const useAuth = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  
  useEffect(() => {
    setIsAuthenticated(authService.isAuthenticated());
  }, []);
  
  return { isAuthenticated };
};
```

### Renovação Automática de Token
O sistema renova automaticamente o token quando:
- Está próximo do vencimento (5 minutos antes)
- Recebe erro 401 em qualquer requisição
- Usuário faz uma ação após período de inatividade

## 📝 Logs e Monitoramento

### Logging Estruturado
Todos os serviços incluem logging estruturado:
- **Requisições**: URL, método, parâmetros, duração
- **Erros**: Stack trace, contexto, timestamp
- **Operações**: Criação, atualização, exclusão de dados

### Métricas
- Tempo de resposta das APIs
- Taxa de erro por endpoint
- Operações por usuário
- Uso de recursos

## 🔄 Migração do Código Existente

### Substituição Gradual
1. **Importe o novo serviço** junto com o antigo
2. **Teste as funcionalidades** em paralelo
3. **Substitua gradualmente** as chamadas antigas
4. **Remova o código antigo** após validação

### Exemplo de Migração
```typescript
// Código antigo
import { getUsers as oldGetUsers } from '../api/user';

// Código novo
import { userService } from '../services';

// Transição
const users = await userService.getUsers(); // Nova implementação
// const users = await oldGetUsers(); // Remover após validação
```

## 🧪 Testes

### Estrutura de Testes
```typescript
import { userService } from '../services/userService';

describe('UserService', () => {
  test('deve listar usuários com paginação', async () => {
    const result = await userService.getUsers({ page: 1, limit: 10 });
    
    expect(result.items).toBeDefined();
    expect(result.pagination).toBeDefined();
    expect(result.pagination.page).toBe(1);
  });
});
```

## 📚 Recursos Adicionais

- **Tipagem TypeScript**: Todos os métodos são fortemente tipados
- **Documentação JSDoc**: Comentários detalhados em todos os métodos
- **Tratamento de Edge Cases**: Validação de entrada e saída
- **Performance**: Cache inteligente e otimizações
- **Acessibilidade**: Mensagens de erro amigáveis

## 🤝 Contribuição

Para adicionar novos serviços ou modificar existentes:

1. **Siga o padrão** estabelecido pelos serviços existentes
2. **Adicione tipagem forte** para todos os parâmetros e retornos
3. **Implemente tratamento de erros** específico
4. **Documente** todos os métodos públicos
5. **Adicione testes** para as funcionalidades principais
6. **Atualize** este README se necessário

---

**Versão**: 2.0.0  
**Última atualização**: Janeiro 2025  
**Autor**: Kilo Code FullStack