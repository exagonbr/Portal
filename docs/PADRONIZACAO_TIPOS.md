# Padronização de Tipos e Compatibilidade Frontend-Backend

## 📋 Resumo das Implementações

Este documento descreve as padronizações implementadas para garantir compatibilidade entre frontend e backend, seguindo as **Prioridades Alta e Média** definidas.

## ✅ Prioridade Alta - Implementado

### 1. Padronização de Nomes de Campos

**Decisão**: Adotado padrão **inglês** (`phone`, `address`) em vez de português (`telefone`, `endereco`)

**Justificativa**:
- Consistência com padrões internacionais
- Facilita integração com APIs externas
- Já estava sendo usado em interfaces mais recentes

**Implementação**:
- Campos legados mantidos com `@deprecated` para compatibilidade
- Utilitários de migração criados para conversão automática
- Validação de ambos os formatos durante período de transição

### 2. Unificação de Tipos de Enum

**Enums Centralizados** (`src/types/common.ts`):
```typescript
export enum InstitutionType {
  SCHOOL = 'SCHOOL',
  COLLEGE = 'COLLEGE', 
  UNIVERSITY = 'UNIVERSITY',
  TECH_CENTER = 'TECH_CENTER'
}

export enum UserRole {
  STUDENT = 'student',
  TEACHER = 'teacher',
  ADMIN = 'admin',
  MANAGER = 'manager',
  SYSTEM_ADMIN = 'system_admin',
  INSTITUTION_MANAGER = 'institution_manager',
  ACADEMIC_COORDINATOR = 'academic_coordinator',
  GUARDIAN = 'guardian'
}
```

**Labels Localizados**:
```typescript
export const INSTITUTION_TYPE_LABELS: Record<InstitutionType, string> = {
  [InstitutionType.SCHOOL]: 'Escola',
  [InstitutionType.COLLEGE]: 'Faculdade',
  [InstitutionType.UNIVERSITY]: 'Universidade',
  [InstitutionType.TECH_CENTER]: 'Centro Técnico'
};
```

### 3. Padronização de Tipos de Data

**Tipos Definidos**:
```typescript
export type DateString = string; // ISO 8601 format
export type UUID = string;
export type Email = string;
export type Phone = string;
```

**Utilitários de Conversão**:
```typescript
export const formatDate = (date: Date | string): DateString => {
  if (typeof date === 'string') return date;
  return date.toISOString();
};

export const parseDate = (dateString: DateString): Date => {
  return new Date(dateString);
};
```

## ✅ Prioridade Média - Implementado

### 1. DTOs Centralizados

**Arquivo**: `src/types/dto.ts`

**Estrutura Padronizada**:
```typescript
export interface UserDto extends BaseEntityDto {
  name: string;
  email: Email;
  phone?: Phone;
  address?: string;
  // Campos legados para compatibilidade
  telefone?: Phone;
  endereco?: string;
  // ... outros campos
}
```

**Utilitários de Conversão**:
```typescript
export const migrateDtoFields = <T>(dto: T): T => {
  // Converte campos legados para novos
};

export const ensureDtoCompatibility = <T>(dto: T): T => {
  // Garante compatibilidade com campos legados
};
```

### 2. Validação de Tipos em Runtime

**Arquivo**: `src/utils/validation.ts`

**Validadores de Enum**:
```typescript
export const isValidInstitutionType = (value: any): value is InstitutionType => {
  return Object.values(InstitutionType).includes(value);
};

export const isValidUserRole = (value: any): value is UserRole => {
  return Object.values(UserRole).includes(value);
};
```

**Validadores de Estrutura**:
```typescript
export const isApiResponse = <T>(value: any): value is ApiResponse<T> => {
  return (
    typeof value === 'object' &&
    value !== null &&
    typeof value.success === 'boolean'
    // ... outras validações
  );
};
```

**Validadores de Dados**:
```typescript
export const validateUserData = (userData: any): UserValidationResult => {
  const errors: string[] = [];
  
  if (!userData.name || typeof userData.name !== 'string') {
    errors.push('Nome é obrigatório');
  }
  
  if (!userData.email || !isValidEmail(userData.email)) {
    errors.push('Email válido é obrigatório');
  }
  
  return { isValid: errors.length === 0, errors };
};
```

### 3. Documentação OpenAPI/Swagger

**Arquivo**: `docs/api-schema.yaml`

**Estrutura Implementada**:
- Definições de schemas para todas as entidades principais
- Documentação de endpoints com parâmetros e respostas
- Validações e formatos de dados
- Exemplos de uso

## 🔧 Estruturas Padronizadas

### Resposta da API
```typescript
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  errors?: string[];
}
```

### Paginação
```typescript
export interface PaginatedResponse<T = any> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
```

### Filtros Base
```typescript
export interface BaseFilter {
  search?: string;
  is_active?: boolean;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}
```

## 🔄 Migração e Compatibilidade

### Estratégia de Migração

1. **Campos Legados**: Mantidos com `@deprecated` durante período de transição
2. **Conversão Automática**: Utilitários convertem automaticamente entre formatos
3. **Validação Dupla**: Sistema aceita ambos os formatos durante migração
4. **Fallback**: Sempre há fallback para estruturas antigas

### Exemplo de Uso
```typescript
// Serviço atualizado
const result = await response.json();

// Validar estrutura da resposta
const validatedResponse = validateApiResponse<InstitutionDto>(result);
if (!validatedResponse || !validatedResponse.data) {
  throw new Error('Estrutura de resposta inválida da API');
}

// Migrar campos legados se necessário
return migrateContactFields(validatedResponse.data);
```

## 📁 Arquivos Criados/Modificados

### Novos Arquivos
- `src/types/common.ts` - Tipos e enums centralizados
- `src/types/dto.ts` - DTOs compartilhados
- `src/utils/validation.ts` - Validação runtime
- `docs/api-schema.yaml` - Documentação OpenAPI
- `docs/PADRONIZACAO_TIPOS.md` - Esta documentação

### Arquivos Modificados
- `src/types/user.ts` - Atualizado para usar tipos centralizados
- `src/types/institution.ts` - Atualizado para usar tipos centralizados
- `src/services/institutionService.ts` - Implementação de exemplo com validação

## 🎯 Benefícios Implementados

1. **Consistência**: Tipos unificados entre frontend e backend
2. **Validação**: Verificação automática de tipos em runtime
3. **Compatibilidade**: Suporte a campos legados durante transição
4. **Documentação**: API documentada com OpenAPI/Swagger
5. **Manutenibilidade**: Código mais fácil de manter e evoluir
6. **Robustez**: Detecção precoce de incompatibilidades

## 🚀 Próximos Passos

1. **Aplicar padrão aos serviços restantes**: userService, schoolService, etc.
2. **Atualizar componentes**: Migrar componentes para usar novos tipos
3. **Testes**: Implementar testes para validadores
4. **Backend**: Aplicar mesma padronização no backend
5. **Migração gradual**: Remover campos legados após período de transição

## 📚 Referências

- [OpenAPI Specification](https://swagger.io/specification/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [API Design Best Practices](https://docs.microsoft.com/en-us/azure/architecture/best-practices/api-design) 