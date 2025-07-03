# Guia de Refatoração Completa para PostgreSQL

Este documento explica como refatorar todas as rotas, controllers, DTOs, serviços e entidades para a nova estrutura PostgreSQL.

## Resumo das Mudanças Realizadas

### 1. Estrutura Geral
- **Antes**: TypeORM com UUIDs
- **Depois**: Knex.js com IDs numéricos incrementais
- **Banco**: Migração de MySQL para PostgreSQL

### 2. Entidades Refatoradas

#### User (Exemplo Completo)
```typescript
// Antes (TypeORM)
@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;
  // ... decorators TypeORM
}

// Depois (Interface)
export interface User {
  id: number;
  version?: number;
  email: string;
  // ... campos baseados na migração
  created_at: Date;
  updated_at: Date;
}
```

#### Video (Exemplo Completo)
```typescript
// Nova estrutura baseada na migração
export interface Video {
  id: number;
  class: string; // campo obrigatório
  title?: string;
  name?: string;
  // ... todos os campos da migração
}
```

### 3. Repositórios Refatorados

#### Padrão de Repository
```typescript
export class EntityRepository {
  private static readonly TABLE_NAME = 'table_name';

  static async findById(id: number): Promise<EntityWithRelations | null> {
    // Implementação com Knex
  }

  static async create(data: CreateEntityData): Promise<Entity> {
    // Implementação com Knex
  }

  // ... outros métodos
}
```

### 4. Controllers Refatorados

#### Padrão de Controller
```typescript
export class EntityController {
  static async getEntities(req: Request, res: Response, next: NextFunction) {
    try {
      // Validação de parâmetros
      const { limit, offset } = req.query;
      
      // Conversão para números
      const entities = await EntityRepository.findAll(
        limit ? parseInt(limit as string) : undefined,
        offset ? parseInt(offset as string) : undefined
      );

      return res.json({
        success: true,
        data: entities,
        total: entities.length
      });
    } catch (error: any) {
      return res.status(500).json({
        success: false,
        message: 'Erro ao buscar entidades',
        error: error.message
      });
    }
  }

  static async getEntityById(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const entityId = parseInt(id);

      if (isNaN(entityId)) {
        return res.status(400).json({
          success: false,
          message: 'ID inválido'
        });
      }

      const entity = await EntityRepository.findById(entityId);

      if (!entity) {
        return res.status(404).json({
          success: false,
          message: 'Entidade não encontrada'
        });
      }

      return res.json({
        success: true,
        data: entity
      });
    } catch (error: any) {
      return res.status(500).json({
        success: false,
        message: 'Erro ao buscar entidade',
        error: error.message
      });
    }
  }
}
```

### 5. DTOs Refatorados

#### Padrão de DTO
```typescript
export interface CreateEntityDto {
  // Campos obrigatórios
  required_field: string;
  // Campos opcionais
  optional_field?: string;
  // IDs como números
  related_entity_id?: number;
}

export interface UpdateEntityDto {
  // Todos os campos opcionais
  required_field?: string;
  optional_field?: string;
  related_entity_id?: number;
}

export interface EntityResponseDto {
  id: number;
  // Campos da entidade
  required_field: string;
  // Relacionamentos
  related_entity?: {
    id: number;
    name: string;
  };
  created_at: Date;
  updated_at: Date;
}
```

### 6. Rotas Refatoradas

#### Padrão de Rotas
```typescript
import express from 'express';
import { body, param, query, validationResult } from 'express-validator';
import { EntityController } from '../controllers/EntityController';
import { validateJWT } from '../middleware/auth';

const router = express.Router();

// GET /api/entities
router.get(
  '/',
  [
    query('limit').optional().isInt({ min: 1, max: 100 }),
    query('offset').optional().isInt({ min: 0 }),
  ],
  async (req: express.Request, res: express.Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array(),
      });
    }
    return EntityController.getEntities(req, res, () => {});
  }
);

// GET /api/entities/:id
router.get(
  '/:id',
  [
    param('id').isInt({ min: 1 }).withMessage('ID deve ser um número inteiro positivo'),
  ],
  EntityController.getEntityById
);

// POST /api/entities
router.post(
  '/',
  validateJWT,
  [
    body('required_field').notEmpty().withMessage('Campo obrigatório'),
    body('related_entity_id').optional().isInt({ min: 1 }),
  ],
  EntityController.createEntity
);

export default router;
```

## Passos para Refatorar Cada Entidade

### 1. Verificar a Migração
```bash
# Encontrar a migração correspondente
ls backend/migrations/*entity_name*
```

### 2. Refatorar a Entidade
1. Substituir classe TypeORM por interface
2. Usar IDs numéricos em vez de UUIDs
3. Adicionar todos os campos da migração
4. Criar interfaces para Create, Update e WithRelations

### 3. Criar o Repository
1. Usar padrão estático com Knex
2. Implementar métodos básicos: findById, create, update, delete, findAll
3. Adicionar métodos específicos conforme necessário
4. Implementar joins para relacionamentos

### 4. Refatorar o Controller
1. Converter IDs de string para number
2. Validar IDs com isNaN()
3. Usar try/catch adequado
4. Retornar respostas padronizadas

### 5. Atualizar DTOs
1. Mudar IDs de string para number
2. Atualizar interfaces de resposta
3. Manter validações adequadas

### 6. Refatorar Rotas
1. Usar validações do express-validator
2. Validar IDs como inteiros
3. Manter documentação Swagger atualizada

### 7. Atualizar Serviços
1. Usar novos repositories
2. Converter lógica de negócio
3. Manter funcionalidades existentes

## Lista de Entidades para Refatorar

### Entidades Principais
- [x] User (Completo)
- [x] Video (Completo)
- [ ] TvShow
- [ ] Institution
- [ ] Role
- [ ] File
- [ ] Author
- [ ] Genre
- [ ] Tag
- [ ] Theme
- [ ] TargetAudience

### Entidades de Relacionamento
- [ ] UserRoles
- [ ] UserGenres
- [ ] VideoGenres
- [ ] VideoTags
- [ ] VideoThemes
- [ ] VideoAuthors
- [ ] InstitutionUsers
- [ ] EducationalStageUsers

### Entidades de Sistema
- [ ] UserSessions
- [ ] NotificationQueue
- [ ] SystemSettings
- [ ] SystemReports
- [ ] PasswordResetTokens

## Comandos Úteis

### Executar Migrações
```bash
cd backend
npm run migrate:latest
```

### Verificar Estrutura do Banco
```bash
# Conectar ao PostgreSQL
psql -h localhost -U postgres -d portal_sabercon

# Listar tabelas
\dt

# Descrever tabela
\d table_name
```

### Testar Endpoints
```bash
# Testar autenticação
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@portal.com","password":"admin123"}'

# Testar endpoint com token
curl -X GET http://localhost:3001/api/videos \
  -H "Authorization: Bearer YOUR_TOKEN"
```

## Considerações Importantes

### 1. Compatibilidade
- Manter APIs compatíveis quando possível
- Documentar breaking changes
- Implementar versionamento se necessário

### 2. Performance
- Usar índices adequados nas migrações
- Implementar paginação em listagens
- Otimizar queries com joins

### 3. Validação
- Validar todos os IDs como números
- Manter validações de negócio
- Usar express-validator consistentemente

### 4. Testes
- Atualizar testes existentes
- Testar conversões de ID
- Validar relacionamentos

### 5. Documentação
- Atualizar documentação Swagger
- Manter comentários no código
- Documentar mudanças de API

## Exemplo de Refatoração Completa

Para ver um exemplo completo de refatoração, consulte:
- `backend/src/entities/User.ts`
- `backend/src/repositories/UserRepository.ts`
- `backend/src/controllers/AuthController.ts`
- `backend/src/routes/auth.ts`
- `backend/src/dto/AuthDto.ts`
- `backend/src/services/AuthService.ts`

Estes arquivos mostram o padrão completo a ser seguido para todas as outras entidades do sistema. 