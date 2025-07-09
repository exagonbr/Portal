# Implementação de Headers de Autorização

Este documento descreve as alterações realizadas para garantir que todos os serviços da aplicação incluam o header de autorização `Authorization: Bearer {token}` em todas as requisições HTTP.

## Arquivos Modificados

1. **src/services/authHeaderService.ts** - Novo serviço centralizado para gerenciar headers de autorização
2. **src/services/apiService.ts** - Atualizado para usar o AuthHeaderService
3. **src/services/api.ts** - Atualizado para usar o AuthHeaderService
4. **src/services/analyticsSessionService.ts** - Atualizado para usar o AuthHeaderService
5. **src/services/awsService.ts** - Atualizado para usar o AuthHeaderService
6. **src/services/fileService.ts** - Atualizado para usar o AuthHeaderService
7. **src/services/securityPoliciesService.ts** - Atualizado para usar o AuthHeaderService
8. **src/services/systemSettingsService.ts** - Atualizado para usar o AuthHeaderService
9. **src/services/sessionService.ts** - Atualizado para usar o AuthHeaderService
10. **src/services/base-api-service.ts** - Adicionado método getHeaders que usa o AuthHeaderService
11. **src/services/s3Service.ts** - Atualizado para usar o AuthHeaderService

## Arquivos que Precisam de Atenção

De acordo com o script de verificação `check-auth-headers.js`, os seguintes arquivos precisam ser atualizados:

1. **src/services/sessionPersistenceService.ts** - Detectado uso de Bearer token sem usar AuthHeaderService
2. **src/services/unifiedAuthService.ts** - Detectado uso de Bearer token sem usar AuthHeaderService

### Recomendações para Atualização

#### Para sessionPersistenceService.ts:

```typescript
// Importar o AuthHeaderService
import { AuthHeaderService } from './authHeaderService';

// Substituir qualquer código que defina headers manualmente por:
const headers = await AuthHeaderService.getHeaders();

// Ou, se estiver usando um token específico:
const headers = new Headers();
headers.set('Content-Type', 'application/json');
headers.set('Authorization', `Bearer ${token}`);
```

#### Para unifiedAuthService.ts:

```typescript
// Importar o AuthHeaderService
import { AuthHeaderService } from './authHeaderService';

// Substituir qualquer código que defina headers manualmente por:
const headers = await AuthHeaderService.getHeaders();

// Ou, se estiver usando um token específico:
const headers = new Headers();
headers.set('Content-Type', 'application/json');
headers.set('Authorization', `Bearer ${token}`);
```

## Como Verificar a Implementação

Foi criado um script `check-auth-headers.js` que verifica se todos os serviços estão usando o AuthHeaderService ou o apiService (que já usa o AuthHeaderService). Execute-o com:

```bash
node check-auth-headers.js
```

## Benefícios da Implementação

1. **Centralização da lógica de autorização** - Todas as requisições HTTP usam a mesma lógica para obter e incluir o token de autorização
2. **Facilidade de manutenção** - Alterações na lógica de obtenção de tokens podem ser feitas em um único lugar
3. **Consistência** - Todas as requisições HTTP incluem o header de autorização da mesma forma
4. **Segurança** - Garantia de que todas as requisições HTTP incluem o header de autorização quando necessário 