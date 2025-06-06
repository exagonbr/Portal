# Portal Sabercon - Backend API

## 📋 Visão Geral

Backend completo para a plataforma educacional Portal Sabercon, desenvolvido em Node.js com TypeScript, oferecendo sistema robusto de autenticação, gerenciamento de sessões Redis, dashboard analytics e API RESTful completa.

## 🚀 Funcionalidades Principais

### 🔐 Sistema de Autenticação
- **JWT (JSON Web Tokens)** para autenticação segura
- **Sessões Redis** com suporte a múltiplos dispositivos
- **Refresh Tokens** para renovação automática
- **Blacklist de tokens** para logout seguro
- **Validação de permissões** por role e resource

### 📱 Gerenciamento de Sessões
- **Sessões multi-dispositivo** com detecção automática
- **Rastreamento de atividade** em tempo real
- **Expiração automática** de sessões inativas
- **Estatísticas de uso** e analytics de sessões
- **Cleanup automático** de sessões expiradas

### 📊 Dashboard e Analytics
- **Dashboard administrativo** com métricas do sistema
- **Dashboard personalizado** por usuário
- **Métricas em tempo real** (usuários ativos, performance)
- **Analytics históricos** com gráficos
- **Monitoramento de saúde** do sistema

### 🏗️ Arquitetura Robusta
- **TypeORM** para ORM e migrations
- **Redis** para cache e sessões
- **PostgreSQL** como banco principal
- **Swagger** para documentação API
- **Middleware customizado** para segurança
- **Logs estruturados** e monitoramento

## 🛠️ Tecnologias Utilizadas

- **Node.js** v16+
- **TypeScript** v4+
- **Express.js** - Framework web
- **TypeORM** - ORM para PostgreSQL
- **Redis** - Cache e sessões
- **JWT** - Autenticação
- **Swagger** - Documentação API
- **bcrypt** - Hash de senhas
- **express-validator** - Validação de dados
- **helmet** - Segurança HTTP
- **cors** - Cross-Origin Resource Sharing
- **morgan** - Logs HTTP

## 📁 Estrutura do Projeto

```
backend/
├── src/
│   ├── config/           # Configurações (DB, Redis, Swagger)
│   ├── entities/         # Entidades TypeORM
│   ├── middleware/       # Middlewares customizados
│   ├── routes/          # Rotas da API
│   ├── services/        # Lógica de negócio
│   ├── scripts/         # Scripts utilitários
│   ├── types/           # Definições TypeScript
│   └── index.ts         # Entry point
├── docs/                # Documentação
├── migrations/          # Migrations do banco
├── package.json
├── tsconfig.json
└── README.md
```

## ⚙️ Configuração e Instalação

### 1. Pré-requisitos

- Node.js v16 ou superior
- PostgreSQL v12 ou superior
- Redis v6 ou superior
- npm ou yarn

### 2. Instalação das dependências

```bash
npm install
```

### 3. Configuração das variáveis de ambiente

Crie um arquivo `.env` na raiz do projeto com base na documentação:

```env
# APPLICATION SETTINGS
NODE_ENV=development
PORT=3001

# JWT SETTINGS
JWT_SECRET=your-very-secure-jwt-secret-key-change-this-in-production

# DATABASE SETTINGS (PostgreSQL)
DB_HOST=localhost
DB_PORT=5432
DB_NAME=portal_sabercon
DB_USER=postgres
DB_PASSWORD=root
DB_SSL=false

# REDIS SETTINGS
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=
REDIS_DB=0
REDIS_TLS=false

# CORS SETTINGS
CORS_ORIGIN=http://localhost:3000
CORS_CREDENTIALS=true

# ADMIN USER SETTINGS
ADMIN_EMAIL=admin@portal.com
ADMIN_PASSWORD=password123
```

📋 **Veja a documentação completa das variáveis em:** [`docs/ENVIRONMENT_VARIABLES.md`](./docs/ENVIRONMENT_VARIABLES.md)

### 4. Setup inicial do sistema

Execute o script de configuração automática:

```bash
npm run setup
```

Este script irá:
- ✅ Verificar todas as variáveis de ambiente
- ✅ Testar conexões com PostgreSQL e Redis
- ✅ Executar migrations do banco
- ✅ Criar roles padrão (admin, teacher, student)
- ✅ Criar usuário administrador
- ✅ Exibir informações de configuração

### 5. Iniciar o servidor

```bash
# Desenvolvimento
npm run dev

# Produção
npm run build
npm start
```

## 📚 Documentação da API

### Swagger UI
Acesse a documentação interativa em: `http://localhost:3001/api-docs`

### Principais Endpoints

#### 🔐 Autenticação e Sessões (`/api/sessions`)
- `POST /login` - Login com criação de sessão
- `POST /logout` - Logout e destruição de sessão
- `POST /logout-all` - Logout de todos os dispositivos
- `POST /refresh` - Renovar token com refresh token
- `GET /list` - Listar sessões ativas do usuário
- `DELETE /destroy/:sessionId` - Remover sessão específica
- `GET /stats` - Estatísticas de sessões (Admin)
- `GET /validate` - Validar sessão atual

#### 📊 Dashboard (`/api/dashboard`)
- `GET /system` - Dashboard administrativo completo
- `GET /user` - Dashboard personalizado do usuário
- `GET /metrics/realtime` - Métricas em tempo real
- `GET /analytics` - Dados para gráficos de analytics
- `GET /summary` - Resumo baseado no role
- `GET /notifications` - Notificações do dashboard
- `GET /health` - Status de saúde do sistema

#### 👥 Usuários (`/api/users`)
- `GET /` - Listar usuários
- `POST /` - Criar usuário
- `GET /:id` - Obter usuário por ID
- `PUT /:id` - Atualizar usuário
- `DELETE /:id` - Remover usuário

#### 🏢 Instituições (`/api/institutions`)
- `GET /` - Listar instituições
- `POST /` - Criar instituição
- `GET /:id` - Obter instituição por ID
- `PUT /:id` - Atualizar instituição
- `DELETE /:id` - Remover instituição

## 🔒 Sistema de Autenticação

### Como funciona

1. **Login**: O usuário faz login com email/senha
2. **JWT + Sessão**: Sistema gera JWT e cria sessão Redis
3. **Múltiplos dispositivos**: Cada login cria nova sessão
4. **Validação**: Toda requisição valida JWT e sessão Redis
5. **Refresh**: Tokens expirados podem ser renovados
6. **Logout**: Remove sessão Redis e adiciona JWT à blacklist

### Exemplo de uso

```javascript
// Login
const response = await fetch('/api/sessions/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'user@portal.com',
    password: 'password123',
    deviceType: 'web'
  })
});

const { token, user, session } = await response.json();

// Usar token em requisições
const userDashboard = await fetch('/api/dashboard/user', {
  headers: { 'Authorization': `Bearer ${token}` }
});
```

## 📊 Dashboard e Analytics

### Dashboard Administrativo
- **Estatísticas de usuários**: Total, ativos, novos do mês
- **Análise por role**: Distribuição de usuários
- **Análise por instituição**: Usuários por instituição
- **Métricas de sessões**: Usuários ativos, sessões por dispositivo
- **Performance do sistema**: Uptime, memória, versão
- **Atividades recentes**: Registros e logins recentes

### Dashboard do Usuário
- **Perfil personalizado**: Dados do usuário e estatísticas
- **Progresso em cursos**: Cursos em andamento e concluídos
- **Atividade recente**: Últimas sessões e tempo de estudo
- **Conquistas**: Badges e achievements do usuário

### Métricas em Tempo Real
- **Usuários ativos** no momento
- **Sessões ativas** por dispositivo
- **Uso de memória** do Redis
- **Timestamp** da última atualização

## 🔧 Scripts Disponíveis

```bash
# Desenvolvimento
npm run dev              # Inicia servidor em modo desenvolvimento
npm run build           # Compila TypeScript para JavaScript
npm start              # Inicia servidor de produção

# Banco de dados
npm run typeorm:cli     # CLI do TypeORM
npm run migration:generate # Gera nova migration
npm run migration:run   # Executa migrations pendentes
npm run migration:revert # Reverte última migration

# Utilitários
npm run setup          # Script de configuração inicial
npm run test           # Executa testes (se configurado)
npm run lint           # Verifica code style
```

## 🔄 Middleware e Segurança

### Middlewares Implementados

1. **`sessionMiddleware`**: Autenticação JWT + Redis
2. **`extractClientInfo`**: Extrai IP, User-Agent, dispositivo
3. **`requireRole`**: Controle de acesso por role
4. **`requirePermission`**: Controle de acesso por permissão
5. **`optionalAuth`**: Autenticação opcional

### Segurança Implementada

- **Helmet**: Headers de segurança HTTP
- **CORS**: Configuração de Cross-Origin
- **Rate Limiting**: Proteção contra DDoS (preparado)
- **Input Validation**: Validação de dados de entrada
- **Password Hashing**: bcrypt para senhas
- **JWT Blacklist**: Logout seguro com invalidação

## 🗄️ Banco de Dados

### Entidades Principais

- **User**: Usuários do sistema
- **Role**: Roles de acesso (admin, teacher, student)
- **Permission**: Permissões específicas
- **Institution**: Instituições de ensino
- **Course**: Cursos disponíveis
- **Module**: Módulos dos cursos
- **Lesson**: Aulas dos módulos

### Migrations
O sistema utiliza TypeORM migrations para versionamento do banco:

```bash
# Gerar nova migration
npm run migration:generate -- src/migrations/NomeDaMigration

# Executar migrations
npm run migration:run

# Reverter migration
npm run migration:revert
```

## 📝 Logs e Monitoramento

### Sistema de Logs
- **Morgan**: Logs HTTP estruturados
- **Console**: Logs de aplicação com níveis
- **Desenvolvimento**: Logs detalhados com stack traces
- **Produção**: Logs otimizados sem informações sensíveis

### Monitoramento
- **Health Check**: Endpoint `/api/dashboard/health`
- **Métricas**: CPU, memória, uptime
- **Redis Status**: Conexão e uso de memória
- **Database Status**: Conexão e pool de conexões

## 🚀 Deploy e Produção

### Configurações de Produção

1. **Variáveis de ambiente**:
   ```env
   NODE_ENV=production
   JWT_SECRET=super-secure-random-key-256-bits
   DB_SSL=true
   REDIS_TLS=true
   CORS_ORIGIN=https://yourdomain.com
   ```

2. **Docker** (exemplo):
   ```dockerfile
   FROM node:16-alpine
   WORKDIR /app
   COPY package*.json ./
   RUN npm ci --only=production
   COPY dist/ ./dist/
   EXPOSE 3001
   CMD ["npm", "start"]
   ```

3. **SSL/TLS**: Configure certificados para HTTPS
4. **Proxy Reverso**: Use Nginx ou similar
5. **Backup**: Configure backup automático do PostgreSQL
6. **Monitoramento**: Use PM2, forever ou similar

## 🤝 Contribuição

1. Faça fork do projeto
2. Crie uma branch para sua feature (`git checkout -b feature/nova-feature`)
3. Commit suas mudanças (`git commit -m 'Adiciona nova feature'`)
4. Push para a branch (`git push origin feature/nova-feature`)
5. Abra um Pull Request

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

## 🆘 Suporte

- **Documentação**: `http://localhost:3001/api-docs`
- **Issues**: Abra uma issue no repositório
- **Email**: dev@portal.sabercon.com

---

**Portal Sabercon Backend v2.0.0** - Sistema robusto para educação digital 🎓