# Sistema de Rastreamento de Atividades

Este documento descreve o sistema completo de rastreamento de atividades implementado na plataforma Portal.

## 📋 Visão Geral

O sistema de rastreamento de atividades captura e analisa todas as interações dos usuários na plataforma, incluindo:

- **Login/Logout** e falhas de autenticação
- **Visualização de páginas** e tempo gasto
- **Reprodução de vídeos** com detalhes completos (tempo assistido, pausas, buscas, qualidade)
- **Atividades educacionais** (quiz, tarefas, cursos, aulas)
- **Interações sociais** (fórum, chat, comentários)
- **Gestão de conteúdo** (downloads, uploads, marcadores)
- **Erros e ações do sistema**

## 🏗️ Arquitetura

### Componentes Principais

1. **Tipos TypeScript** (`src/types/activity.ts`)
   - Definições de interfaces para todas as atividades
   - Tipos de dados para viewing status e watchlist
   - Enums para tipos de atividade

2. **Serviço de Rastreamento** (`src/services/activityTrackingService.ts`)
   - Classe principal para gerenciar o rastreamento
   - Sistema de fila para performance
   - Métodos para cada tipo de atividade

3. **Hook React** (`src/hooks/useActivityTracking.ts`)
   - Interface simples para componentes React
   - Rastreamento automático de páginas e erros
   - Funções específicas para cada tipo de atividade

4. **APIs REST** (`src/app/api/activity/`)
   - `/track` - Registrar atividades
   - `/viewing-status` - Gerenciar status de visualização
   - `/watchlist` - Gerenciar lista de assistir

5. **Tabelas do Banco de Dados**
   - `user_activity` - Registro de todas as atividades
   - `viewing_status` - Status de visualização de vídeos
   - `watchlist_entry` - Lista de vídeos para assistir
   - `activity_sessions` - Sessões de usuário
   - `activity_summaries` - Resumos diários agregados

## 🚀 Como Usar

### 1. Rastreamento Básico em Componentes React

```tsx
import useActivityTracking from '@/hooks/useActivityTracking'

function MeuComponente() {
  const { trackActivity, trackPageView } = useActivityTracking()

  const handleQuizSubmit = async (quizId: string, score: number) => {
    // Sua lógica de submissão...
    
    // Rastrear a atividade
    await trackActivity('quiz_complete', {
      quiz_id: quizId,
      score,
      time_spent: 300 // segundos
    })
  }

  return (
    // Seu componente...
  )
}
```

### 2. Rastreamento de Vídeos

```tsx
import { VideoPlayerWithTracking } from '@/components/VideoPlayerWithTracking'

function PaginaVideo() {
  return (
    <VideoPlayerWithTracking
      videoId={123}
      tvShowId={456}
      videoUrl="https://example.com/video.mp4"
      title="Aula de Matemática"
      duration={1800}
      quality={['720p', '1080p']}
    />
  )
}
```

### 3. Rastreamento Manual de Atividades

```tsx
import { activityTracker } from '@/services/activityTrackingService'

// Rastrear login
await activityTracker.trackLogin(userId, {
  login_method: 'email',
  device: 'mobile'
})

// Rastrear erro de login
await activityTracker.trackLoginFailed('user@example.com', 'wrong_password', {
  attempts: 3
})

// Rastrear quiz
await activityTracker.trackQuizAttempt(userId, quizId, 85, {
  questions_answered: 10,
  time_spent: 300
})

// Rastrear erro
await activityTracker.trackError(userId, new Error('API Error'), {
  endpoint: '/api/courses',
  status_code: 500
})
```

### 4. Gerenciar Viewing Status

```tsx
// Atualizar progresso do vídeo
await activityTracker.updateViewingStatus({
  user_id: userId,
  video_id: 123,
  current_play_time: 450, // 7.5 minutos
  runtime: 1800, // 30 minutos total
  watch_percentage: 25,
  quality: '1080p',
  playback_speed: 1.25,
  completed: false
})

// Obter status atual
const status = await activityTracker.getViewingStatus(userId, 123)
```

### 5. Gerenciar Watchlist

```tsx
// Adicionar à lista
await activityTracker.addToWatchlist(userId, 123, undefined, 'Assistir depois')

// Remover da lista
await activityTracker.removeFromWatchlist(userId, 123)
```

## 📊 Relatórios e Analytics

### 1. Estatísticas de Atividade

```tsx
import { activityTracker } from '@/services/activityTrackingService'

const stats = await activityTracker.getActivityStats({
  user_id: userId,
  date_from: new Date('2024-01-01'),
  date_to: new Date('2024-01-31'),
  activity_type: ['video_play', 'video_complete']
})

console.log('Total de atividades:', stats.total_activities)
console.log('Usuários únicos:', stats.unique_users)
console.log('Duração média de sessão:', stats.average_session_duration)
```

### 2. Atividades do Usuário

```tsx
const { activities, total } = await activityTracker.getUserActivities({
  user_id: userId,
  activity_type: 'video_play',
  date_from: new Date('2024-01-01'),
  page: 1,
  limit: 50
})
```

### 3. Relatórios da API

```tsx
// GET /api/reports/usage
const response = await fetch('/api/reports/usage?period=30d&activity_type=video_play')
const data = await response.json()
```

## 🎯 Tipos de Atividade Disponíveis

### Autenticação
- `login` - Login bem-sucedido
- `logout` - Logout do usuário
- `login_failed` - Tentativa de login falhada

### Navegação
- `page_view` - Visualização de página
- `search` - Pesquisa realizada

### Vídeos
- `video_start` - Início da reprodução
- `video_play` - Reprodução (progresso)
- `video_pause` - Pausa
- `video_stop` - Parada
- `video_complete` - Vídeo concluído
- `video_seek` - Busca no vídeo

### Educacional
- `quiz_start` - Início de quiz
- `quiz_attempt` - Tentativa de quiz
- `quiz_complete` - Quiz concluído
- `assignment_start` - Início de tarefa
- `assignment_submit` - Envio de tarefa
- `assignment_complete` - Tarefa concluída
- `course_enroll` - Matrícula em curso
- `course_complete` - Curso concluído
- `lesson_start` - Início de aula
- `lesson_complete` - Aula concluída

### Conteúdo
- `book_open` - Abertura de livro
- `book_read` - Leitura de livro
- `book_bookmark` - Marcador adicionado
- `content_access` - Acesso a conteúdo

### Social
- `forum_post` - Post no fórum
- `forum_reply` - Resposta no fórum
- `chat_message` - Mensagem de chat

### Sistema
- `file_download` - Download de arquivo
- `file_upload` - Upload de arquivo
- `profile_update` - Atualização de perfil
- `settings_change` - Mudança de configuração
- `notification_read` - Notificação lida
- `session_timeout` - Timeout de sessão
- `error` - Erro ocorrido
- `system_action` - Ação do sistema

## ⚙️ Configuração

### 1. Opções do Serviço

```tsx
import ActivityTrackingService from '@/services/activityTrackingService'

const tracker = new ActivityTrackingService({
  trackPageViews: true,
  trackVideoEvents: true,
  trackUserInteractions: true,
  trackErrors: true,
  trackPerformance: false,
  sessionTimeout: 30, // minutos
  batchSize: 50, // atividades por lote
  flushInterval: 10 // segundos
})
```

### 2. Configuração do Hook

```tsx
const tracking = useActivityTracking({
  trackPageViews: true,
  trackVideoEvents: true,
  trackUserInteractions: true,
  trackErrors: true,
  sessionTimeout: 30
})
```

## 🗄️ Estrutura do Banco de Dados

### Tabela `user_activity`

```sql
CREATE TABLE user_activity (
  id UUID PRIMARY KEY,
  user_id VARCHAR NOT NULL,
  session_id VARCHAR,
  activity_type VARCHAR NOT NULL,
  entity_type VARCHAR,
  entity_id VARCHAR,
  action VARCHAR NOT NULL,
  details JSON,
  ip_address VARCHAR,
  user_agent VARCHAR,
  device_info VARCHAR,
  browser VARCHAR,
  operating_system VARCHAR,
  location VARCHAR,
  duration_seconds INTEGER,
  start_time TIMESTAMP,
  end_time TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
)
```

### Tabela `viewing_status`

```sql
CREATE TABLE viewing_status (
  id UUID PRIMARY KEY,
  user_id VARCHAR NOT NULL,
  video_id INTEGER NOT NULL,
  tv_show_id INTEGER,
  profile_id VARCHAR,
  current_play_time INTEGER DEFAULT 0,
  runtime INTEGER,
  completed BOOLEAN DEFAULT FALSE,
  watch_percentage DECIMAL(5,2) DEFAULT 0,
  last_position INTEGER DEFAULT 0,
  quality VARCHAR,
  playback_speed DECIMAL(3,2) DEFAULT 1.0,
  subtitle_language VARCHAR,
  audio_language VARCHAR,
  device_type VARCHAR DEFAULT 'web',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id, video_id)
)
```

### Tabela `watchlist_entry`

```sql
CREATE TABLE watchlist_entry (
  id UUID PRIMARY KEY,
  user_id VARCHAR NOT NULL,
  video_id INTEGER,
  tv_show_id INTEGER,
  profile_id VARCHAR,
  added_at TIMESTAMP DEFAULT NOW(),
  is_deleted BOOLEAN DEFAULT FALSE,
  priority INTEGER,
  notes TEXT,
  reminder_date TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  CHECK (video_id IS NOT NULL OR tv_show_id IS NOT NULL)
)
```

## 🔧 Migração e Instalação

### 1. Executar Migração

```bash
# Backend
cd backend
npm run migrate:latest

# Ou manualmente
npx knex migrate:latest
```

### 2. Verificar Tabelas

```sql
-- Verificar se as tabelas foram criadas
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('user_activity', 'viewing_status', 'watchlist_entry');

-- Verificar views
SELECT viewname FROM pg_views 
WHERE schemaname = 'public' 
AND viewname LIKE 'v_%activity%';
```

## 📈 Performance e Otimização

### 1. Sistema de Fila

O serviço usa um sistema de fila em memória para melhorar a performance:

- **Batch Size**: Agrupa até 50 atividades por inserção
- **Flush Interval**: Salva automaticamente a cada 10 segundos
- **Flush Automático**: Salva quando a fila atinge o tamanho máximo

### 2. Índices do Banco

```sql
-- Índices principais para performance
CREATE INDEX idx_user_activity_user_type ON user_activity(user_id, activity_type);
CREATE INDEX idx_user_activity_user_date ON user_activity(user_id, created_at);
CREATE INDEX idx_user_activity_type_date ON user_activity(activity_type, created_at);
CREATE INDEX idx_user_activity_session_date ON user_activity(session_id, created_at);

-- Índices para viewing_status
CREATE INDEX idx_viewing_status_user ON viewing_status(user_id);
CREATE INDEX idx_viewing_status_video ON viewing_status(video_id);
CREATE INDEX idx_viewing_status_completed ON viewing_status(completed);
```

### 3. Views para Relatórios

```sql
-- Resumo de atividades por usuário
CREATE VIEW v_user_activity_summary AS
SELECT 
    user_id,
    COUNT(*) as total_activities,
    COUNT(DISTINCT session_id) as unique_sessions,
    COUNT(DISTINCT DATE(created_at)) as active_days,
    COUNT(*) FILTER (WHERE activity_type = 'login') as login_count,
    COUNT(*) FILTER (WHERE activity_type LIKE 'video_%') as video_activities,
    MIN(created_at) as first_activity,
    MAX(created_at) as last_activity
FROM user_activity
GROUP BY user_id;
```

## 🛠️ Troubleshooting

### 1. Problemas Comuns

**Erro: Tabelas não existem**
```bash
# Executar migração
npm run migrate:latest
```

**Erro: Fila muito grande**
```tsx
// Reduzir batch size
const tracker = new ActivityTrackingService({
  batchSize: 25,
  flushInterval: 5
})
```

**Erro: Session ID não gerado**
```tsx
// Verificar se o usuário está autenticado
const { user } = useAuth()
if (!user) return // Não rastrear usuários não autenticados
```

### 2. Debug

```tsx
// Habilitar logs detalhados
console.log('🔄 Iniciando rastreamento para:', userId)
console.log('📊 Dados da atividade:', activityData)
console.log('✅ Atividade salva com sucesso')
```

### 3. Monitoramento

```sql
-- Verificar atividades recentes
SELECT activity_type, COUNT(*) 
FROM user_activity 
WHERE created_at > NOW() - INTERVAL '1 hour'
GROUP BY activity_type;

-- Verificar performance
SELECT 
    user_id,
    COUNT(*) as activities_today,
    MAX(created_at) as last_activity
FROM user_activity 
WHERE DATE(created_at) = CURRENT_DATE
GROUP BY user_id
ORDER BY activities_today DESC
LIMIT 10;
```

## 🎯 Próximos Passos

1. **Analytics Avançados**
   - Implementar machine learning para detecção de padrões
   - Alertas automáticos para comportamentos anômalos
   - Recomendações personalizadas baseadas em atividade

2. **Performance**
   - Implementar Redis para cache de sessões
   - Particionamento de tabelas por data
   - Compressão de dados antigos

3. **Relatórios**
   - Dashboard em tempo real
   - Exportação para BI tools
   - Relatórios automáticos por email

4. **Compliance**
   - Implementar LGPD/GDPR compliance
   - Anonimização de dados sensíveis
   - Auditoria de acesso aos dados

---

Para mais informações ou suporte, consulte a equipe de desenvolvimento ou abra uma issue no repositório do projeto. 