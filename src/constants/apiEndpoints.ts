const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

// Endpoints da API
export const API_ENDPOINTS = {
  // Autenticação
  auth: {
    login: `${API_BASE_URL}/auth/login`,
    logout: `${API_BASE_URL}/auth/logout`,
    register: `${API_BASE_URL}/auth/register`,
    profile: `${API_BASE_URL}/auth/profile`,
    refreshToken: `${API_BASE_URL}/auth/refresh-token`,
  },

  // Usuários
  users: {
    list: `${API_BASE_URL}/users`,
    create: `${API_BASE_URL}/users`,
    get: (id: string) => `${API_BASE_URL}/users/${id}`,
    update: (id: string) => `${API_BASE_URL}/users/${id}`,
    delete: (id: string) => `${API_BASE_URL}/users/${id}`,
    byRole: (role: string) => `${API_BASE_URL}/users?role=${role}`,
  },

  // Instituições
  institutions: {
    list: `${API_BASE_URL}/institutions`,
    create: `${API_BASE_URL}/institutions`,
    get: (id: string) => `${API_BASE_URL}/institutions/${id}`,
    update: (id: string) => `${API_BASE_URL}/institutions/${id}`,
    delete: (id: string) => `${API_BASE_URL}/institutions/${id}`,
  },

  // Cursos
  courses: {
    list: `${API_BASE_URL}/courses`,
    create: `${API_BASE_URL}/courses`,
    get: (id: string) => `${API_BASE_URL}/courses/${id}`,
    update: (id: string) => `${API_BASE_URL}/courses/${id}`,
    delete: (id: string) => `${API_BASE_URL}/courses/${id}`,
    byTeacher: (teacherId: string) => `${API_BASE_URL}/courses?teacher=${teacherId}`,
    byStudent: (studentId: string) => `${API_BASE_URL}/courses?student=${studentId}`,
  },

  // Módulos
  modules: {
    list: `${API_BASE_URL}/modules`,
    create: `${API_BASE_URL}/modules`,
    get: (id: string) => `${API_BASE_URL}/modules/${id}`,
    update: (id: string) => `${API_BASE_URL}/modules/${id}`,
    delete: (id: string) => `${API_BASE_URL}/modules/${id}`,
    byCourse: (courseId: string) => `${API_BASE_URL}/modules?course=${courseId}`,
  },

  // Livros
  books: {
    list: `${API_BASE_URL}/books`,
    create: `${API_BASE_URL}/books`,
    get: (id: string) => `${API_BASE_URL}/books/${id}`,
    update: (id: string) => `${API_BASE_URL}/books/${id}`,
    delete: (id: string) => `${API_BASE_URL}/books/${id}`,
    search: (query: string) => `${API_BASE_URL}/books/search?q=${query}`,
  },

  // Vídeos
  videos: {
    list: `${API_BASE_URL}/videos`,
    create: `${API_BASE_URL}/videos`,
    get: (id: string) => `${API_BASE_URL}/videos/${id}`,
    update: (id: string) => `${API_BASE_URL}/videos/${id}`,
    delete: (id: string) => `${API_BASE_URL}/videos/${id}`,
    byModule: (moduleId: string) => `${API_BASE_URL}/videos?module=${moduleId}`,
  },

  // Quizzes
  quizzes: {
    list: `${API_BASE_URL}/quizzes`,
    create: `${API_BASE_URL}/quizzes`,
    get: (id: string) => `${API_BASE_URL}/quizzes/${id}`,
    update: (id: string) => `${API_BASE_URL}/quizzes/${id}`,
    delete: (id: string) => `${API_BASE_URL}/quizzes/${id}`,
    submit: (id: string) => `${API_BASE_URL}/quizzes/${id}/submit`,
    results: (id: string) => `${API_BASE_URL}/quizzes/${id}/results`,
  },

  // Dashboard
  dashboard: {
    teacher: `${API_BASE_URL}/dashboard/teacher`,
    student: `${API_BASE_URL}/dashboard/student`,
    admin: `${API_BASE_URL}/dashboard/admin`,
    coordinator: `${API_BASE_URL}/dashboard/coordinator`,
    guardian: `${API_BASE_URL}/dashboard/guardian`,
  },

  // Notas
  grades: {
    list: `${API_BASE_URL}/grades`,
    create: `${API_BASE_URL}/grades`,
    get: (id: string) => `${API_BASE_URL}/grades/${id}`,
    update: (id: string) => `${API_BASE_URL}/grades/${id}`,
    delete: (id: string) => `${API_BASE_URL}/grades/${id}`,
    byStudent: (studentId: string) => `${API_BASE_URL}/grades?student=${studentId}`,
    byCourse: (courseId: string) => `${API_BASE_URL}/grades?course=${courseId}`,
  },

  // Frequência
  attendance: {
    list: `${API_BASE_URL}/attendance`,
    create: `${API_BASE_URL}/attendance`,
    get: (id: string) => `${API_BASE_URL}/attendance/${id}`,
    update: (id: string) => `${API_BASE_URL}/attendance/${id}`,
    delete: (id: string) => `${API_BASE_URL}/attendance/${id}`,
    byStudent: (studentId: string) => `${API_BASE_URL}/attendance?student=${studentId}`,
    byClass: (classId: string) => `${API_BASE_URL}/attendance?class=${classId}`,
  },

  // Roles e Permissões
  roles: {
    list: `${API_BASE_URL}/roles`,
    create: `${API_BASE_URL}/roles`,
    get: (id: string) => `${API_BASE_URL}/roles/${id}`,
    update: (id: string) => `${API_BASE_URL}/roles/${id}`,
    delete: (id: string) => `${API_BASE_URL}/roles/${id}`,
  },

  permissions: {
    list: `${API_BASE_URL}/permissions`,
    create: `${API_BASE_URL}/permissions`,
    get: (id: string) => `${API_BASE_URL}/permissions/${id}`,
    update: (id: string) => `${API_BASE_URL}/permissions/${id}`,
    delete: (id: string) => `${API_BASE_URL}/permissions/${id}`,
  },

  // Notificações
  notifications: {
    list: `${API_BASE_URL}/notifications`,
    create: `${API_BASE_URL}/notifications`,
    get: (id: string) => `${API_BASE_URL}/notifications/${id}`,
    markAsRead: (id: string) => `${API_BASE_URL}/notifications/${id}/read`,
    markAllAsRead: `${API_BASE_URL}/notifications/read-all`,
  },

  // Chat e Fórum
  chats: {
    list: `${API_BASE_URL}/chats`,
    create: `${API_BASE_URL}/chats`,
    get: (id: string) => `${API_BASE_URL}/chats/${id}`,
    messages: (id: string) => `${API_BASE_URL}/chats/${id}/messages`,
    sendMessage: (id: string) => `${API_BASE_URL}/chats/${id}/messages`,
  },

  forum: {
    threads: `${API_BASE_URL}/forum/threads`,
    createThread: `${API_BASE_URL}/forum/threads`,
    getThread: (id: string) => `${API_BASE_URL}/forum/threads/${id}`,
    replies: (threadId: string) => `${API_BASE_URL}/forum/threads/${threadId}/replies`,
    createReply: (threadId: string) => `${API_BASE_URL}/forum/threads/${threadId}/replies`,
  },

  // Relatórios
  reports: {
    performance: `${API_BASE_URL}/reports/performance`,
    attendance: `${API_BASE_URL}/reports/attendance`,
    grades: `${API_BASE_URL}/reports/grades`,
    usage: `${API_BASE_URL}/reports/usage`,
  },
};

export default API_ENDPOINTS; 