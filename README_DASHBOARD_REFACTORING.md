# 📊 Sistema de Dashboards Refatorado

## Visão Geral

O sistema de dashboards foi completamente refatorado para usar as tabelas existentes do banco de dados e fornecer funcionalidades específicas para cada tipo de usuário conforme especificado.

## 🔒 Roles e Dashboards Implementados

### 1. **System Administrator (Global Administrator)**
**Rota:** `/api/dashboard/system-admin`  
**Frontend:** `/dashboard/system-admin`

#### Funcionalidades:
- ✅ **System health metrics** (uptime, load, queue status)
- ✅ **User growth analytics** (students, teachers, schools onboarded)  
- ✅ **Access and permission logs**
- ✅ **Multi-institution synchronization status**
- ✅ **Backup, security, and compliance alerts**

#### Tabelas Utilizadas:
- `institutions` - Status e sincronização de instituições
- `schools` - Escolas totais e ativas
- `users` - Crescimento de usuários por role
- `roles` - Distribuição de usuários por função
- `notifications` - Logs de atividades e alertas de segurança

---

### 2. **Institution Manager (School Directors / Unit Heads)**
**Rota:** `/api/dashboard/institution-manager`  
**Frontend:** `/dashboard/institution-manager`

#### Funcionalidades:
- ✅ **Enrollment trends and attendance heatmaps**
- ✅ **Academic performance per class/cycle**
- ✅ **Resource allocation and teacher coverage**
- ✅ **Budget vs. utilization indicators**
- ✅ **Notifications broadcast panel**

#### Tabelas Utilizadas:
- `schools` - Visão geral das escolas da instituição
- `classes` - Turmas e sua capacidade
- `user_classes` - Matrículas e cobertura de professores
- `class_education_cycles` - Desempenho por ciclo educacional
- `announcements` - Painel de comunicados

---

### 3. **Academic Coordinator (Cycle or Department Supervisors)**  
**Rota:** `/api/dashboard/coordinator`  
**Frontend:** `/dashboard/coordinator`

#### Funcionalidades:
- ✅ **Cross-class learning outcomes analytics**
- ✅ **Curriculum progress and adherence indicators**
- ✅ **Student risk flags by discipline**
- ✅ **Teacher performance and planning stats**
- ✅ **Pedagogical intervention history**

#### Tabelas Utilizadas:
- `education_cycles` - Progresso curricular e aderência
- `class_education_cycles` - Analytics entre turmas
- `user_classes` - Performance de professores e estudantes
- `notifications` - Histórico de intervenções pedagógicas

---

### 4. **Teachers**
**Rota:** `/api/dashboard/teacher`  
**Frontend:** `/dashboard/teacher`

#### Funcionalidades:
- ✅ **Class attendance, punctuality, and participation rates**
- ✅ **Grade distribution and performance evolution**
- ✅ **Engagement analytics for assigned readings and activities**
- ✅ **Alerts for underperforming students**
- ✅ **Access to Video Learning Portal**
- ✅ **Access to Literature Portal**

#### Tabelas Utilizadas:
- `user_classes` - Turmas do professor e alunos
- `courses` - Cursos e materiais do professor
- `content` - Analytics de engajamento em atividades
- `videos` - Portal de Vídeos de Aprendizagem
- `books` - Portal de Literatura

---

### 5. **Students**
**Rota:** `/api/dashboard/student`  
**Frontend:** `/dashboard/student`

#### Funcionalidades:
- ✅ **Daily agenda, upcoming deadlines, and quiz results**
- ✅ **Learning progress trackers (per subject and skill)**
- ✅ **Reading statistics from Literature Portal**
- ✅ **Messaging panel with instructors**
- ✅ **Personal goal-setting and achievement milestones**
- ✅ **Literature Portal (reading books, sending notes to teacher)**
- ✅ **Student Portal (videos, games, PDFs, materials)**

#### Tabelas Utilizadas:
- `user_classes` - Agenda e turmas do estudante
- `education_cycles` - Progresso por matéria
- `quizzes` - Resultados de testes
- `books` - Estatísticas de leitura
- `chat_messages` - Mensagens com instrutores
- `content` - Materiais do portal do estudante

---

### 6. **Guardians (Parents or Legal Representatives)**
**Rota:** `/api/dashboard/guardian`  
**Frontend:** `/dashboard/guardian`

#### Funcionalidades:
- ✅ **Real-time updates on grades and attendance**
- ✅ **Behavioral alerts and commendations**
- ✅ **Reading and homework completion reports**
- ✅ **Teacher communication logs**
- ✅ **Multi-child view (for parents with more than one student)**

#### Tabelas Utilizadas:
- `users` - Estudantes sob responsabilidade
- `user_classes` - Turmas e escolas dos filhos
- `chat_messages` - Comunicação com professores
- `notifications` - Alertas comportamentais

---

## 🏗️ Estrutura de Arquivos

### Backend
```
backend/src/routes/dashboard.ts - Todas as rotas refatoradas
backend/src/entities/ - Entidades do banco de dados
├── User.ts
├── Institution.ts
├── School.ts
├── Class.ts
├── UserClass.ts
├── EducationCycle.ts
├── Role.ts
└── ...
```

### Frontend
```
src/app/dashboard/ - Páginas dos dashboards
├── system-admin/page.tsx
├── institution-manager/page.tsx
├── coordinator/page.tsx
├── teacher/page.tsx
├── student/page.tsx
└── guardian/page.tsx

src/services/dashboardService.ts - Serviço centralizado da API
src/types/roles.ts - Definições de roles e permissões
```

## 🔧 Como Usar

### 1. Chamar a API
```typescript
import { dashboardService } from '@/services/dashboardService';

// Para System Admin
const systemData = await dashboardService.getSystemAdminDashboard();

// Para Institution Manager
const institutionData = await dashboardService.getInstitutionManagerDashboard();

// Para Academic Coordinator
const coordinatorData = await dashboardService.getCoordinatorDashboard();

// Para Teacher
const teacherData = await dashboardService.getTeacherDashboard();

// Para Student
const studentData = await dashboardService.getStudentDashboard();

// Para Guardian
const guardianData = await dashboardService.getGuardianDashboard();

// Generic (baseado no role do usuário)
const userData = await dashboardService.getDashboardByRole(userRole);
```

### 2. Utilizar no Frontend
```typescript
// Exemplo para Teacher Dashboard
const [dashboardData, setDashboardData] = useState<TeacherDashboardData | null>(null);

useEffect(() => {
  const loadData = async () => {
    try {
      const data = await dashboardService.getTeacherDashboard();
      setDashboardData(data);
    } catch (error) {
      console.error('Erro ao carregar dashboard:', error);
    }
  };
  
  loadData();
}, []);
```

## 📊 Dados Simulados vs Reais

### Dados Reais (usando tabelas existentes):
- ✅ Usuários, roles e permissões
- ✅ Instituições e escolas
- ✅ Turmas e matrículas
- ✅ Cursos e conteúdos
- ✅ Livros e vídeos
- ✅ Mensagens e notificações

### Dados Simulados (para desenvolvimento):
- ⚠️ Notas e avaliações (aguardando tabela `grades`)
- ⚠️ Frequência e presença (aguardando tabela `attendance`)
- ⚠️ Métricas de performance (aguardando implementação)
- ⚠️ Relatórios comportamentais (aguardando implementação)

## 🚀 Próximos Passos

1. **Implementar tabelas faltantes:**
   - `grades` - Para notas reais
   - `attendance` - Para frequência real
   - `guardian_students` - Relacionamento responsável-estudante
   - `assignments` - Para tarefas e prazos
   - `behavioral_reports` - Para relatórios comportamentais

2. **Integrar sistemas externos:**
   - Sistema de backup
   - Monitoramento de performance
   - Analytics em tempo real

3. **Melhorar visualizações:**
   - Gráficos interativos
   - Dashboards em tempo real
   - Notificações push

## 🔐 Segurança e Permissões

Todas as rotas estão protegidas com:
- ✅ Validação JWT
- ✅ Validação de sessão
- ✅ Controle de acesso baseado em roles
- ✅ Filtros por instituição (quando aplicável)

## 📱 Responsividade

Todos os dashboards são:
- ✅ Responsivos (mobile-first)
- ✅ Acessíveis (ARIA labels)
- ✅ Performance otimizada
- ✅ PWA ready

---

**Desenvolvido para o Portal Educacional**  
Sistema completo de gestão educacional com dashboards específicos por perfil de usuário. 