# API de Funções (Roles)

Esta API permite gerenciar as funções (roles) no sistema.

## Endpoints

### Listar todas as funções

**GET /api/roles**

Retorna uma lista de todas as funções disponíveis no sistema.

#### Resposta

```json
[
  {
    "id": 1,
    "version": 1,
    "authority": "ROLE_ADMIN",
    "displayName": "Administrador"
  },
  {
    "id": 2,
    "version": 1,
    "authority": "ROLE_TEACHER",
    "displayName": "Professor"
  }
]
```

### Obter função por ID

**GET /api/roles/:id**

Retorna os detalhes de uma função específica.

#### Parâmetros de URL

- `id` - ID da função

#### Resposta

```json
{
  "id": 1,
  "version": 1,
  "authority": "ROLE_ADMIN",
  "displayName": "Administrador"
}
```

### Criar nova função

**POST /api/roles**

Cria uma nova função no sistema.

#### Corpo da requisição

```json
{
  "authority": "ROLE_COORDINATOR",
  "displayName": "Coordenador"
}
```

#### Resposta

```json
{
  "id": 3,
  "version": 1,
  "authority": "ROLE_COORDINATOR",
  "displayName": "Coordenador"
}
```

### Atualizar função

**PUT /api/roles/:id**

Atualiza os dados de uma função existente.

#### Parâmetros de URL

- `id` - ID da função

#### Corpo da requisição

```json
{
  "authority": "ROLE_COORDINATOR",
  "displayName": "Coordenador Pedagógico"
}
```

#### Resposta

```json
{
  "id": 3,
  "version": 2,
  "authority": "ROLE_COORDINATOR",
  "displayName": "Coordenador Pedagógico"
}
```

### Excluir função

**DELETE /api/roles/:id**

Remove uma função do sistema.

#### Parâmetros de URL

- `id` - ID da função

#### Resposta

- Código 204 (No Content) em caso de sucesso

### Obter função com usuários

**GET /api/roles/:id/users**

Retorna uma função específica com a lista de usuários associados.

#### Parâmetros de URL

- `id` - ID da função

#### Resposta

```json
{
  "id": 1,
  "version": 1,
  "authority": "ROLE_ADMIN",
  "displayName": "Administrador",
  "users": [
    {
      "id": 1,
      "fullName": "João Silva",
      "email": "joao@example.com"
    },
    {
      "id": 2,
      "fullName": "Maria Santos",
      "email": "maria@example.com"
    }
  ]
}
``` 