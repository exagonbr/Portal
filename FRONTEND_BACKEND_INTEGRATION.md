# Integração Frontend-Backend

Este documento descreve como o frontend se conecta ao backend refatorado.

## Arquitetura da Integração

A comunicação entre frontend e backend segue uma arquitetura em camadas:

1. **Cliente API** (`src/lib/api-client.ts`): Responsável por fazer requisições HTTP ao backend.
2. **Serviços** (`src/services/*.ts`): Encapsulam a lógica de comunicação com endpoints específicos.
3. **Hooks React** (`src/hooks/*.ts`): Fornecem interfaces amigáveis para componentes React.
4. **Componentes UI** (`src/components/*`): Interfaces de usuário que consomem os hooks.
5. **Páginas** (`src/pages/*`): Montam a experiência completa do usuário.

## Cliente API

O cliente API foi atualizado para se comunicar diretamente com o backend:

```typescript
// src/lib/api-client.ts
export const fetchWithAuth = async (url: string, options: ApiRequestOptions = {}): Promise<Response> => {
  const { skipAuth = false, isInternal = false, timeout = 30000, ...restOptions } = options;
  
  const baseUrl = isInternal ? getInternalApiUrl() : getApiUrl();
  const fullUrl = url.startsWith('http') ? url : `${baseUrl}${url}`;
  
  const headers = createAuthHeaders(skipAuth);
  
  // Adiciona os headers personalizados
  const mergedHeaders = {
    ...headers,
    ...restOptions.headers,
  };

  // Configura o timeout
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch(fullUrl, {
      ...restOptions,
      headers: mergedHeaders,
      signal: controller.signal,
      credentials: 'include',
    });
    
    return response;
  } catch (error: any) {
    if (error?.name === 'AbortError') {
      throw new Error(`Requisição para ${url} excedeu o tempo limite de ${timeout}ms`);
    }
    throw error;
  } finally {
    clearTimeout(timeoutId);
  }
};
```

## Serviços Base

Todos os serviços estendem o `BaseApiService` que fornece operações CRUD básicas:

```typescript
// src/services/base-api-service.ts
export class BaseApiService<T> {
  protected basePath: string;

  constructor(basePath: string) {
    this.basePath = basePath;
  }

  async getAll(): Promise<T[]> {
    const response = await apiClient.get<T[]>(this.basePath);
    if (!response.data) throw new Error('No data received');
    return response.data;
  }

  async getById(id: string | number): Promise<T> {
    const response = await apiClient.get<T>(`${this.basePath}/${id}`);
    if (!response.data) throw new Error('No data received');
    return response.data;
  }

  async create(data: Partial<T>): Promise<T> {
    const response = await apiClient.post<T>(this.basePath, data);
    if (!response.data) throw new Error('No data received');
    return response.data;
  }

  async update(id: string | number, data: Partial<T>): Promise<T> {
    const response = await apiClient.put<T>(`${this.basePath}/${id}`, data);
    if (!response.data) throw new Error('No data received');
    return response.data;
  }

  async delete(id: string | number): Promise<void> {
    await apiClient.delete(`${this.basePath}/${id}`);
  }

  protected getFullUrl(path: string = ''): string {
    const cleanPath = path.startsWith('/') ? path : `/${path}`;
    return getApiUrl(this.basePath + cleanPath);
  }
}
```

## Serviços Específicos

Os serviços específicos foram criados para todas as entidades do backend:

1. `activitySessionsService.ts`
2. `activitySummariesService.ts`
3. `rolePermissionsService.ts`
4. `securityPoliciesService.ts`
5. `notificationqueueService.ts`
6. `teachersubjectService.ts`
7. `watchlistentryService.ts`

Exemplo de uso:

```typescript
// Importar o serviço
import { activitySessionsService } from '@/services/activitySessionsService';

// Usar os métodos
const sessions = await activitySessionsService.getAll();
const activeOnly = await activitySessionsService.getActiveSessions();
```

## Hooks React

Os hooks React fornecem estado e gerenciamento de ciclo de vida para os componentes:

```typescript
// src/hooks/useActivitySessions.ts
export function useActivitySessions() {
  const [sessions, setSessions] = useState<ActivitySession[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchSessions = useCallback(async (page = 1, limit = 10) => {
    setLoading(true);
    setError(null);
    try {
      const response = await activitySessionsService.getAllWithPagination(page, limit);
      setSessions(response.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao buscar sessões');
    } finally {
      setLoading(false);
    }
  }, []);

  // ... outros métodos

  return {
    sessions,
    loading,
    error,
    fetchSessions,
    // ... outros métodos
  };
}
```

## Componentes UI

Os componentes UI utilizam os hooks para exibir e manipular dados:

```tsx
// src/components/admin/ActivitySessionsManager.tsx
export const ActivitySessionsManager: React.FC<ActivitySessionsManagerProps> = ({ userId }) => {
  const {
    sessions,
    loading,
    error,
    fetchSessions,
    endSession,
    getActiveSessions,
    getUserSessions,
  } = useActivitySessions();

  // ... lógica do componente

  return (
    <div>
      {/* Interface do usuário */}
    </div>
  );
};
```

## Páginas

As páginas montam os componentes e gerenciam a navegação:

```tsx
// src/pages/admin/activity-sessions.tsx
const ActivitySessionsPage: React.FC = () => {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { userId } = router.query;

  // Verificar autenticação
  if (status === 'loading') {
    return <LoadingSpinner />;
  }

  if (status === 'unauthenticated') {
    router.push('/login');
    return null;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Gerenciamento de Sessões de Atividade</h1>
      
      <ActivitySessionsManager userId={userId as string} />
    </div>
  );
};
```

## Rotas Disponíveis

As seguintes rotas de administração foram implementadas:

- `/admin/activity-sessions` - Gerenciamento de sessões de atividade
- `/admin/role-permissions` - Gerenciamento de permissões de função

## Autenticação

Todas as requisições ao backend incluem automaticamente o token de autenticação armazenado no localStorage:

```typescript
const getAuthToken = (): string | null => {
  if (typeof window === 'undefined' || typeof localStorage === 'undefined') return null;
  try {
    return localStorage.getItem('accessToken');
  } catch (error) {
    console.error('Erro ao acessar localStorage:', error);
    return null;
  }
};
```

## Tratamento de Erros

Erros de API são capturados e tratados em cada nível:

1. No cliente API através do `ApiClientError`
2. Nos serviços através de try/catch
3. Nos hooks através de estados de erro
4. Nos componentes através de renderização condicional

## Conclusão

Esta integração fornece uma comunicação robusta e tipada entre o frontend e o backend refatorado, seguindo as melhores práticas de desenvolvimento React e TypeScript. 