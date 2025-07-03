export interface SystemAdminDashboardData {
  // Métricas de sistema global
  systemHealth: {
    uptime: number;
    load: number;
    queueStatus: number;
    responseTime: number;
  };

  // Analytics de crescimento de usuários
  userGrowthAnalytics: {
    totalStudents: number;
    totalTeachers: number;
    totalSchools: number;
    growthRate: {
      students: number;
      teachers: number;
      schools: number;
    };
    onboardingStats: {
      lastWeek: number;
      lastMonth: number;
    };
  };

  // Logs de acesso e permissões
  accessLogs: {
    totalLogins: number;
    failedAttempts: number;
    securityAlerts: number;
    permissionChanges: number;
  };

  // Status de sincronização multi-institucional
  multiInstitutionSync: {
    totalInstitutions: number;
    syncedInstitutions: number;
    pendingSync: number;
    lastSyncTime: Date;
    syncErrors: number;
  };

  // Alertas de backup, segurança e compliance
  systemAlerts: {
    backupStatus: 'success' | 'warning' | 'error';
    securityStatus: 'secure' | 'warning' | 'compromised';
    complianceStatus: 'compliant' | 'pending' | 'violation';
    lastBackup: Date;
    nextScheduledBackup: Date;
  };
}

export interface InstitutionManagerDashboardData {
  // Tendências de matrícula e mapas de calor de presença
  enrollmentTrends: {
    totalEnrollments: number;
    monthlyGrowth: number;
    dropoutRate: number;
    retentionRate: number;
  };

  attendanceHeatmaps: {
    dailyAttendance: { [date: string]: number };
    weeklyAverage: number;
    monthlyAverage: number;
    classAttendanceRates: { [classId: string]: number };
  };

  // Performance acadêmica por turma/ciclo
  academicPerformance: {
    averageGrade: number;
    performanceByClass: { [classId: string]: { average: number; trend: 'up' | 'down' | 'stable' } };
    performanceByCycle: { [cycleId: string]: { average: number; studentCount: number } };
    subjectPerformance: { [subject: string]: number };
  };

  // Alocação de recursos e cobertura de professores
  resourceAllocation: {
    totalTeachers: number;
    teacherStudentRatio: number;
    classroomUtilization: number;
    equipmentStatus: { [equipment: string]: 'available' | 'maintenance' | 'unavailable' };
  };

  // Indicadores de orçamento vs utilização
  budgetIndicators: {
    allocatedBudget: number;
    usedBudget: number;
    utilizationRate: number;
    categoryBreakdown: { [category: string]: number };
    pendingExpenses: number;
  };

  // Painel de transmissão de notificações
  notificationsBroadcast: {
    totalNotifications: number;
    readRate: number;
    responseRate: number;
    urgentNotifications: number;
    scheduledNotifications: number;
  };
}

export interface AcademicCoordinatorDashboardData {
  // Analytics de resultados de aprendizagem entre turmas
  learningOutcomes: {
    crossClassAnalytics: {
      [classId: string]: {
        completionRate: number;
        averageScore: number;
        strugglingStudents: number;
        excelling: number;
      };
    };
    subjectComparison: { [subject: string]: { average: number; standardDeviation: number } };
  };

  // Indicadores de progresso e aderência curricular
  curriculumProgress: {
    overallProgress: number;
    adherenceRate: number;
    completedModules: number;
    totalModules: number;
    behindSchedule: number;
    aheadOfSchedule: number;
  };

  // Flags de risco estudantil por disciplina
  studentRiskFlags: {
    [discipline: string]: {
      atRiskStudents: number;
      criticalCases: number;
      improvingStudents: number;
      interventionsNeeded: number;
    };
  };

  // Estatísticas de performance e planejamento de professores
  teacherPerformanceStats: {
    totalTeachers: number;
    averageClassScore: number;
    planningCompliance: number;
    professionalDevelopmentHours: number;
    evaluationScores: { [teacherId: string]: number };
  };

  // Histórico de intervenções pedagógicas
  pedagogicalInterventions: {
    totalInterventions: number;
    successRate: number;
    activeInterventions: number;
    interventionTypes: { [type: string]: number };
    studentImprovementRate: number;
  };
}

export interface TeacherDashboardData {
  // Taxas de presença, pontualidade e participação da turma
  classEngagement: {
    attendanceRate: number;
    punctualityRate: number;
    participationRate: number;
    dailyStats: { [date: string]: { attendance: number; participation: number } };
  };

  // Distribuição de notas e evolução da performance
  gradeDistribution: {
    averageGrade: number;
    gradeRanges: { [range: string]: number };
    performanceEvolution: { [period: string]: number };
    improvingStudents: number;
    strugglingStudents: number;
  };

  // Analytics de engajamento para leituras e atividades designadas
  assignmentEngagement: {
    totalAssignments: number;
    completionRate: number;
    averageScore: number;
    lateSubmissions: number;
    engagementMetrics: {
      readingTime: number;
      videoWatchTime: number;
      forumParticipation: number;
    };
  };

  // Alertas para alunos com baixo desempenho
  studentAlerts: {
    lowPerformance: number;
    absences: number;
    behavioralIssues: number;
    needingAttention: string[];
    parentContactNeeded: number;
  };

  // Acesso aos portais educacionais
  educationalPortals: {
    videoLearningPortal: {
      totalVideos: number;
      completedCourses: number;
      hoursWatched: number;
      certificationProgress: number;
    };
    literaturePortal: {
      assignedReadings: number;
      studentProgress: { [studentId: string]: { pagesRead: number; notesReceived: number } };
      recommendationsGiven: number;
      notesRepliedTo: number;
    };
  };
}

export interface StudentDashboardData {
  // Agenda diária, prazos próximos e resultados de quiz
  dailyAgenda: {
    todayClasses: Array<{ subject: string; time: string; teacher: string; room: string }>;
    upcomingDeadlines: Array<{ title: string; dueDate: Date; subject: string; priority: 'low' | 'medium' | 'high' }>;
    recentQuizResults: Array<{ title: string; score: number; maxScore: number; date: Date }>;
  };

  // Rastreadores de progresso de aprendizagem por matéria e habilidade
  learningProgress: {
    subjectProgress: { [subject: string]: { completed: number; total: number; grade: number } };
    skillProgress: { [skill: string]: { level: number; xp: number; nextLevelXp: number } };
    overallCompletion: number;
    strongestSubjects: string[];
    needsImprovement: string[];
  };

  // Estatísticas de leitura do Portal de Literatura
  readingStats: {
    totalPagesRead: number;
    booksCompleted: number;
    currentlyReading: Array<{ title: string; progress: number; totalPages: number }>;
    completionBadges: Array<{ name: string; description: string; earnedDate: Date }>;
    readingStreak: number;
    monthlyGoal: { target: number; current: number };
  };

  // Painel de mensagens com instrutores
  teacherMessages: {
    unreadMessages: number;
    recentConversations: Array<{ teacher: string; subject: string; lastMessage: Date; preview: string }>;
    importantNotices: Array<{ title: string; content: string; date: Date; read: boolean }>;
  };

  // Definição de metas pessoais e marcos de conquista
  personalGoals: {
    activeGoals: Array<{ title: string; progress: number; target: number; deadline: Date }>;
    completedGoals: number;
    achievementMilestones: Array<{ title: string; description: string; achievedDate: Date; points: number }>;
    totalPoints: number;
    currentLevel: number;
  };

  // Acesso aos portais estudantil
  studentPortals: {
    literaturePortal: {
      availableBooks: number;
      currentAssignments: number;
      notesToTeacher: number;
      readingHistory: Array<{ title: string; completedDate: Date; rating: number }>;
    };
    studentPortal: {
      videosWatched: number;
      gamesCompleted: number;
      materialsDownloaded: number;
      favoriteMaterials: Array<{ title: string; type: 'video' | 'game' | 'pdf'; lastAccessed: Date }>;
    };
  };
}

export interface GuardianDashboardData {
  // Atualizações em tempo real sobre notas e presença
  realTimeUpdates: {
    latestGrades: Array<{ subject: string; grade: number; date: Date; teacher: string }>;
    attendanceStatus: { present: number; absent: number; late: number; total: number };
    todayStatus: 'present' | 'absent' | 'late' | 'not-started';
    weeklyAttendance: { [day: string]: 'present' | 'absent' | 'late' };
  };

  // Alertas comportamentais e elogios
  behavioralAlerts: {
    alerts: Array<{ type: 'behavioral' | 'academic' | 'attendance'; severity: 'low' | 'medium' | 'high'; description: string; date: Date; teacher: string }>;
    commendations: Array<{ title: string; description: string; teacher: string; date: Date; category: string }>;
    totalAlerts: number;
    resolvedIssues: number;
  };

  // Relatórios de conclusão de leitura e lição de casa
  homeworkReports: {
    pendingAssignments: number;
    completedThisWeek: number;
    completionRate: number;
    averageGrade: number;
    subjectBreakdown: { [subject: string]: { completed: number; total: number; avgGrade: number } };
    readingProgress: {
      currentBooks: Array<{ title: string; progress: number; assignedBy: string; dueDate: Date }>;
      completedBooks: number;
      readingTime: number;
    };
  };

  // Logs de comunicação com professores
  teacherCommunication: {
    totalMessages: number;
    unreadMessages: number;
    recentConversations: Array<{ teacher: string; subject: string; lastMessage: Date; snippet: string; priority: 'normal' | 'high' }>;
    scheduledMeetings: Array<{ teacher: string; date: Date; purpose: string; type: 'in-person' | 'virtual' }>;
    parentTeacherConferences: Array<{ date: Date; attendees: string[]; summary: string; actionItems: string[] }>;
  };

  // Visualização multi-filho para pais com mais de um estudante
  multiChildView: {
    children: Array<{
      id: string;
      name: string;
      class: string;
      teacher: string;
      overallGrade: number;
      attendanceRate: number;
      behavioralScore: number;
      recentActivity: string;
      needsAttention: boolean;
      priorityAlerts: number;
    }>;
    familyOverview: {
      totalChildren: number;
      averagePerformance: number;
      totalUnreadMessages: number;
      upcomingEvents: Array<{ child: string; event: string; date: Date }>;
      familyGoals: Array<{ title: string; progress: number; involvedChildren: string[] }>;
    };
  };
}

export interface DashboardNotification {
  id: string;
  type: 'info' | 'warning' | 'error' | 'success';
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
  actionRequired?: boolean;
  actionUrl?: string;
  category: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  expiresAt?: Date;
}

export interface DashboardMetrics {
  label: string;
  value: number | string;
  previousValue?: number | string;
  change?: number;
  changeType?: 'increase' | 'decrease' | 'neutral';
  unit?: string;
  format?: 'number' | 'percentage' | 'currency' | 'time';
  icon?: string;
  color?: string;
  trend?: Array<{ period: string; value: number }>;
}

export interface DashboardWidget {
  id: string;
  type: 'chart' | 'table' | 'metric' | 'list' | 'calendar' | 'progress';
  title: string;
  subtitle?: string;
  data: any;
  config?: any;
  permissions: string[];
  refreshRate?: number; // em segundos
  isRealtime?: boolean;
  size: 'small' | 'medium' | 'large' | 'full';
  order: number;
}

export interface DashboardConfig {
  userId: string;
  role: string;
  widgets: DashboardWidget[];
  layout: {
    columns: number;
    gaps: boolean;
    responsive: boolean;
  };
  preferences: {
    theme: 'light' | 'dark' | 'auto';
    refreshRate: number;
    notifications: boolean;
    realTimeUpdates: boolean;
    defaultView: string;
  };
  lastUpdated: Date;
}

// Interface para dados importados do sistema legado
export interface LegacyDataMapping {
  // Mapeamento de dados do MySQL para PostgreSQL
  users: {
    legacyId: number;
    newId: string;
    migrationDate: Date;
    verified: boolean;
  };
  institutions: {
    legacyId: number;
    newId: string;
    migrationDate: Date;
    verified: boolean;
  };
  videos: {
    legacyId: number;
    newId: string;
    migrationDate: Date;
    verified: boolean;
  };
  // outros mapeamentos conforme necessário
}

export interface DashboardImportStatus {
  totalRecords: number;
  migratedRecords: number;
  failedRecords: number;
  lastSync: Date;
  status: 'pending' | 'in-progress' | 'completed' | 'failed';
  errors: Array<{ record: string; error: string; timestamp: Date }>;
} 