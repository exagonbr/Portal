import { apiService } from './api';

export interface SystemAdminDashboardData {
  systemHealth: {
    uptime: number;
    cpuUsage: any;
    memoryUsage: any;
    activeConnections: number;
    queueStatus: {
      pending: number;
      processing: number;
      completed: number;
      failed: number;
    };
  };
  userGrowth: {
    totalInstitutions: number;
    activeInstitutions: number;
    totalSchools: number;
    activeSchools: number;
    totalUsers: number;
    activeUsers: number;
    usersByRole: Array<{ role: string; count: number }>;
    growthMetrics: {
      usersLastMonth: number;
      institutionsLastMonth: number;
    };
  };
  accessLogs: any[];
  syncStatus: Array<{
    id: string;
    name: string;
    is_active: boolean;
    updated_at: string;
  }>;
  securityAlerts: any[];
  complianceStatus: {
    backupStatus: string;
    dataRetention: string;
    accessControls: string;
    auditLogs: string;
  };
}

export interface InstitutionManagerDashboardData {
  schoolsOverview: Array<{
    id: string;
    name: string;
    is_active: boolean;
    total_classes: number;
    total_students: number;
    total_teachers: number;
  }>;
  enrollmentTrends: Array<{
    month: string;
    enrollments: number;
  }>;
  attendanceHeatmap: Array<{
    id: string;
    name: string;
    shift: string;
    attendance_rate: number;
  }>;
  academicPerformance: Array<{
    id: string;
    class_name: string;
    cycle_name: string;
    level: string;
    performance_score: number;
  }>;
  resourceAllocation: Array<{
    school_name: string;
    allocated_classes: number;
    capacity: number;
    budget_allocated: number;
  }>;
  teacherCoverage: Array<{
    class_id: string;
    class_name: string;
    teacher_count: number;
    student_count: number;
  }>;
  budgetIndicators: {
    metric: string;
    total_budget: number;
    utilized_budget: number;
    utilization_rate: number;
  };
  notificationsBroadcast: any[];
  institutionMetrics: {
    totalSchools: number;
    totalStudents: number;
    totalTeachers: number;
    totalClasses: number;
  };
}

export interface CoordinatorDashboardData {
  learningOutcomesAnalytics: Array<{
    id: string;
    class_name: string;
    cycle_name: string;
    level: string;
    learning_outcome_score: number;
    curriculum_adherence: number;
  }>;
  curriculumProgressIndicators: Array<{
    id: string;
    name: string;
    level: string;
    duration_weeks: number;
    classes_using: number;
    completion_percentage: number;
  }>;
  studentRiskFlags: Array<{
    student_id: string;
    student_name: string;
    class_name: string;
    risk_level: 'high' | 'medium' | 'low';
    risk_type: string;
  }>;
  teacherPerformanceStats: Array<{
    teacher_id: string;
    teacher_name: string;
    classes_taught: number;
    performance_score: number;
    planning_completeness: number;
  }>;
  interventionHistory: any[];
  cycleOverview: Array<{
    id: string;
    name: string;
    level: string;
    duration_weeks: number;
    active_classes: number;
  }>;
  academicMetrics: {
    totalCycles: number;
    activeClasses: number;
    averageCurriculumAdherence: number;
    studentsAtRisk: number;
  };
}

export interface TeacherDashboardData {
  classAttendanceRates: Array<{
    id: string;
    name: string;
    attendance_rate: number;
    punctuality_rate: number;
    participation_rate: number;
  }>;
  gradeDistribution: Array<{
    id: string;
    name: string;
    grade_a_count: number;
    grade_b_count: number;
    grade_c_count: number;
    grade_d_count: number;
    grade_f_count: number;
  }>;
  performanceEvolution: Array<{
    month: string;
    average_grade: number;
  }>;
  engagementAnalytics: Array<{
    course_id: string;
    course_title: string;
    reading_materials: number;
    assignments: number;
    engagement_rate: number;
  }>;
  underperformingStudentsAlerts: Array<{
    id: string;
    student_name: string;
    class_name: string;
    current_grade: number;
    alert_type: string;
  }>;
  teacherClasses: Array<{
    id: string;
    name: string;
    shift: string;
    year: number;
    school_name: string;
    student_count: number;
  }>;
  coursesOverview: any[];
  videoLearningPortal: {
    recentVideos: any[];
    totalVideos: number;
  };
  literaturePortal: {
    availableBooks: any[];
    totalBooks: number;
  };
  teacherMetrics: {
    totalClasses: number;
    totalStudents: number;
    averageAttendance: number;
    alertsCount: number;
  };
}

export interface StudentDashboardData {
  dailyAgenda: Array<{
    id: string;
    name: string;
    shift: string;
    year: number;
    school_name: string;
    cycle_name: string;
    level: string;
  }>;
  upcomingDeadlines: Array<{
    id: string;
    title: string;
    type: string;
    course_title: string;
    deadline: string;
  }>;
  quizResults: Array<{
    id: string;
    title: string;
    created_at: string;
    score: number;
    total_questions: number;
  }>;
  learningProgressTrackers: Array<{
    id: string;
    subject: string;
    level: string;
    progress_percentage: number;
    completed_activities: number;
    total_activities: number;
  }>;
  readingStatistics: {
    books: Array<{
      id: string;
      title: string;
      author: string;
      pages_read: number;
      total_pages: number;
      completed: boolean;
      rating: number;
    }>;
    totalBooksRead: number;
    totalPagesRead: number;
    averageRating: number;
  };
  messagingPanel: Array<{
    id: string;
    content: string;
    created_at: string;
    sender_name: string;
    is_from_teacher: boolean;
  }>;
  personalGoalsAndMilestones: {
    goals: Array<{
      goal: string;
      category: string;
      progress: number;
      target_date: string;
    }>;
    achievements: Array<{
      achievement_name: string;
      description: string;
      unlocked: boolean;
      unlocked_at: string;
    }>;
  };
  literaturePortal: {
    availableBooks: any[];
    currentReadings: any[];
  };
  studentPortal: {
    materials: any[];
    videoCount: number;
    gameCount: number;
    documentCount: number;
  };
  studentMetrics: {
    enrolledClasses: number;
    pendingAssignments: number;
    averageQuizScore: number;
    completionBadges: number;
  };
}

export interface GuardianDashboardData {
  realTimeUpdates: {
    grades: Array<{
      student_id: number;
      subject: string;
      grade: number;
      assessment_type: string;
      grade_date: string;
    }>;
    attendance: Array<{
      student_id: number;
      date: string;
      status: 'present' | 'late' | 'absent';
    }>;
  };
  behavioralAlertsAndCommendations: Array<{
    student_id: number;
    type: 'commendation' | 'alert';
    description: string;
    date: string;
  }>;
  homeworkAndReadingReports: Array<{
    student_id: number;
    assignment_name: string;
    status: 'completed' | 'pending';
    due_date: string;
    completion_percentage: number;
  }>;
  teacherCommunicationLogs: Array<{
    id: string;
    content: string;
    created_at: string;
    teacher_name: string;
    regarding_student_id: number;
  }>;
  multiChildView: Array<{
    student: {
      student_id: number;
      student_name: string;
      class_name: string;
      year: number;
      school_name: string;
    };
    recentGrades: any[];
    attendanceRate: number;
    behaviorSummary: {
      commendations: number;
      alerts: number;
    };
    homeworkCompletion: number;
  }>;
  upcomingEvents: Array<{
    event_name: string;
    description: string;
    event_date: string;
    type: 'meeting' | 'event';
  }>;
  guardianMetrics: {
    totalChildren: number;
    averageAttendance: number;
    totalCommendations: number;
    totalAlerts: number;
    unreadMessages: number;
  };
}

export const dashboardService = {
  // System Administrator Dashboard
  async getSystemAdminDashboard(): Promise<SystemAdminDashboardData> {
    const response = await apiService.get('/dashboard/system-admin');
    return response.data as SystemAdminDashboardData;
  },

  // Institution Manager Dashboard
  async getInstitutionManagerDashboard(): Promise<InstitutionManagerDashboardData> {
    const response = await apiService.get('/dashboard/institution-manager');
    return response.data as InstitutionManagerDashboardData;
  },

  // Academic Coordinator Dashboard
  async getCoordinatorDashboard(): Promise<CoordinatorDashboardData> {
    const response = await apiService.get('/dashboard/coordinator');
    return response.data as CoordinatorDashboardData;
  },

  // Teacher Dashboard
  async getTeacherDashboard(): Promise<TeacherDashboardData> {
    const response = await apiService.get('/dashboard/teacher');
    return response.data as TeacherDashboardData;
  },

  // Student Dashboard
  async getStudentDashboard(): Promise<StudentDashboardData> {
    const response = await apiService.get('/dashboard/student');
    return response.data as StudentDashboardData;
  },

  // Guardian Dashboard
  async getGuardianDashboard(): Promise<GuardianDashboardData> {
    const response = await apiService.get('/dashboard/guardian');
    return response.data as GuardianDashboardData;
  },

  // Generic dashboard loader based on user role
  async getDashboardByRole(role: string): Promise<any> {
    const roleMapping: Record<string, string> = {
      'SYSTEM_ADMIN': '/dashboard/system-admin',
      'INSTITUTION_MANAGER': '/dashboard/institution-manager', 
      'ACADEMIC_COORDINATOR': '/dashboard/coordinator',
      'TEACHER': '/dashboard/teacher',
      'STUDENT': '/dashboard/student',
      'GUARDIAN': '/dashboard/guardian'
    };

    const endpoint = roleMapping[role] || '/dashboard/user';
    const response = await apiService.get(endpoint);
    return response.data;
  }
}; 