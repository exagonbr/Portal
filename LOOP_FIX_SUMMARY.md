# Correção do Loop de Requisições - API TV Shows

## Problema Identificado

Foi detectado um loop de requisições na API `/api/tv-shows?page=1&limit=12` com **64 requisições em 30 segundos**, causado pelo seguinte fluxo problemático:

1. `useEffect` inicial chamava `loadTvShows()`
2. `loadTvShows()` chamava `calculateStats()` com `setTimeout`
3. `calculateStats()` fazia nova requisição para `/api/tv-shows`
4. Isso criava um ciclo infinito de requisições

## Soluções Implementadas

### 1. Remoção da Chamada Recursiva
**Arquivo:** `src/app/portal/collections/manage/page.tsx`

- **Removido:** Chamada desnecessária de `calculateStats()` dentro de `loadTvShows()`
- **Motivo:** Evitar que cada carregamento de dados dispare uma nova requisição de estatísticas

```typescript
// ANTES (problemático)
if (page === 1) {
  setTimeout(() => calculateStats(), 100)
}

// DEPOIS (corrigido)
// Chamada removida
```

### 2. Otimização da Função calculateStats
**Arquivo:** `src/app/portal/collections/manage/page.tsx`

- **Adicionado:** Parâmetro `useExistingData` para reutilizar dados já carregados
- **Melhorado:** Sistema de fallback para usar dados existentes em caso de erro

```typescript
const calculateStats = async (useExistingData = false) => {
  let allCollections: TVShowListItem[] = []
  
  if (useExistingData && tvShows.length > 0) {
    // Usar dados já carregados se disponíveis
    allCollections = tvShows
  } else {
    // Buscar TODAS as coleções apenas se necessário
    // ...
  }
}
```

### 3. Sistema de Debounce e Controle de Estado
**Arquivo:** `src/app/portal/collections/manage/page.tsx`

- **Adicionado:** Estados para controlar execução simultânea
- **Implementado:** Sistema de debounce para evitar chamadas muito frequentes

```typescript
const [isLoadingStats, setIsLoadingStats] = useState(false)
const [lastStatsUpdate, setLastStatsUpdate] = useState<number>(0)
const [isLoadingTvShows, setIsLoadingTvShows] = useState(false)
const [lastTvShowsUpdate, setLastTvShowsUpdate] = useState<number>(0)

// Debounce de 2 segundos para calculateStats
// Debounce de 1 segundo para loadTvShows
```

### 4. Monitor de Requisições
**Arquivo:** `src/utils/requestMonitor.ts` (novo)

- **Criado:** Sistema de monitoramento para detectar e prevenir loops
- **Configurado:** Limite de 10 requisições por 30 segundos
- **Implementado:** Bloqueio automático e relatórios de loops detectados

```typescript
class RequestMonitor {
  private readonly MAX_REQUESTS_PER_WINDOW = 10;
  private readonly TIME_WINDOW = 30000; // 30 segundos
  
  shouldBlockRequest(url: string, method: string = 'GET'): boolean {
    // Lógica de detecção e bloqueio de loops
  }
}
```

### 5. Integração do Monitor
**Arquivo:** `src/app/portal/collections/manage/page.tsx`

- **Integrado:** Monitor de requisições nas funções principais
- **Adicionado:** Verificação antes de cada requisição para API

```typescript
// Verificar se deve bloquear a requisição por loop
if (requestMonitor.shouldBlockRequest(requestUrl)) {
  console.error('🚨 Requisição bloqueada por loop detectado:', requestUrl)
  return
}
```

## Melhorias de Performance

1. **Reutilização de Dados:** `calculateStats()` agora pode usar dados já carregados
2. **Prevenção de Chamadas Simultâneas:** Estados de controle evitam execuções paralelas
3. **Debounce Inteligente:** Diferentes intervalos para diferentes tipos de requisição
4. **Fallback Robusto:** Sistema de recuperação em caso de erro

## Monitoramento e Logging

- **Logs Detalhados:** Todas as operações são logadas para debug
- **Relatórios de Loop:** Loops detectados são reportados com detalhes
- **Estatísticas:** Monitor fornece estatísticas de uso da API

## Resultado Esperado

- **Eliminação Completa** dos loops de requisições
- **Redução Significativa** no número de chamadas à API
- **Melhor Performance** da aplicação
- **Experiência de Usuário** mais fluida
- **Monitoramento Proativo** de problemas futuros

## Arquivos Modificados

1. `src/app/portal/collections/manage/page.tsx` - Correções principais
2. `src/utils/requestMonitor.ts` - Novo sistema de monitoramento
3. `LOOP_FIX_SUMMARY.md` - Esta documentação

## Como Testar

1. Abrir a página de gerenciamento de coleções
2. Monitorar o console do navegador
3. Verificar se não há mais logs de "Loop de requisições detectado"
4. Confirmar que a página carrega normalmente sem requisições excessivas

## Próximos Passos

- Monitorar logs de produção para confirmar eficácia
- Considerar implementar o monitor em outras partes da aplicação
- Avaliar possibilidade de cache mais agressivo para dados estáticos 