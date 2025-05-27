# Portal Sabercon - Backend API

Backend da plataforma educacional Portal Sabercon, desenvolvido com Node.js, TypeScript, PostgreSQL e Redis.

## 🚀 Tecnologias

- **Node.js** - Runtime JavaScript
- **TypeScript** - Linguagem de programação
- **Express.js** - Framework web
- **PostgreSQL** - Banco de dados principal
- **Redis** - Cache e sessões
- **Knex.js** - Query builder e migrations
- **BullMQ** - Filas de mensageria
- **JWT** - Autenticação
- **Bcrypt** - Hash de senhas
- **Winston** - Logging
- **Jest** - Testes

## 📁 Estrutura do Projeto

```
backend/
├── src/
│   ├── config/          # Configurações (DB, Redis, Queue)
│   ├── controllers/     # Controladores da API
│   ├── models/          # Modelos de dados
│   ├── routes/          # Rotas da API
│   ├── services/        # Lógica de negócio
│   ├── middleware/      # Middlewares
│   ├── utils/           # Utilitários
│   ├── types/           # Tipos TypeScript
│   ├── queues/          # Workers das filas
│   └── index.ts         # Arquivo principal
├── migrations/          # Migrations do banco
├── seeds/              # Seeds do banco
├── tests/              # Testes
├── docs/               # Documentação
└── scripts/            # Scripts utilitários
```

## 🛠️ Configuração

### Pré-requisitos

- Node.js 18+
- PostgreSQL 13+
- Redis 6+

### Instalação

1. Clone o repositório e navegue para o backend:
```bash
cd backend
```

2. Instale as dependências:
```bash
npm install
```

3. Configure as variáveis de ambiente:
```bash
cp .env.example .env
```

4. Configure o banco de dados PostgreSQL e Redis no arquivo `.env`

5. Execute as migrations:
```bash
npm run migrate
```

6. Execute os seeds (opcional):
```bash
npm run seed
```

## 🚀 Execução

### Desenvolvimento
```bash
npm run dev
```

### Produção
```bash
npm run build
npm start
```

### Testes
```bash
npm test
npm run test:watch
npm run test:coverage
```

## 📊 Banco de Dados

### Estrutura Principal

- **institutions** - Instituições de ensino
- **users** - Usuários do sistema
- **courses** - Cursos oferecidos
- **modules** - Módulos dos cursos
- **lessons** - Lições dos módulos
- **books** - Livros digitais
- **videos** - Vídeos educacionais
- **user_progress** - Progresso dos usuários
- **annotations** - Anotações nos livros
- **highlights** - Destaques nos livros

### Migrations

```bash
# Executar migrations
npm run migrate

# Reverter última migration
npm run migrate:rollback

# Reset completo do banco
npm run db:reset
```

## 🔄 Filas de Mensageria

O sistema utiliza BullMQ para processamento assíncrono:

### Tipos de Filas

- **email-queue** - Envio de emails
- **notification-queue** - Notificações push
- **file-processing-queue** - Processamento de arquivos
- **analytics-queue** - Processamento de analytics
- **backup-queue** - Backups automáticos

### Worker

```bash
npm run queue:dev
```

## 🔐 Autenticação

O sistema utiliza JWT para autenticação:

- **Access Token** - Válido por 24 horas
- **Refresh Token** - Válido por 7 dias
- **Roles** - admin, manager, teacher, student

## 📝 API Endpoints

### Autenticação
- `POST /api/auth/login` - Login
- `POST /api/auth/register` - Registro
- `POST /api/auth/refresh` - Renovar token
- `POST /api/auth/logout` - Logout

### Usuários
- `GET /api/users` - Listar usuários
- `GET /api/users/:id` - Obter usuário
- `PUT /api/users/:id` - Atualizar usuário
- `DELETE /api/users/:id` - Deletar usuário

### Cursos
- `GET /api/courses` - Listar cursos
- `POST /api/courses` - Criar curso
- `GET /api/courses/:id` - Obter curso
- `PUT /api/courses/:id` - Atualizar curso
- `DELETE /api/courses/:id` - Deletar curso

### Livros
- `GET /api/books` - Listar livros
- `POST /api/books` - Criar livro
- `GET /api/books/:id` - Obter livro
- `PUT /api/books/:id` - Atualizar livro
- `DELETE /api/books/:id` - Deletar livro

### Progresso
- `GET /api/progress/user/:userId` - Progresso do usuário
- `POST /api/progress` - Atualizar progresso
- `GET /api/progress/course/:courseId` - Progresso no curso

## 🔧 Scripts Disponíveis

```bash
npm run dev          # Desenvolvimento
npm run build        # Build para produção
npm start            # Executar produção
npm test             # Executar testes
npm run migrate      # Executar migrations
npm run seed         # Executar seeds
npm run db:reset     # Reset do banco
npm run lint         # Linter
npm run format       # Formatação
```

## 🐳 Docker

```bash
# Build da imagem
docker build -t portal-backend .

# Executar container
docker run -p 3001:3001 portal-backend
```

## 📈 Monitoramento

### Health Check
```
GET /health
```

### Métricas
- Prometheus metrics em `/metrics`
- Logs estruturados com Winston
- Monitoramento de performance

## 🔒 Segurança

- Helmet.js para headers de segurança
- Rate limiting
- Validação de entrada com Joi
- Sanitização de dados
- CORS configurado
- Logs de auditoria

## 🚀 Deploy

### Variáveis de Ambiente Obrigatórias

```env
NODE_ENV=production
PORT=3001
DB_HOST=your_db_host
DB_NAME=portal_sabercon
DB_USER=your_db_user
DB_PASSWORD=your_db_password
REDIS_HOST=your_redis_host
JWT_SECRET=your_jwt_secret
```

### Processo de Deploy

1. Build da aplicação
2. Executar migrations
3. Iniciar aplicação
4. Verificar health check

## 📚 Documentação

- API Documentation: `/api/docs` (Swagger)
- Postman Collection: `docs/postman/`
- Database Schema: `docs/database/`

## 🤝 Contribuição

1. Fork o projeto
2. Crie uma branch para sua feature
3. Commit suas mudanças
4. Push para a branch
5. Abra um Pull Request

## 📄 Licença

Este projeto está sob a licença MIT.