// Tipos para gerenciamento integrado de roles
import { UserRole, RolePermissions } from './roles'

export interface PermissionGroup {
  id: string
  name: string
  description: string
  permissions: PermissionDefinition[]
}

export interface PermissionDefinition {
  key: keyof RolePermissions
  name: string
  description: string
  category: string
}

export interface ExtendedRole {
  role: UserRole
  name: string
  description: string
  type: 'system' | 'custom'
  permissions: RolePermissions
  userCount: number
  status: 'active' | 'inactive'
  isEditable: boolean
  createdAt: string
  updatedAt: string
}

export interface CustomRole {
  id: string
  name: string
  description: string
  type: 'custom'
  permissions: RolePermissions
  userCount: number
  status: 'active' | 'inactive'
  createdAt: string
  updatedAt: string
}

export interface RoleOperations {
  canEdit: boolean
  canDelete: boolean
  canClone: boolean
  canAssignUsers: boolean
}

// Definições de grupos de permissões
export const PERMISSION_GROUPS: PermissionGroup[] = [
  {
    id: 'system_management',
    name: 'Gestão do Sistema',
    description: 'Permissões administrativas do sistema',
    permissions: [
      {
        key: 'canManageSystem',
        name: 'Gerenciar Sistema',
        description: 'Acesso total às configurações do sistema',
        category: 'Sistema'
      },
      {
        key: 'canManageInstitutions',
        name: 'Gerenciar Instituições',
        description: 'Criar, editar e remover instituições',
        category: 'Sistema'
      },
      {
        key: 'canManageGlobalUsers',
        name: 'Gerenciar Usuários Globais',
        description: 'Administrar usuários em todas as instituições',
        category: 'Sistema'
      },
      {
        key: 'canViewSystemAnalytics',
        name: 'Visualizar Análises do Sistema',
        description: 'Acessar relatórios e métricas globais',
        category: 'Sistema'
      },
      {
        key: 'canManageSecurityPolicies',
        name: 'Gerenciar Políticas de Segurança',
        description: 'Configurar políticas de segurança e acesso',
        category: 'Sistema'
      }
    ]
  },
  {
    id: 'institution_management',
    name: 'Gestão Institucional',
    description: 'Administração de escolas e unidades',
    permissions: [
      {
        key: 'canManageSchools',
        name: 'Gerenciar Escolas',
        description: 'Administrar escolas e unidades de ensino',
        category: 'Instituição'
      },
      {
        key: 'canManageInstitutionUsers',
        name: 'Gerenciar Usuários da Instituição',
        description: 'Administrar usuários dentro da instituição',
        category: 'Instituição'
      },
      {
        key: 'canManageClasses',
        name: 'Gerenciar Turmas',
        description: 'Criar e administrar turmas e classes',
        category: 'Instituição'
      },
      {
        key: 'canManageSchedules',
        name: 'Gerenciar Horários',
        description: 'Configurar horários e grade curricular',
        category: 'Instituição'
      },
      {
        key: 'canViewInstitutionAnalytics',
        name: 'Visualizar Análises Institucionais',
        description: 'Acessar relatórios da instituição',
        category: 'Instituição'
      }
    ]
  },
  {
    id: 'academic_management',
    name: 'Gestão Acadêmica',
    description: 'Coordenação pedagógica e curricular',
    permissions: [
      {
        key: 'canManageCycles',
        name: 'Gerenciar Ciclos Educacionais',
        description: 'Administrar períodos letivos e ciclos',
        category: 'Acadêmico'
      },
      {
        key: 'canManageCurriculum',
        name: 'Gerenciar Currículo',
        description: 'Definir e modificar estrutura curricular',
        category: 'Acadêmico'
      },
      {
        key: 'canMonitorTeachers',
        name: 'Monitorar Professores',
        description: 'Supervisionar atividades docentes',
        category: 'Acadêmico'
      },
      {
        key: 'canViewAcademicAnalytics',
        name: 'Visualizar Análises Acadêmicas',
        description: 'Acessar métricas de desempenho acadêmico',
        category: 'Acadêmico'
      },
      {
        key: 'canCoordinateDepartments',
        name: 'Coordenar Departamentos',
        description: 'Gerenciar departamentos e coordenações',
        category: 'Acadêmico'
      }
    ]
  },
  {
    id: 'teaching',
    name: 'Ensino',
    description: 'Atividades de ensino e avaliação',
    permissions: [
      {
        key: 'canManageAttendance',
        name: 'Gerenciar Presença',
        description: 'Registrar e controlar frequência dos alunos',
        category: 'Ensino'
      },
      {
        key: 'canManageGrades',
        name: 'Gerenciar Notas',
        description: 'Lançar e editar notas dos alunos',
        category: 'Ensino'
      },
      {
        key: 'canManageLessonPlans',
        name: 'Gerenciar Planos de Aula',
        description: 'Criar e modificar planos de aula',
        category: 'Ensino'
      },
      {
        key: 'canUploadResources',
        name: 'Enviar Recursos',
        description: 'Fazer upload de materiais didáticos',
        category: 'Ensino'
      },
      {
        key: 'canCommunicateWithStudents',
        name: 'Comunicar com Alunos',
        description: 'Enviar mensagens e comunicados para alunos',
        category: 'Ensino'
      },
      {
        key: 'canCommunicateWithGuardians',
        name: 'Comunicar com Responsáveis',
        description: 'Comunicar-se com pais e responsáveis',
        category: 'Ensino'
      }
    ]
  },
  {
    id: 'student_access',
    name: 'Acesso do Aluno',
    description: 'Funcionalidades para estudantes',
    permissions: [
      {
        key: 'canViewOwnSchedule',
        name: 'Visualizar Próprio Horário',
        description: 'Acessar horário pessoal de aulas',
        category: 'Aluno'
      },
      {
        key: 'canViewOwnGrades',
        name: 'Visualizar Próprias Notas',
        description: 'Consultar notas e avaliações próprias',
        category: 'Aluno'
      },
      {
        key: 'canAccessLearningMaterials',
        name: 'Acessar Materiais de Aprendizagem',
        description: 'Baixar e visualizar conteúdo educacional',
        category: 'Aluno'
      },
      {
        key: 'canSubmitAssignments',
        name: 'Enviar Tarefas',
        description: 'Submeter trabalhos e atividades',
        category: 'Aluno'
      },
      {
        key: 'canTrackOwnProgress',
        name: 'Acompanhar Próprio Progresso',
        description: 'Visualizar evolução acadêmica pessoal',
        category: 'Aluno'
      },
      {
        key: 'canMessageTeachers',
        name: 'Enviar Mensagens para Professores',
        description: 'Comunicar-se com docentes',
        category: 'Aluno'
      }
    ]
  },
  {
    id: 'guardian_access',
    name: 'Acesso do Responsável',
    description: 'Funcionalidades para pais e responsáveis',
    permissions: [
      {
        key: 'canViewChildrenInfo',
        name: 'Visualizar Informações dos Filhos',
        description: 'Acessar dados gerais dos dependentes',
        category: 'Responsável'
      },
      {
        key: 'canViewChildrenGrades',
        name: 'Visualizar Notas dos Filhos',
        description: 'Consultar desempenho acadêmico dos dependentes',
        category: 'Responsável'
      },
      {
        key: 'canViewChildrenAttendance',
        name: 'Visualizar Presença dos Filhos',
        description: 'Acompanhar frequência dos dependentes',
        category: 'Responsável'
      },
      {
        key: 'canViewChildrenAssignments',
        name: 'Visualizar Tarefas dos Filhos',
        description: 'Acompanhar atividades e trabalhos',
        category: 'Responsável'
      },
      {
        key: 'canReceiveAnnouncements',
        name: 'Receber Comunicados',
        description: 'Receber avisos e informações da escola',
        category: 'Responsável'
      },
      {
        key: 'canCommunicateWithSchool',
        name: 'Comunicar com a Escola',
        description: 'Entrar em contato com a instituição',
        category: 'Responsável'
      },
      {
        key: 'canScheduleMeetings',
        name: 'Agendar Reuniões',
        description: 'Marcar encontros com professores e coordenação',
        category: 'Responsável'
      }
    ]
  },
  {
    id: 'financial_access',
    name: 'Acesso Financeiro',
    description: 'Informações financeiras e pagamentos',
    permissions: [
      {
        key: 'canViewFinancialInfo',
        name: 'Visualizar Informações Financeiras',
        description: 'Acessar dados financeiros básicos',
        category: 'Financeiro'
      },
      {
        key: 'canViewPayments',
        name: 'Visualizar Pagamentos',
        description: 'Consultar histórico de pagamentos',
        category: 'Financeiro'
      },
      {
        key: 'canViewBoletos',
        name: 'Visualizar Boletos',
        description: 'Acessar boletos e cobranças',
        category: 'Financeiro'
      },
      {
        key: 'canViewFinancialHistory',
        name: 'Visualizar Histórico Financeiro',
        description: 'Consultar histórico financeiro completo',
        category: 'Financeiro'
      }
    ]
  }
] 